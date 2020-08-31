const LabBookService = {
  //might need to add a way to only pulled logged in info
  getAllExperiments(db) {
    return db('experiments')
      .select('*');
  }
};

module.exports = LabBookService;