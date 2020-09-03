
INSERT INTO users (first_name, last_name, username, password, email)
VALUES ('Derick', 'Planter', 'dPlanter', 'strongStuff', 'dplanter@herbz.com');

INSERT INTO experiments (experiment_title, hypothesis, user_id)
VALUES 
  ('Plants and Sunlight', 'Plants need sunlight to live', 1),
  ('Plants and Air quality', 'Particles in air can clog leaf pores', 1);

INSERT INTO variables (variable_name, experiment_id)
VALUES 
  ('lamp light', 1),
  ('lamp light', 2);

INSERT INTO observations (observation_title, observation_notes, experiment_id)
VALUES 
  ('Plant oxygen production', 'Capture Measurement 1', 1),
  ('Plant oxygen production', 'Captrue Measurement 2', 1),
  ('Plant oxygen production', 'Capture MEasurement 3', 1),
  ('Plants and Air quality', 'too many clogs stuff', 2);