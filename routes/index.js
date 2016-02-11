'use strict';
import {Router} from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/user/:workId/:creatorId', (req, res) => {
  const {workId, creatorId} = req.params;

  res.render('user', {
    workId,
    creatorId
  });
});

export default router;
