require('dotenv').config();
const app = require('../src/app');
const knex = require('knex');
const supertest = require('supertest');
const { makeUsersArray, makeExperimentsArray, makeMaliciousExperimentEntry, makeObservationsArray, makeAuthHeader } = require('./test-helpers');
const { expect } = require('chai');

//TODO update expect validations to expect data structure below
// { Experiment Data,
//   user: {
//     user data
//   }
//   observations: {
//     observation data
//   }
// }

describe('EXPERIMENTS endpoints', () => {
  let db;

  before('establish connection', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });


  after('destroy "db" connection', () => db.destroy());

  before('Cleanup', () => {
    return db.raw('TRUNCATE observations, experiments, users RESTART IDENTITY CASCADE');
  });

  afterEach('Cleanup', () => {
    return db.raw('TRUNCATE observations, experiments, users RESTART IDENTITY CASCADE');
  });


  describe(`GET /api/experiments`, () => {

    
    context('Given no experiments in the database', () => {

      beforeEach('Insert users to database', () => {
        return db('users').insert(makeUsersArray());
      });

      it('returns a 200 and an empty array', () => {
        return supertest(app)
          .get('/api/experiments')
          .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
          .expect(200, []);
      });
    });

    context('Given experiments in the database', () => {
      beforeEach('Insert experiments to database', () => {
        return db('users').insert(makeUsersArray())
          .then(() => {
            return db('experiments').insert(makeExperimentsArray());
          })
          .then(() => {
            return db('observations').insert(makeObservationsArray());
          });
      });
      // needs to be for specific users only
      it('responds with 200 and all of the experiments', () => {
        const expected = makeExperimentsArray()[0];
        return supertest(app)
          .get('/api/experiments')
          .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
          .expect(200)
          .then(res => {
            expect(res.body[0].id).to.eql(expected.id);
            expect(res.body[0].experiment_title).to.eql(expected.experiment_title);
            expect(res.body[0].hypothesis).to.eql(expected.hypothesis);
            expect(res.body[0].user_id).to.eql(expected.user_id);
            expect(res.body[0]).to.have.property('date_created');
          });
      });

    });

    context('Given an XSS attack experiment', () => {
      beforeEach('Insert users to database', () => {
        return db('users').insert(makeUsersArray());
      });

      const { maliciousExperiment, expectedExperiment } = makeMaliciousExperimentEntry();

      beforeEach('Insert malicious experiment entry', () => {
        return db('experiments')
          .insert(maliciousExperiment);
      });

      it('Removes XSS attack content', () => {
        return supertest(app)
          .get('/api/experiments')
          .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
          .expect(200)
          .expect(res => {
            expect(res.body[0].experiment_title).to.eql(expectedExperiment.experiment_title);
            expect(res.body[0].hypothesis).to.eql(expectedExperiment.hypothesis);
            expect(res.body[0].variable_name).to.eql(expectedExperiment.variable_name);
          });
      });
    });

  });

  describe(`GET /api/experiments/:experiment_id`, () => {

    context('Given no experiments', () => {
      beforeEach('Insert users to database', () => {
        return db('users').insert(makeUsersArray());
      });

      it('Responds with 404 and experiment does not exist', () => {
        const experiment_id = 2;

        return supertest(app)
          .get(`/api/experiments/${experiment_id}`)
          .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
          .expect(404, { error: { message: 'Experiment does not exist' } });
      });
    });

    context('Given experiments in the database', () => {
      beforeEach('Insert experiments to database', () => {
        return db('users').insert(makeUsersArray())
          .then(() => {
            return db('experiments').insert(makeExperimentsArray());
          });
      });

      it('responds with 404 when folder does not exist', () => {
        const experiment_id = 12345;
        return supertest(app)
          .get(`/api/experiments/${experiment_id}`)
          .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
          .expect(404, { error: { message: 'Experiment does not exist' } });
      });

      it('responds with 200 and the specified experiment', () => {
        const expectedExperiment = makeExperimentsArray()[1];
        const expectedExperimentId = expectedExperiment.id;

        return supertest(app)
          .get(`/api/experiments/${expectedExperimentId}`)
          .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
          .expect(200)
          .expect(expectedExperiment);
      });
    });
  });

  describe(`POST /api/experiments`, () => {

    beforeEach('Insert experiments to database', () => {
      return db('users').insert(makeUsersArray());
    });

    it(`creates a new experiment and responds with 201 and new experiment`, () => {
      const newExperiment = {
        experiment_title: "Test Experiment",
        hypothesis: "This is expected to behave this way",
        user_id: 1,
        variable_name: "farms with cows"
      };

      return supertest(app)
        .post('/api/experiments/')
        .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
        .send(newExperiment)
        .expect(201);
    });

    const requiredFields = ['experiment_title', 'hypothesis', 'user_id', 'variable_name'];
    requiredFields.forEach(field => {
      const newExperiment = {
        experiment_title: "New Experiment",
        hypothesis: "This is expected to behave this way",
        user_id: 1,
        variable_name: "farms with cows"
      };

      it(`Responds with a 400 and an error message when the '${field}' is missing`, () => {
        delete newExperiment[field];
        return supertest(app)
          .post('/api/experiments')
          .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
          .send(newExperiment)
          .expect(400, { error: { message: `Missing '${field}' in request body` } });
      });
    });

    it('Removes malicious XSS attack before inserting', () => {
      const { maliciousExperiment, expectedExperiment } = makeMaliciousExperimentEntry();

      return supertest(app)
        .post('/api/experiments/')
        .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
        .send(maliciousExperiment)
        .expect(201)
        .expect(res => {
          expect(res.body.experiment_title).to.eql(expectedExperiment.experiment_title);
          expect(res.body.hypothesis).to.eql(expectedExperiment.hypothesis);
          expect(res.body.variable_name).to.eql(expectedExperiment.variable_name);
          expect(res.body.user_id).to.eql(expectedExperiment.user_id);
        })
        .then(res => 
          supertest(app)
            .get(`/api/experiments/${res.body.id}`)
            .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
            .expect(res.body)
        );
    });
  });

  describe(`DELETE /api/experiments/:experiment_id`, () => {
    beforeEach('Insert experiments to database', () => {
      return db('users').insert(makeUsersArray())
        .then(() => {
          return db('experiments').insert(makeExperimentsArray());
        })
        .then(() => {
          return db('observations').insert(makeObservationsArray());
        });
    });

    it('should delete experiment by id', () => {
      return db('experiments')
        .first()
        .then(experiment => {
          return supertest(app)
            .delete(`/api/experiments/${experiment.id}`)
            .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
            .expect(204);
        });
    });

    it('should respond with 404 for an invalid id', () => {
      return supertest(app)
        .delete('/api/experiments/12334')
        .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
        .expect(404, { error: { message: 'Experiment does not exist' } });
    });

  });
});
