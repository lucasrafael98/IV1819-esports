import requests
import json
import time

gameArray = []

for i in range(100, 570):
    try:
        r = requests.get('http://api.esportsearnings.com/v0/LookupGameById?apikey=015bc5f751e5d2c169656bb490fb05e33947070364c2bb2e97f6c6573e522647&gameid='+str(i))
        r_json = r.json()
        gameArray.append({"gameid": i,"totalUSDPrize": float(r_json["TotalUSDPrize"]), "totalTournaments": r_json["TotalTournaments"], "gameName": r_json["GameName"], "totalPlayers": r_json["TotalPlayers"]})
        #print(gameArray)
        time.sleep(2.5)
    except:
        time.sleep(2.5)
        continue

gameArray.sort(key=lambda x: x["totalUSDPrize"], reverse=True)

new_json= {"games": gameArray}
print(json.dumps(new_json, indent=4, separators=(',', ': ')))