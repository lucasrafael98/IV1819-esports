import requests
import json

r = requests.get('http://api.worldbank.org/v2/countries?per_page=304&format=json')

print(json.dumps(r.json(), sort_keys=True, indent=4, separators=(',', ': ')))
