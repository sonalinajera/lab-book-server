const express = require('express');
const observationsRouter = express.Router();
const observationsService = require('./observationsService');

observationsRouter
  .route('/:experiment_id/observations')
  .get((req, res, next) => {
    const experimentId = req.params.experiment_id;
    observationsService.getAllObservations(req.app.get('db'), experimentId)
      .then(observations => {
        if(!observationsRouter) {
          return res.send(404, { message: { error: 'Observation not founds '}});
        }
        return res.send(observations);
      })
      .catch(next);
  });

module.exports = observationsRouter;