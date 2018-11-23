var countryStats;

d3.json("data/countries_stats.json").then(function (data) {
    countryStats = data.countries;
    gen_vis();
});

function gen_vis(){
    var padding = 30;
    var w = 700;
    var h = 700;
    var yscale = d3.scaleLinear()
        .domain([0,100])
        .range([h - padding, padding]);
    var xscale = d3.scaleLog()
        .domain([0.9,d3.max(countryStats, function(d) {
                return d.players;})])
        .range([padding,w-padding]);
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var svg = d3.select("#scatter");

    var seriesNames = d3.keys(countryStats[0])
    .filter(function(d) { return d === "urbanPopPercentage" || d === "unemploymentPercentage"; })
    .sort();

    // Map the data to an array of arrays of {x, y} tuples.
    var series = seriesNames.map(function(series) {
        return countryStats.map(function(d) {
        return {x: +d.players, y: +d[series], title: d.countryName};
        });
    });

    svg = svg.append("svg");
    svg = svg.attr("width",w);
    svg = svg.attr("height",h); 

    svg.selectAll(".series")
        .data(series)
        .enter()
        .append("g")
        .attr("fill", function(d, i) { return color(i); })
        .selectAll(".point")
        .data(function(d) { return d; })
        .enter().append("circle")
        .attr("cx",function(d) {
            return xscale(d.x);
        })
        .attr("cy",function(d) {
            return yscale(d.y);
        })
        .attr("r", 4.5)
        .append("title")
        .text(function(d) { return d.title;});
    
    
    var yaxis = d3.axisLeft()
        .scale(yscale);
    svg.append("g")
        .attr("transform","translate(" + padding + ",0)")
        .attr("class","scatter-y")
        .call(yaxis);
    var xaxis = d3.axisBottom()
        .scale(d3.scaleLog()
            .domain([0.9, d3.max(countryStats, function(d) {
                return d.players;})])
            .range([padding, w-padding]))
        .tickFormat(d3.format("d"))
        .ticks(d3.max(countryStats, function(d) {
            return d.players;}) / 1);
    svg.append("g")
        .attr("transform","translate(0," + (h-padding) + ")")
        .attr("class","scatter-x")
        .call(xaxis);
}