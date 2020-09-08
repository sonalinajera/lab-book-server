const observationsRouter = require("./observationsRouter");

const observationsService = {
  getAllObservations(db, experiment_id){
    return db('observations')
      .select('*')
      .where('experiment_id', experiment_id);
  },
  getObservationById(db, id) {
    return db('observations')
      .select('*')
      .where('id', id)
      .first();
  },
  insertObservation(db, newObservation) {
    return db('observations')
      .insert(newObservation)
      .returning('*')
      .then(([observation]) => observation)
      .then(observation =>
        observationsService.getObservationById(db, observation.id));
  },
  updateObservation(db, observationId, observationToUpdate) {
    return db('observations')
      .where({id: observationId})
      .update(observationToUpdate, returning=true)
      .returning('*');
  },
  deleteObservation(db, id){
    return db('observations')
      .where('id', id)
      .delete();
  }

};

module.exports = observationsService;