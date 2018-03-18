function drawFractionsVis(data, selection, hospital) {
    var margin = { top: 20, bottom: 20, left: 30, right: 30}
    var height = 300    
    var width = screenWidth / 2 - margin.right - margin.left

    selection.style("max-width", screenWidth / 2 + "px") 
        .style("float", "left")    
        .append("canvas")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "fractions-canvas")

    var ctx = document.getElementById("fractions-canvas").getContext('2d');

    var myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["This Week"],
            datasets: [
            {
                label: hospital,
                backgroundColor: "rgb(255, 99, 132)",
                data: [data["ref"].toFixed(2)],
            },
            {
                label: "All Other Facilities",
                backgroundColor: "rgb(200, 200, 200)",
                data: [data["others"].toFixed(2)],
            },
        ],
    },
    options: {
        title: {
            display: true,
            text: 'Fraction of Transfers < 20 Minutes'
        },
        scales: {
          yAxes: [{
            scaleLabel: {
                labelString: "Fraction of Transfers < 20 Minutes",
                display: true
            },
            ticks: {
                beginAtZero:true
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