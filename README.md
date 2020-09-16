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
**For all post endpoints, database creates unique IDs and date in UTC time **

### Open Endpoints
Does not require authentication

```
GET /
```

Status: 200 OK 

#### Create User
Used to create a new account for a User. 

** URL ** `/api/users/`
** METHOD ** `POST`
** Auth Required ** `No`

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

** Code **: `200 ok`
*Content example *
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
** Condition 1 **: Missing a required field if request body 
** Code ** : `400 BAD REQUEST`

** Content ** : 
``` json
{
  "error": "Missing [SPECIFIC FIELD] in request body"
}

```
** Condition 2 **: Password contain spaces in the beginning or end. 
** Code ** : `400 BAD REQUEST`

** Content ** : 
``` json
{
  "error": "Password must not start or end with empty spaces"
}
```
** Condition 3 **: Username already exists. 
** Code ** : `400 BAD REQUEST`

** Content ** : 
``` json
{
  "error": "Username already taken"
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