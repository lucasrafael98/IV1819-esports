import requests
import json
import time

gameArray = []

for i in range(151, 528):
    try:
        r = requests.get('http://api.esportsearnings.com/v0/LookupGameById?apikey=015bc5f751e5d2c169656bb490fb05e33947070364c2bb2e97f6c6573e522647&gameid='+str(i))
        r_json = r.json()
        gameArray.append({"gameid": i,"totalUSDPrize": float(r_json["TotalUSDPrize"]), "totalTournaments": int(r_json["TotalTournaments"]), "gameName": r_json["GameName"], "totalPlayers": int(r_json["TotalPlayers"])})
        #print(gameArray)
        time.sleep(2.1)
    except:
        continue

gameArray.sort(key=lambda x: x["totalUSDPrize"], reverse=True)

new_json= {"games": gameArray}
print(json.dumps(new_json, indent=4, separators=(',', ': ')))