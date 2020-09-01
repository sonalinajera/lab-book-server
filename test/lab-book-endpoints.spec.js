require('dotenv').config();
const app = require('../src/app');
const knex = require('knex');
const supertest = require('supertest');
const { seedUsers, makeUsersArray, makeExperimentsArray } = require('./test-helpers');

describe('LAB BOOK endpoints', () => {
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
          });
      });
      // needs to be for specific users only
      it('responds with 200 and all of the experiments', () => {
        const expected = makeExperimentsArray();
        return supertest(app)
          .get('/api/experiments')
          .expect(200)
          .expect(expected);
      });

      // need to do XSS

    });

  });

  describe.only(`GET /api/experiments/:experiment_id`, () => {

    context('Given no experiments', () => {

      it('Responds with 404 and experiment does not exist', () => {
        const experiment_id = 2;

        return supertest(app)
          .get(`/api/experiment/${experiment_id}`)
          .expect(404)
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
          .get(`/api/experiment/${experiment_id}`)
          .expect(404);
      });
    });
  });

});
