let teams_sorted, earningsByAge, games_sorted;
let quantity = false;
let age_selected = true;
let teams_selected;
let last_changed = 1;
let tags_teams = [];
let tags_games = [];
let promises = [
    d3.json("data/earningsByAge_global.json").then(function (data) {
        data.earningsByAge.forEach(element => {
            element.earnings = +element.earnings;
            element.age = +element.age;
        });
        earningsByAge = data.earningsByAge;
    }),
    d3.json("data/teams_sorted.json").then(function (data) {
        data.teams.forEach(element => {
            element.TeamId = +element.TeamId;
            element.TotalUSDPrize = +element.TotalUSDPrize;
            element.TotalTournaments = +element.TotalTournaments;
            tags_teams.push(createTag(element.TeamName));
        });
        teams_sorted = data.teams;
    }),
    d3.json("data/games_sorted.json").then(function (data) {
        data.games.forEach(element => {
            element.gameid = +element.gameid;
            element.totalUSDPrize = +element.totalUSDPrize;
            element.totalTournaments = +element.totalTournaments;
            tags_games.push(createTag(element.gameName));
        });
        games_sorted = data.games;
    })
];

Promise.all(promises).then(function(values){
    gen_vis();
});
                    
function gen_vis(){
    var margin =  {top: 20, right: 10, bottom: 20, left: 70};
    var marginOverview = {top: 30, right: 10, bottom: 20, left: 70};
    var selectorHeight = 40;
    var scrollBarGap = 20; 
    barChartWidth = window.innerWidth * 0.5 - margin.left - margin.right;
    barChartHeight = window.innerHeight * 0.4 - margin.top - margin.bottom - selectorHeight;
    heightOverview = window.innerHeight * 0.089 - marginOverview.top - marginOverview.bottom;
        
    var maxLength = d3.max(teams_sorted.map(function(d){ return d.TeamName.length}))
    var barWidth = maxLength * 3;
    numBars = Math.round(barChartWidth/barWidth);
    var isScrollDisplayed = barWidth * teams_sorted.length > barChartWidth;
  
    var xscale = d3.scaleBand()
        .domain(earningsByAge.slice(0,numBars).map(function (d) { return d.age; }))
        .rangeRound([0, barChartWidth]).paddingInner([0.5]);

    var yscale = d3.scalePow().exponent(0.4)
        .domain([0, d3.max(earningsByAge, function (d) { return d.earnings; })])
        .range([barChartHeight, 0]);
  
    var xAxis  = d3.axisBottom().scale(xscale);
    var yAxis  = d3.axisLeft().scale(yscale).tickFormat(d3.format("$.2s")).ticks(5);
  
    var svg = d3.select("#barchart").append("svg")
        .attr("width", barChartWidth + margin.left + margin.right)
        .attr("height", barChartHeight + margin.top + margin.bottom + selectorHeight + scrollBarGap);
  
    var diagram = svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    diagram.append("g")
  	    .attr("class", "x axis")
        .attr("transform", "translate(0, " + barChartHeight + ")")
        .call(xAxis)
        .append("text")
        .attr("x", barChartWidth / 2)
        .attr("y", 36)
        .attr("class", "bchart-x-text")
        .style("text-anchor", "middle")
        .text("Age");
  
    diagram.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("x", -145)
        .attr("y", -50)
        .attr("transform", "rotate(-90)")
        .attr("class", "bchart-y-text")
        .style("text-anchor", "middle")
        .text("Earnings");
  
    var bars = diagram.append("g").attr("class", "main-bars");
  
    bars.selectAll("rect")
        .data(earningsByAge.slice(0, numBars), function (d) {return d.age; })
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return xscale(d.age); })
        .attr("y", function (d) { return yscale(d.earnings); })
        .attr("width", xscale.bandwidth())
        .attr("height", function (d) { return barChartHeight - yscale(d.earnings); });


    d3.select("#check1").on("change",function(){
        console.log("OMG", last_changed);
        if(last_changed == 1){return;}
        xscale = d3.scaleBand()
            .domain(earningsByAge.slice(0,numBars).map(function (d) { return d.age; }))
            .rangeRound([0, barChartWidth]).paddingInner([0.5]);
        yscale = d3.scalePow().exponent(0.4)
            .domain([0, d3.max(earningsByAge, function (d) { return d.earnings; })])
            .range([barChartHeight, 0]);
        xAxis  = d3.axisBottom().scale(xscale);
        yAxis  = d3.axisLeft().scale(yscale).tickFormat(d3.format("$.2s")).ticks(5);
        d3.selectAll(".x.axis").call(xAxis);
        d3.selectAll(".y.axis").call(yAxis);
        xOverview = d3.scaleBand()
            .domain(earningsByAge.map(function (d) { return d.age; }))
            .rangeRound([0, barChartWidth]).paddingInner([0.5]);
        yOverview = d3.scalePow().exponent(0.4).range([heightOverview, 0]);
        yOverview.domain(yscale.domain());
        diagram.selectAll('.extra-subBar1').remove();
        diagram.selectAll('.extra-subBar2').remove();
        subBars = diagram.select("#bchart-scroll").selectAll('.subBar');
        subBars.data(earningsByAge)
            .transition()
            .duration(1000)
            .attr("height", function(d) {return heightOverview - yOverview(d.earnings);})
            .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.earnings); })
            .attr("x", function(d) { return xOverview(d.age) - 5;})
            .attr("width", function(d) { return xOverview.bandwidth();});
        rects = bars.selectAll("rect").data(earningsByAge)
            .transition()
            .duration(1000)
            .attr("y", function (d) { return yscale(d.earnings); })
            .attr("height", function (d) { return barChartHeight - yscale(d.earnings); })
            .attr("x", function (d) { return xscale(d.age); })
            .attr("width", function (d) { return xscale.bandwidth(); });
        displayed = d3.scaleQuantize()
            .domain([0, barChartWidth])
            .range(d3.range(earningsByAge.length));

        d3.select(".mover")
            .attr("width", Math.round(parseFloat(numBars * barChartWidth)/earningsByAge.length));
        
        d3.select(".bchart-x-text").text("Age");
        d3.select(".bchart-y-text").text("Earnings");
        last_changed = 1;
        age_selected = true;
    });
    d3.select("#check2").on("change",function(){
        if(last_changed != 1 && (teams_selected && last_changed == 3 || teams_selected && last_changed == 4)){return;}
        xscale = d3.scaleBand()
            .domain(teams_sorted.slice(0,numBars).map(function (d) { return d.TeamName; }))
            .rangeRound([0, barChartWidth]).paddingInner([0.5]);
        if(document.getElementById("check3").checked){
            yscale = d3.scalePow().exponent(0.35)
                .domain([0, 25E6])
                .range([barChartHeight, 0]);
            xAxis  = d3.axisBottom().scale(xscale).tickFormat(function(d,i){ return tags_teams[i] });
            yAxis  = d3.axisLeft().scale(yscale).tickFormat(d3.format("$.2s")).ticks(5);
            d3.selectAll(".x.axis").call(xAxis);
            d3.selectAll(".y.axis").call(yAxis);
            d3.selectAll(".x.axis").selectAll("text").append("title")
                .data(teams_sorted)
                .text(function(d) { return d.TeamName;});
            xOverview = d3.scaleBand()
                .domain(teams_sorted.map(function (d) { return d.TeamName; }))
                .rangeRound([0, barChartWidth]).paddingInner([0.5]);
            yOverview = d3.scalePow().exponent(0.35).range([heightOverview, 0]);
            yOverview.domain(yscale.domain());
            rects = bars.selectAll("rect").data(teams_sorted)
                .transition()
                .duration(1000)
                .attr("y", function (d) { return yscale(d.TotalUSDPrize); })
                .attr("height", function (d) { return barChartHeight - yscale(d.TotalUSDPrize); })
                .attr("x", function (d) { return xscale(d.TeamName); })
                .attr("width", function (d) { return xscale.bandwidth(); });
            subBars = diagram.select("#bchart-scroll").selectAll('.subBar');
            subBars.data(teams_sorted)
                .transition()
                .duration(1000)
                .attr("height", function(d) {return heightOverview - yOverview(d.TotalUSDPrize);})
                .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.TotalUSDPrize); })
                .attr("x", function(d) { return xOverview(d.TeamName) - 84;})
                .attr("width", function(d) { return xOverview.bandwidth();});
            subBars.data(teams_sorted).enter().append("rect")
                .classed('subBar extra-subBar1', true)
                .attr("height", function(d) {return heightOverview - yOverview(d.TotalUSDPrize);})
                .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.TotalUSDPrize); })
                .attr("x", function(d) { return xOverview(d.TeamName) - 84;})
                .attr("width", function(d) { return xOverview.bandwidth();});
            d3.select(".bchart-x-text").text("Team");
            d3.select(".bchart-y-text").text("Earnings");
            last_changed = 3;
            quantity = false;
        }else{
            yscale = d3.scalePow().exponent(0.35)
                .domain([0, d3.max(teams_sorted, function (d) { return d.TotalTournaments; })])
                .range([barChartHeight, 0]);
            xAxis  = d3.axisBottom().scale(xscale).tickFormat(function(d,i){ return tags_teams[i] });
            yAxis  = d3.axisLeft().scale(yscale).ticks(5);
            d3.selectAll(".x.axis").call(xAxis);
            d3.selectAll(".y.axis").call(yAxis);
            d3.selectAll(".x.axis").selectAll("text").append("title")
                .data(teams_sorted)
                .text(function(d) { return d.TeamName;});
            xOverview = d3.scaleBand()
                .domain(teams_sorted.map(function (d) { return d.TeamName; }))
                .rangeRound([0, barChartWidth]).paddingInner([0.5]);
            yOverview = d3.scalePow().exponent(0.35).range([heightOverview, 0]);
            yOverview.domain(yscale.domain());
            rects = bars.selectAll("rect").data(teams_sorted)
                .transition()
                .duration(1000)
                .attr("y", function (d) { return yscale(d.TotalTournaments); })
                .attr("height", function (d) { return barChartHeight - yscale(d.TotalTournaments); })
                .attr("x", function (d) { return xscale(d.TeamName); })
                .attr("width", function (d) { return xscale.bandwidth(); });
            subBars = diagram.select("#bchart-scroll").selectAll('.subBar');
            subBars.data(teams_sorted)
                .transition()
                .duration(1000)
                .attr("height", function(d) {return heightOverview - yOverview(d.TotalTournaments);})
                .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.TotalTournaments); })
                .attr("x", function(d) { return xOverview(d.TeamName) - 84;})
                .attr("width", function(d) { return xOverview.bandwidth();});
            subBars.data(teams_sorted).enter().append("rect")
                .classed('subBar extra-subBar1', true)
                .attr("height", function(d) {return heightOverview - yOverview(d.TotalTournaments);})
                .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.TotalTournaments); })
                .attr("x", function(d) { return xOverview(d.TeamName) - 84;})
                .attr("width", function(d) { return xOverview.bandwidth();});
            d3.select(".bchart-x-text").text("Team");
            d3.select(".bchart-y-text").text("Tournaments Won");
            last_changed = 4;
            quantity = true;
        }

        displayed = d3.scaleQuantize()
            .domain([0, barChartWidth])
            .range(d3.range(teams_sorted.length));

        d3.select(".mover")
            .attr("width", Math.round(parseFloat(numBars * barChartWidth)/teams_sorted.length))
            .attr("x", 0)
            .attr("y", 0);
        
        age_selected = false;
        teams_selected = true;
    });
    d3.select("#check3").on("change",function(){
        if(last_changed == 2 && teams_selected){return;}
        if(document.getElementById("check2").checked){
            yscale = d3.scalePow().exponent(0.35)
                .domain([0, 2.5E7])
                .range([barChartHeight, 0]);
            yAxis  = d3.axisLeft().scale(yscale).tickFormat(d3.format("$.2s")).ticks(5);
            d3.selectAll(".y.axis").call(yAxis);
            yOverview = d3.scalePow().exponent(0.35).range([heightOverview, 0]);
            yOverview.domain(yscale.domain());
            subBars = diagram.select("#bchart-scroll").selectAll('.subBar');
            subBars.data(teams_sorted)
                .transition()
                .duration(1000)
                .attr("height", function(d) {return heightOverview - yOverview(d.TotalUSDPrize);})
                .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.TotalUSDPrize); });

            rects = bars.selectAll("rect")
                .transition()
                .duration(1000)
                .attr("y", function (d) { return yscale(d.TotalUSDPrize); })
                .attr("height", function (d) { return barChartHeight - yscale(d.TotalUSDPrize); });
            d3.select(".bchart-x-text").text("Team");
            d3.select(".bchart-y-text").text("Earnings");
            teams_selected = true;
        }else{
            yscale = d3.scalePow().exponent(0.35)
                .domain([0, d3.max(games_sorted, function (d) { return d.totalUSDPrize; })])
                .range([barChartHeight, 0]);
            yAxis  = d3.axisLeft().scale(yscale).tickFormat(d3.format("$.2s")).ticks(5);
            d3.selectAll(".y.axis").call(yAxis);
            yOverview = d3.scalePow().exponent(0.35).range([heightOverview, 0]);
            yOverview.domain(yscale.domain());
            subBars = diagram.select("#bchart-scroll").selectAll('.subBar');
            subBars.data(games_sorted)
                .transition()
                .duration(1000)
                .attr("height", function(d) {return heightOverview - yOverview(d.totalUSDPrize);})
                .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.totalUSDPrize); });

            rects = bars.selectAll("rect")
                .data(games_sorted)
                .transition()
                .duration(1000)
                .attr("y", function (d) { return yscale(d.totalUSDPrize); })
                .attr("height", function (d) { return barChartHeight - yscale(d.totalUSDPrize); });
            d3.select(".bchart-x-text").text("Game");
            d3.select(".bchart-y-text").text("Prize Money");
            teams_selected = false;
        }
        last_changed = 3;
        quantity = false;
    });
    d3.select("#check4").on("change",function(){
        if(last_changed == 4){return;}
        if(document.getElementById("check2").checked){
            yscale = d3.scalePow().exponent(0.4)
                .domain([0, 1400])
                .range([barChartHeight, 0]);
            yAxis = d3.axisLeft().scale(yscale).ticks(5);
            d3.selectAll(".y.axis").call(yAxis);
            yOverview = d3.scalePow().exponent(0.4).range([heightOverview, 0]);
            yOverview.domain(yscale.domain());
            subBars = diagram.select("#bchart-scroll").selectAll('.subBar');
            subBars.data(teams_sorted)
                .transition()
                .duration(1000)
                .attr("height", function(d) {return heightOverview - yOverview(d.TotalTournaments);})
                .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.TotalTournaments); });

            rects = bars.selectAll("rect")
                .transition()
                .duration(1000)
                .attr("y", function (d) { return yscale(d.TotalTournaments); })
                .attr("height", function (d) { return barChartHeight - yscale(d.TotalTournaments); });
            d3.select(".bchart-x-text").text("Team");
            d3.select(".bchart-y-text").text("Tournaments Won");
            teams_selected = true;
        }else{
            yscale = d3.scalePow().exponent(0.35)
                .domain([0, d3.max(games_sorted, function (d) { return d.totalTournaments; })])
                .range([barChartHeight, 0]);
            yAxis  = d3.axisLeft().scale(yscale).ticks(5);
            d3.selectAll(".y.axis").call(yAxis);
            yOverview = d3.scalePow().exponent(0.35).range([heightOverview, 0]);
            yOverview.domain(yscale.domain());
            subBars = diagram.select("#bchart-scroll").selectAll('.subBar');
            subBars.data(games_sorted)
                .transition()
                .duration(1000)
                .attr("height", function(d) {return heightOverview - yOverview(d.totalTournaments);})
                .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.totalTournaments); });

            rects = bars.selectAll("rect")
                .data(games_sorted)
                .transition()
                .duration(1000)
                .attr("y", function (d) { return yscale(d.totalTournaments); })
                .attr("height", function (d) { return barChartHeight - yscale(d.totalTournaments); });   
            d3.select(".bchart-x-text").text("Game");
            d3.select(".bchart-y-text").text("Tournaments Played");        
            teams_selected = false;
        }
        quantity = true;
        last_changed = 4;
    });

    d3.select("#check5").on("change",function(){
        if(last_changed == 5 || (!teams_selected && last_changed == 3 || !teams_selected && last_changed == 4)){return;}
        xscale = d3.scaleBand()
            .domain(games_sorted.slice(0,numBars).map(function (d) { return d.gameName; }))
            .rangeRound([0, barChartWidth]).paddingInner([0.5]);

        xAxis  = d3.axisBottom().scale(xscale).tickFormat(function(d,i){ return tags_games[i] });
        d3.selectAll(".x.axis").call(xAxis);
        d3.selectAll(".x.axis").selectAll("text").append("title")
            .data(games_sorted)
            .text(function(d) { return d.gameName;});
        xOverview = d3.scaleBand()
            .domain(games_sorted.map(function (d) { return d.gameName; }))
            .rangeRound([0, barChartWidth]).paddingInner([0.5]);
        if(document.getElementById("check3").checked){
            yscale = d3.scalePow().exponent(0.35)
                .domain([0, d3.max(games_sorted, function (d) { return d.totalUSDPrize; })])
                .range([barChartHeight, 0]);
            yAxis  = d3.axisLeft().scale(yscale).tickFormat(d3.format("$.2s")).ticks(5);
            d3.selectAll(".y.axis").call(yAxis);
            yOverview = d3.scalePow().exponent(0.35).range([heightOverview, 0]);
            yOverview.domain(yscale.domain());
            subBars = diagram.select("#bchart-scroll").selectAll('.subBar');
            subBars.data(games_sorted)
                .transition()
                .duration(1000)
                .attr("height", function(d) {return heightOverview - yOverview(d.totalUSDPrize);})
                .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.totalUSDPrize); })
                .attr("x", function(d) { return xOverview(d.gameName) - 102;})
                .attr("width", function(d) { return xOverview.bandwidth();});
            subBars.data(games_sorted).enter().append("rect")
                .classed('subBar extra-subBar2', true)
                .attr("height", function(d) {return heightOverview - yOverview(d.totalUSDPrize);})
                .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.totalUSDPrize); })
                .attr("x", function(d) { return xOverview(d.gameName) - 102;})
                .attr("width", function(d) { return xOverview.bandwidth();});
            rects = bars.selectAll("rect")
                .data(games_sorted)
                .transition()
                .duration(1000)
                .attr("y", function (d) { return yscale(d.totalUSDPrize); })
                .attr("height", function (d) { return barChartHeight - yscale(d.totalUSDPrize); })
                .attr("x", function (d) { return xscale(d.gameName); })
                .attr("width", function (d) { return xscale.bandwidth(); });
            d3.select(".bchart-x-text").text("Game");
            d3.select(".bchart-y-text").text("Prize Money");
            quantity = false;
        }else{
            yscale = d3.scalePow().exponent(0.35)
                .domain([0, d3.max(games_sorted, function (d) { return d.totalTournaments; })])
                .range([barChartHeight, 0]);
            yAxis  = d3.axisLeft().scale(yscale).ticks(5);
            d3.selectAll(".y.axis").call(yAxis);
            yOverview = d3.scalePow().exponent(0.35).range([heightOverview, 0]);
            yOverview.domain(yscale.domain());
            subBars = diagram.select("#bchart-scroll").selectAll('.subBar');
            subBars.data(games_sorted)
                .transition()
                .duration(1000)
                .attr("height", function(d) {return heightOverview - yOverview(d.totalTournaments);})
                .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.totalTournaments); })
                .attr("x", function(d) { return xOverview(d.gameName) - 102;})
                .attr("width", function(d) { return xOverview.bandwidth();});
            subBars.data(games_sorted).enter().append("rect")
                .classed('subBar extra-subBar2', true)
                .attr("height", function(d) {return heightOverview - yOverview(d.totalTournaments);})
                .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.totalTournaments); })
                .attr("x", function(d) { return xOverview(d.gameName) - 102;})
                .attr("width", function(d) { return xOverview.bandwidth();});
            rects = bars.selectAll("rect")
                .data(games_sorted)
                .transition()
                .duration(1000)
                .attr("y", function (d) { return yscale(d.totalTournaments); })
                .attr("height", function (d) { return barChartHeight - yscale(d.totalTournaments); })
                .attr("x", function (d) { return xscale(d.gameName); })
                .attr("width", function (d) { return xscale.bandwidth(); });
            d3.select(".bchart-x-text").text("Game");
            d3.select(".bchart-y-text").text("Tournaments Played");
            quantity = true;
        }
        displayed = d3.scaleQuantize()
            .domain([0, barChartWidth])
            .range(d3.range(games_sorted.length));

        d3.select(".mover")
            .attr("width", Math.round(parseFloat(numBars * barChartWidth)/games_sorted.length))
            .attr("x", 0)
        last_changed = 5;
        teams_selected = false;
        age_selected = false;
    });
  
