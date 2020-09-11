const xss = require('xss')

const experimentsService = {
  getExperimentsByUser(db, userId) {
    return db
      .from('experiments')
      .select('*',
      db.raw(
        `json_strip_nulls(
          json_build_object(
            'id', users.id,
            'username', users.username,
            'first_name', users.first_name,
            'last_name', users.last_name,
            'email', users.email,
            'date_created', users.date_created
          )
        ) AS "user"`
      ),)
      .where('experiments.user_id', userId)
      .leftJoin('users', 'experiments.user_id', 'users.id')
      .groupBy('experiments.id', 'users.id')
  },
  getExperimentById(db, id) {
    return db
    .from('experiments')
    .select(
      'experiments.id',
      'experiments.experiment_title',
      'experiments.hypothesis',
      'experiments.date_created',
      'experiments.variable_name',
      'experiments.user_id',
      db.raw(
        `json_strip_nulls(
          row_to_json(
            (SELECT tmp FROM (
              SELECT
                users.id,
                users.username,
                users.first_name,
                users.last_name,
                users.email,
                users.date_created
          ) tmp)
          )
        ) AS "user"`
      ),
      db.raw(
        `json_strip_nulls(
          row_to_json(
            (SELECT tmp FROM (
              SELECT
                observations.id,
                observations.observation_title,
                observations.observation_notes,
                observations.experiment_id,
                observations.date_created
          ) tmp)
          )
        ) AS "observations"`
      )
      )
    .leftJoin('users', 'experiments.user_id', 'users.id')
    .leftJoin('observations', 'experiments.id', 'observations.experiment_id')
    .where('experiments.id', id)
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
  },

  serializeExperiment(experiment) {
    const { user , observations} = experiment
    return {
      id: experiment.id,
      experiment_title: xss(experiment.experiment_title), 
      hypothesis: xss(experiment.hypothesis), 
      user_id: parseInt(xss(experiment.user_id)),
      variable_name: xss(experiment.variable_name),
      date_created: experiment.date_created,
      user: {
        id: user.id,
        username: xss(user.username),
        first_name: xss(user.first_name),
        last_name: xss(user.last_name),
        email: xss(user.email),
        date_created: new Date(user.date_created),
      }
    }
  }
};

module.exports = experimentsService;