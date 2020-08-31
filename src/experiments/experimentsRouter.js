const express = require('express');
const experimentsRouter = express.Router();
const ExprimentsService = require('./experimentsService');

experimentsRouter
  .route('/experiments')
  .get((req, res, next) => {

    ExprimentsService.getAllExperiments(req.app.get('db'))
      .then(experiments => {
        return res.json(experiments);
      })
      .catch(next);
  });

module.exports = experimentsRouter;