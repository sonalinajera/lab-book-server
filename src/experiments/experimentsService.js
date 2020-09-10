const xss = require('xss')

const experimentsService = {
  //might need to add a way to only pulled logged in info
  getAllExperiments(db) {
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
            json_build_object(
              'id', users.id,
              'username', users.username,
              'first_name', users.first_name,
              'last_name', users.last_name,
              'email', users.email,
              'date_created', users.date_created
            )
          ) AS "user"`
        ),
        db.raw(
          `json_strip_nulls(
            json_build_object(
              'id', observations.id,
              'observation_title', observations.observation_title,
              'observation_notes', observations.observation_notes,
              'experiment_id', observations.experiment_id,
              'date_created', observations.date_created
            )
          ) AS "observations"`
        )
        )
      .leftJoin('users', 'experiments.user_id', 'users.id')
      .groupBy('experiments.id', 'users.id')
      .leftJoin('observations', 'experiments.id', 'observations.experiment_id')
      .groupBy('experiments.id', 'observations.id')
      .orderBy('experiments.id', 'asc');
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
      },
      observations: {
        id: observations.id,
        observation_title: xss(observations.observation_title),
        observation_notes: xss(observations.observation_notes),
        experiment_id: observations.experiment_id,
        date_created: observations.date_created
      }
    }
  }
};

module.exports = experimentsService;