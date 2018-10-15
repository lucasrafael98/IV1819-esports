
import json

with open('countries.json') as f:
    data = json.load(f)

with open('test.json') as f:
    dataCode = json.load(f)

nameToCode = {}
for i in range(0,len(dataCode[1])):
    nameToCode[dataCode[1][i]['name']] = dataCode[1][i]['iso2Code'].lower()

for country in range(0,len(data["countries"])):
    data["countries"][country]['CountryCode'] = nameToCode[data["countries"][country]['country_name']]

print (json.dumps(data, sort_keys=True, indent=4, separators=(',', ': ')))