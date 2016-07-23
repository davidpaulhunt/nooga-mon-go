'use strict';

// const PokeInfo = require('./noogamongo');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(3000);

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.render('index');
});

io.on('connection', (socket) => {
  const PokemonWatcher = require('./pokemon_watcher');
  PokemonWatcher.on('fetched', (data) => {
    socket.emit('pokemon_data', data);
  });
});
