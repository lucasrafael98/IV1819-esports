let tourn_mmyy, tourn_team_mmyy, tourn_team_prize_mmyy, tourn_game_mmyyyy,tourn_game_usd_mmyyyy;
times = d3.range(24);
let laststyle = "";
let custom_teams,custom_teams_earnings,custom_games,custom_games_earnings;
let custom_teams_selected = false;
let tags_custom_teams = [];
let tags_custom_games = [];
let colorLegend = [0, 1, 10, 150, 300, 400, 500];
let months_ext = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "Novemeber", "December"]
let promises2 = [
    d3.json("data/tourn_mmyyyy.json").then(function (data) {
        data.data.forEach(element => {
            element.tournaments = +element.tournaments;
            element.startMonth = +element.startMonth;
            element.startYear = +element.startYear;
        });
        tourn_mmyy = data.data;
    }),
    
    d3.json("data/tourn_team_mmyyyy.json").then(function (data) {
        data.TournsWonPerTeamYM.forEach(element => {
            element.TeamName = element.TeamName;
            element.TeamId = +element.TeamId;
            element.TournamentsWon = +element.TournamentsWon;
            element.startMonth = +element.startMonth;
            element.startYear = +element.startYear;
        });
        tourn_team_mmyy = data.TournsWonPerTeamYM;
    }),
    
    d3.json("data/tourn_team_prize_mmyyyy.json").then(function (data) {
        data.prizePerTeamYM.forEach(element => {
            element.TeamName = element.TeamName;
            element.TeamId = +element.TeamId;
            element.prizeSum = +element.prizeSum;
            element.startMonth = +element.startMonth;
            element.startYear = +element.startYear;
        });
        tourn_team_prize_mmyy = data.prizePerTeamYM;
    }),
    d3.json("data/new_tourn_game_mmyyyy.json").then(function (data) {
        data.data.forEach(element => {
            element.gameName = element.gameName;
            element.gameId = +element.gameId;
            element.TournamentsPlayed = +element.TournamentsPlayed;
            element.startMonth = +element.startMonth;
            element.startYear = +element.startYear;
        });
        tourn_game_mmyyyy = data.data;
    }),
    d3.json("data/new_tourn_game_usd_mmyyyy.json").then(function (data) {
        data.data.forEach(element => {
            element.gameName = element.gameName;
            element.gameId = +element.gameId;
            element.prizeSum = +element.prizeSum;
            element.startMonth = +element.startMonth;
            element.startYear = +element.startYear;
        });
        tourn_game_usd_mmyyyy = data.data;
    })
];

Promise.all(promises2).then(function(values){
    gen_heatmap();
});

