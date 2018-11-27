import json

with open('world-110m.geojson') as f:
    data = json.load(f)

stringArray = []

for country in data["features"]:
    stringArray.append({"name": country["properties"]["name"], "value": "<option value=\"" +country["id"]+ "\">"+country["properties"]["name"]+"</option>"})

stringArray.sort(key=lambda x: x["name"], reverse=False)

for string in stringArray:
    print(string["value"])