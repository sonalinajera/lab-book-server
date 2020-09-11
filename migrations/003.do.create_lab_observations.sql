DROP TABLE IF EXISTS observations;

CREATE TABLE observations
( 
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  observation_title TEXT NOT NULL,
  observation_notes TEXT NOT NULL,
  date_created TIMESTAMPTZ NOT NULL DEFAULT now(),
  experiment_id INTEGER REFERENCES experiments(id) ON DELETE CASCADE NOT NULL 
);