const express = require('express');
const path = require('path');
const experimentsRouter = express.Router();
const ExperimentsService = require('./experimentsService');
const jsonParser = express.json();
const xss = require('xss');
const { requireAuth } = require('../middleware/jwt-auth')

const serializeExperiment = experiment => ({
  id: experiment.id,
  experiment_title: xss(experiment.experiment_title), 
  hypothesis: xss(experiment.hypothesis), 
  user_id: parseInt(xss(experiment.user_id)),
  variable_name: xss(experiment.variable_name),
  date_created: experiment.date_created
});

experimentsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {

    ExperimentsService.getAllExperiments(req.app.get('db'))
      .then(experiments => {

        if(experiments.length === 0 || experiments[0].id === null) {
          return res.json([]);
        }
        return res.json(experiments.map(ExperimentsService.serializeExperiment));
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
    newExperiment.user_id = req.user.id
    ExperimentsService.insertExperiment(req.app.get('db'), newExperiment)
      .then(experiment => {
        return res.status(201)
          .location(path.posix.join(req.originalUrl, `/${experiment.id}`))
          .json(ExperimentsService.serializeExperiment(experiment));
      })
      .catch(next);
  });

experimentsRouter
  .route('/:experiment_id')
  .all(requireAuth)
  .get((req, res, next) => {
    const  experiment_id  = req.params.experiment_id;
    ExperimentsService.getExperimentById(req.app.get('db'), experiment_id) 
      .then(experiment => {
        if (!experiment) {
          return res.status(404).json({ 
            error: { message: 'Experiment does not exist' } 
          });
        }
        return res.json(ExperimentsService.serializeExperiment(experiment));
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const experiment_id = req.params.experiment_id;
    ExperimentsService.deleteExperiment(req.app.get('db'), experiment_id)
      .then(numRowsAffected => {
        if(!numRowsAffected){
          return res.status(404).json({ error: { message: 'Experiment does not exist' }});
        }
        return res.status(204).end();
      })
      .catch(next);
  });
 
module.exports = experimentsRouter;