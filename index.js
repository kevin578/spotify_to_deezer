const express = require('express')
const app = express()
const queryString = require('query-string');
const request = require('request')
require('dotenv').config()

app.get('/auth/spotify', function(req, res) {
  var scope = 'user-library-read playlist-read-private';
   res.redirect('https://accounts.spotify.com/authorize?' +
    queryString.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: scope,
      redirect_uri: 'http://localhost:3001/auth/spotify/callback/',
    }));
});

app.get(
  '/auth/spotify/callback/',
  function(req, res) {
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: req.query.code,
        redirect_uri: 'http://localhost:3001/auth/spotify/callback/',
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
      },
      json: true
    };
  request.post(authOptions, function(error, response, body) {
    console.log('Spotify Access Token: ' + body.access_token)
    res.redirect('/')
  })
  }
);

app.get('/auth/deezer', function(req, res) {
  res.redirect('https://connect.deezer.com/oauth/auth.php?' +
    queryString.stringify({
      app_id: process.env.DEEZER_APP_ID,
      redirect_uri: 'http://localhost:3001/auth/deezer/callback',
      perms: 'basic_access,email,manage_library'
    }));
})

app.get('/auth/deezer/callback/', function(req, res) {
  request.get('https://connect.deezer.com/oauth/access_token.php?' + 
    queryString.stringify({
      app_id: process.env.DEEZER_APP_ID,
      secret: process.env.DEEZER_SECRET,
      code: req.query.code,
    }),
    function(error, response, body) {
      console.log('Deezer Access Token: ' + queryString.parse(body).access_token)
      res.redirect('/')
    }) 
})


app.get('/', function (req, res) {
  res.sendFile(`${__dirname}/index.html`)
})

app.listen(3001)
