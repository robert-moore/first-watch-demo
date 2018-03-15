// d3.select("select#hospital")
//     .on("change", function(d) {
//         const selectedHospital = d3.select(this).property("value")
//
//         d3.json("http://127.0.0.1:5000/hospital-data/" + selectedHospital + "/2018-02-12", function(err, json) {
//             console.log("success")
//             console.log(err)
//             console.log(json)
//         })
//         console.log(selectedHospital)
//     })


// changes chart

var changesSVG = d3.select("#changes")
    .append("svg")
    .attr("height", 400)
    .attr("width", 600)



// scatterplot


// fraction chart
