const express = require('express');
const path = require('path');
const experimentsRouter = express.Router();
const ExperimentsService = require('./experimentsService');
const jsonParser = express.json();
const xss = require('xss');
const { requireAuth } = require('../middleware/jwt-auth')
const jwt = require('jsonwebtoken');


experimentsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    let authToken = req.headers.authorization
    let bearerToken = authToken.slice(7, authToken.length)
    const { user_id } = jwt.decode(bearerToken)
      ExperimentsService.getExperimentsByUser(req.app.get('db'), user_id)
        .then(experiments => {
          if(!experiments) {
            return res.json([])
          }
          return res.json(experiments.map(ExperimentsService.serializeExperiment))
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