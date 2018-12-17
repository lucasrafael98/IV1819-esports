let teams_sorted, earningsByAge, games_sorted;
let quantity = false;
let age_selected = true;
let isReset = false;
let teams_selected;
let last_changed = 1;
let last_custom_changed = 1;
let tags_teams = [];
let tags_games = [];
let xscale, yscale, xAxis, yAxis, svg, diagram, xOverview, yOverview, previousDataSet,bars,displayed;
let currCountry;
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
  
    xscale = d3.scaleBand()
        .domain(earningsByAge.slice(0,numBars).map(function (d) { return d.age; }))
        .rangeRound([0, barChartWidth]).paddingInner([0.5]);

    yscale = d3.scalePow().exponent(0.4)
        .domain([0, d3.max(earningsByAge, function (d) { return d.earnings; })])
        .range([barChartHeight, 0]);
  
    xAxis  = d3.axisBottom().scale(xscale);
    yAxis  = d3.axisLeft().scale(yscale).tickFormat(d3.format("$.2s")).ticks(5);
  
    svg = d3.select("#barchart").append("svg")
        .attr("width", barChartWidth + margin.left + margin.right)
        .attr("height", barChartHeight + margin.top + margin.bottom + selectorHeight + scrollBarGap);
  
    diagram = svg.append("g")
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
        .text("Earnings (Worldwide)");
  
    bars = diagram.append("g").attr("class", "main-bars");
  
    bars.selectAll("rect")
        .data(earningsByAge.slice(0, numBars), function (d) {return d.age; })
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return xscale(d.age); })
        .attr("y", function (d) { return yscale(d.earnings); })
        .attr("width", xscale.bandwidth())
        .attr("height", function (d) { return barChartHeight - yscale(d.earnings); });


    d3.select("#check1").on("change",function(){
        if(last_changed == 1){return;}

        updateBars(earningsByAge,"age","earnings",0.5,0.1);
        
        d3.select(".bchart-x-text").text("Age");
        d3.select(".bchart-y-text").text("Earnings (Worldwide)");
        last_changed = 1;
        age_selected = true;
    });
    d3.select("#check2").on("change",function(){
        if(last_changed != 1 && (teams_selected && last_changed == 3 || teams_selected && last_changed == 4)){return;}
        if(document.getElementById("check3").checked){
            updateBars(teams_sorted,"TeamName","TotalUSDPrize");
            d3.selectAll(".x.axis").selectAll(".tick").select("text").append("title")
                .data(teams_sorted)
                .text(function(d) { return d.TeamName; });
            
            d3.select(".bchart-x-text").text("Team");
            d3.select(".bchart-y-text").text("Earnings");
            last_changed = 3;
            quantity = false;
        }else{
            updateBars(teams_sorted,"TeamName","TotalTournaments");

            d3.selectAll(".x.axis").selectAll(".tick").select("text").append("title")
                .data(teams_sorted)
                .text(function(d) { return d.TeamName;});

            d3.select(".bchart-x-text").text("Team");
            d3.select(".bchart-y-text").text("Tournaments Won");
            last_changed = 4;
            quantity = true;
        }
        age_selected = false;
        teams_selected = true;
    });
    d3.select("#check3").on("change",function(){
        if(last_changed == 2 && teams_selected){return;}
        if(document.getElementById("check2").checked){
            updateBars(teams_sorted,"TeamName","TotalUSDPrize");

            d3.select(".bchart-x-text").text("Team");
            d3.select(".bchart-y-text").text("Earnings");
            teams_selected = true;
        }else{

            updateBars(games_sorted,"gameName","totalUSDPrize");

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

            updateBars(teams_sorted,"TeamName","TotalTournaments");

            d3.select(".bchart-x-text").text("Team");
            d3.select(".bchart-y-text").text("Tournaments Won");
            teams_selected = true;
        }else{

            updateBars(games_sorted,"gameName","totalTournaments");

            d3.select(".bchart-x-text").text("Game");
            d3.select(".bchart-y-text").text("Tournaments Played");        
            teams_selected = false;
        }
        quantity = true;
        last_changed = 4;
    });

    d3.select("#check5").on("change",function(){
        if(last_changed == 5 || (!teams_selected && last_changed == 3 || !teams_selected && last_changed == 4)){return;}
        
        if(document.getElementById("check3").checked){
            updateBars(games_sorted,"gameName","totalUSDPrize");
            
            d3.select(".bchart-x-text").text("Game");
            d3.select(".bchart-y-text").text("Prize Money");
            quantity = false;
        }else{   
            updateBars(games_sorted,"gameName","totalTournaments");
            
            d3.select(".bchart-x-text").text("Game");
            d3.select(".bchart-y-text").text("Tournaments Played");
            quantity = true;
        }
        d3.selectAll(".x.axis").selectAll(".tick").select("text").append("title")
            .data(games_sorted)
            .text(function(d) { return d.gameName;});
        
        last_changed = 5;
        teams_selected = false;
        age_selected = false;
    });

    d3.select("#custom-check").on("change",function(){
        if(last_custom_changed == 1) {return;}        
        if(document.getElementById("custom-check3").checked){
            updateBars(custom_teams_earnings,"TeamName","prizeSum");
            
            d3.select(".bchart-x-text").text("Team");
            d3.select(".bchart-y-text").text("Earnings");
        }else{   
            updateBars(custom_teams,"TeamName","TournamentsWon");
            
            d3.select(".bchart-x-text").text("Team");
            d3.select(".bchart-y-text").text("Tournaments Won");

        }
        d3.selectAll(".x.axis").selectAll(".tick").select("text").append("title")
            .data(custom_teams.slice(0,numBars))
            .text(function(d) { return d.TeamName;});
        
        last_custom_changed = 1;
    });

    d3.select("#custom-check2").on("change",function(){
        if(last_custom_changed == 2) {return;}
        if(document.getElementById("custom-check3").checked){
            updateBars(custom_games_earnings,"gameName","prizeSum");
            
            d3.select(".bchart-x-text").text("Game");
            d3.select(".bchart-y-text").text("Earnings");
        }else{   
            console.log("What", custom_games);
            updateBars(custom_games,"gameName","TournamentsPlayed");
            
            d3.select(".bchart-x-text").text("Game");
            d3.select(".bchart-y-text").text("Tournaments Played");

        }
        d3.selectAll(".x.axis").selectAll(".tick").select("text").append("title")
            .data(custom_games.slice(0,numBars))
            .text(function(d) { return d.gameName;});
        
        last_custom_changed = 2;
    });

    d3.select("#custom-check3").on("change",function(){
        if(last_custom_changed == 3) {return;} 
        if(document.getElementById("custom-check2").checked){
            updateBars(custom_games_earnings,"gameName","prizeSum");
            
            d3.select(".bchart-x-text").text("Game");
            d3.select(".bchart-y-text").text("Earnings");

            d3.selectAll(".x.axis").selectAll(".tick").select("text").append("title")
            .data(custom_games.slice(0,numBars))
            .text(function(d) { return d.gameName;});
        }else{   
            updateBars(custom_teams_earnings,"TeamName","prizeSum");
            
            d3.select(".bchart-x-text").text("Team");
            d3.select(".bchart-y-text").text("Earnings");

            d3.selectAll(".x.axis").selectAll(".tick").select("text").append("title")
            .data(custom_teams.slice(0,numBars))
            .text(function(d) { return d.TeamName;});
        }
        
        last_custom_changed = 3;
    });

    d3.select("#custom-check4").on("change",function(){
        if(last_custom_changed == 4) {return;} 
        if(document.getElementById("custom-check2").checked){
            updateBars(custom_games,"gameName","TournamentsPlayed");
            
            d3.select(".bchart-x-text").text("Game");
            d3.select(".bchart-y-text").text("Tournaments Won");

            d3.selectAll(".x.axis").selectAll(".tick").select("text").append("title")
            .data(custom_games.slice(0,numBars))
            .text(function(d) { return d.gameName;});
        }else{   
            updateBars(custom_teams,"TeamName","TournamentsWon");
            
            d3.select(".bchart-x-text").text("Team");
            d3.select(".bchart-y-text").text("Tournaments Won");

            d3.selectAll(".x.axis").selectAll(".tick").select("text").append("title")
            .data(custom_teams.slice(0,numBars))
            .text(function(d) { return d.TeamName;});
        }

        last_custom_changed = 4;
    });

    d3.select("#reset-bar-chart").on("click",function(){
        if(last_selected_country != null){
         d3.select(last_selected_country)
         .transition()
         .duration(400)
         .attr("fill", function (){
           // Set the color
           return selectedCountries[last_selected_country.__data__.id] ? "#009684" : (data.get(last_selected_country.__data__.id+choroMode) ? returnActualColorScale(data.get(last_selected_country.__data__.id+choroMode)) : "#969696");
         });
         last_selected_country = null;
       }

        custom_teams_selected = false;
        eba_country_selected = false;
        isReset = true;
        updateBars(earningsByAge,"age","earnings",0.5,0.1);
        isReset = false;
        
        d3.select(".bchart-x-text").text("Age");
        d3.select(".bchart-y-text").text("Earnings (Worldwide)");
        document.getElementById("reset-bar-chart").style.display = "none";
        handleResetCheckBox(0);
        document.getElementById("custom-chart-menu").style.display = "none";
        last_changed = 1;
        age_selected = true;
    });
    
