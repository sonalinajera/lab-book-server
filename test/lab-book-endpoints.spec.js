require('dotenv').config();
const app = require('../src/app');
const knex = require('knex');
const supertest =require('supertest');
const { before } = require('mocha');


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
    db.raw('TRUNCATE observations, variables, experiments, users RESTART IDENTITY CASCADE');
  });

  afterEach('Cleanup', () => {
    db.raw('TRUNCATE observations, variables, experiments, users RESTART IDENTITY CASCADE');
  });


  describe(`GET /api/experiments`, () => {
    
    context('Given no experiments in the database', () => {
      it('returns a 200 and an empty array', () => {
        return supertest(app)
          .get('/api/experiments')
          .expect(200, []);
      });
    });


  });
  

});