function gen_heatmap(){

    let margin = {
        top: 0,
        right: 25,
        bottom: 70,
        left: 25
    };
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let years = d3.range(2000,2018);

    let width = window.innerWidth / 2.4;
	let gridSize = Math.floor(width / months.length * 0.7);
	let height = (gridSize) * (years.length) / 2.35;

    let svg = d3.select('#heatmap')
        .append("svg")
        .attr("width", width + margin.left + margin.right + 100)
        .attr("height", height + margin.top + margin.bottom + gridSize)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let colorScale = d3.scaleLog()
        .domain([1, d3.max(tourn_mmyy, function(d) {return d.tournaments; })/2, d3.max(tourn_mmyy, function(d) {return d.tournaments; })])
        .range(["#64827e", "#28638c", "#002a47"])

    let monthLabels = svg.selectAll(".monthLabel")
        .data(months)
        .enter()
        .append("text")
        .text(function(d) { return d; })
        .attr("x", function(d, i) { return (i-1.1) * gridSize; })
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("transform", "translate(115," + (height + 2.25 * gridSize)  + ")")

    let yearLabels = svg.selectAll(".yearLabel")
        .data(years)
        .enter()
        .append("text")
        .text(function(d) { return d; })
        .attr("x", 10)
        .attr("y", function(d, i) { return (i-0.9) * gridSize /2; })
        .style("text-anchor", "end")
        .attr("transform", "translate(" + gridSize / 2 + ", 57.5)");

    var defs = svg.append("svg:defs");

    let heatMap = svg.selectAll(".hour")
        .data(tourn_mmyy)
        .enter().append("rect")
        .attr("x", function(d) { return (d.startMonth) * gridSize; })
        .attr("y", function(d) { return (d.startYear - 1999) * gridSize / 2; })
        .attr("width", gridSize)
        .attr("height", gridSize / 2)
        .attr("class", "heatmap-block")
        .style("stroke", "black")
        .style("stroke-opacity", 0.6)
        .style("fill", function(d) { 
            if(d.tournaments === 0) return "#848484";
            else return colorScale(d.tournaments); });

    var hml = d3.select('#heatmap').select("svg").append("g")
        .attr("class", "heatmap-legend")
        .attr("transform", "translate(" + width / 1.22 + ")")
        .selectAll("rect").data(colorELegend);

    var ls_w = 20, ls_h = 20;

    d3.select('#heatmap').select("svg")
        .selectAll(".heatmap-legend")
        .append("text")
        .attr("id", "heatmap-legend-stat")
        .attr("transform", "translate(-15, " + (height / 2) + ")")
        .text("Tournaments Played:");

    hml.data(colorLegend)
        .enter().append("rect")
        .attr("x", 20)
        .attr("y", function(d, i){ return height - (i*ls_h) - 2*ls_h;})
        .attr("width", ls_w)
        .attr("height", ls_h)
        .style("fill", function(d) { 
            if(d === 0) return "#848484";
            else return colorScale(d); });
                
    hml.data(colorLegend)
        .enter().append("text")
        .attr("class", "heatmap-legend-numbers")
        .attr("x", 50)
        .attr("y", function(d, i){ return height - (i*ls_h) - ls_h - 4;})
        .text(function(d){ return d; });

    svg.selectAll(".heatmap-block").on("click",function(){
        age_selected = false;
        let month = this.__data__.startMonth;
        let year = this.__data__.startYear;
        custom_teams = tourn_team_mmyy.filter(function(d){ return d.startMonth === month && d.startYear === year && d.TeamId !== -1; });
        custom_teams_earnings = tourn_team_prize_mmyy.filter(function(d){ return d.startMonth === month && d.startYear === year && d.TeamId !== -1; });
        custom_games = tourn_game_mmyyyy.filter(function(d){ return d.startMonth === month && d.startYear === year && d.gameId !== -1; });
        custom_games_earnings = tourn_game_usd_mmyyyy.filter(function(d){ return d.startMonth === month && d.startYear === year && d.gameId !== -1; });
        tags_custom_teams = [];
        tags_custom_games = [];
        for (let i = 0; i < custom_teams.length; i++) {
            tags_custom_teams.push(createTag(custom_teams[i].TeamName));
        }
        for (let i = 0; i < custom_games.length; i++) {
            tags_custom_games.push(createTag(custom_games[i].gameName));
        }
        if(custom_teams.length !== 0){
            document.getElementById("reset-bar-chart").style.display = "block";
            handleResetCheckBox(1);
            resetCustomBoxes();
            let diagram = d3.select("#superbchart").select("#barchart").select("svg").select("g");
            let bars = diagram.select(".main-bars");
            eba_country_selected = false;
            custom_teams_selected = true;
            xscale = d3.scaleBand()
                .domain(custom_teams.slice(0,numBars).map(function (d) { return d.TeamName; }))
                .rangeRound([0, barChartWidth]).paddingInner([0.5]);
            yscale = d3.scaleLinear()
                .domain([0, d3.max(custom_teams, function (d) { return d.TournamentsWon; })])
                .range([barChartHeight, 0]);
            xAxis  = d3.axisBottom().scale(xscale).tickFormat(function(d,i){ return tags_custom_teams[i] });
            yAxis  = d3.axisLeft().scale(yscale)
                        .tickFormat(d3.format("d"))
                        .ticks(d3.max(custom_teams, function (d) { return d.TournamentsWon; }));
            d3.selectAll(".x.axis").call(xAxis);
            d3.selectAll(".y.axis").call(yAxis);
            d3.selectAll(".x.axis").selectAll(".tick").select("text").append("title")
                .data(custom_teams.slice(0,numBars))
                .text(function(d) { return d.TeamName;});
            d3.select(".bchart-x-text").text("Team");
            d3.select(".bchart-y-text").text("Tournaments Won");
            xOverview = d3.scaleBand()
                .domain(custom_teams.map(function (d) { return d.TeamName; }))
                .rangeRound([0, barChartWidth]).paddingInner([0.5]);
            yOverview = d3.scaleLinear().range([heightOverview, 0]);
            yOverview.domain(yscale.domain());
            rects = bars.selectAll("rect").data(custom_teams.slice(0,numBars));
            rects.exit().remove();
            rects.transition()
                .duration(1000)
                .attr("y", function (d) { return yscale(d.TournamentsWon); })
                .attr("height", function (d) { return barChartHeight - yscale(d.TournamentsWon); })
                .attr("x", function (d) { return xscale(d.TeamName); })
                .attr("width", function (d) { return xscale.bandwidth(); });
            rects.data(custom_teams.slice(0,numBars)).enter().append("rect")
                .transition()
                .duration(1000)
                .attr("class", "bar")
                .attr("y", function (d) { return yscale(d.TournamentsWon); })
                .attr("height", function (d) { return barChartHeight - yscale(d.TournamentsWon); })
                .attr("x", function (d) { return xscale(d.TeamName); })
                .attr("width", function (d) { return xscale.bandwidth(); });
            subBars = diagram.select("#bchart-scroll").selectAll('.subBar').data(custom_teams);
            subBars.exit().remove();
            subBars.transition()
                .duration(1000)
                .attr("height", function(d) {return heightOverview - yOverview(d.TournamentsWon);})
                .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.TournamentsWon); })
                .attr("x", function(d) { return xOverview(d.TeamName);})
                .attr("width", function(d) { return xOverview.bandwidth();});
            subBars.data(custom_teams).enter().append("rect")
                .classed('subBar extra-subBar', true)
                .attr("height", function(d) {return heightOverview - yOverview(d.TournamentsWon);})
                .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.TournamentsWon); })
                .attr("x", function(d) { return xOverview(d.TeamName);})
                .attr("width", function(d) { return xOverview.bandwidth();});
                
            displayed = d3.scaleQuantize()
                .domain([0, barChartWidth])
                .range(d3.range(custom_teams.length));
            d3.select(".mover")
                .attr("width", Math.round(parseFloat(numBars * barChartWidth)/custom_teams.length))
                .attr("x", 0)
                .attr("y", 0);
            d3.selectAll(".main-bars").selectAll("rect").on("mousemove",function(d){
                addMouseOver(d,this);
            });
        
            d3.selectAll(".main-bars").selectAll("rect").on("mouseout",function(){
                $('.tooltip').css({
                    display: "none"
                });
            });
        }
    });
    svg.selectAll(".heatmap-block").on("mouseover",function(){
        laststyle =  d3.select(this).style("fill");
        d3.select(this).style("stroke-opacity", "1");
        d3.select(this).style("fill", "rgba(45, 101, 139,0.5)");
        d3.select(this).style("cursor", function(){
            let month = this.__data__.startMonth;
            let year = this.__data__.startYear;
            let custom_teamsTemp = tourn_team_mmyy.filter(function(d){ return d.startMonth === month && d.startYear === year && d.TeamId !== -1; });
            if(custom_teamsTemp.length !== 0) return "pointer";
            else return "not-allowed";
        });
    });

    svg.selectAll(".heatmap-block").on("mouseout",function(){

        d3.select(this).style("stroke-opacity", "0.6");
        d3.select(this).style("fill", laststyle);
        $('.tooltip').css({
            display: "none"
        });
    });

    svg.selectAll(".heatmap-block").data(tourn_mmyy).on("mousemove",function(d){
        let month = this.__data__.startMonth;
        let year = this.__data__.startYear;
        custom_teamsTemp = tourn_team_mmyy.filter(function(d){ return d.startMonth === month && d.startYear === year && d.TeamId !== -1; });
        var text;
        if(custom_teamsTemp.length !== 0){
            text = months_ext[d.startMonth - 1] + " of " + d.startYear + "<br>Tournaments Played: " + d.tournaments;
            $('.tooltip').html(text);
            $('.tooltip').css({
                display: "block",
                left: d3.mouse(this)[0] + 30 + $(window).width() * 0.482,
                top: d3.mouse(this)[1] + 30
            });
        }
        else{
            text = months_ext[d.startMonth - 1] + " of " + d.startYear + "<br>Tournaments Played: " +
                     d.tournaments + "<br>No extra data available for this month.";
            $('.tooltip').html(text);
            $('.tooltip').css({
                display: "block",
                left: d3.mouse(this)[0] + 30 + $(window).width() * 0.442,
                top: d3.mouse(this)[1] + 30
            });
        }
    });
}