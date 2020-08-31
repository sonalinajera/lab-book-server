require('dotenv').config();
const app = require('../src/app');
const knex = require('knex');
const supertest = require('supertest');
const { before } = require('mocha');
const helpers = require('./test-helpers');
const { seedUsers, makeUsersArray, makeExperimentsArray } = require('./test-helpers');
const { expect } = require('chai');

describe.only('LAB BOOK endpoints', () => {
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


  describe(`GET /api/experiments/:user_id`, () => {

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
        const expected = helpers.makeExperimentsArray();
        return supertest(app)
          .get('/api/experiments')
          .expect(200)
          .then(res => {
            console.log(res.body);
          });
      });

      // it('responds with ')

    });

  });


});
