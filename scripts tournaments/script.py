import requests
import time
import json

arrayTournaments = []

for i in range(0,500):
    try:
        r = requests.get('http://api.esportsearnings.com/v0/LookupRecentTournaments?apikey=015bc5f751e5d2c169656bb490fb05e33947070364c2bb2e97f6c6573e522647&offset='+str(i*100))
        
        arrayTournaments += r.json()
        time.sleep(2.2)
    except:
        continue

print(json.dumps(arrayTournaments, sort_keys=True, indent=4, separators=(',', ': ')))
