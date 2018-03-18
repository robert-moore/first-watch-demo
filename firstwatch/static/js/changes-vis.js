function drawChangesVis(data, selection, hospital) {
    console.log("changes data", data)

    var flattenedData = Object.keys(data).reduce(function(completeList, timeFrame) {
        timeFrameList = Object.keys(data[timeFrame]).reduce(function(subList, facilityClass) {
            subList.push({ facility: facilityClass, timeFrame: timeFrame, value: data[timeFrame][facilityClass] })
            return subList
        }, [])
        return completeList.concat(timeFrameList)
    }, [])

    console.log("formattedData", flattenedData)

    var groupedByFacility = _.groupBy(flattenedData, "facility")

    console.log("groupedByFacility", groupedByFacility)

    

    var margin = { top: 20, bottom: 20, left: 30, right: 30}
    var height = 300    
    var width = screenWidth / 2 - margin.right - margin.left

    selection.style("max-width", screenWidth / 2 + "px")
        .style("float", "left")
        .append("canvas")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "changes-canvas")

    var ctx = document.getElementById("changes-canvas").getContext('2d');
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    var myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Last Year", "Last Month", "Last Week"],
            datasets: [
            {
                label: hospital,
                backgroundColor: "rgb(255, 99, 132)",
                data: groupedByFacility["ref"].map(function(d){ return d.value.toFixed(1) }),
            },
            {
                label: "All Other Facilities",
                backgroundColor: "rgb(200, 200, 200)",
                data: groupedByFacility["others"].map(function(d){ return d.value.toFixed(1) }),
            },
        ],
    },
    options: {
        title: {
            display: true,
            text: '% Change in Transfers > 20 Minutes'
        },
        scales: {
          yAxes: [{
            scaleLabel: {
                labelString: "% Change",
                display: true
            },
            stacked: false,
            gridLines: {
              display: true,
              color: "rgba(200,200,200,0.2)"
            }
          }],
          xAxes: [{
            gridLines: {
              display: false
            }
          }],
          
        }
      }
    })
}