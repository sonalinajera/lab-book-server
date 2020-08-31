const express = require('express');
const experimentsRouter = express.Router();

experimentsRouter
  .route('/experiments')
  .get((req, res, next) => {
    res.status(200).send([]);
  });

module.exports = experimentsRouter;