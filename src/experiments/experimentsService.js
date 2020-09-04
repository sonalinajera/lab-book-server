const experimentsService = {
  //might need to add a way to only pulled logged in info
  getAllExperiments(db) {
    return db('experiments')
      .select('*')
      .leftOuterJoin('users', 'experiments.user_id', '=', 'users.id')
      .groupBy('experiments.id', 'users.id')
      // .leftOuterJoin('observations', 'experiments.id', '=', 'observations.experiment_id')
      // .groupBy('experiments.id', 'observations.id')
      .leftOuterJoin('variables', 'experiments.id', '=', 'variables.experiment_id')
      .groupBy('experiments.id', 'variables.id')
      .orderBy('experiments.id','asc');
  },
  getExperimentById(db, id) {
    return db('experiments')
      .select('*')
      .where('id', id)
      .first();
  }
};

module.exports = experimentsService;