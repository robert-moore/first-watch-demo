function drawScatterVis(data, selection) {
    console.log("scatter data", data)
    var margin = { top: 20, bottom: 40, left: 50, right: 50}
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

        // Add the x Axis
  g.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(timeScale));

// text label for the x axis
g.append("text")             
  .attr("transform",
        "translate(" + (width/2) + " ," + 
                       (height + margin.top + 20) + ")")
  .style("text-anchor", "middle")
  .text("Date");

// Add the y Axis
g.append("g")
  .call(d3.axisLeft(yScale));

// text label for the y axis
g.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x",0 - (height / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("Value");      
}