if (isScrollDisplayed)
{
    var xOverview = d3.scaleBand()
        .domain(earningsByAge.map(function (d) { return d.age; }))
        .rangeRound([0, barChartWidth]).paddingInner([0.5]);
    yOverview = d3.scalePow().exponent(0.4).range([heightOverview, 0]);
    yOverview.domain(yscale.domain());

    var subBars = diagram.append('g')
                        .attr("id", "bchart-scroll")
                        .attr("transform", "translate(0, " + scrollBarGap +")")
                        .selectAll('.subBar')
                        .data(earningsByAge);
    subBars.enter().append("rect")
        .classed('subBar', true)
        .attr("height", function(d) {
            return heightOverview - yOverview(d.earnings)
        })
        .attr("width", function(d) {
            return xOverview.bandwidth();
        })
        .attr("x", function(d) {
            return xOverview(d.age) - 15;
        })
        .attr("y", function(d) {
            return barChartHeight + heightOverview + yOverview(d.earnings)
        })
        var displayed = d3.scaleQuantize()
            .domain([0, barChartWidth])
            .range(d3.range(earningsByAge.length));

        diagram.select("#bchart-scroll").append("rect")
            .attr("transform", "translate(0, " + (barChartHeight + margin.bottom) + ")")
            .attr("class", "mover")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", selectorHeight)
            .attr("width", Math.round(parseFloat(numBars * barChartWidth)/earningsByAge.length))
            .attr("pointer-events", "all")
            .attr("cursor", "ew-resize")
            .call(d3.drag().on("drag", display));
    }
    function display () {
        var x = parseInt(d3.select(this).attr("x")),
            nx = x + d3.event.dx,
            w = parseInt(d3.select(this).attr("width")),
            f, nf, new_data, rects;

        if ( nx < 0 || nx + w > barChartWidth ) return;

        d3.select(this).attr("x", nx);

        f = displayed(x);
        nf = displayed(nx);
        if ( f === nf ) return;
        console.log(age_selected,custom_teams_selected);
        if(age_selected && !custom_teams_selected){

            new_data = earningsByAge.slice(nf, nf + numBars);

            xscale.domain(new_data.map(function (d) { return d.age; }));
            diagram.select(".x.axis").call(xAxis);

            rects = bars.selectAll("rect")
                .data(new_data, function (d) {return d.age; });

            rects.attr("x", function (d) { return xscale(d.age); });
            
            rects.enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) { return xscale(d.age); })
                .attr("y", function (d) { return yscale(d.earnings); })
                .attr("width", xscale.bandwidth())
                .attr("height", function (d) { return barChartHeight - yscale(d.earnings); });
            
            rects.exit().remove();
        }else if(custom_teams_selected){
            new_data = custom_teams.slice(nf, nf + numBars);
            console.log(new_data);
            new_tags = tags_custom_teams.slice(nf, nf + numBars);
            xscale.domain(new_data.map(function (d) { return d.TeamName; }));
            yscale = d3.scaleLinear()
                .domain([0, d3.max(custom_teams, function (d) { return d.TournamentsWon; })])
                .range([barChartHeight, 0]);
            xAxis  = d3.axisBottom().scale(xscale).tickFormat(function(d,i){ return new_tags[i] });
            yAxis  = d3.axisLeft().scale(yscale).tickFormat(d3.format("$.2s"));
            diagram.select(".x.axis").call(xAxis);
            diagram.select(".y.axis").call(yAxis);
            rects = bars.selectAll("rect")
                .data(new_data, function (d) {return d.TeamName; });

            rects.attr("x", function (d) { return xscale(d.TeamName); });
            rects.enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) { 
                    console.log(xscale(d.TeamName));
                    return xscale(d.TeamName); 
                })
                .attr("y", function (d) {
                    console.log(xscale.bandwidth()); 
                    return yscale(d.TournamentsWon); })
                .attr("width", xscale.bandwidth())
                .attr("height", function (d) { return barChartHeight - yscale(d.TournamentsWon); });

            d3.selectAll(".x.axis").selectAll("text").append("title")
                .data(new_data)
                .text(function(d) { return d.TeamName;});  
            rects.exit().remove();        
        }
        else{
            if(teams_selected){
                new_data = teams_sorted.slice(nf, nf + numBars);
                new_tags = tags_teams.slice(nf, nf + numBars);
                xscale.domain(new_data.map(function (d) { return d.TeamName; }));
                xAxis  = d3.axisBottom().scale(xscale).tickFormat(function(d,i){ return new_tags[i] });
    
                diagram.select(".x.axis").call(xAxis);
    
                rects = bars.selectAll("rect")
                    .data(new_data, function (d) {return d.TeamName; });
    
                rects.attr("x", function (d) { return xscale(d.TeamName); });
                
                if(quantity){
                    rects.enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", function (d) { return xscale(d.TeamName); })
                    .attr("y", function (d) { return yscale(d.TotalTournaments); })
                    .attr("width", xscale.bandwidth())
                    .attr("height", function (d) { return barChartHeight - yscale(d.TotalTournaments); });
                }
                else{
                    rects.enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", function (d) { return xscale(d.TeamName); })
                    .attr("y", function (d) { return yscale(d.TotalUSDPrize); })
                    .attr("width", xscale.bandwidth())
                    .attr("height", function (d) { return barChartHeight - yscale(d.TotalUSDPrize); });
                }
                d3.selectAll(".x.axis").selectAll("text").append("title")
                    .data(new_data)
                    .text(function(d) { return d.TeamName;});
            }else{
                new_data = games_sorted.slice(nf, nf + numBars);
                new_tags = tags_games.slice(nf, nf + numBars);
                xscale.domain(new_data.map(function (d) { return d.gameName; }));
    
                xAxis  = d3.axisBottom().scale(xscale).tickFormat(function(d,i){ return new_tags[i] });
    
                diagram.select(".x.axis").call(xAxis);
    
                rects = bars.selectAll("rect")
                    .data(new_data, function (d) {return d.gameName; });
    
                rects.attr("x", function (d) { return xscale(d.gameName); });
                
                if(quantity){
                    rects.enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", function (d) { return xscale(d.gameName); })
                    .attr("y", function (d) { return yscale(d.totalTournaments); })
                    .attr("width", xscale.bandwidth())
                    .attr("height", function (d) { return barChartHeight - yscale(d.totalTournaments); });
                }
                else{
                    rects.enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", function (d) { return xscale(d.gameName); })
                    .attr("y", function (d) { return yscale(d.totalUSDPrize); })
                    .attr("width", xscale.bandwidth())
                    .attr("height", function (d) { return barChartHeight - yscale(d.totalUSDPrize); });
                }
                d3.selectAll(".x.axis").selectAll("text").append("title")
                    .data(new_data)
                    .text(function(d) { return d.gameName;});               
            }

            rects.exit().remove();
        }
    };
}

