const experimentsService = {
  //might need to add a way to only pulled logged in info
  getAllExperiments(db) {
    return db('experiments')
      .select('*');
  },
  getExperimentById(db, id) {
    return db('experiments')
      .select('*')
      .where('id', id)
      .first();
  }
};

module.exports = experimentsService;