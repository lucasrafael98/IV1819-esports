let earnings_by_age, teams_sorted;
let teams_names = [];

let promises = [
    d3.json("../../earningsByAge_global.json").then(function (data) {
        data.earningsByAge.forEach(element => {
            element.earnings = +element.earnings;
            element.age = +element.age;
        });
        earnings_by_age = data.earningsByAge;
    }),
    d3.json("../../teams_sorted.json").then(function (data) {
        data.teams.forEach(element => {
            element.TeamId = +element.TeamId;
            teams_names.push(element.TeamName);
            element.TotalUSDPrize = +element.TotalUSDPrize;
            element.TotalTournaments = +element.TotalTournaments;
        });
        teams_sorted = data.teams;
    })
];

Promise.all(promises).then(function(values){
    gen_vis();
});

function gen_vis() {
    var padding=100;
    var w = 690 * 2;
    var h = 690;
    var bar_w = 30;
    var bar_p = 5;
    var hscale = d3.scaleLinear()
        .domain([0, 4e7])
        .range([h-padding,padding]);
    var xscale = d3.scaleLinear()
        .domain([0,earnings_by_age.length+2])
        .range([padding,w-padding]);
    var svg = d3.select("#the_chart");
    svg = svg.append("svg");
    svg = svg.attr("width",w);
    svg = svg.attr("height",h); 
    svg.selectAll("rect")
        .data(earnings_by_age)
        .enter().append("rect")
        .attr("width",Math.floor((w-padding*2)/earnings_by_age.length)-bar_p)
        .attr("height",function(d) {
            return h-padding-hscale(d.earnings);
        })
        .attr("fill","purple")
        .attr("x",function(d, i) {
            return xscale(i);
        })
        .attr("y",function(d) {
            return hscale(d.earnings);
        });
    var yaxis = d3.axisLeft()
        .scale(hscale);
    svg.append("g")
        .attr("transform","translate(100,0)")
        .attr("class","y axis")
        .call(yaxis);
    var xaxis = d3.axisBottom()
        .scale(d3.scaleLinear()
        .domain([d3.min(earnings_by_age, function(d) {return d.age; })-1,d3.max(earnings_by_age, function(d) {return d.age; })+1])
        .range([padding+bar_w/2+bar_p,w-padding-bar_w/2-bar_p]))
        .tickFormat(d3.format("d"))
        .ticks(earnings_by_age.length);
    svg.append("g")
        .attr("transform","translate(0," + (h-padding) + ")")
        .call(xaxis);
    d3.select("#check2")
        .on("change", function(){
            // var new_xscale = d3.scaleLinear()
            // .domain([0,teams_names.length])
            // .range([padding,w-padding]);
            // svg.selectAll("rect")
            //     .data(teams_sorted)
            //     .transition()
            //     .duration(1000)
            //     .attr("width",Math.floor((w-padding*2)/teams_names.length)-bar_p)
            //     .attr("height",function(d) {
            //         return h-padding-hscale(d.TotalUSDPrize);
            //     })
            //     .attr("fill","red")
            //     .attr("y",function(d) {
            //         return hscale(d.TotalUSDPrize);
            //     })
            //     .attr("x",function(d, i) {
            //         return new_xscale(i);
            //     });
            // xaxis.scale(d3.scaleLinear()
            //     .domain(teams_names)
            //     .range([padding+bar_w/2+bar_p,w-padding-bar_w/2-bar_p]))
            //     .tickFormat(d3.format("d"))
            //     .ticks(teams_sorted.length);
            // svg.append("g")
            //     .attr("transform","translate(0," + (h-padding) + ")")
            //     .call(xaxis);
        });
}

function handleCheckBox(object){
    let c1 = document.getElementById("check1");
    let c2 = document.getElementById("check2");
    let c3 = document.getElementById("check3");
    let c4 = document.getElementById("check4");
    if( c1 == object){
        c1.checked = true;
        c2.checked = false;
        c3.checked = false;
        c4.checked = false;
        document.getElementsByClassName("chart-submenu")[0].style.display = "none";
    }else if( c2 == object){
        c1.checked = false;
        c2.checked = true;
        c3.checked = true;
        c4.checked = false;
        document.getElementsByClassName("chart-submenu")[0].style.display = "block";
    }else if( c3 == object){
        c1.checked = false;
        c2.checked = true;
        c3.checked = true;
        c4.checked = false;
    }else{
        c1.checked = false;
        c2.checked = true;
        c3.checked = false;
        c4.checked = true;
    }
}