function handleCheckBox(object){
    let c1 = document.getElementById("check1");
    let c2 = document.getElementById("check2");
    let c3 = document.getElementById("check3");
    let c4 = document.getElementById("check4");
    let c5 = document.getElementById("check5");
    if( c1 == object){
        c1.checked = true;
        c2.checked = false;
        c3.checked = false;
        c4.checked = false;
        c5.checked = false;
        document.getElementsByClassName("chart-submenu")[0].style.display = "none";
    }else if( c2 == object){
        c1.checked = false;
        c2.checked = true;
        c5.checked = false;
        if(last_changed == 4){
            c3.checked = false;
            c4.checked = true;  
        }else if(last_changed == 5){
            //DO NOTHING
        }
        else{
            c3.checked = true;
            c4.checked = false; 
        }
        document.getElementsByClassName("chart-submenu")[0].style.display = "block";
    }else if( c3 == object){
        if(c2.checked){
            c2.checked = true;
            c5.checked = false;
        }else if(c5.checked){
            c2.checked = false;
            c5.checked = true;
        }
        c1.checked = false;
        c3.checked = true;
        c4.checked = false;
    }else if(c4 == object){
        if(c2.checked){
            c2.checked = true;
            c5.checked = false;
        }else if(c5.checked){
            c2.checked = false;
            c5.checked = true;
        }
        c1.checked = false;
        c3.checked = false;
        c4.checked = true;
    }else{
        c1.checked = false;
        c2.checked = false;
        c5.checked = true;
        if(last_changed == 4){
            c3.checked = false;
            c4.checked = true;  
        }else if(last_changed == 3){
            //DO NOTHING
        }
        else{
            c3.checked = true;
            c4.checked = false; 
        }
        document.getElementsByClassName("chart-submenu")[0].style.display = "block";        
    }
}

