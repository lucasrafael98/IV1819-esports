let full_dataset;
times = d3.range(24);
d3.json("data/tourn_mmyyyy.json").then(function (data) {
    data.data.forEach(element => {
        element.tournaments = +element.tournaments;
        element.startMonth = +element.startMonth;
        element.startYear = +element.startYear;
    });
    full_dataset = data.data;
    gen_heatmap();
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
        .domain([1, d3.max(full_dataset, function(d) {return d.tournaments; })/2, d3.max(full_dataset, function(d) {return d.tournaments; })])
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
        .data(full_dataset)
        .enter().append("rect")
        .attr("x", function(d) { return (d.startMonth) * gridSize; })
        .attr("y", function(d) { return (d.startYear - 1999) * gridSize / 2; })
        .attr("width", gridSize)
        .attr("height", gridSize / 2)
        .style("stroke", "black")
        .style("stroke-opacity", 0.6)
        .style("fill", function(d) { 
            if(d.tournaments === 0) return "#848484";
            else return colorScale(d.tournaments); });
}