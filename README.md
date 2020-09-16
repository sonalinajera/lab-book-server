# Lab-book Server side API

This is a server that works along with a Lab-book client: 

Open [live app](https://frozen-lowlands-31689.herokuapp.com/) to view it in the browser.

## Summary 
The API connects client and server for the Lab Book application. The API allows for CRUD operations listed below to be accessed at specific endpoints to create and store Users, Experiments and Observations. The API also handles creating unique ideas for each group of data collected. 

## Description of App Interaction
This is the server feature of a larger app that will help field researchers track their research and store their field observations.

The form layout is based on the scientific method. Users will use the app to sign up, document, and delete multiple experiment observations.

The server allows for new user sign up, and users to store their experiments and observations. 

## Technology Stack
This server-side app was made using the JavaScript, CSS 3, HTML 5. Alongside, this server used Node.js, Express.js and Postgresql.


## Endpoints (How to use)
**For all post endpoints, database creates unique IDs and date in UTC time**

### Open Endpoints
Does not require authentication

#### 1. Create User
Used to create a new account for a User. 

**URL** `/api/users/`

**METHOD** `POST`

**Auth Required** `No`

##### Constraints 
Must include the following fields in original request 

``` json
{
  "username": "someUsername",
  "password": "someP@ssword1",
  "first_name": "someFirstName",
  "last_name": "someLastName",
  "email": "someEmail"
}
```

#### Success Response

**Code**: `200 ok`

**Content**
 ``` json 
 {
  "id": 1,
  "username": "someUsername",
  "first_name": "someFirstName",
  "last_name": "someLastName",
  "email": "someEmail",
  "date_created": "2020-08-25T08:34:13.000Z"
 }
```

#### Error Response

**Condition 1**: Missing a required field in request body 

**Code** : `400 BAD REQUEST`

**Content** : 
``` json
{
  "error": "Missing [SPECIFIC FIELD] in request body"
}

```
**Condition 2**: Password contain spaces in the beginning or end.

**Code** : `400 BAD REQUEST`

**Content** : 
``` json
{
  "error": "Password must not start or end with empty spaces"
}
```
**Condition 3**: Username already exists. 

**Code** : `400 BAD REQUEST`

**Content** : 
``` json
{
  "error": "Username already taken"
}
```

#### 2. Login
Used to collect a token for a registered User. 

**URL** `/api/login/`

**METHOD** `POST`

**Auth Required** `No`

**Content** : 
``` json
{
  "username": "[valid email address]",
  "password": "[password in plain text]"
}
```

#### Success Response

**Code**: `200 ok`

**Content**
 ``` json 
 {
  "token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcl9pZCI6IjIiLCJpYXQiOjE1MTYyMzkwMjJ9.XSEH_rpQwQ8GKLAr6siB_NemU7MwxYxirSsR-l18VZ4"
 }
```

#### Error Response

**Condition 1**: Missing a required key in request body 

**Code** : `400 BAD REQUEST`

**Content** : 
``` json
{
  "error": "Missing [SPECIFIC KEY] in request body"
}

```

#### Error Response

**Condition 1**: Incorrect Username/Password 

**Code** : `400 BAD REQUEST`

**Content** : 
``` json
{
  "error": "Incorrect username or password"
}

```


### Closed Endpoints
Endpoints that require a valid Token to be included in the header of request. Token generated from successful login. 


#### 1. GET Experiments
Get details experiments for the User that is currently logged in. 

**URL** `/api/experiments/`

**METHOD** `GET`

**Auth Required** `Yes`


#### Success Response

**Code**: `200 ok`

**Content**
For user ID 1 with successful login and token generated 

**Without Experiments**
```json
{[]}
```

**With Experiments**

 ``` json 
 [
    {
      "id": "1",
      "experiment_title": "Title",
      "hypothesis": "Hypothesis",
      "date_created": "2020-08-23T08:34:13.000Z",
      "variable_name": "var",
      "user_id": "1"
    },
    {
      "id": "2",
      "experiment_title": "Title",
      "hypothesis": "Hypothesis",
      "date_created": "2020-08-23T08:34:13.000Z",
      "variable_name": "var",
      "user_id": "1"
    }
 ]
```

#### 2. GET Experiment by ID
Get details experiments for the User that is currently logged in. 

**URL** `/api/experiments/:experiment_id/`

**METHOD** `GET`

**Auth Required** `Yes`

#### Success Response

**Code**: `200 ok`

**Content**
For user ID 1 with successful login and token generated for experiment id 2. 

 ``` json 
 [
    {
      "id": "2",
      "experiment_title": "Title",
      "hypothesis": "Hypothesis",
      "date_created": "2020-08-23T08:34:13.000Z",
      "variable_name": "var",
      "user_id": "1"
    }
 ]
```

#### Error Response

**Condition 1**: Experiment doesn't exist at that ID 

**Code** : `404 NOT FOUND`

**Content** : 
``` json
{
  "error": "Experiment does not exist"
}

```

#### 3. POST Experiment
Creates experiment for current user that is logged in

**URL** `/api/experiments/`

**METHOD** `POST`

**Auth Required** `Yes`

##### Constraints 
Must include the following fields in original request 

``` json
{
  "experiment_title": "Title",
  "hypothesis": "Hypothesis",
  "variable_name": "var",
  "user_id": "1"
}
```

#### Success Response

**Code**: `201 ok`

**Content**
location `/api/experiments/3/`

 ``` json 
 [
    {
      "id": "3",
      "experiment_title": "newTitle",
      "hypothesis": "newHypothesis",
      "date_created": "2020-08-23T08:34:13.000Z",
      "variable_name": "newVar",
      "user_id": "1"
    }
 ]
```

#### Error Response

**Condition 1**: Missing a required field

**Code** : `400 BAD REQUEST`

**Content** : 
``` json
{
  "error": "Missing [SPECIFIC KEY] in request body"
}
```

#### 4. DELETE Experiment
Deletes experiment for current user that is logged in from database

**URL** `/api/experiments/:experiment_id/`

**METHOD** `DELETE`

**Auth Required** `Yes`

##### Constraints 
Must include experiment id to delete

#### Success Response

**Code**: `204 ok`
No content sent back

#### Error Response

**Condition 1**: Experiment at specified ID does not exist

**Code** : `404 NOT FOUND`

**Content** : 
``` json
{
  "error": "Experiment does not exist"
}

```

#### 5. GET Observations by experiment ID
Get details of observations for the User that is currently logged in and the current experiment id. 

**URL** `/api/experiments/:experiment_id/observations/`

**METHOD** `GET`

**Auth Required** `Yes`

##### Constraints 
Must include experiment ID.

#### Success Response

**Code**: `200 ok`

**Content**
location `/api/experiments/2/observations/`

**Without Observations**
```json
{[]}
```

**With Observations**

 ``` json 
 [
    {
      "id": 1,
      "observation_title": "Observation title 1",
      "observation_notes": "Observation Notes 1",
      "date_created": "2020-03-20T08:34:13.000Z",
      "experiment_id": "2"
    },
     {
      "id": 2,
      "observation_title": "Observation title 2",
      "observation_notes": "Observation Notes 2",
      "date_created": "2020-03-20T08:34:13.000Z",
      "experiment_id": "2"
    },
  ]
```


#### 6. GET Observation by ID
Get details of observation for the User that is currently logged in and the current experiment id. 

**URL** `/api/experiments/:experiment_id/observations/:observation_id/`

**METHOD** `GET`

**Auth Required** `Yes`

##### Constraints 
Must include experiment ID and observation ID.

#### Success Response

**Code**: `200 ok`

**Content**
location `/api/experiments/2/observations/2/`

**Without Observations**
```json
{[]}
```

**With Observations**

 ``` json 
 [
     {
      "id": 2,
      "observation_title": "Observation title 2",
      "observation_notes": "Observation Notes 2",
      "date_created": "2020-03-20T08:34:13.000Z",
      "experiment_id": "2"
    },
  ]
```

#### 7. POST Observation
Get details of observation for the User that is currently logged in and the current experiment id. 

**URL** `/api/experiments/:experiment_id/observations/`

**METHOD** `POST`

**Auth Required** `Yes`

##### Constraints 
Must include experiment ID.

request body 

```json
  {
    "observation_title": "Observation title 1",
    "observation_notes": "Observation Notes 1", 
    "experiment_id": "2"
  }
```

#### Success Response

**Code**: `201 ok`

**Content**
location `/api/experiments/2/observations/1`

 
 ``` json 
 [
     {
      "id": 1,
      "observation_title": "Observation title 1",
      "observation_notes": "Observation Notes 1",
      "date_created": "2020-03-20T08:34:13.000Z",
      "experiment_id": "2"
    },
  ]
```

#### Error Response

**Condition 1**: Missing a required field

**Code** : `400 BAD REQUEST`

**Content** : 
``` json
{
  "error": "Missing [SPECIFIC KEY] in request body"
}

```

#### 4. DELETE Observation
Deletes observation for current user that is logged in from database

**URL** `/api/experiments/:experiment_id/observation/:observation_id`

**METHOD** `DELETE`

**Auth Required** `Yes`

##### Constraints 
Must include experiment and observation ID to delete

#### Success Response

**Code**: `204 ok`
No content sent back

#### Error Response

**Condition 1**: Observation at specified ID does not exist

**Code** : `404 NOT FOUND`

**Content** : 
``` json
{
  "error": "Observation does not exist"
}

```

## Clone Set up (optional: not needed to run client side)

Complete the following steps to start a new project (NEW-PROJECT-NAME):

1. Clone this repository to your local machine `git clone LAB-BOOK-SERVICE-URL NEW-PROJECTS-NAME`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`
5. Move the example Environment file to `.env` that will be ignored by git and read by the express server `mv example.env .env`
6. Create a database and test database on your local machine
7. Run migration scripts and seed tables
8. User `npm test` to make sure everything is set up
9. Edit the contents of the `package.json` to use NEW-PROJECT-NAME instead of `"name": "lab-book-serve",`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

To create tables `migrate`
    
To create test tables `migrate:test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.