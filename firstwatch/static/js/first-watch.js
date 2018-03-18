var dateParse = d3.timeParse("%Y-%m-%d %H:%M:%S")

var screenWidth = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;

var defaultWidth = 2000

// needed because of background hospital image
var scaleFactor = screenWidth / defaultWidth


d3.select("#in-county-hospitals")
    .selectAll("option")
    .data(inCountyHospitals)
    .enter()
    .append("option")
    .attr("value", function(d) { return d })
    .property("selected", function(d){ return d === hospital; })
    .text( function(d) { return d })

d3.select("#out-of-county-hospitals")
    .selectAll("option")
    .data(outOfCountyHospitals)
    .enter()
    .append("option")
    .attr("value", function(d) { return d })
    .property("selected", function(d){ return d === hospital; })    
    .text( function(d) { return d })

d3.select("#replay-vis")
    .style("zoom", scaleFactor)
    .style("-moz-transform", "scale(" + scaleFactor + ")")


d3.select("#facility-selector")
    .on('change', setDateAndFacility)


var scatterVisData = []
for (var i = 0; i < scatterData.times.length; i++) {
    var point = {}
    point.time = dateParse(scatterData.times[i])
    point.minutesToTransfer = scatterData.transfer_times[i]
    scatterVisData.push(point)
}

drawEventVis(eventData, d3.select("#replay-vis"), hospital)
drawScatterVis(scatterVisData, d3.select("#scatter-vis"))
drawChangesVis(changesData, d3.select("#changes-vis"), hospital)
drawFractionsVis(fractionsData, d3.select("#fractions-vis"), hospital)

function setDateAndFacility() {
    // var selectedDate = d3.select('#date-selector').property('value'); 
    var selectedDate = "02-12-2018"
    var selectedFacility = d3.select('#facility-selector').property('value');
    window.location.href = '/hospital-data/' + selectedFacility + '/' + selectedDate 
}
