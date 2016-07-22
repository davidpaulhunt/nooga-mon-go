'use strict';

function info(msg) {
  process.stdout.write(`\n${msg}\n`);
}

const _ = require('lodash');
const PGO = require('pokemon-go-node-api');

const accountOne = new PGO.Pokeio();
const locationOne = {
  type: 'coords',
  coords: {
    latitude: 35.056355,
    longitude: -85.311214,
    altitude: 0,
  },
};
const credentials = require('./credentials.json');
const usernameOne = credentials.username;
const passwordOne = credentials.password;
const providerOne = credentials.provider;

accountOne.init(usernameOne, passwordOne, locationOne, providerOne, function initAccount(errOne) {
  if (errOne) {
    console.error(errOne.stack);
    return process.exit(errOne);
  }

  info(`Current location: ${accountOne.playerInfo.locationName}`);
  info('1[i] lat/long/alt: : ' + accountOne.playerInfo.latitude + ' ' + accountOne.playerInfo.longitude + ' ' + accountOne.playerInfo.altitude);

  accountOne.GetProfile(function getAccountProfile(errGetProfile, profile) {
    if (errGetProfile) {
      console.error(errGetProfile, errGetProfile.stack);
      return process.exit(errGetProfile);
    }

    info(`Username: ${profile.username}`);
    info(`Poke Storage: ${profile.poke_storage}`);
    info(`Item Storage: ${profile.item_storage}`);

    function getNearbyPokemon() {
      accountOne.Heartbeat(function handleHeartbeat(hbErr, hb) {
        if (hbErr) {
          throw hbErr;
        }

        if (hb) {
          info('Got heartbeat');

          if (hb.cells.length > 0) {
            const cells = hb.cells;
            cells.forEach(function eachCell(cell, cellIndex) {
              if (cell.NearbyPokemon.length > 0) {
                // do something about nearby
                cell.NearbyPokemon.forEach(function eachNearbyPokemon(nearbyPokemon, nearbyIndex) {
                  const pokemon = accountOne.pokemonlist[parseInt(nearbyPokemon.PokedexNumber, 10) - 1];
                  info(`There is a ${pokemon.name} at ${nearbyPokemon.DistanceMeters.toString()} meters.`);
                });
              }
              if (cell.WildPokemon.length > 0) {
                // catch some pokemon
              }
            });

            setTimeout(function waitForTwoSeconds() {
              process.exit();
            }, 2000);
          }
        }
      });
    }

    setInterval(getNearbyPokemon, 5000);
  });
});