function handleResetCheckBox(type){
    console.log("Cheguei aqui->",type);

    let c1 = document.getElementById("check1");
    let c2 = document.getElementById("check2");
    let c3 = document.getElementById("check3");
    let c4 = document.getElementById("check4");
    let c5 = document.getElementById("check5");

    if(type == 0){
        //document.getElementById("resetButton").style.display = "none";
        document.getElementsByClassName("chart-submenu")[0].style.display = "none";   
        c1.disabled = false;
        c2.disabled = false;
        c3.disabled = false;
        c4.disabled = false;
        c5.disabled = false;
        c1.checked = true;
        c2.checked = false;
        c3.checked = false;
        c4.checked = false;
        c5.checked = false;
    }else if(type == 1){
        //document.getElementById("resetButton").style.display = "block";
        document.getElementsByClassName("chart-submenu")[0].style.display = "block"; 
        c1.disabled = true;
        c2.disabled = true;
        c3.disabled = true;
        c4.disabled = true;
        c5.disabled = true;
        c1.checked = false;
        c2.checked = true;
        c3.checked = false;
        c4.checked = true;
        c5.checked = false;
    }
    document.getElementById("reset").checked = true;
}

function createTag(name){
    let result = "";
    if(name.trim().indexOf(' ') != -1){
        let words = name.split(" ");
        for (let i = 0; i < words.length; i++) {
            result += words[i].charAt(0).toUpperCase()
        }
    }else{
        result += name.substring(0,3).toUpperCase();
    }
    return result;
}