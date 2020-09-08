const express = require('express');
const path = require('path');
const experimentsRouter = express.Router();
const ExperimentsService = require('./experimentsService');
const jsonParser = express.json();

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
  })
  .post(jsonParser, (req, res, next) => {
    const { experiment_title, hypothesis, user_id, variable_name} = req.body;
  
    const newExperiment = { experiment_title, hypothesis, user_id, variable_name};
    for (const [key, value] of Object.entries(newExperiment))
      if(value == null) 
        return res.status(400).json({
          error: {message :`Missing '${key}' in request body` }
        });
    //newExperiment.user_id = req.user.id
    ExperimentsService.insertExperiment(req.app.get('db'), newExperiment)
      .then()
      .then(experiment => {
        return res.status(201)
          .location(path.posix.join(req.originalUrl, `/${experiment.id}`))
          .json(experiment);
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
  })
  .delete((req, res, next) => {
    const experiment_id = req.params.experiment_id;
    ExperimentsService.deleteExperiment(req.app.get('db'), experiment_id)
      .then(numRowsAffected => {
        if(!numRowsAffected){
          res.status(404).json({ error: { message: 'Experiment does not exist' }});
        }
        res.status(204).end();
      })
      .catch(next);
  });
 
module.exports = experimentsRouter;