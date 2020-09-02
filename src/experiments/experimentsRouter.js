const express = require('express');
const experimentsRouter = express.Router();
const ExperimentsService = require('./experimentsService');

experimentsRouter
  .route('/')
  .get((req, res, next) => {

    ExperimentsService.getAllExperiments(req.app.get('db'))
      .then(experiments => {
        if(!experiments) {
          return res.json(experiments);
        }
        return res.json(experiments);
      })
      .catch(next);
  });

experimentsRouter
  .route('/:experiment_id')
  .get((req, res, next) => {
    const  experiment_id  = req.params.experiment_id;
    ExperimentsService.getExperimentById(req.app.get('db'), experiment_id) 
      .then(experiment => {
        if (!experiment) {
          return res.status(404).json({ 
            error: { message: 'Experiment does not exist' } 
          });
        }
        return res.json(experiment);
      })
      .catch(next);
  });
 
module.exports = experimentsRouter;