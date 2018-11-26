import json

with open('new_games_sorted.json') as f:
    dataTeams = json.load(f)

def findTeam(id):
    for team in dataTeams["games"]:
        if(int(id) == team["gameid"]):
            return team["gameName"]
    return "None"

#with open('tourn_team_mmyyyy.json') as f:
#    dataTeamsTourn = json.load(f)

with open('tourn_game_usd_mmyyyy.json') as f:
    dataTeamsTournPrize = json.load(f)

for t in dataTeamsTournPrize["data"]:
    t["gameName"] = findTeam(t["gameId"])

print(json.dumps(dataTeamsTournPrize, indent=4, separators=(',', ': ')))
