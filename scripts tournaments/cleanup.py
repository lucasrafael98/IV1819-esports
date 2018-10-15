import json

with open('test.json') as f:
    data = json.load(f)

array = []

for tournament in data["tournaments"]:
    entry = {}
    entry["EndDate"] = tournament["EndDate"]
    entry["StartDate"] = tournament["StartDate"]
    entry["GameId"] = tournament["GameId"]
    entry["TournamentId"] = tournament["TournamentId"]
    entry["TotalUSDPrize"] = float(tournament["TotalUSDPrize"])
    
    array += [entry]
    
cleaned_up = {"tournaments" : array }

print(json.dumps(cleaned_up, sort_keys=True, indent=4, separators=(',', ': ')))