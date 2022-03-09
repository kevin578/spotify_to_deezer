const express = require('express')
const queryString = require('query-string');
const request = require('request')
const cookieParser = require('cookie-parser');
const authRoutes = require('./controllers/auth');
const homeRoutes = require('./controllers/home');

require('dotenv').config()

const app = express()

app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(authRoutes)
app.use(homeRoutes)

app.listen(3001)
