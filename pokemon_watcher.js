'use strict';

const _ = require('lodash');
const PokemonGo = require('pokemon-go-node-api');
const EventEmitter = require('events');
const credentials = require('./credentials.json');
const places = require('./places.json').list;

class PokemonWatcher extends EventEmitter {
  constructor(accounts) {
    super();
  }
}

const watcher = new PokemonWatcher();

_.keys(credentials.place_accounts).map(function mapPlaceAccounts(key) {
  const creds = credentials.place_accounts[key];
  const place = _.find(places, { 'key': key });
  const account = new PokemonGo.Pokeio();
  const location = {
    type: 'coords',
    coords: {
      altitude: 0,
      latitude: place.lat,
      longitude: place.lng,
    },
  };
  const username = creds.username;
  const password = creds.password;
  const provider = creds.provider;

  account.init(username, password, location, provider, function initAccount() {
    const interval = setInterval(function every10Seconds() {
      const hbData = {
        place: key,
        pokemon: [],
      };

      account.Heartbeat(function handleAccountHeartbeat(err, hb) {
        if (err) {
          console.error(err);
        } else {
          if (hb.cells.length > 0) {
            const cells = hb.cells;
            cells.forEach(function eachCell(cell, cellIndex) {
              if (cell.NearbyPokemon.length > 0) {
                // do something about nearby
                cell.NearbyPokemon.forEach(function eachNearbyPokemon(nearbyPokemon, nearbyIndex) {
                  const pokemon = account.pokemonlist[parseInt(nearbyPokemon.PokedexNumber, 10) - 1];
                  const pokemonData = {
                    name: pokemon.name,
                    img: pokemon.img,
                    distance: nearbyPokemon.DistanceMeters.toString(),
                  };
                  const mappedPokemon = _.find(cell.MapPokemon, { 'PokedexTypeId': nearbyPokemon.PokedexNumber });
                  if (mappedPokemon) {
                    pokemonData.location = {
                      lat: mappedPokemon.Latitude,
                      lng: mappedPokemon.Longitude,
                    };
                  }
                  hbData.pokemon.push(pokemonData);
                });
              }
            });
          }
        }

        watcher.emit('fetched', hbData);
      });
    }, 10000);

    process.on('exit', () => {
      clearInterval(interval);
    });
  });
});

module.exports = watcher;
