import requests
import time
import json

with open('tournaments.json') as f:
    data = json.load(f)

array = []

for tournament in data["tournaments"]:
    r = requests.get('http://api.esportsearnings.com/v0/LookupTournamentById?apikey=015bc5f751e5d2c169656bb490fb05e33947070364c2bb2e97f6c6573e522647&tournamentid='+str(tournament["TournamentId"]))
    r_json = r.json()

    entry = {}
    entry["EndDate"] = tournament["EndDate"]
    entry["StartDate"] = tournament["StartDate"]
    entry["GameId"] = tournament["GameId"]
    entry["TournamentId"] = tournament["TournamentId"]
    entry["TotalUSDPrize"] = float(tournament["TotalUSDPrize"])
    time.sleep(2.1)
    if(r_json['Teamplay'] == 1):
        new_r = requests.get('http://api.esportsearnings.com/v0/LookupTournamentTeamResultsByTournamentId?apikey=015bc5f751e5d2c169656bb490fb05e33947070364c2bb2e97f6c6573e522647&tournamentid='+str(tournament["TournamentId"]))
        new_r_json = new_r.json()
        if(len(new_r_json) > 0):
            if(new_r_json[0]["TeamId"] != 0):
                entry["TeamId"] = new_r_json[0]["TeamId"]
                entry["FirstUSDPrize"] = float(new_r_json[0]["PrizeUSD"])
            else:
                entry["TeamId"] = -1
                entry["FirstUSDPrize"] = 0
        else:
            entry["TeamId"] = -1
            entry["FirstUSDPrize"] = 0
        
        time.sleep(2.1)
    else:
        entry["TeamId"] = -1
        entry["FirstUSDPrize"] = 0

    array += [entry]
    
cleaned_up = {"tournaments" : array }

print(json.dumps(array, indent=4, separators=(',', ': ')))