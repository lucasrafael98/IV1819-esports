let full_dataset;
times = d3.range(24);
d3.json("../tourn_mmyyyy.json").then(function (data) {
    data.data.forEach(element => {
        element.tournaments = +element.tournaments;
        element.startMonth = +element.startMonth;
        element.startYear = +element.startYear;
    });
    full_dataset = data.data;
    gen_vis();
});

function gen_vis(){
    let margin = {
        top: 0,
        right: 25,
        bottom: 70,
        left: 25
    };
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dec"];
    let years = d3.range(2000,2018);

    let width = Math.max(Math.min(window.innerWidth, 1000), 500) - margin.left - margin.right - 20;
	let gridSize = Math.floor(width / months.length);
	let height = (gridSize) * (years.length) / 2;

    let svg = d3.select('#the_heatmap')
	.append("svg")
	.attr("width", width + margin.left + margin.right + 100)
	.attr("height", height + margin.top + margin.bottom + gridSize)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let colorScale = d3.scaleLinear()
	.domain([0, d3.max(full_dataset, function(d) {return d.tournaments; })/2, d3.max(full_dataset, function(d) {return d.tournaments; })])
	.range(["#FFFFDD", "#3E9583", "#1F2D86"])

    let monthLabels = svg.selectAll(".monthLabel")
    .data(months)
    .enter()
    .append("text")
    .text(function(d) { return d; })
    .attr("x", function(d, i) { return i * gridSize; })
    .attr("y", 0)
    .style("text-anchor", "middle")
    .attr("transform", "translate(115," + (height + gridSize)  + ")")

    let yearLabels = svg.selectAll(".yearLabel")
    .data(years)
    .enter()
    .append("text")
    .text(function(d) { return d; })
    .attr("x", 0)
    .attr("y", function(d, i) { return i * gridSize /2; })
    .style("text-anchor", "end")
    .attr("transform", "translate(" + gridSize / 2 + ", 57.5)");

    let heatMap = svg.selectAll(".hour")
    .data(full_dataset)
    .enter().append("rect")
    .attr("x", function(d) { return (d.startMonth) * gridSize; })
    .attr("y", function(d) { return (d.startYear - 1999) * gridSize / 2; })
    .attr("width", gridSize)
    .attr("height", gridSize / 2)
    .style("stroke", "black")
    .style("stroke-opacity", 0.6)
    .style("fill", function(d) { return colorScale(d.tournaments); });
}