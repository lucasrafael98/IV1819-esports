import json

with open('teste.json') as f:
    data = json.load(f)

array = {}

for tournament in data:
    if(tournament["TeamId"] != -1):
        if(tournament["TeamId"] in array):
            array[tournament["TeamId"]]["Wins"] += 1
            array[tournament["TeamId"]]["Amount"] += tournament["FirstUSDPrize"]
        else:
            array[tournament["TeamId"]] = {"Wins": 1, "Amount": tournament["FirstUSDPrize"]}

print(json.dumps(array, indent=4, separators=(',', ': ')))