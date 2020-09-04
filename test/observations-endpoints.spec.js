require('dotenv').config();
const app = require('../src/app');
const knex = require('knex');
const supertest = require('supertest');
const { makeUsersArray, makeExperimentsArray, makeObservationsArray, makeVariablesArray } = require('./test-helpers');
const { expect } = require('chai');

describe('OBSERVATION ENDPOINTS', () => {
  let db;

  before('establish connection', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('destroy connection', () => db.destroy());

  before('Cleanup', () => {
    return db.raw('TRUNCATE observations, variables, experiments, users RESTART IDENTITY CASCADE');
  });

  afterEach('Cleanup', () => {
    return db.raw('TRUNCATE observations, variables, experiments, users RESTART IDENTITY CASCADE');
  });

  describe('GET /api/experiments/:experiments_id/observations', () => {

    context('When there is no data in the database', () => {
      it('Responds with a 200 and an empty array', () => {
        return supertest(app)
          .get('/api/experiments/1/observations')
          .expect(200, []);
      });
    });

    context('When there is data in the database', () => {
      beforeEach('insert data', () => {
        return db('users').insert(makeUsersArray())
          .then(() => {
            return db('experiments').insert(makeExperimentsArray());
          })
          .then(() => {
            return db('observations').insert(makeObservationsArray());
          })
          .then(() => {
            return db('variables').insert(makeVariablesArray());
          });
      });

      it('responds with 200 and only the experiments specific observations', () => {
        const experiment = makeExperimentsArray()[1];
        const experimentId = experiment.id;
        const expectedObservations = [
          {
            id: 1,
            observation_title: 'Colony health',
            observation_notes: "Colony's health is good, bees are active",
            date_created: '2020-03-20T08:34:13.000Z',
            experiment_id: 2
          },
          {
            id: 2,
            observation_title: 'Colony health',
            observation_notes: 'After a month on pesticide, bees activities is low',
            date_created: '2020-06-10T08:34:13.000Z',
            experiment_id: 2
          }
        ];

        return supertest(app)
          .get(`/api/experiments/${experimentId}/observations`)
          .expect(200)
          .expect(expectedObservations);

      });

    });
  });

  describe(`GET /api/experiments/:experiment_id/observations/:observations_id`, () => {
  
    beforeEach('insert data', () => {
      return db('users').insert(makeUsersArray())
        .then(() => {
          return db('experiments').insert(makeExperimentsArray());
        })
        .then(() => {
          return db('observations').insert(makeObservationsArray());
        })
        .then(() => {
          return db('variables').insert(makeVariablesArray());
        });
    });

    context('When the observation does not exist', () => {
      it(`Returns 404 and 'Observation does not exist'`, () => {
        const testObservationId = 12345;
        return supertest(app)
          .get(`/api/experiments/2/observations/${testObservationId}`)
          .expect(404, { error: { message: 'Observation does not exist'}});
      });
    });

    context.only(`When there's data in the database`, () => {
      it(`Returns 200 and the observation`, () => {
        const expectedObservation = makeObservationsArray()[0];
        const observationId = 1;
        return supertest(app)
          .get(`/api/experiments/1/observations/${observationId}`)
          .expect(200)
          .then( res => console.log(res.body))
      });
    });
  });
});