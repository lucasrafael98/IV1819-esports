var width = 850, height = 465;



// Map and projection
var path = d3.geoPath();
var projection = d3.geoNaturalEarth()
    .scale(width / 1.75 / Math.PI)
    .translate([width / 2, height / 2])
var path = d3.geoPath()
    .projection(projection);

// Data and color scale
var data = d3.map();
var colorEarningsScale = d3.scaleLog()
	.domain([10000, 10000000])
	.interpolate(d3.interpolateHcl)
  .range([d3.rgb("#969696"), d3.rgb('#28638c')]); 

var colorPlayersScale = d3.scaleLinear()
	.domain([0, 1000])
	.interpolate(d3.interpolateHcl)
  .range([d3.rgb("#677d91"), d3.rgb('#28638c')]);  


//Load Data
var promises = [
  d3.json("data/world-110m.geojson"),
  d3.json("data/countries.json").then(function(d) { 
    for(var country in d["countries"]) {
      data.set(d["countries"][country]["countryCode"]+"0", d["countries"][country]["totalUSDPrize"]);
      data.set(d["countries"][country]["countryCode"]+"1", d["countries"][country]["players"]);
    }
  })
]

var selectedCountries = {};
choroMode = 0; //0 -> earnings, 1-> players
var countriesStatesChoro;

returnActualColorScale = function(info){
  if(choroMode == 0)
    return colorEarningsScale(info)
  else
    return colorPlayersScale(info)
}

Promise.all(promises).then(function(values){
  
  var mSelect = $('.multipleSelect').fastselect({
    onItemSelect: function(item, value){
      //console.log(item);
      //console.log(value.value);
      //console.log(this.optionsCollection.selectedValues);
      if(selectedCountries[value.value] == null){
        d3.selectAll("path").filter(function(d) { return d ? d.id === value.value : false; })
          .transition()
          .duration(1500)
          .attr("fill", "#009684");
        selectedCountries[value.value] = data.get(value.value+choroMode) ? returnActualColorScale(data.get(value.value+choroMode)) : "#d6d6d6";
      } 
      else{
        d3.selectAll("path").filter(function(d) { return d ? d.id === value.value : false; })
          .transition()
          .duration(1500)
          .attr("fill", function (d){
            // Set the color
            return data.get(d.id+choroMode) ? returnActualColorScale(data.get(d.id+choroMode)) : "#969696";
          })
        delete selectedCountries[value.value]
      }
    }
  });

  var svg = d3.select("#chloropleth")
            .insert("svg", ":first-child")
            .attr("width",width)
            .attr("height",height); 
  svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(values[0].features)
        .enter().append("path")
            .attr("fill", function (d){ //default is earnings
                // Pull data for this country
                d.totalUSDPrize = data.get(d.id+0);
                d.players = data.get(d.id+1);
                // Set the color
                return data.get(d.id+"0") ? colorEarningsScale(d.totalUSDPrize) : "#969696";
            })
            .attr("d", path)
            .on("mouseover", function () {
              if(selectedCountries[this.__data__.id] == null)
              d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", "#009684");
            })
            .on("mouseleave", function(){
              if(selectedCountries[this.__data__.id] == null)
                d3.select(this)
                  .transition()
                  .duration(1500)
                  .attr("fill", function (d){
                    // Set the color
                    return data.get(d.id+choroMode) ? returnActualColorScale(data.get(this.__data__.id+choroMode)) : "#969696";
              })})
            .on("mousedown", function(){
              var option = d3.selectAll(".multipleSelect").select("[value='"+this.__data__.id+"']")._groups[0][0];
              if(selectedCountries[this.__data__.id] == null){                

                hammerTest.optionsCollection.setSelected(option);

                var selectedModel = hammerTest.optionsCollection.findWhere(function(model) {
                    return model.value === option.value;
                });

                selectedModel && selectedModel.$item.addClass(hammerTest.options.itemSelectedClass);

                hammerTest.updateDomElements();
                selectedCountries[this.__data__.id] = data.get(this.__data__.id+choroMode) ? returnActualColorScale(data.get(this.__data__.id+choroMode)) : "#d6d6d6";
              } 
              else{
                
                //console.log(hammerTest.optionsCollection);            
                var removedModel = hammerTest.optionsCollection.removeSelected(option);

                if (removedModel && removedModel.$item) {

                  removedModel.$item.removeClass(hammerTest.options.itemSelectedClass);

                }
                hammerTest.updateDomElements();
                delete selectedCountries[this.__data__.id]
              }

              
              console.log(data.get(this.__data__.id+choroMode) ? data.get(this.__data__.id+choroMode) : 0)} //demo to show clicked data
            )
  
  d3.selectAll("#switchToPlayerAmountChoro")
    .on("mousedown", function(){
      if(choroMode == 0){
        d3.selectAll("#switchToPlayerAmountChoro").style("background", "lightblue");
        d3.selectAll("#switchToEarningsAmountChoro").style("background", "white");
        selectedCountries = {};
        choroMode = 1;
        svg.selectAll(".countries")
          .selectAll("path")
          .data(values[0].features)
          .transition()
          .duration(700)
          .attr("fill", function (d){
            // Set the color
            return data.get(d.id+choroMode) ? colorPlayersScale(d.players) : "#969696"; 
          })
      }
    })
  d3.selectAll("#switchToEarningsAmountChoro")
  .on("mousedown", function(){
      if(choroMode == 1){
        d3.selectAll("#switchToPlayerAmountChoro").style("background", "white");
        d3.selectAll("#switchToEarningsAmountChoro").style("background", "lightblue");
        selectedCountries = {};
        choroMode = 0;
        svg.selectAll(".countries")
          .selectAll("path")
          .data(values[0].features)
          .transition()
          .duration(700)
          .attr("fill", function (d){ 
            // Set the color
            return data.get(d.id+choroMode) ? colorEarningsScale(d.totalUSDPrize) : "#969696";
          })
      }
    })

    
})