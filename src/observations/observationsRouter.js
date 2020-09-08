const express = require('express');
const observationsRouter = express.Router();
const ObservationsService = require('./observationsService');
const jsonParser = express.json();
const path = require('path');

observationsRouter
  .route('/:experiment_id/observations')
  .get((req, res, next) => {
    const experimentId = req.params.experiment_id;
    ObservationsService.getAllObservations(req.app.get('db'), experimentId)
      .then(observations => {
        if (!observations) {
          return res.json(observations);
        }
        return res.send(observations);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { observation_title, observation_notes, experiment_id } = req.body;
    const newObservation = { observation_title, observation_notes, experiment_id };

    for (const [key, value] of Object.entries(newObservation))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });

    ObservationsService.insertObservation(req.app.get('db'), newObservation)
      .then(observation => {
        return res.status(201)
          .location(path.posix.join(req.originalUrl, `/${observation.id}`))
          .json(observation);
      })
      .catch(next);
  });


observationsRouter
  .route('/:experiment_id/observations/:observation_id')
  .get((req, res, next) => {
    const observationId = req.params.observation_id;
    ObservationsService.getObservationById(req.app.get('db'), observationId)
      .then(observation => {
        if (!observation) {
          return res.status(404).json({
            error: { message: 'Observation does not exist' }
          });
        }
        return res.send(observation);
      }).catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { observation_title, observation_notes } = req.body;
    const observationToUpdate = { observation_title, observation_notes };
    const observationId = req.params.observation_id;
    const numberOfValues = Object.values(observationToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return (res.status(400).json({
        error: {
          message: `Request body must content either 'observation_title' or 'observation_notes'`
        }
      })
      );

    ObservationsService.updateObservation(req.app.get('db'), observationId, observationToUpdate)
      .then(updatedObservation => {
        if(updatedObservation.length === 0) {
          return res.status(404).json({
            error: { message: 'Observation does not exist'}
          });
        }
        return res.status(200).json(updatedObservation[0]);
      })
      .catch(next);

  })
  .delete((req, res, next) => {
    const observation_id = req.params.observation_id;
    ObservationsService.deleteObservation(req.app.get('db'), observation_id)
      .then(numRowsAffected => {
        if(!numRowsAffected) {
          res.status(404).json({ error: { message: 'Observation does not exist' }});
        }
        return res.status(204).end();
      })
      .catch(next);
  });

module.exports = observationsRouter;