import json

with open('world-110m.geojson') as f:
    data = json.load(f)

with open('countries_stats.json') as f:
   dataCode = json.load(f)

def findReplace(name, code):
    for dict in data["features"]:
        if dict["properties"]["name"] == name:
            dict["id"] = code
            return
            

for country in dataCode["countries"]:
    try:
        findReplace(country["countryName"], country["countryCode"])
    except:
        continue

print(json.dumps(data, indent=4, separators=(',', ': ')))