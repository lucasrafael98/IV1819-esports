var countryStats;
var scplYMode = false;
var scplXMode = false;

d3.json("data/countries.json").then(function (data) {
    countryStats = data.countries;
    gen_scatter();
});

function gen_scatter(){
    var padding = 50;
    var w = 700;
    var h = 700;
    var yscale = d3.scaleLinear()
        .domain([0,1])
        .range([h - padding, padding]);
    var xscale = d3.scaleLog()
        .domain([1,1000])
        .range([padding + 10,w-padding]);
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var svg = d3.select("#scatter");

    var seriesNames = d3.keys(countryStats[0])
    .filter(function(d) { return d === "urbanPopPercentage" 
                                || d === "unemploymentPercentage"; })
    .sort();

    // Map the data to an array of arrays of {x, y} tuples.
    var series = seriesNames.map(function(series) {
        return countryStats.map(function(d) {
        return {x: +d.players, y: +d[series], title: d.countryName, code: d.countryCode};
        });
    });

    svg = svg.append("svg");
    svg = svg.attr("width",w);
    svg = svg.attr("height",h); 

    // Default: UrbanPop/Unemployment
    svg.selectAll(".series")
        .data(series)
        .enter()
        .append("g")
        .attr("fill", function(d, i) { return color(i); })
        .attr("class", function(d, i) { return ("scpl-circle" + i); })
        .selectAll(".point")
        .data(function(d) { return d; })
        .enter().append("circle")
        .attr("cx",function(d) {
            return xscale(d.x);
        })
        .attr("cy",function(d) {
            return yscale(d.y / 100);
        })
        .attr("r", 4.5)
        .attr("id", function(d) { return d.code; })
        .on("mouseover", function(){
            d3.select(this)
                .transition()
                .duration(300)
                .attr("r", 7.5);
        })
        .on("mouseout", function(){
            d3.select(this)
                .transition()
                .duration(300)
                .attr("r", 4.5);
        })
        .append("title")
        .text(function(d) { return d.title;});
    
    // axes
    var yaxis = d3.axisLeft()
        .scale(yscale)
        .tickFormat(d3.format(".0%"))
        .ticks(10);
    svg.append("g")
        .attr("transform","translate(" + padding + ",0)")
        .attr("class","scatter-y")
        .call(yaxis);
    var xaxis = d3.axisBottom()
        .scale(d3.scaleLog()
            .domain([1, 1000])
            .range([padding + 10, w-padding]))
        .tickFormat(d3.format("d"))
        .ticks(2.5);
    svg.append("g")
        .attr("transform","translate(0," + (h-padding) + ")")
        .attr("class","scatter-x")
        .call(xaxis);


    // Switch Y axis
    d3.selectAll("#togg-y")
        .on("click", function() {
            if(!scplYMode){
                yscale = d3.scaleLog()
                    .domain([1e9,1E14])
                    .range([h - padding, padding]);
            
                svg.selectAll(".scpl-circle0")
                    .selectAll("circle")
                    .data(countryStats)
                    .transition()
                    .duration(700)
                    .attr("fill", "gold")
                    .attr("cy", function(d){
                                    return yscale(d.annualGDPUSD / 1.2)})
                
                svg.selectAll(".scpl-circle1")
                    .selectAll("circle")
                    .data(countryStats)
                    .transition()
                    .duration(700)
                    .attr("fill", "gold")
                    .attr("cy", function(d){
                                    return yscale(d.annualGDPUSD / 1.2)})
                
                yaxis = d3.axisLeft()
                    .scale(yscale)
                    .tickFormat(d3.format("$.0"))
                    .ticks(5);
                svg.selectAll(".scatter-y")
                    .transition()
                    .duration(700)
                    .attr("transform","translate(" + padding + ",0)")
                    .call(yaxis);
            }
            else{
                yscale = d3.scaleLinear()
                        .domain([0,1])
                        .range([h - padding, padding]);

                svg.selectAll(".scpl-circle0")
                    .selectAll("circle")
                    .data(series[0])
                    .transition()
                    .duration(700)
                    .attr("fill", function(d, i) { return color(0); })
                    .attr("cy", function(d){
                                    return yscale(d.y / 100)})

                svg.selectAll(".scpl-circle1")
                    .selectAll("circle")
                    .data(series[1])
                    .transition()
                    .duration(700)
                    .attr("fill", function(d, i) { return color(1); })
                    .attr("cy", function(d){
                                    return yscale(d.y / 100)});
                
                yaxis = d3.axisLeft()
                    .scale(yscale)
                    .tickFormat(d3.format(".0%"))
                    .ticks(10);
                svg.selectAll(".scatter-y")
                    .transition()
                    .duration(700)
                    .attr("transform","translate(" + padding + ",0)")
                    .call(yaxis);
            }
            scplYMode = !scplYMode;
        })


    // Switch X axis
    d3.selectAll("#togg-x")
        .on("click", function(){
            if(!scplXMode){
                xscale = d3.scaleLog()
                            .domain([1E4,1E8])
                            .range([padding+ 10,w-padding]);
                
                svg.selectAll(".scpl-circle0")
                    .selectAll("circle")
                    .data(countryStats)
                    .transition()
                    .duration(700)
                    .attr("cx", function(d){
                            return xscale(d.totalUSDPrize)});

                svg.selectAll(".scpl-circle1")
                    .selectAll("circle")
                    .data(countryStats)
                    .transition()
                    .duration(700)
                    .attr("cx", function(d){
                            return xscale(d.totalUSDPrize)});
                
                xaxis = d3.axisBottom()
                    .scale(xscale)
                    .tickFormat(d3.format("$.0"))
                    .ticks(3);
                svg.selectAll(".scatter-x")
                    .transition()
                    .duration(700)
                    .attr("transform","translate(0, " + (h-padding) + ")")
                    .call(xaxis);
            }
            else{
                xscale = d3.scaleLog()
                            .domain([1,1000])
                            .range([padding + 10,w-padding]);
    
                svg.selectAll(".scpl-circle0")
                    .selectAll("circle")
                    .data(countryStats)
                    .transition()
                    .duration(700)
                    .attr("cx", function(d){
                            return xscale(d.players)});

                svg.selectAll(".scpl-circle1")
                    .selectAll("circle")
                    .data(countryStats)
                    .transition()
                    .duration(700)
                    .attr("cx", function(d){
                            return xscale(d.players)});
                
                xaxis = d3.axisBottom()
                    .scale(xscale)
                    .tickFormat(d3.format("d"))
                    .ticks(2.5);
                svg.selectAll(".scatter-x")
                    .transition()
                    .duration(700)
                    .attr("transform","translate(0, " + (h-padding) + ")")
                    .call(xaxis);
            }
            scplXMode = !scplXMode;
        });
}