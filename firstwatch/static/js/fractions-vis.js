function drawFractionsVis(data, selection) {
    console.log("fractions data", data)
    var margin = { top: 20, bottom: 20, left: 30, right: 30}
    var height = 400    
    var width = screenWidth / 2 - margin.right - margin.left

    var svg = selection
        .append("svg")
        .attr("width", screenWidth)
        .attr("height", height - margin.top - margin.bottom)

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

}