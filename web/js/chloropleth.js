var width = window.innerWidth * 0.55, height = window.innerHeight * 0.5 - window.innerHeight * 0.5*0.15;
var earningsByAgeCountry, curCountryEBA;
var eba_country_selected = false;
var last_selected_country = null;

// Map and projection
var path = d3.geoPath();
var projection = d3.geoNaturalEarth()
    .scale(width / 2.15 / Math.PI)
    .translate([width / 2, height / 2 + height * 0.09])
var path = d3.geoPath()
    .projection(projection);

// Data and color scale
var data = d3.map();
var colorEarningsScale = d3.scaleLog()
	.domain([1000, 0.2e7])
	.interpolate(d3.interpolateHcl)
  .range([d3.rgb("#969696"), d3.rgb('#28638c')]); 

var colorPlayersScale = d3.scaleLog()
	.domain([2.5, 100])
	.interpolate(d3.interpolateHcl)
  .range([d3.rgb("#677d91"), d3.rgb('#28568c')]);  

var colorELegend = [1e4, 1e5, 1e6, 1e7, 1e8]
var colorPLegend = [1, 10, 100, 1000]

//Load EarningsByAge for each country
d3.json("data/earningsByAge_country.json").then(function(d){
  earningsByAgeCountry = d.earningsPerAgeCountry;
})

//Load Data
var promises_cl = [
  d3.json("data/world-110m.geojson"),
  d3.json("data/countries.json").then(function(d) { 
    for(var country in d["countries"]) {
      data.set(d["countries"][country]["countryCode"]+"0", d["countries"][country]["totalUSDPrize"]);
      data.set(d["countries"][country]["countryCode"]+"1", d["countries"][country]["players"]);
    }
  })
]
choroMode = 0; //0 -> earnings, 1-> players
var countriesStatesChoro;

returnActualColorScale = function(info){
  if(choroMode == 0)
    return colorEarningsScale(info)
  else
    return colorPlayersScale(info)
}

