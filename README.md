# Lab-book Server side API

This is a server that works along with a Lab-book client: 

Open [live app](http://localhost:3000) to view it in the browser.

## Description 
This is the server feature of a larger app that will help field researchers track their research and store their field observations.

The form layout is based on the scientific method. Users will use the app to sign up, document, and delete multiple experiment observations.

The server allows for new user sign up, and users to store their experiments and observations. 

## Technology Stack
This server-side app was made using the JavaScript, CSS 3, HTML 5. Alongside, this server used Node.js, Express.js and Postgresql.

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