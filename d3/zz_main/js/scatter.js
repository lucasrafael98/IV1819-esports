var countryStats;
var scplYMode = false;
var scplXMode = false;

d3.json("data/countries.json").then(function (data) {
    countryStats = data.countries;
    gen_scatter();
});

function gen_scatter(){
    var padding = 50;
    var w = window.innerWidth / 2.5;
    var h = w * 2.3 / 4;
    var yscale = d3.scaleLinear()
        .domain([0,1])
        .range([h - padding, padding]);
    var xscale = d3.scaleLog()
        .domain([1,1000])
        .range([padding + 10,w-padding]);
    var color = d3.scaleOrdinal(["#095689", "#466c89"]);
    var svg = d3.select("#scatter");

    var seriesNames = d3.keys(countryStats[0])
                            .filter(function(d) { return d === "urbanPopPercentage" 
                                                    || d === "unemploymentPercentage"; })
                            .sort();

    // Map the data to an array of arrays of {x, y} tuples.
    var series = seriesNames.map(function(series) {
        return countryStats.map(function(d) {
        return {x: +d.players, y: +d[series], title: d.countryName, countryCode: d.countryCode, i: series};
        });
    });

    svg = svg.insert("svg", ":first-child");
    svg = svg.attr("width",w);
    svg = svg.attr("height",h); 

    // Default: UrbanPop/Unemployment
    svg.selectAll(".series")
        .data(series)
        .enter()
        .append("g")
        .attr("class", function(d, i) { return ("scpl-circle" + i); })
        .selectAll(".point")
        .data(function(d) { return d; })
        .enter().append("circle")
        .attr("fill", function(d) { return color(d.i); })
        .attr("cx",function(d) {
            return xscale(d.x);
        })
        .attr("cy",function(d) {
            return yscale(d.y / 100);
        })
        .attr("r", 4.5)
        .attr("id", function(d) { return d.countryCode; })
        .on("mouseover", function(){
            d3.select(this)
                .transition()
                .duration(50)
                .attr("r", 6.5);
        })
        .on("mouseout", function(){
            d3.select(this)
                .transition()
                .duration(1800)
                .attr("r", function(d){ return (Object.keys(selectedCountries).length !== 0 &&
                                                 selectedCountries[d.countryCode] == null) ? 0.75 : 4.5});
        })
        .append("title")
        .text(function(d) {
            if(d.i === "urbanPopPercentage")
                return ("Country:\t" + d.title + "\nPlayers:\t" + d.x + "\nUrban Population:\t" + d3.format(".1%")(d.y / 100));
            else
                return ("Country:\t" + d.title + "\nPlayers:\t" + d.x + "\nUneployment:\t" + d3.format(".1%")(d.y / 100));
        });
    
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
                    .attr("fill", "#009684")
                    .attr("cy", function(d){
                                    return yscale(d.annualGDPUSD / 1.2)})
                    .select("title")
                    .text(function(d) {
                        if(!scplXMode)
                            return ("Country:\t" + d.countryName + "\nPlayers:\t" + d.players +
                                        "\nGDP:\t" + d3.format("$,d")(d.annualGDPUSD / 100)); 
                        else
                            return ("Country:\t" + d.countryName + "\nEarnings:\t" + d3.format("$,d")(d.totalUSDPrize) +
                                        "\nGDP:\t" + d3.format("$,d")(d.annualGDPUSD / 100));   
                    });

                
                svg.selectAll(".scpl-circle1")
                    .selectAll("circle")
                    .data(countryStats)
                    .transition()
                    .duration(700)
                    .attr("fill", "#009684")
                    .attr("cy", function(d){
                                    return yscale(d.annualGDPUSD / 1.2)})
                    .select("title")
                    .text(function(d) {
                        if(!scplXMode)
                            return ("Country:\t" + d.countryName + "\nPlayers:\t" + d.players +
                                        "\nGDP:\t" + d3.format("$,d")(d.annualGDPUSD / 100)); 
                        else
                            return ("Country:\t" + d.countryName + "\nEarnings:\t" + d3.format("$,d")(d.totalUSDPrize) +
                                        "\nGDP:\t" + d3.format("$,d")(d.annualGDPUSD / 100));   
                    });
                
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
                    .data(countryStats)
                    .transition()
                    .duration(700)
                    .attr("fill", function() { return color(0); })
                    .attr("cy", function(d){
                                    return yscale(d.unemploymentPercentage / 100)})
                    .select("title")
                    .text(function(d) {
                        if(!scplXMode)
                            return ("Country:\t" + d.countryName + "\nPlayers:\t" + d.players +
                                        "\nUnemployment:\t" + d3.format(".1%")(d.unemploymentPercentage / 100));
                        else
                            return ("Country:\t" + d.countryName + "\nEarnings:\t" + d3.format("$,d")(d.totalUSDPrize) +
                                        "\nUnemployment:\t" + d3.format(".1%")(d.unemploymentPercentage / 100)); 
                    });

                svg.selectAll(".scpl-circle1")
                    .selectAll("circle")
                    .data(countryStats)
                    .transition()
                    .duration(700)
                    .attr("fill", function() { return color(1); })
                    .attr("cy", function(d){
                                    return yscale(d.urbanPopPercentage / 100)})
                    .select("title")
                    .text(function(d) {
                        if(!scplXMode)
                            return ("Country:\t" + d.countryName + "\nPlayers:\t" + d.players +
                                        "\nUrban Population:\t" + d3.format(".1%")(d.urbanPopPercentage / 100));
                        else
                            return ("Country:\t" + d.countryName + "\nEarnings:\t" + d3.format("$,d")(d.totalUSDPrize) +
                                        "\nUrban Population:\t" + d3.format(".1%")(d.urbanPopPercentage / 100)); 
                    });
                
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
                            return xscale(d.totalUSDPrize)})
                    .select("title")
                    .text(function(d) {
                        if(!scplYMode)
                            return ("Country:\t" + d.countryName + "\nEarnings:\t" + d3.format("$,d")(d.totalUSDPrize) +
                                        "\nUnemployment:\t" + d3.format(".1%")(d.unemploymentPercentage / 100));
                        else
                            return ("Country:\t" + d.countryName + "\nEarnings:\t" + d3.format("$,d")(d.totalUSDPrize) +
                                        "\nGDP:\t" + d3.format("$,d")(d.annualGDPUSD / 100));   
                    });

                svg.selectAll(".scpl-circle1")
                    .selectAll("circle")
                    .data(countryStats)
                    .transition()
                    .duration(700)
                    .attr("cx", function(d){
                            return xscale(d.totalUSDPrize)})
                    .select("title")
                    .text(function(d) {
                        if(!scplYMode)
                            return ("Country:\t" + d.countryName + "\nEarnings:\t" + d3.format("$,d")(d.totalUSDPrize) +
                                        "\nUrban Population:\t" + d3.format(".1%")(d.urbanPopPercentage / 100));
                        else
                            return ("Country:\t" + d.countryName + "\nEarnings:\t" + d3.format("$,d")(d.totalUSDPrize) +
                                        "\nGDP:\t" + d3.format("$,d")(d.annualGDPUSD / 100));   
                    });
                
                xaxis = d3.axisBottom()
                    .scale(xscale)
                    .tickFormat(d3.format("$,d"))
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
                            return xscale(d.players)})
                    .select("title")
                    .text(function(d) {
                        if(!scplYMode)
                            return ("Country:\t" + d.countryName + "\nPlayers:\t" + d.players +
                                        "\nUnemployment:\t" + d3.format(".1%")(d.unemploymentPercentage / 100));
                        else
                            return ("Country:\t" + d.countryName + "\nPlayers:\t" + d.players +
                                        "\nGDP:\t" + d3.format("$,d")(d.annualGDPUSD / 100));
                    });

                svg.selectAll(".scpl-circle1")
                    .selectAll("circle")
                    .data(countryStats)
                    .transition()
                    .duration(700)
                    .attr("cx", function(d){
                            return xscale(d.players)})
                    .select("title")
                    .text(function(d) {
                        if(!scplYMode)
                            return ("Country:\t" + d.countryName + "\nPlayers:\t" + d.players +
                                        "\nUrban Population:\t" + d3.format(".1%")(d.urbanPopPercentage / 100));
                        else
                            return ("Country:\t" + d.countryName + "\nPlayers:\t" + d.players +
                                        "\nGDP:\t" + d3.format("$,d")(d.annualGDPUSD / 100));   
                    });
                
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