Promise.all(promises_cl).then(function(values){
  
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

        /************************
         * Change the bar chart.
         ************************/
        d3.select("#no-data-chart").style("visibility", "hidden");
        curCountryEBA = earningsByAgeCountry.filter(function(d){ return value.value == d.CountryCode; });
        if(curCountryEBA.length !== 0){
          curCountryEBA = curCountryEBA[0].earningsByAge;
          let diagram = d3.select("#superbchart").select("#barchart").select("svg").select("g");
          let bars = diagram.select(".main-bars");
          xscale = d3.scaleBand()
              .domain(curCountryEBA.slice(0,numBars).map(function (d) { return d.age; }))
              .rangeRound([0, barChartWidth]).paddingInner([0.5]);
          yscale = d3.scalePow().exponent(0.4)
              .domain([0, d3.max(curCountryEBA, function (d) { return d.earnings; })])
              .range([barChartHeight, 0]);
          xAxis  = d3.axisBottom().scale(xscale);
          yAxis  = d3.axisLeft().scale(yscale)
                      .tickFormat(d3.format("$.2s"))
                      .ticks(5);
          d3.selectAll(".x.axis").call(xAxis);
          d3.selectAll(".y.axis").call(yAxis);
          d3.select(".bchart-x-text").text("Age");
          d3.select(".bchart-y-text").text("Earnings (" + value.text + ")");
          xOverview = d3.scaleBand()
              .domain(curCountryEBA.map(function (d) { return d.age; }))
              .rangeRound([0, barChartWidth]).paddingInner([0.5]);
          yOverview = d3.scalePow().exponent(0.35).range([heightOverview, 0]);
          yOverview.domain(yscale.domain());
          rects = bars.selectAll("rect").data(curCountryEBA.slice(0,numBars));
          rects.exit().remove();
          rects.transition()
              .duration(1000)
              .attr("y", function (d) { return yscale(d.earnings); })
              .attr("height", function (d) { return barChartHeight - yscale(d.earnings); })
              .attr("x", function (d) { return xscale(d.age); })
              .attr("width", function (d) { return xscale.bandwidth(); });
          rects.data(curCountryEBA.slice(0,numBars)).enter().append("rect")
              .transition()
              .duration(1000)
              .attr("class", "bar")
              .attr("y", function (d) { return yscale(d.earnings); })
              .attr("height", function (d) { return barChartHeight - yscale(d.earnings); })
              .attr("x", function (d) { return xscale(d.age); })
              .attr("width", function (d) { return xscale.bandwidth(); });
          subBars = diagram.select("#bchart-scroll").selectAll('.subBar').data(curCountryEBA);
          subBars.exit().remove();
          subBars.transition()
              .duration(1000)
              .attr("height", function(d) {return heightOverview - yOverview(d.earnings);})
              .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.earnings); })
              .attr("x", function(d) { return xOverview(d.age) - 84;})
              .attr("width", function(d) { return xOverview.bandwidth();});
          subBars.data(curCountryEBA).enter().append("rect")
              .classed('subBar extra-subBar', true)
              .attr("height", function(d) {return heightOverview - yOverview(d.earnings);})
              .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.earnings); })
              .attr("x", function(d) { return xOverview(d.age) - 84;})
              .attr("width", function(d) { return xOverview.bandwidth();});
          displayed = d3.scaleQuantize()
              .domain([0, barChartWidth])
              .range(d3.range(curCountryEBA.length));

          d3.select(".mover")
              .attr("width", Math.round(parseFloat(numBars * barChartWidth)/curCountryEBA.length))
              .attr("x", 0)
              .attr("y", 0);
          eba_country_selected = true;
        }
        else{ alert("This country doesn't have earnings by age info available. Sorry! (please fix me)"); }

        /**************************
         * Change the scatter plot.
         **************************/

        circles0 = d3.selectAll("#scatter")
                                .select("svg")
                                .select(".scpl-circle0")
                                .selectAll("circle");
        circles0.filter(function(d){ return selectedCountries[d.countryCode] == null; })
          .transition()
          .duration(200)
          .attr("r", 0.75);
        circles0.filter(function(d){ return selectedCountries[d.countryCode] != null; })
          .transition()
          .duration(200)
          .attr("r", 4.5);

        circles1 = d3.selectAll("#scatter")
                      .select("svg")
                      .select(".scpl-circle1")
                      .selectAll("circle");
        circles1.filter(function(d){ return selectedCountries[d.countryCode] == null; })
          .transition()
          .duration(200)
          .attr("r", 0.75);
        circles1.filter(function(d){ return selectedCountries[d.countryCode] != null; })
          .transition()
          .duration(200)
          .attr("r", 4.5);
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
        let removedId = value.value;
        if(Object.keys(selectedCountries).length === 0){
          circles0 = d3.selectAll("#scatter")
                        .select("svg")
                        .select(".scpl-circle0")
                        .selectAll("circle");
          circles0.transition()
            .duration(200)
            .attr("r", 4.5);

          circles1 = d3.selectAll("#scatter")
                        .select("svg")
                        .select(".scpl-circle1")
                        .selectAll("circle");
          circles1.transition()
            .duration(200)
            .attr("r", 4.5);
        }
        else{
          circles0 = d3.selectAll("#scatter")
                        .select("svg")
                        .select(".scpl-circle0")
                        .selectAll("circle");
          circles0.filter(function(d){ return d.countryCode == removedId; })
            .transition()
            .duration(200)
            .attr("r", 0.75);

          circles1 = d3.selectAll("#scatter")
            .select("svg")
            .select(".scpl-circle1")
            .selectAll("circle");
          circles1.filter(function(d){ return d.countryCode == removedId; })
            .transition()
            .duration(200)
            .attr("r", 0.75);
        }
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
            .on("mouseover", function (d) {
              if(d["players"] == null || d['players'] < 2){
                $(this).css( 'cursor', 'not-allowed' );
              }

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
                })

                $('.tooltip').css({
                  display: "none"
                });
            })
            .on("mousemove", function(d){
              var totalUSDPrize = d['totalUSDPrize'] ? "$"+numeral(d['totalUSDPrize']).format('0a') : "none";
              var players = d['players'] ? numeral(d['players']).format('0a') : "none";
              var text = d['properties']['name']  + (players != "none" ? "<br>Players: " + players : "" ) + (totalUSDPrize != "none" ? "<br>Total Earnings: " + totalUSDPrize : "");
              console.log(JSON.stringify(d));
              $('.tooltip').html(text);
              $('.tooltip').css({
                display: "block",
                left: d3.mouse(this)[0] + 30,
                top: d3.mouse(this)[1] + 30
              });
            })
            .on("mousedown", function(d){

              if(d["players"] == null || d['players'] < 2){
                return;
              }

              var option = d3.selectAll(".multipleSelect").select("[value='"+this.__data__.id+"']")._groups[0][0];
              
              if(selectedCountries[this.__data__.id] == null){                

                hammerTest.optionsCollection.setSelected(option);

                var selectedModel = hammerTest.optionsCollection.findWhere(function(model) {
                    return model.value === option.value;
                });

                selectedModel && selectedModel.$item.addClass(hammerTest.options.itemSelectedClass);

                hammerTest.updateDomElements();
                selectedCountries[this.__data__.id] = data.get(this.__data__.id+choroMode) ? returnActualColorScale(data.get(this.__data__.id+choroMode)) : "#d6d6d6";
                temp = this;

                /************************
                 * Change the bar chart.
                 ************************/
                d3.select("#no-data-chart").style("visibility", "hidden");
                curCountryEBA = earningsByAgeCountry.filter(function(d){ return temp.__data__.id == d.CountryCode; });
                if(curCountryEBA.length !== 0){
                  curCountryEBA = curCountryEBA[0].earningsByAge;
                  let diagram = d3.select("#superbchart").select("#barchart").select("svg").select("g");
                  let bars = diagram.select(".main-bars");
                  xscale = d3.scaleBand()
                      .domain(curCountryEBA.slice(0,numBars).map(function (d) { return d.age; }))
                      .rangeRound([0, barChartWidth]).paddingInner([0.5]);
                  yscale = d3.scalePow().exponent(0.4)
                      .domain([0, d3.max(curCountryEBA, function (d) { return d.earnings; })])
                      .range([barChartHeight, 0]);
                  xAxis  = d3.axisBottom().scale(xscale);
                  yAxis  = d3.axisLeft().scale(yscale)
                              .tickFormat(d3.format("$.2s"))
                              .ticks(5);
                  d3.selectAll(".x.axis").call(xAxis);
                  d3.selectAll(".y.axis").call(yAxis);
                  d3.select(".bchart-x-text").text("Age");
                  d3.select(".bchart-y-text").text("Earnings (" + this.__data__.properties.name + ")");
                  xOverview = d3.scaleBand()
                      .domain(curCountryEBA.map(function (d) { return d.age; }))
                      .rangeRound([0, barChartWidth]).paddingInner([0.5]);
                  yOverview = d3.scalePow().exponent(0.35).range([heightOverview, 0]);
                  yOverview.domain(yscale.domain());
                  rects = bars.selectAll("rect").data(curCountryEBA.slice(0,numBars));
                  rects.exit().remove();
                  rects.transition()
                      .duration(1000)
                      .attr("y", function (d) { return yscale(d.earnings); })
                      .attr("height", function (d) { return barChartHeight - yscale(d.earnings); })
                      .attr("x", function (d) { return xscale(d.age); })
                      .attr("width", function (d) { return xscale.bandwidth(); });
                  rects.data(curCountryEBA.slice(0,numBars)).enter().append("rect")
                      .transition()
                      .duration(1000)
                      .attr("class", "bar")
                      .attr("y", function (d) { return yscale(d.earnings); })
                      .attr("height", function (d) { return barChartHeight - yscale(d.earnings); })
                      .attr("x", function (d) { return xscale(d.age); })
                      .attr("width", function (d) { return xscale.bandwidth(); });
                  subBars = diagram.select("#bchart-scroll").selectAll('.subBar').data(curCountryEBA);
                  subBars.exit().remove();
                  subBars.transition()
                      .duration(1000)
                      .attr("height", function(d) {return heightOverview - yOverview(d.earnings);})
                      .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.earnings); })
                      .attr("x", function(d) { return xOverview(d.age) - 84;})
                      .attr("width", function(d) { return xOverview.bandwidth();});
                  subBars.data(curCountryEBA).enter().append("rect")
                      .classed('subBar extra-subBar', true)
                      .attr("height", function(d) {return heightOverview - yOverview(d.earnings);})
                      .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.earnings); })
                      .attr("x", function(d) { return xOverview(d.age) - 84;})
                      .attr("width", function(d) { return xOverview.bandwidth();});
                  displayed = d3.scaleQuantize()
                      .domain([0, barChartWidth])
                      .range(d3.range(curCountryEBA.length));

                  d3.select(".mover")
                      .attr("width", Math.round(parseFloat(numBars * barChartWidth)/curCountryEBA.length))
                      .attr("x", 0)
                      .attr("y", 0);
                  eba_country_selected = true;
                }
                else{ alert("This country doesn't have earnings by age info available. Sorry! (please fix me)"); }

                /**************************
                 * Change the scatter plot.
                 **************************/

                circles0 = d3.selectAll("#scatter")
                                .select("svg")
                                .select(".scpl-circle0")
                                .selectAll("circle");
                circles0.filter(function(d){ return selectedCountries[d.countryCode] == null; })
                  .transition()
                  .duration(200)
                  .attr("r", 0.75);
                circles0.filter(function(d){ return selectedCountries[d.countryCode] != null; })
                  .transition()
                  .duration(200)
                  .attr("r", 4.5);

                circles1 = d3.selectAll("#scatter")
                              .select("svg")
                              .select(".scpl-circle1")
                              .selectAll("circle");
                circles1.filter(function(d){ return selectedCountries[d.countryCode] == null; })
                  .transition()
                  .duration(200)
                  .attr("r", 0.75);
                circles1.filter(function(d){ return selectedCountries[d.countryCode] != null; })
                  .transition()
                  .duration(200)
                  .attr("r", 4.5);
              } 
              else{
                
                //console.log(hammerTest.optionsCollection);            
                var removedModel = hammerTest.optionsCollection.removeSelected(option);

                if (removedModel && removedModel.$item) {

                  removedModel.$item.removeClass(hammerTest.options.itemSelectedClass);

                }
                hammerTest.updateDomElements();
                delete selectedCountries[this.__data__.id]
                let removedId = this.__data__.id;

                if(Object.keys(selectedCountries).length === 0){
                  circles0 = d3.selectAll("#scatter")
                                .select("svg")
                                .select(".scpl-circle0")
                                .selectAll("circle");
                  circles0.transition()
                    .duration(200)
                    .attr("r", 4.5);

                  circles1 = d3.selectAll("#scatter")
                                .select("svg")
                                .select(".scpl-circle1")
                                .selectAll("circle");
                  circles1.transition()
                    .duration(200)
                    .attr("r", 4.5);
                }
                else{
                  circles0 = d3.selectAll("#scatter")
                                .select("svg")
                                .select(".scpl-circle0")
                                .selectAll("circle");
                  circles0.filter(function(d){ return d.countryCode == removedId; })
                    .transition()
                    .duration(200)
                    .attr("r", 0.75);

                  circles1 = d3.selectAll("#scatter")
                    .select("svg")
                    .select(".scpl-circle1")
                    .selectAll("circle");
                  circles1.filter(function(d){ return d.countryCode == removedId; })
                    .transition()
                    .duration(200)
                    .attr("r", 0.75);
                }
              }


              if(last_selected_country != null && last_selected_country != this
                 && selectedCountries[this.__data__.id]){
                d3.select(last_selected_country)
                .transition()
                .duration(400)
                .attr("fill", function (d){
                  // Set the color
                  return selectedCountries[this.__data__.id] ? "#009684" : (data.get(d.id+choroMode) ? returnActualColorScale(data.get(this.__data__.id+choroMode)) : "#969696");
                });
              }

              
              d3.select(this)
              .transition()
              .duration(400)
              .attr("fill", (last_selected_country == null || last_selected_country == this || selectedCountries[this.__data__.id]) ? "#fff600" : "#3bf99a")
              .transition()
              .duration(400)
              .attr("fill", function (d){
                // Set the color
                return selectedCountries[this.__data__.id] ? "#a8a200" : (data.get(d.id+choroMode) ? returnActualColorScale(data.get(this.__data__.id+choroMode)) : "#969696");
              });
              
              if(selectedCountries[this.__data__.id])
                last_selected_country = this;
            }//console.log(data.get(this.__data__.id+choroMode) ? data.get(this.__data__.id+choroMode) : 0)} //demo to show clicked data
            )

  var cml = svg.append("g")
                .attr("class", "chloro-legend")
                .attr("transform", "translate(190)")
                .selectAll("rect").data(colorELegend);

  var ls_w = 20, ls_h = 20;

  svg.select(".chloro-legend")
      .append("text")
      .attr("id", "chloro-legend-stat")
      .attr("transform", "translate(25, 270)")
      .text("Earnings:");

  cml.data(colorELegend)
        .enter().append("rect")
        .attr("x", 20)
        .attr("y", function(d, i){ return height - (i*ls_h) - 2*ls_h;})
        .attr("width", ls_w)
        .attr("height", ls_h)
        .style("fill", function(d) { return colorEarningsScale(d); });
                
  cml.data(colorELegend)
        .enter().append("text")
        .attr("class", "chloro-legend-number")
        .attr("x", 50)
        .attr("y", function(d, i){ return height - (i*ls_h) - ls_h - 4;})
        .text(function(d){ return d3.format("$.1s")(d); });
  
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
        svg.selectAll(".chloro-legend").selectAll("rect")
            .data(colorPLegend).exit().remove();
        svg.selectAll(".chloro-legend").selectAll(".chloro-legend-number")
            .data(colorPLegend).exit().remove();
        svg.selectAll(".chloro-legend")
            .selectAll("rect").data(colorPLegend)
            .transition().duration(700)
            .style("fill", function(d) { return colorPlayersScale(d); })
        svg.selectAll(".chloro-legend")
            .selectAll(".chloro-legend-number").data(colorPLegend)
            .text(function(d){ return d; });
        svg.selectAll(".chloro-legend")
            .select("#chloro-legend-stat")
            .attr("transform", "translate(25, 290)")
            .text("Players:");
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
        svg.selectAll(".chloro-legend")
            .selectAll("rect").data(colorELegend)
            .transition().duration(700)
            .style("fill", function(d) { return colorEarningsScale(d); })
        svg.selectAll(".chloro-legend")
            .selectAll(".chloro-legend-number").data(colorELegend)
            .text(function(d){ return d3.format("$.1s")(d); });
        svg.selectAll(".chloro-legend")
            .select("#chloro-legend-stat")
            .attr("transform", "translate(25, 270)")
            .text("Earnings:");
        svg.selectAll(".chloro-legend")
            .selectAll("rect").data(colorELegend).enter().append("rect")
            .attr("x", 20)
            .attr("y", function(d, i){ return height - (i*ls_h) - 2*ls_h;})
            .attr("width", ls_w)
            .attr("height", ls_h)
            .style("fill", function(d) { return colorEarningsScale(d); })
        svg.selectAll(".chloro-legend")
            .selectAll(".chloro-legend-number").data(colorELegend).enter().append("text")
            .attr("class", "chloro-legend-number")
            .attr("x", 50)
            .attr("y", function(d, i){ return height - (i*ls_h) - ls_h - 4;})
            .text(function(d){ return d3.format("$.1s")(d); });
      }
    })

    
})