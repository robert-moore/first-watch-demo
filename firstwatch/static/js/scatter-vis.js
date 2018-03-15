function drawScatterVis(data, selection) {
    console.log("scatter data", data)
    var margin = { top: 20, bottom: 40, left: 30, right: 30}
    var height = 400    
    var width = screenWidth - margin.right - margin.left

    var timeScale = d3.scaleTime()
        .domain(d3.extent(data.map(function(d) { return d.time })))
        .range([0, width])

    var yScale = d3.scaleLinear()
        .domain(d3.extent(data.map(function(d) { return d.minutesToTransfer })))
        .range([height, 0])

    // scatter vis
    var svg = selection
        .append("svg")
        .attr("width", screenWidth)
        .attr("height", height + margin.top + margin.bottom)

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    g.selectAll("circle.point")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return timeScale(d.time)})
        .attr("cy", function(d) { return yScale(d.minutesToTransfer)})
        .attr("r", 10)
        .attr("fill", function(d) {
            if (d.minutesToTransfer > 20 ) {
                return "crimson"
            } else {
                return "steelblue"
            }
        })
}