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
  }

};

module.exports = observationsService;