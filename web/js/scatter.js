var countryStats;
var scplYMode = false;
var scplXMode = false;

d3.json("data/countries.json").then(function (data) {
    countryStats = data.countries.filter(function(d){
        if (d.players > 1) return d;
    });
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
        .domain([1.6,1000])
        .range([padding + 10,w-padding]);
    var color = d3.scaleOrdinal(["#28568c", "#008e96"]);
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
            $('.tooltip').css({
                display: "none"
            });
        })
        .on("mousemove", function(d){
            var text;
            if(d.i === "urbanPopPercentage")
                text = (d.title + "<br>Players: " + d.x + "<br>Urban Population: " + d3.format(".1%")(d.y / 100));
            else
                text = (d.title + "<br>Players: " + d.x + "<br>Uneployment: " + d3.format(".1%")(d.y / 100));
            $('.tooltip').html(text);
            $('.tooltip').css({
              display: "block",
              left: d3.mouse(this)[0] + 30 + $(window).width() * 0.007,
              top: d3.mouse(this)[1] + 30 + $(window).height() * 0.445
            })
        });
    
    // axes
    var yaxis = d3.axisLeft()
        .scale(yscale)
        .tickFormat(d3.format(".0%"))
        .ticks(10);
    svg.append("g")
        .attr("transform","translate(" + padding + ",0)")
        .attr("class","scatter-y")
        .call(yaxis)
        .append("text")
        .attr("x", -h / 2)
        .attr("y", -padding * 0.8)
        .attr("transform", "rotate(-90)")
        .attr("class", "scatter-y-text")
        .style("text-anchor", "middle")
        .text("Unemployment / Urban Population");;
    var xaxis = d3.axisBottom()
        .scale(xscale)
        .tickFormat(d3.format("d"))
        .tickValues([10, 100, 1000]);
    svg.append("g")
        .attr("transform","translate(0," + (h-padding) + ")")
        .attr("class","scatter-x")
        .call(xaxis)
        .append("text")
        .attr("x", w / 2)
        .attr("y", (h/6)-padding * 0.8)
        .attr("class", "scatter-x-text")
        .style("text-anchor", "middle")
        .text("Number of Players");


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
                    .on("mousemove", function(d){
                        var text;
                        if(!scplXMode)
                            text = (d.countryName + "<br>Players: " + d.players +
                                        "<br>GDP: " + d3.format("$.3s")(d.annualGDPUSD / 100)); 
                        else
                            text = (d.countryName + "<br>Earnings: " + d3.format("$.3s")(d.totalUSDPrize) +
                                        "<br>GDP: " + d3.format("$.3s")(d.annualGDPUSD / 100));   
                        $('.tooltip').html(text);
                        $('.tooltip').css({
                            display: "block",
                            left: d3.mouse(this)[0] + 30 + $(window).width() * 0.007,
                            top: d3.mouse(this)[1] + 30 + $(window).height() * 0.445
                        })
                    })
                    .transition()
                    .duration(700)
                    .attr("fill", "#009684")
                    .attr("cy", function(d){
                                    return yscale(d.annualGDPUSD / 1.2)});

                
                svg.selectAll(".scpl-circle1")
                    .selectAll("circle")
                    .data(countryStats)
                    .on("mousemove", function(d){
                        var text;
                        if(!scplXMode)
                            text = (d.countryName + "<br>Players: " + d.players +
                                        "<br>GDP: " + d3.format("$.3s")(d.annualGDPUSD / 100));
                        else
                            text = (d.countryName + "<br>Earnings: " + d3.format("$.3s")(d.totalUSDPrize) +
                                        "<br>GDP: " + d3.format("$.3s")(d.annualGDPUSD / 100));   
                        $('.tooltip').html(text);
                        $('.tooltip').css({
                            display: "block",
                            left: d3.mouse(this)[0] + 30 + $(window).width() * 0.007,
                            top: d3.mouse(this)[1] + 30 + $(window).height() * 0.445
                        })
                    })
                    .transition()
                    .duration(700)
                    .attr("fill", "#009684")
                    .attr("cy", function(d){
                                    return yscale(d.annualGDPUSD / 1.2)});
                
                yaxis = d3.axisLeft()
                    .scale(yscale)
                    .tickFormat(d3.format("$.0s"))
                    .ticks(5);
                svg.selectAll(".scatter-y")
                    .transition()
                    .duration(700)
                    .attr("transform","translate(" + padding + ",0)")
                    .call(yaxis)
                    .selectAll(".scatter-y-text")
                    .text("GDP");

                document.getElementsByClassName("caption-container2")[0].style.display = "none";
                document.getElementsByClassName("ball1")[0].style.backgroundColor = "#009684";
                document.getElementsByClassName("ball-text")[0].innerHTML = "GDP";
            }
            else{
                yscale = d3.scaleLinear()
                        .domain([0,1])
                        .range([h - padding, padding]);

                svg.selectAll(".scpl-circle0")
                    .selectAll("circle")
                    .data(countryStats)
                    .on("mousemove", function(d){
                        var text;
                        if(!scplXMode)
                            text = (d.countryName + "<br>Players: " + d.players +
                                        "<br>Unemployment: " + d3.format(".1%")(d.unemploymentPercentage / 100));
                        else
                            text = (d.countryName + "<br>Earnings: " + d3.format("$.3s")(d.totalUSDPrize) +
                                            "<br>Unemployment: " + d3.format(".1%")(d.unemploymentPercentage / 100));   
                        $('.tooltip').html(text);
                        $('.tooltip').css({
                            display: "block",
                            left: d3.mouse(this)[0] + 30 + $(window).width() * 0.007,
                            top: d3.mouse(this)[1] + 30 + $(window).height() * 0.445
                        })
                    })
                    .transition()
                    .duration(700)
                    .attr("fill", function() { return color(0); })
                    .attr("cy", function(d){
                                    return yscale(d.unemploymentPercentage / 100)});

                svg.selectAll(".scpl-circle1")
                    .selectAll("circle")
                    .data(countryStats)
                    .on("mousemove", function(d){
                        var text;
                        if(!scplXMode)
                            text = (d.countryName + "<br>Players: " + d.players +
                                        "<br>Urban Population: " + d3.format(".1%")(d.urbanPopPercentage / 100));
                        else
                            text = (d.countryName + "<br>Earnings: " + d3.format("$.3s")(d.totalUSDPrize) +
                                        "<br>Urban Population: " + d3.format(".1%")(d.urbanPopPercentage / 100));   
                        $('.tooltip').html(text);
                        $('.tooltip').css({
                            display: "block",
                            left: d3.mouse(this)[0] + 30 + $(window).width() * 0.007,
                            top: d3.mouse(this)[1] + 30 + $(window).height() * 0.445
                        })
                    })
                    .transition()
                    .duration(700)
                    .attr("fill", function() { return color(1); })
                    .attr("cy", function(d){
                                    return yscale(d.urbanPopPercentage / 100)})
                
                yaxis = d3.axisLeft()
                    .scale(yscale)
                    .tickFormat(d3.format(".0%"))
                    .ticks(10);
                svg.selectAll(".scatter-y")
                    .transition()
                    .duration(700)
                    .attr("transform","translate(" + padding + ",0)")
                    .call(yaxis)
                    .selectAll(".scatter-y-text")
                    .text("Unemployment / Urban Population");

                document.getElementsByClassName("caption-container2")[0].style.display = "block";
                document.getElementsByClassName("ball1")[0].style.backgroundColor = "#008e96";
                document.getElementsByClassName("ball-text")[0].innerHTML = "Urban Population";
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
                    .on("mousemove", function(d){
                        var text;
                        if(!scplYMode)
                            text = (d.countryName + "<br>Earnings: " + d3.format("$.3s")(d.totalUSDPrize) +
                                        "<br>Unemployment: " + d3.format(".1%")(d.unemploymentPercentage / 100));
                        else
                            text = (d.countryName + "<br>Earnings: " + d3.format("$.3s")(d.totalUSDPrize) +
                                        "<br>GDP: " + d3.format("$.3s")(d.annualGDPUSD / 100));   
                        $('.tooltip').html(text);
                        $('.tooltip').css({
                            display: "block",
                            left: d3.mouse(this)[0] + 30 + $(window).width() * 0.007,
                            top: d3.mouse(this)[1] + 30 + $(window).height() * 0.445
                        })
                    })
                    .transition()
                    .duration(700)
                    .attr("cx", function(d){
                            return xscale(d.totalUSDPrize)});

                svg.selectAll(".scpl-circle1")
                    .selectAll("circle")
                    .data(countryStats)
                    .on("mousemove", function(d){
                        var text;
                        if(!scplYMode)
                            text = (d.countryName + "<br>Earnings: " + d3.format("$.3s")(d.totalUSDPrize) +
                                        "<br>Urban Population: " + d3.format(".1%")(d.urbanPopPercentage / 100));
                        else
                            text = (d.countryName + "<br>Earnings: " + d3.format("$.3s")(d.totalUSDPrize) +
                                        "<br>GDP: " + d3.format("$.3s")(d.annualGDPUSD / 100));   
                        $('.tooltip').html(text);
                        $('.tooltip').css({
                            display: "block",
                            left: d3.mouse(this)[0] + 30 + $(window).width() * 0.007,
                            top: d3.mouse(this)[1] + 30 + $(window).height() * 0.445
                        })
                    })
                    .transition()
                    .duration(700)
                    .attr("cx", function(d){
                            return xscale(d.totalUSDPrize)});
                
                xaxis = d3.axisBottom()
                    .scale(xscale)
                    .tickFormat(d3.format("$.1s"))
                    .ticks(3);
                svg.selectAll(".scatter-x")
                    .transition()
                    .duration(700)
                    .attr("transform","translate(0, " + (h-padding) + ")")
                    .call(xaxis)
                    .call(xaxis)
                    .selectAll(".scatter-x-text")
                    .text("Player Earnings");
            }
            else{
                xscale = d3.scaleLog()
                            .domain([1.6,1000])
                            .range([padding + 10,w-padding]);
    
                svg.selectAll(".scpl-circle0")
                    .selectAll("circle")
                    .data(countryStats)
                    .on("mousemove", function(d){
                        var text;
                        if(!scplYMode)
                            text = (d.countryName + "<br>Players: " + d.players +
                                        "<br>Unemployment: " + d3.format(".1%")(d.unemploymentPercentage / 100));
                        else
                            text = (d.countryName + "<br>Players: " + d.players +
                                        "<br>GDP: " + d3.format("$.3s")(d.annualGDPUSD / 100));   
                        $('.tooltip').html(text);
                        $('.tooltip').css({
                            display: "block",
                            left: d3.mouse(this)[0] + 30 + $(window).width() * 0.007,
                            top: d3.mouse(this)[1] + 30 + $(window).height() * 0.445
                        })
                    })
                    .transition()
                    .duration(700)
                    .attr("cx", function(d){
                            return xscale(d.players)});

                svg.selectAll(".scpl-circle1")
                    .selectAll("circle")
                    .data(countryStats)
                    .on("mousemove", function(d){
                        var text;
                        if(!scplYMode)
                            text = (d.countryName + "<br>Players: " + d.players +
                                        "<br>Urban Population: " + d3.format(".1%")(d.urbanPopPercentage / 100));
                        else
                            text = (d.countryName + "<br>Players: " + d.players +
                                        "<br>GDP: " + d3.format("$.3s")(d.annualGDPUSD / 100));   
                        $('.tooltip').html(text);
                        $('.tooltip').css({
                            display: "block",
                            left: d3.mouse(this)[0] + 30 + $(window).width() * 0.007,
                            top: d3.mouse(this)[1] + 30 + $(window).height() * 0.445
                        })
                    })
                    .transition()
                    .duration(700)
                    .attr("cx", function(d){
                            return xscale(d.players)});
                
                xaxis = d3.axisBottom()
                    .scale(xscale)
                    .tickFormat(d3.format("d"))
                    .tickValues([10, 100, 1000]);
                svg.selectAll(".scatter-x")
                    .transition()
                    .duration(700)
                    .attr("transform","translate(0, " + (h-padding) + ")")
                    .call(xaxis)
                    .call(xaxis)
                    .selectAll(".scatter-x-text")
                    .text("Number of Players");
            }
            scplXMode = !scplXMode;
        });
}