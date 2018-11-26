let tourn_mmyy, tourn_team_mmyy, tourn_team_prize_mmyy;
times = d3.range(24);
let laststyle = "";
d3.json("data/tourn_mmyyyy.json").then(function (data) {
    data.data.forEach(element => {
        element.tournaments = +element.tournaments;
        element.startMonth = +element.startMonth;
        element.startYear = +element.startYear;
    });
    tourn_mmyy = data.data;
    gen_heatmap();
});

d3.json("data/tourn_team_mmyyyy.json").then(function (data) {
    data.TournsWonPerTeamYM.forEach(element => {
        element.TeamName = element.TeamName;
        element.TeamId = +element.TeamId;
        element.TournamentsWon = +element.TournamentsWon;
        element.startMonth = +element.startMonth;
        element.startYear = +element.startYear;
    });
    tourn_team_mmyy = data.TournsWonPerTeamYM;
});

d3.json("data/tourn_team_prize_mmyyyy.json").then(function (data) {
    data.prizePerTeamYM.forEach(element => {
        element.TeamName = element.TeamName;
        element.TeamId = +element.TeamId;
        element.prizeSum = +element.prizeSum;
        element.startMonth = +element.startMonth;
        element.startYear = +element.startYear;
    });
    tourn_team_prize_mmyy = data.prizePerTeamYM;
});

function gen_heatmap(){

    let margin = {
        top: 0,
        right: 25,
        bottom: 70,
        left: 25
    };
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dec"];
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
        .attr("x", function(d, i) { return (i-0.8) * gridSize; })
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("transform", "translate(115," + (height + 2.25 * gridSize)  + ")")

    let yearLabels = svg.selectAll(".yearLabel")
        .data(years)
        .enter()
        .append("text")
        .text(function(d) { return d; })
        .attr("x", 10)
        .attr("y", function(d, i) { return (i-0.6) * gridSize /2; })
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

    svg.selectAll(".heatmap-block").on("click",function(){
        let diagram = d3.select(".superbchart").select("#barchart").select("svg").select("g");
        let bars = diagram.select(".main-bars");
        let month = this.__data__.startMonth;
        let year = this.__data__.startYear;
        let mmyy_teams_won = tourn_team_mmyy.filter(function(d){ return d.startMonth === month && d.startYear === year && d.TeamId !== -1; });
        if(mmyy_teams_won.length !== 0){
            xscale = d3.scaleBand()
                .domain(mmyy_teams_won.slice(0,numBars).map(function (d) { return d.TeamName; }))
                .rangeRound([0, barChartWidth]).paddingInner([0.5]);
            yscale = d3.scaleLinear()
                .domain([0, d3.max(mmyy_teams_won, function (d) { return d.TournamentsWon; })])
                .range([barChartHeight, 0]);
            xAxis  = d3.axisBottom().scale(xscale).tickFormat(function(d,i){ return tags[i] });
            yAxis  = d3.axisLeft().scale(yscale);
            d3.selectAll(".x.axis").call(xAxis);
            d3.selectAll(".y.axis").call(yAxis);
            d3.selectAll(".x.axis").selectAll("text").append("title")
                .data(mmyy_teams_won)
                .text(function(d) { return d.TeamName;});
            xOverview = d3.scaleBand()
                .domain(mmyy_teams_won.map(function (d) { return d.TeamName; }))
                .rangeRound([0, barChartWidth]).paddingInner([0.5]);
            yOverview = d3.scaleLinear().range([heightOverview, 0]);
            yOverview.domain(yscale.domain());
            rects = bars.selectAll("rect").data(mmyy_teams_won)
                .transition()
                .duration(1000)
                .attr("y", function (d) { return yscale(d.TournamentsWon); })
                .attr("height", function (d) { return barChartHeight - yscale(d.TournamentsWon); })
                .attr("x", function (d) { return xscale(d.TeamName); })
                .attr("width", function (d) { return xscale.bandwidth(); });
            subBars = diagram.selectAll('.subBar');
            subBars.data(mmyy_teams_won)
                .transition()
                .duration(1000)
                .attr("height", function(d) {return heightOverview - yOverview(d.TournamentsWon);})
                .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.TournamentsWon); })
                .attr("x", function(d) { return xOverview(d.TeamName) - 84;})
                .attr("width", function(d) { return xOverview.bandwidth();});
            subBars.data(mmyy_teams_won).enter().append("rect")
                .classed('subBar extra-subBar', true)
                .attr("height", function(d) {return heightOverview - yOverview(d.TournamentsWon);})
                .attr("y", function (d) { return barChartHeight + heightOverview + yOverview(d.TournamentsWon); })
                .attr("x", function(d) { return xOverview(d.TeamName) - 84;})
                .attr("width", function(d) { return xOverview.bandwidth();});
            displayed = d3.scaleQuantize()
                .domain([0, barChartWidth])
                .range(d3.range(mmyy_teams_won.length));

            d3.select(".mover")
                .attr("width", Math.round(parseFloat(numBars * barChartWidth)/mmyy_teams_won.length))
                .attr("x", 0)
                .attr("y", 0);
        }
        else{
            alert("No teams found for this month. Sorry! (please fix me)");
        }
    });
    svg.selectAll(".heatmap-block").on("mouseover",function(){
        laststyle =  d3.select(this).style("fill");
        d3.select(this).style("stroke-opacity", "1");
        d3.select(this).style("fill", "rgba(45, 101, 139,0.5)");
        d3.select(this).style("cursor", "pointer");
    });

    svg.selectAll(".heatmap-block").on("mouseout",function(){

        d3.select(this).style("stroke-opacity", "0.6");
        d3.select(this).style("fill", laststyle);
    });
}