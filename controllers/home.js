const express = require('express');
const request = require('request')
 
const router = express.Router();


router.get('/', refreshSpotifyToken, async function (req, res) {
  let { spotify_token } = req.signedCookies;
  if (spotify_token) {
    const albums = await proccessAlbums(spotify_token)
  }
  res.sendFile(`${process.env.PWD}/index.html`)
})

async function proccessAlbums(access_token, albums = [], offset = 0) {
  const newAlbums = await getAlbums(access_token, offset)

  // if (newAlbums.length == 20 ) {
  //   proccessAlbums(access_token, albums.concat(newAlbums), offset + 20)
  // }
  return albums.concat(newAlbums)

}

function getAlbums(access_token, offset) {
  return new Promise((resolve)=> {
    var options = {
      'method': 'GET',
      'url': `https://api.spotify.com/v1/me/albums?offset=${offset}`,
      'headers': {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    };
    request(options, function (error, response) {
      const body = JSON.parse(response.body)
      const albums = body.items;
      const newAlbums = albums.map((album)=> {
        return {artist: album.album.artists[0].name, album: album.album.name}
      })
      resolve(newAlbums)
    });

  })
}


function refreshSpotifyToken(req, res, next) {
  if (!req.signedCookies) return next()
  console.log(req.signedCookies.spotify_token)
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 
      'Authorization': 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: req.signedCookies.spotify_token 
    },
    json: true
  };
  request.post(authOptions, function(error, response, body) {
    console.log(error, body)
    if (!error && response.statusCode === 200) {
      res.cookies('spotify_token', body, {encode: true})
    }
    next();
  });
}


module.exports = router
