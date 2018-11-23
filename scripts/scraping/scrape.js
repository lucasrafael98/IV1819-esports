const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

let players = [];
let playersIds = [];
let playersJSON = JSON.parse(fs.readFileSync('../data/players.json', 'utf8'));
let requestCount = 0;

for (let i = 0; i < playersJSON.length; i++) {
    let id = playersJSON[i].PlayerId;
    playersIds.push(id);
}

for (let i = 0; i < playersIds.length; i++) {
    sleep(200).then(() => {
        let first_url = 'https://www.esportsearnings.com/players/' + playersIds[i];
        request(first_url,(error,response,html) => {
            if(!error && response.statusCode == 200){
                const $ = cheerio.load(html);
        
                let fixed_url = response.request.href + '/results-by-age';
        
                request(fixed_url,(error,response,html) => {
                    if(!error && response.statusCode == 200){
                        console.log(response.request.href);
                        let player = {};
                        player['PlayerId'] = playersIds[i];
                        player['EarningsPerAge'] = [];
                        const $ = cheerio.load(html);
                        const table = $('.detail_box_smooth .detail_list_table');
        
                        // console.log(table);
                        table.find('.detail_list_table_header').each((i,el) => {
                            let obj = {};
                            obj['Age'] = $(el).find('a').attr('name');
                            player['EarningsPerAge'].push(obj);
                        }) ;
                        let true_index_count = 0;
                        table.find('.detail_list_table_subheader').each((i,el) => {
                            if(i % 2 == 0){
                                player['EarningsPerAge'][true_index_count]['EarningsUSD'] = $(el).find('.info_prize_highlight').text().substring(1);
                                true_index_count++;
                            }
                        }) ;
                        players.push(player);
                        requestCount++;
                        if(requestCount % 100 == 0){
                            console.log("LETS GOO BOIIS --->" +  requestCount);
                        }
                        if(requestCount == playersIds.length){
                            var json = JSON.stringify(players);
                            fs.writeFile('playerEarnings.json', json, 'utf8');
                            console.log('done');
                        }
                    }
                });
            }
        });
    });
}