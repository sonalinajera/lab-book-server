const experimentsService = {
  //might need to add a way to only pulled logged in info
  getAllExperiments(db) {
    return db('experiments')
      .select('experiments.id',
        'experiments.experiment_title',
        'experiments.hypothesis',
        'experiments.date_created',
        'experiments.variable_name',
        'experiments.user_id')
      .rightOuterJoin('users', 'experiments.user_id', '=', 'users.id')
      .groupBy('experiments.id', 'users.id')
      // .leftOuterJoin('observations', 'experiments.id', '=', 'observations.experiment_id')
      // .groupBy('experiments.id', 'observations.id')
      // .leftOuterJoin('variables', 'experiments.id', '=', 'variables.experiment_id')
      // .groupBy('experiments.id', 'variables.id')
      .orderBy('experiments.id','asc');
  },
  getExperimentById(db, id) {
    return db('experiments')
      .select('*')
      .where('id', id)
      .first();
  },

  insertExperiment(db, newExperiment) {
    return db('experiments')
      .insert(newExperiment)
      .returning('*')
      .then(([experiment]) => experiment)
      .then(experiment => 
        experimentsService.getExperimentById(db, experiment.id)
      );
  },
  deleteExperiment(db, id) {
    return db('experiments')
      .where('id', id)
      .delete();
  }
};

module.exports = experimentsService;