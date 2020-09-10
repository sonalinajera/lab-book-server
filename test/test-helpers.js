const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      first_name: 'Litany',
      last_name: 'TheSinger',
      username: 'MyDude',
      password: 'ireallyLikeU',
      email: 'litany@song.com',
      date_created: '2020-08-25T08:34:13.000Z',
    },
    {
      id: 2,
      first_name: 'Phyll',
      last_name: 'Salinger',
      username: 'PlantGuy',
      password: 'photosynthesize',
      email: 'chlorophyll@herbarium.edu',
      date_created: '2029-01-22T16:28:32.615Z'
    }
  ];
}

function makeExperimentsArray() {
  return [
    {
      id: 1,
      experiment_title: 'Effects of Vibrations on Ant Colonies',
      hypothesis: 'Ants use vibrations to react to their environment',
      date_created: '2020-08-23T08:34:13.000Z',
      variable_name: 'surface only vibrations',
      user_id: 1
    },
    {
      id: 2,
      experiment_title: 'Pesticides and Bees',
      hypothesis: 'Pesticides containing synthetic chemicals contribute to bee death',
      date_created: '2020-03-19T08:34:13.000Z',
      variable_name: 'using Synthecide',
      user_id: 1
    },
    {
      id: 3,
      experiment_title: 'Air pollution and decrease plant oxygen production',
      hypothesis: 'Air pollutants aggregate on plant surface and decreases plant oxygen production',
      date_created: '2020-05-10T08:34:13.000Z',
      variable_name: 'cleaning leaves',
      user_id: 2
    },
  ];
}

// function makeVariablesArray() {
//   return [
//     {
//       id: 1,
//       variable_name: 'surface only vibrations',
//       experiment_id: 1
//     },
//     {
//       id: 2,
//       variable_name: 'using Synthecide',
//       experiment_id: 2
//     },
//     {
//       id: 3,
//       variable_name: 'manmade vibrations',
//       experiment_id: 1
//     },
//     {
//       id: 4,
//       variable_name: 'cleaning leaves',
//       experiment_id: 3
//     },
//   ];
// }

function makeObservationsArray() {
  return [
    {
      id: 1,
      observation_title: 'Colony health',
      observation_notes: `Colony's health is good, bees are active`,
      date_created: '2020-03-20T08:34:13.000Z',
      experiment_id: 2
    },
    {
      id: 2,
      observation_title: 'Colony health',
      observation_notes: 'After a month on pesticide, bees activities is low',
      date_created: '2020-06-10T08:34:13.000Z',
      experiment_id: 2
    },
    {
      id: 3,
      observation_title: 'Cleaning leaves',
      observation_notes: 'Air pollants aggregate on plant surface and decreases plant oxygen production, manually cleaning with cloth not enough',
      date_created: '2020-05-10T08:34:13.000Z',
      experiment_id: 3
    },
  ];
}
//XSS 
function makeMaliciousExperimentEntry() {
  const maliciousExperiment = {
    experiment_title: 'Fake title <script>alert("xss");</script>',
    hypothesis: 'Fake hypothesis <script>alert("xss");</script>',
    variable_name: 'Fake variable <script>alert("xss");</script>',
    user_id: 1
  };

  const expectedExperiment = {
    experiment_title: 'Fake title &lt;script&gt;alert("xss");&lt;/script&gt;',
    hypothesis: 'Fake hypothesis &lt;script&gt;alert("xss");&lt;/script&gt;',
    variable_name: 'Fake variable &lt;script&gt;alert("xss");&lt;/script&gt;',
    user_id: 1
  };

  return {
    maliciousExperiment,
    expectedExperiment
  };
}

function makeMaliciousObservationEntry () {
  const maliciousObservation = {
    observation_title: 'Colony health <script>alert("xss");</script>',
    observation_notes: `Colony's <script>alert("xss");</script> health is good, bees are active`,
    experiment_id: 2
  };

  const expectedObservation = {
    observation_title: 'Colony health &lt;script&gt;alert("xss");&lt;/script&gt;',
    observation_notes: `Colony's &lt;script&gt;alert("xss");&lt;/script&gt; health is good, bees are active`,
    experiment_id: 2
  };

  const maliciousObservationUpdate = {
    observation_title: 'Colony health <script>alert("xss");</script>',
    observation_notes: `Colony's <script>alert("xss");</script> health is good, bees are active`,
  };

  const expectedObservationUpdate = {
    observation_title: 'Colony health &lt;script&gt;alert("xss");&lt;/script&gt;',
    observation_notes: `Colony's &lt;script&gt;alert("xss");&lt;/script&gt; health is good, bees are active`
  }
  
  return {
    maliciousObservation,
    expectedObservation,
    maliciousObservationUpdate,
    expectedObservationUpdate
  };
}

//Seeding database for test files

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  
  return db.into('users').insert(preppedUsers)
      .then(() => 
            // update the auto sequence to stay in sync
        db.raw(
          `SELECT setval('users_id_seq', ?)`,
          [users[users.length - 1].id]
        ));
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

// function seedExperiments(db, experiments) {
//   return db.into('experiments').insert(experiments)
//     .then(() => {
//       db.raw(
//         `SELECT setval('lab-book_experiments_id_seq', ?)`,
//         [experiments[experiments.length - 1].id]
//       );
//     });
// }

function seedAllTables(db) {
  return seedUsers(db, makeUsersArray())
    .then(() => {
      return db.into('experiments')
        .insert(makeExperimentsArray());
    });

}



module.exports = {
  makeUsersArray,
  makeExperimentsArray,
  makeObservationsArray,
  seedUsers,
  seedAllTables,
  makeMaliciousExperimentEntry,
  makeMaliciousObservationEntry,
  makeAuthHeader
};