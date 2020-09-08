
INSERT INTO users (first_name, last_name, username, password, email)
VALUES ('Derick', 'Planter', 'dPlanter', 'strongStuff', 'dplanter@herbz.com');

INSERT INTO experiments (experiment_title, hypothesis, variable_name, user_id)
VALUES 
  ('Plants and Sunlight', 'Plants need sunlight to live', 'lamp light', 1),
  ('Plants and Air quality', 'Particles in air can clog leaf pores', 'near carbon factories', 1);

INSERT INTO observations (observation_title, observation_notes, experiment_id)
VALUES 
  ('Plant oxygen production', 'Capture Measurement 1', 1),
  ('Plant oxygen production', 'Captrue Measurement 2', 1),
  ('Plant oxygen production', 'Capture MEasurement 3', 1),
  ('Plants and Air quality', 'too many clogs stuff', 2);