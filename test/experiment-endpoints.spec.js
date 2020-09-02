require('dotenv').config();
const app = require('../src/app');
const knex = require('knex');
const supertest = require('supertest');
const { makeUsersArray, makeExperimentsArray, makeVariablesArray, makeObservationsArray } = require('./test-helpers');
const { expect } = require('chai');

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
    return db.raw('TRUNCATE observations, variables, experiments, users RESTART IDENTITY CASCADE');
  });

  afterEach('Cleanup', () => {
    return db.raw('TRUNCATE observations, variables, experiments, users RESTART IDENTITY CASCADE');
  });


  describe(`GET /api/experiments`, () => {

    context('Given no experiments in the database', () => {
      it('returns a 200 and an empty array', () => {
        return supertest(app)
          .get('/api/experiments')
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
            return db('variables').insert(makeVariablesArray());
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
          .expect(200)
          .then(res => {
            expect(res.body[0].id).to.eql(expected.id);
            expect(res.body[0].experiment_title).to.eql(expected.experiment_title);
            expect(res.body[0].hypothesis).to.eql(expected.hypothesis);
            expect(res.body[0].user_id).to.eql(expected.user_id);
            expect(res.body[0]).to.have.property('date_created');
          });
      });

      // need to do XSS

    });

  });

  describe(`GET /api/experiments/:experiment_id`, () => {

    context('Given no experiments', () => {

      it('Responds with 404 and experiment does not exist', () => {
        const experiment_id = 2;

        return supertest(app)
          .get(`/api/experiments/${experiment_id}`)
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
          .expect(404, { error: { message: 'Experiment does not exist' } });
      });

      it('responds with 200 and the specified experiment', () => {
        const expectedExperiment = makeExperimentsArray()[1];
        const expectedExperimentId = expectedExperiment.id;
  
        return supertest(app)
          .get(`/api/experiments/${expectedExperimentId}`)
          .expect(200)
          .expect(expectedExperiment);
      });
    });
  });

});
