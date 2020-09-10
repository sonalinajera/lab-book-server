require('dotenv').config();
const app = require('../src/app');
const knex = require('knex');
const supertest = require('supertest');
const { makeUsersArray, makeExperimentsArray, makeObservationsArray, makeMaliciousObservationEntry, makeAuthHeader } = require('./test-helpers');
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
    return db.raw('TRUNCATE observations, experiments, users RESTART IDENTITY CASCADE');
  });

  afterEach('Cleanup', () => {
    return db.raw('TRUNCATE observations, experiments, users RESTART IDENTITY CASCADE');
  });

  describe('GET /api/experiments/:experiments_id/observations', () => {

    context('When there is no data in the database', () => {
      it('Responds with a 200 and an empty array', () => {
        return supertest(app)
          .get('/api/experiments/1/observations')
          .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
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
          });
      });

      it('responds with 200 and only the experiments specific observations', () => {
        const experiment = makeExperimentsArray()[1];
        const experimentId = experiment.id;
        const expectedObservations = [
          {
            id: 1,
            observation_title: 'Colony health',
            observation_notes: 'Colony\'s health is good, bees are active',
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
          .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
          .expect(200)
          .expect(expectedObservations);

      });

    });

    context('Given an XSS attack observation', () => {
      beforeEach('Inser users and experiments to database', () => {
        return db('users').insert(makeUsersArray())
          .then(() => {
            return db('experiments').insert(makeExperimentsArray());
          });
      });

      const { maliciousObservation, expectedObservation } = makeMaliciousObservationEntry();

      beforeEach('Insert malicious observation entry', () => {
        return db('observations')
          .insert(maliciousObservation);
      });

      it('Removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/experiments/${maliciousObservation.experiment_id}/observations`)
          .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
          .expect(200)
          .expect(res => {
            expect(res.body[0].observation_title).to.eql(expectedObservation.observation_title);
            expect(res.body[0].observation_notes).to.eql(expectedObservation.observation_notes);
            expect(res.body[0].experiment_id).to.eql(expectedObservation.experiment_id);
            expect(res.body[0]).to.have.property('date_created');
          });
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
        });
    });

    context('When the observation does not exist', () => {
      it(`Returns 404 and 'Observation does not exist'`, () => {
        const testObservationId = 12345;
        return supertest(app)
          .get(`/api/experiments/2/observations/${testObservationId}`)
          .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
          .expect(404, { error: { message: 'Observation does not exist'}});
      });
    });

    context(`When there's data in the database`, () => {
      it(`Returns 200 and the observation`, () => {
        const expectedObservation = makeObservationsArray()[0];
        const observationId = 1;
        return supertest(app)
          .get(`/api/experiments/1/observations/${observationId}`)
          .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
          .expect(200)
          .expect(expectedObservation);
      });
    });
  });

  describe('POST /api/experiments/:experiment_id/observations', () => {
    beforeEach('insert data', () => {
      return db('users').insert(makeUsersArray())
        .then(() => {
          return db('experiments').insert(makeExperimentsArray());
        });
    });

    it('should create and return a new observation when provided valid data', () => {
      const newObservation = {
        observation_title: 'Particle size influences O2 production',
        observation_notes: 'Carbon emission deposits on local flora inhibits photosynthesis', 
        experiment_id: 2
      };

      return supertest(app)
        .post(`/api/experiments/${newObservation.experiment_id}/observations`)
        .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
        .send(newObservation)
        .expect(201)
        .expect(res => {
  
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('observation_title', 'observation_notes', 'experiment_id');
          expect(res.body.observation_title).to.equal(newObservation.observation_title);
          expect(res.body.observation_notes).to.equal(newObservation.observation_notes);
          expect(res.body.experiment_id).to.equal(newObservation.experiment_id);
          expect(res.headers.location).to.equal(`/api/experiments/${newObservation.experiment_id}/observations/${res.body.id}`);
        });
    });

    const requiredFields = ['observation_title', 'observation_notes', 'experiment_id'];
    requiredFields.forEach(field => {
      const newObservation = {
        observation_title: 'Particle density greatly reduces photosynthesis',
        observation_notes: 'slick gunk affects plants more than light dust', 
        experiment_id: 2
      };

      it(`Responds with a 400 and an error message when the '${field}' is missing`, () => {
        delete newObservation[field];
        return supertest(app)
          .post(`/api/experiments/${newObservation.experiment_id}/observations`)
          .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
          .send(newObservation)
          .expect(400, { error: { message: `Missing '${field}' in request body` } });
      });
    });

    it('Removes malicious XSS attack before inserting', () => {
      const { maliciousObservation, expectedObservation } = makeMaliciousObservationEntry();

      return supertest(app)
        .post(`/api/experiments/${maliciousObservation.experiment_id}/observations`)
        .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
        .send(maliciousObservation)
        .expect(201)
        .expect(res => {
          expect(res.body.observation_title).to.eql(expectedObservation.observation_title);
          expect(res.body.observation_notes).to.eql(expectedObservation.observation_notes);
          expect(res.body.experiment_id).to.equal(expectedObservation.experiment_id);
        })
        .then(res => 
          supertest(app)
            .get(`/api/experiments/${maliciousObservation.experiment_id}/observations/${res.body.id}`)
            .expect(res.body)
        );
    });

  });

  describe(`PATCH /api/experiments/:experiment_id/observations/:observations_id`, () => {
    beforeEach('insert data', () => {
      return db('users').insert(makeUsersArray())
        .then(() => {
          return db('experiments').insert(makeExperimentsArray());
        })
        .then(() => {
          return db('observations').insert(makeObservationsArray());
        });
    });

    it('should update observation when given valid data and an id', () => {
      const updatedObservation = {
        observation_title: 'Particle density deeply affects photosynthesis',
        observation_notes: 'Carbon emission deposits on local flora inhibits photosynthesis by being a physical blocker', 
      };

      return supertest(app)
        .patch(`/api/experiments/${makeObservationsArray()[2].experiment_id}/observations/${makeObservationsArray()[2].id}`)
        .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
        .send(updatedObservation)
        .expect(200)
        .then(res => {
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'observation_title', 'observation_notes');
          expect(res.body.observation_title).to.equal(updatedObservation.observation_title);
          expect(res.body.observation_notes).to.equal(updatedObservation.observation_notes);
        });

    });

    it('should respond with 400 when given bad data', () => {
      const badUpdate = {
        newKey: 'stuff we don not care about'
      };

      return db('observations')
        .first()
        .then(observation => {
          return supertest(app)
            .patch(`/api/experiments/${observation.experiment_id}/observations/${observation.id}`)
            .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
            .send(badUpdate)
            .expect(400);
        });

    });

    it('should respond with 404 for an invalid id', () => {
      const updatedObservation = {
        observation_title: 'Particle density deeply affects photosynthesis',
        observation_notes: 'Carbon emission deposits on local flora inhibits photosynthesis by being a physical blocker', 
      };

      return supertest(app)
        .patch(`/api/experiments/${makeObservationsArray()[2].experiment_id}/observations/123345`)
        .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
        .send(updatedObservation)
        .expect(404, {
          error: { message: 'Observation does not exist'}
        });
    });

    it('Removes malicious XSS attack before updating', () => {
      const { maliciousObservationUpdate, expectedObservationUpdate } = makeMaliciousObservationEntry();

      return supertest(app)
        .patch(`/api/experiments/2/observations/1`)
        .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
        .send(maliciousObservationUpdate)
        .expect(200)
        .expect(res => {
          expect(res.body.observation_title).to.eql(expectedObservationUpdate.observation_title);
          expect(res.body.observation_notes).to.eql(expectedObservationUpdate.observation_notes);
        })
        .then(res => 
          supertest(app)
            .get(`/api/experiments/2/observations/${res.body.id}`)
            .expect(res.body)
        );
    });

  });

  describe(`DELETE /api/experiments/:experiment_id/observations/:observations_id`, () => {
    beforeEach('Insert experiments to database', () => {
      return db('users').insert(makeUsersArray())
        .then(() => {
          return db('experiments').insert(makeExperimentsArray());
        })
        .then(() => {
          return db('observations').insert(makeObservationsArray());
        });
    });

    it('should delete observation by id', () => {
      return db('experiments')
        .first()
        .then(experiment => {
          return supertest(app)
            .delete(`/api/experiments/${experiment.id}/observations/${makeObservationsArray()[0].id}`)
            .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
            .expect(204);
        });
    });

    it('should respond with 404 for an invalid id', () => {
      return supertest(app)
        .delete('/api/experiments/1/observations/12345')
        .set('Authorization', makeAuthHeader(makeUsersArray()[0]))
        .expect(404, { error: { message: 'Observation does not exist' }});
    });

  });

});