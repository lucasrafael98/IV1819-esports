import json

with open('world-110m.geojson') as f:
    data = json.load(f)

for country in data["features"]:
    print("<option value=\"" +country["id"]+ "\">"+country["properties"]["name"]+"</option>")
