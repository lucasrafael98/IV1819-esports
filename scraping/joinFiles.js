const request = require('request');
const fs = require('fs');

let playersJSON = JSON.parse(fs.readFileSync('../data/players.json', 'utf8'));
let playersEJSON = JSON.parse(fs.readFileSync('../data/earningByAge.json', 'utf8'));
let joinJSON = [];

// for (let i = 0; i < playersJSON.players.length; i++) {
//     playersJSON.players[i].PlayerId = parseInt(playersJSON.players[i].PlayerId);
//     playersEJSON.earningsByAge[i].PlayerId = parseInt(playersEJSON.earningsByAge[i].PlayerId);
// }

// fs.writeFile('../data/playersWithIntId.json', JSON.stringify(playersJSON), 'utf8');
// fs.writeFile('../data/earningByAgeWithIntId.json', JSON.stringify(playersEJSON), 'utf8');

for (let i = 0; i < playersJSON.players.length; i++) {
    let elToPush = {
        "PlayerId": parseInt(playersJSON.players[i].PlayerId),
        "NameFirst": playersJSON.players[i].NameFirst,
        "NameLast": playersJSON.players[i].NameLast,
        "CurrentHandle": playersJSON.players[i].CurrentHandle,
        "CountryCode": playersJSON.players[i].CountryCode,
        "TotalUSDPrize": playersJSON.players[i].TotalUSDPrize,
        "EarningsPerAge": playersEJSON.earningsByAge[i].EarningsPerAge
    }

    joinJSON.push(elToPush);
}

fs.writeFile('../data/playersFinal.json', JSON.stringify(joinJSON), 'utf8');