if (isScrollDisplayed)
{
    xOverview = d3.scaleBand()
        .domain(earningsByAge.map(function (d) { return d.age; }))
        .rangeRound([0, barChartWidth]).paddingInner([0.5]);
    yOverview = d3.scalePow().exponent(0.1).range([heightOverview, 0]);
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
            return xOverview(d.age);
        })
        .attr("y", function(d) {
            return barChartHeight + heightOverview + yOverview(d.earnings)
        })
        displayed = d3.scaleQuantize()
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

        previousDataSet = earningsByAge;
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
        if(age_selected && !custom_teams_selected && !eba_country_selected){

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
        } else if (eba_country_selected){
            new_data = curCountryEBA.slice(nf, nf + numBars);
            xscale.domain(new_data.map(function (d) { return d.age; }));
            yscale = d3.scalePow().exponent(0.4)
                            .domain([0, d3.max(curCountryEBA, function (d) { return d.earnings; })])
                            .range([barChartHeight, 0]);
            xAxis  = d3.axisBottom().scale(xscale);
            yAxis  = d3.axisLeft().scale(yscale)
                            .tickFormat(d3.format("$.2s")).ticks(5);
            diagram.select(".x.axis").call(xAxis);
            diagram.select(".y.axis").call(yAxis);
            rects = bars.selectAll("rect")
                .data(new_data, function (d) {return d.age; });

            rects.attr("x", function (d) { return xscale(d.age); });
            rects.enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) { 
                    return xscale(d.age); 
                })
                .attr("y", function (d) {
                    return yscale(d.earnings); })
                .attr("width", xscale.bandwidth())
                .attr("height", function (d) { return barChartHeight - yscale(d.earnings); });

            d3.selectAll(".x.axis").selectAll(".tick").select("text").append("title")
                .data(new_data)
                .text(function(d) { return d.TeamName;});  
            rects.exit().remove();  
        } else if(custom_teams_selected){
            let tempArray,x,y,tags;
            if(document.getElementById("custom-check").checked && document.getElementById("custom-check3").checked){
                tempArray = custom_teams_earnings;
                x = "TeamName";
                y = "prizeSum";
                tags = tags_custom_teams;
                yscale = d3.scalePow().exponent(0.4)
                    .domain([0, d3.max(tempArray, function (d) { return d[y]; })])
                    .range([barChartHeight, 0]);
                yAxis  = d3.axisLeft().scale(yscale).tickFormat(d3.format("$.2s")).ticks(5);
            }else if(document.getElementById("custom-check").checked && document.getElementById("custom-check4").checked){
                tempArray = custom_teams;
                x = "TeamName";
                y = "TournamentsWon";
                tags = tags_custom_teams;
                yscale = d3.scaleLinear()
                    .domain([0, d3.max(tempArray, function (d) { return d[y]; })])
                    .range([barChartHeight, 0]);
                yAxis = d3.axisLeft().scale(yscale)
                    .tickFormat(d3.format("d"))
                    .ticks(d3.max(tempArray, function (d) { return d[y]; }));
            }else if(document.getElementById("custom-check2").checked && document.getElementById("custom-check3").checked){
                tempArray = custom_games_earnings;
                x = "gameName";
                y = "prizeSum";
                tags = tags_custom_games;
                yscale = d3.scalePow().exponent(0.4)
                    .domain([0, d3.max(tempArray, function (d) { return d[y]; })])
                    .range([barChartHeight, 0]);
                yAxis  = d3.axisLeft().scale(yscale).tickFormat(d3.format("$.2s")).ticks(5);
            }else if(document.getElementById("custom-check2").checked && document.getElementById("custom-check4").checked){
                tempArray = custom_games;
                x = "gameName";
                y = "TournamentsPlayed";
                tags = tags_custom_games;
                yscale = d3.scaleLinear()
                    .domain([0, d3.max(tempArray, function (d) { return d[y]; })])
                    .range([barChartHeight, 0]);
                yAxis = d3.axisLeft().scale(yscale)
                    .tickFormat(d3.format("d"))
                    .ticks(d3.max(tempArray, function (d) { return d[y]; })/10 + 1);
            }
            console.log(tempArray,x,y,tags);
            new_data = tempArray.slice(nf, nf + numBars);
            new_tags = tags.slice(nf, nf + numBars);
            xscale.domain(new_data.map(function (d) { return d[x]; }));

            xAxis  = d3.axisBottom().scale(xscale).tickFormat(function(d,i){ return new_tags[i] });

            diagram.select(".x.axis").call(xAxis);
            diagram.select(".y.axis").call(yAxis);
            rects = bars.selectAll("rect")
                .data(new_data, function (d) {return d[x]; });

            rects.attr("x", function (d) { return xscale(d[x]); });
            rects.enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) { 
                    return xscale(d[x]); 
                })
                .attr("y", function (d) {
                    return yscale(d[y]); })
                .attr("width", xscale.bandwidth())
                .attr("height", function (d) { return barChartHeight - yscale(d[y]); });

            d3.selectAll(".x.axis").selectAll(".tick").select("text").append("title")
                .data(new_data)
                .text(function(d) { return d[x];});  
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
                d3.selectAll(".x.axis").selectAll(".tick").select("text").append("title")
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
                d3.selectAll(".x.axis").selectAll(".tick").select("text").append("title")
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

