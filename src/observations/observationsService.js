const observationsRouter = require("./observationsRouter");

const observationsService = {
  getAllObservations(db, experiment_id){
    return db('observations')
      .select('*')
      .where('experiment_id', experiment_id);
  }

};

module.exports = observationsService;