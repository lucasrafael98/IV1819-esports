import json
import requests

r = requests.get('http://api.esportsearnings.com/v0/LookupGameById?apikey=015bc5f751e5d2c169656bb490fb05e33947070364c2bb2e97f6c6573e522647&gameid=540')
r_json = r.json()
r_json["gameid"] = 540

print(json.dumps(r_json, indent=4, separators=(',', ': ')))