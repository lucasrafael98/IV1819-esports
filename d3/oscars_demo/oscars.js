var dataset, full_dataset;

d3.json("oscar_winners.json").then(function (data) {
    full_dataset = data;
    dataset = full_dataset.slice(0,35);
    gen_vis();
});

function gen_vis() {
    var padding=30;
    var w = 690 * 2;
    var h = 690;
    var bar_w = 15;
    var hscale = d3.scaleLinear()
        .domain([0,10])
        .range([h-padding,padding]);
    var xscale = d3.scaleLinear()
        .domain([0,dataset.length])
        .range([padding,w-padding]);
    var svg = d3.select("#the_chart");
    svg = svg.append("svg");
    svg = svg.attr("width",w);
    svg = svg.attr("height",h); 
    svg.selectAll("rect")
        .data(dataset)
        .enter().append("rect")
        .attr("width",Math.floor((w-padding*2)/dataset.length)-1)
        .attr("height",function(d) {
            return h-padding-hscale(d.rating);
        })
        .attr("fill","purple")
        .attr("x",function(d, i) {
            return xscale(i);
        })
        .attr("y",function(d) {
            return hscale(d.rating);
        });
    svg.selectAll("rect").append("title")
        .data(dataset)
        .text(function(d) { return d.title;});
    var yaxis = d3.axisLeft()
        .scale(hscale);
    svg.append("g")
        .attr("transform","translate(30,0)")
        .attr("class","y axis")
        .call(yaxis);
    var xaxis = d3.axisBottom()
        .scale(d3.scaleLinear()
        .domain([dataset[0].oscar_year,dataset[dataset.length-1].oscar_year])
        .range([padding+bar_w/2,w-padding-bar_w/2]))
        .tickFormat(d3.format("d"))
        .ticks(dataset.length/4);
    svg.append("g")
        .attr("transform","translate(0," + (h-padding) + ")")
        .call(xaxis);
    d3.selectAll("#old")
        .on("click", function() {
            dataset = full_dataset.slice(35,70);
            bar_w = Math.floor((w-padding*2)/dataset.length)-1;
            svg.selectAll("rect")
                .data(dataset)
                .transition()
                .duration(1000)
                .attr("height",function(d) {
                    return h-padding-hscale(d.rating);
                })
                .attr("fill","red")
                .attr("y",function(d) {
                    return hscale(d.rating);
                })
                .select("title")
                .text(function(d) { return d.title;});
            xaxis.scale(d3.scaleLinear()
                .domain([dataset[0].oscar_year,dataset[dataset.length-1].oscar_year])
                .range([padding+bar_w/2,w-padding-bar_w/2]));
            d3.select(".x.axis")
                .call(xaxis);
        })
}