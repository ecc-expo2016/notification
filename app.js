'use strict';
import 'babel-polyfill';
import path from 'path';
import http from 'http';
import passport from 'passport';
import {Strategy} from 'passport-local';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import mongoose from 'mongoose';
import connectMongo from 'connect-mongo';
import csrf from 'csurf';
import flash from 'connect-flash';
import compression from 'compression';
import socketIo from 'socket.io';
import nodemailer from 'nodemailer';
import {Work} from './models/database';
import routes from './routes';
import admin from './routes/admin';

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new Strategy((username, password, done) => {
  const {ADMIN_USERNAME, ADMIN_PASSWORD} = process.env;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    done(null, username);
    return;
  }

  done(null, false);
}));

const app = express();
const MongoStore = connectMongo(session);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  secret: 'foooooooo',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));
app.use(csrf({cookie: true}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/admin', admin);

const server = http.createServer(app);
const io = socketIo(server);
const {GMAIL_USERNAME, GMAIL_PASSWORD} = process.env;
const transporter = nodemailer.createTransport(
  `smtps://${GMAIL_USERNAME}%40gmail.com:${GMAIL_PASSWORD}@smtp.gmail.com`
);

io.on('connection', socket => {
  const fetchAll = async () => {
    const docs = await Work.find();
    const data = docs.map(doc => {
      doc.creators = doc.creators.map(creator => {
        creator.email = undefined;
        return creator;
      });
      return doc;
    });
    return data;
  };

  const update = async () => {
    const data = await fetchAll();
    io.emit('update', data);
  };

  (async () => {
    const data = await fetchAll();
    io.emit('init', data);
  })();

  socket.on('notify', async (workId, creatorId) => {
    const work = await Work.findById(workId);
    const {name, email} = work.creators.id(creatorId);

    await transporter.sendMail({
      from: `ECC EXPO 2016 運営スタッフ <${GMAIL_USERNAME}@gmail.com>`,
      to: email,
      subject: `${name}（${work.name}）さんへ通知が届きました`,
      text: [
        `${name}（${work.name}）さんへ通知が届きました。`,
        '○○までお越しください。',
        '',
        '通知の停止・再開はこちらから設定してください。',
        'https://ecc-expo2016-notification.herokuapp.com/user/' +
        `${workId}/${creatorId}`
      ].join('\n')
    });
  });

  socket.on('change', async (workId, creatorId, status) => {
    const work = await Work.findById(workId);
    const creator = work.creators.id(creatorId);

    creator.status = status;
    await work.save();
    await update();
  });
});

server.listen(process.env.PORT);