function handleCustomCheckBox(object){
    let c1 = document.getElementById("custom-check");
    let c2 = document.getElementById("custom-check2");
    let c3 = document.getElementById("custom-check3");
    let c4 = document.getElementById("custom-check4");

    if( c1 == object){
        c1.checked = true;
        c2.checked = false;
    }else if( c2 == object){
        c1.checked = false;
        c2.checked = true;
    }else if( c3 == object){
        c3.checked = true;
        c4.checked = false;
    }else if(c4 == object){
        c3.checked = false;
        c4.checked = true;    
    }
}

function resetCustomBoxes(){
    document.getElementById("custom-check").checked = true;
    document.getElementById("custom-check2").checked = false;
    document.getElementById("custom-check3").checked = false;
    document.getElementById("custom-check4").checked = true;
    last_custom_changed = 1;
}

function handleResetCheckBox(type){
    let c1 = document.getElementById("check1");
    let c2 = document.getElementById("check2");
    let c3 = document.getElementById("check3");
    let c4 = document.getElementById("check4");
    let c5 = document.getElementById("check5");

    if(type == 0){
        document.getElementById("default-chart-menu").style.display = "block";
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
        document.getElementById("default-chart-menu").style.display = "none";
        document.getElementById("custom-chart-menu").style.display = "block";
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

function updateBars(data,x,y,padI=0.15,exp=0.15){
    
    xscale = d3.scaleBand()
        .domain(data.slice(0,numBars).map(function (d) { return d[x]; }))
        .rangeRound([0, barChartWidth]).paddingInner([0.5]);
    if(custom_teams_selected && document.getElementById("custom-check4").checked){
        yscale = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) { return d[y]; })])
            .range([barChartHeight, 0]);
    }else{
        yscale = d3.scalePow().exponent(0.4)
            .domain([0, d3.max(data, function (d) { return d[y]; })])
            .range([barChartHeight, 0]);
    }
    if(x == "age"){
        xAxis  = d3.axisBottom().scale(xscale);
    }else if(x == "TeamName"){
        if(custom_teams_selected){
            xAxis = d3.axisBottom().scale(xscale).tickFormat(function(d,i){return tags_custom_teams[i] });
        }else{
            xAxis = d3.axisBottom().scale(xscale).tickFormat(function(d,i){return tags_teams[i] });
        }
    }else if(x == "gameName"){
        if(custom_teams_selected){
            xAxis = d3.axisBottom().scale(xscale).tickFormat(function(d,i){return tags_custom_games[i] });
        }else{
            xAxis = d3.axisBottom().scale(xscale).tickFormat(function(d,i){return tags_games[i] });
        }
    }

    if(custom_teams_selected && document.getElementById("custom-check4").checked){
        if(document.getElementById("custom-check").checked){
            yAxis  = d3.axisLeft().scale(yscale)
            .tickFormat(d3.format("d"))
            .ticks(d3.max(custom_teams, function (d) { return d.TournamentsWon; }));
        }else{
            yAxis  = d3.axisLeft().scale(yscale)
            .tickFormat(d3.format("d"))
            .ticks(d3.max(custom_games, function (d) { return d.TournamentsPlayed; })/10 + 1);
        }
    }else{
        yAxis  = d3.axisLeft().scale(yscale).tickFormat(d3.format("$.2s")).ticks(5);
    }

    d3.selectAll(".x.axis").call(xAxis);
    d3.selectAll(".y.axis").call(yAxis);

    rects = bars.selectAll("rect").data(data.slice(0,numBars));
    rects.exit().remove();
    rects.transition()
        .duration(1000)
        .attr("y", function (d) { return yscale(d[y]); })
        .attr("height", function (d) { return barChartHeight - yscale(d[y]); })
        .attr("x", function (d) { return xscale(d[x]); })
        .attr("width", function (d) { return xscale.bandwidth(); });

    if((custom_teams_selected || isReset) && rects.enter()._groups[0].length > rects.exit()._groups[0].length){
        rects.enter().append("rect")
            .transition()
            .duration(1000)
            .attr("class", "bar")
            .attr("y", function (d) { return yscale(d[y]); })
            .attr("height", function (d) { return barChartHeight - yscale(d[y]); })
            .attr("x", function (d) { return xscale(d[x]); })
            .attr("width", function (d) { return xscale.bandwidth(); });
    }

    displayed = d3.scaleQuantize()
        .domain([0, barChartWidth])
        .range(d3.range(data.length));

    d3.select(".mover")
        .attr("width", Math.round(parseFloat(numBars * barChartWidth)/data.length))
        .attr("x",0);

    xOverview = d3.scaleBand()
        .domain(data.map(function (d) {
            return d[x]; }))
        .range([0, barChartWidth]).paddingInner([padI]);
    yOverview = d3.scalePow().exponent(exp).range([heightOverview, 0]);
    yOverview.domain(yscale.domain());
    subBars = diagram.select("#bchart-scroll").selectAll('.subBar').data(data);
    subBars.exit().remove();
    subBars
        .transition()
        .duration(1000)
        .attr("x", function(d) { return xOverview(d[x]);})
        .attr("y", function(d) { return barChartHeight + heightOverview + yOverview(d[y]);})
        .attr("width", function(d) { return xOverview.bandwidth();})
        .attr("height", function(d) { return heightOverview - yOverview(d[y]);});
    if(subBars.enter()._groups[0].length > subBars.exit()._groups[0].length){
        subBars.enter().append("rect")
        .classed('subBar', true)
        .transition()
        .duration(1000)
        .attr("height", function(d) {
            return heightOverview - yOverview(d[y]);
        })
        .attr("width", function(d) {
            return xOverview.bandwidth();
        })
        .attr("x", function(d) {
            return xOverview(d[x]);
        })
        .attr("y", function(d) {
            return barChartHeight + heightOverview + yOverview(d[y]);
        })
    }
}