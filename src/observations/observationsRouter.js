const express = require('express');
const observationsRouter = express.Router();
const ObservationsService = require('./observationsService');

observationsRouter
  .route('/:experiment_id/observations')
  .get((req, res, next) => {
    const experimentId = req.params.experiment_id;
    ObservationsService.getAllObservations(req.app.get('db'), experimentId)
      .then(observations => {
        if(!observations) {
          return res.json(observations);
        }
        return res.send(observations);
      })
      .catch(next);
  });


observationsRouter
  .route('/:experiments_id/observations/:observation_id')
  .get((req, res, next) => {
    const observationId = req.params.observation_id;
    ObservationsService.getObservationById(req.app.get('db'), observationId)
      .then(observation => {
        if(!observation) {
          return res.status(404).json({
            error: { message: 'Observation does not exist'}
          });
        }
        return res.send('ok');
      }).catch(next);
    
  });
module.exports = observationsRouter;