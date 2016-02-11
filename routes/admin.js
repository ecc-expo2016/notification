'use strict';
import {Router} from 'express';
import passport from 'passport';
import {Work} from '../models/database';

const router = Router();

router.get('/login', (req, res) => {
  if (req.user) {
    res.redirect('./');
    return;
  }

  res.render('admin/login', {
    error: req.flash('error'),
    csrfToken: req.csrfToken()
  });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: './',
  failureRedirect: 'login',
  failureFlash: false,
  failureFlash: 'Invalid username or password.'
}));

router.get('/logout', (req, res) => {
  if (req.user) {
    req.logout();
  }

  res.redirect('login');
});

router.get('/', (req, res) => {
  if (req.user) {
    res.render('admin/index', {
      csrfToken: req.csrfToken()
    });
    return;
  }

  res.redirect('login');
});

router.get('/all', async (req, res) => {
  if (req.user) {
    const docs = await Work.find().sort({modified: 1});
    return res.json(docs);
  }

  res.redirect('login');
});

router.post('/new', async (req, res) => {
  if (req.user) {
    const work = new Work(req.body);
    await work.save();
    return res.send();
  }

  res.redirect('login');
});

router.delete('/:id', async (req, res) => {
  if (req.user) {
    await Work.findByIdAndRemove(req.params.id);
    return res.send();
  }

  res.redirect('login');
});

export default router;
