function drawEventVis(data, selection, hospital) {
  var tickDateFormat = d3.timeFormat('%H:%M');
  console.log("event data", data)
  var averageTimeSelection = selection.select("#average-time-chart")
  var activeAmbulancesSelection = selection.select("#active-ambulances-chart")
  var flowChartCanvas = selection.select("#flow-chart-canvas")

  var defaultWidth = 2000
  var defaultHeight = 390
  var scaleFactor = screenWidth / defaultWidth

  selection
    .style("zoom", scaleFactor)
    .style("-moz-transform", "scale(" + scaleFactor + ")")

    var r = d3.scaleSqrt()
    .domain([0, 1000])
    .range([10, 40]);

    var foci = [
      {"name": "Initial", "x": -0.5, "y": 1, "display": "Initial"},
      {"name": "En Route", "x": 0.25, "y": 0.5, "display": "En Route"},
      {"name": "Transferring Care", "x": 0.5, "y": 0.4, "display": "Transferring Care"},
      {"name": "Preparing Exit", "x": 0.75, "y": 0.5, "display": "Exiting"},
      {"name": "Exit", "x": 2, "y": 0.2, "display": "exit"}
    ];

    var stageFlowChart = stageFlow()
      .width(defaultWidth)
      .height(defaultHeight)
      .foci(foci);

    flowChartCanvas
        .call(stageFlowChart);

    var timer

    // bar charts
    var averageTimeChart = barChart()
      .valueFormat(function (d) {
        return d.toFixed(1) + ' minutes avg.'
      })
      .width(defaultWidth - 100)
      .yLabel('Avg. Time Transferring Care')
    // .data(_.map(oneDayData.minuteData, 'expectedWaitingTime'));

    averageTimeSelection
      .call(averageTimeChart);

    var stackedStages = stackedBarChart()
      .valueFormat(function (d) {
        return d + ' active ' + (d == 1 ? 'ambulance' : 'ambulances') + ''
      })
      .width(defaultWidth - 100)
      .yLabel('# Active Ambulances')
    // .data(_.map(oneDayData.minuteData, 'trucksPerStage'));

    activeAmbulancesSelection
      .call(stackedStages);

    function timerUpdate(value) {
      var date = new Date(value);
      updateDate(date);
    }

    changeDateOrFacility()

    function changeDateOrFacility() {
      var dailyData = handleFirstWatchData(data);
      console.log("daily data", dailyData)
      var newData = dailyData[Object.keys(dailyData)[0]]
      console.log("new data", newData)

      if (!newData) {
        nodes = []
        var startDate = d3.timeDay.ceil(new Date(data[0]["At Hosp"]))
        var averageTimeData = []
        var stackedStagesData = []
      } else {
        nodes = newData.trucks;
        var startDate = newData.date
        var averageTimeData = _.map(newData.minuteData, 'expectedWaitingTime')
        var stackedStagesData = _.map(newData.minuteData, 'trucksPerStage')
      }

      if (timer) {
        timer.playing(false);
      }

      d3.select('#timer').select('svg').remove();
      d3.select('#timer').html('');
      timer = null;

      timer = brushTimer()
        .minValue(Number(startDate))
        .maxValue(Number(d3.timeDay.ceil(startDate)))
        .startingValue(Number(d3.timeMinute.offset(startDate, 5)))
        .stepValue(1000 * 20)
        .stepsPerSecond(30)
        .stepsPerCallback(1)
        .width(screenWidth)
        .accentColor('steelblue')
        .autoResize(false)
        .tickFormat(function (d) {
          return tickDateFormat(new Date(d))
        })
        .tickValues(d3.timeHour.every(3).range(startDate, d3.timeDay.ceil(startDate)).map(Number));

      d3.select('#timer')
        .call(timer);

      averageTimeChart.clearHighlightedInterval().data(averageTimeData);
      // ppm.clearHighlightedInterval().data(_.map(newData.minuteData, 'palettesPerMinute'));
      stackedStages.clearHighlightedInterval().data(stackedStagesData);
      stageFlowChart.title("").nodes([]);

      timer.updateCallback(timerUpdate);
    }


    function updateDate(date) {
      var minute = d3.timeMinute.count(d3.timeDay.floor(date), date);
      averageTimeChart.highlightInterval(minute);
      // ppm.highlightInterval(minute);
      stackedStages.highlightInterval(minute);
      var typeColors = ['#8546d4', '#4f6dd4', '#d44978', '#d8d8d8'];
      var typeColors = ['#5a26a4', '#3452ae', '#b10b48', '#d8d8d8'];
      var typeColorScale = d3.scaleOrdinal(typeColors)
        .domain(['Both', 'Issued', 'Dropoff', 'Neither']);
      var startColor = '#3F51B5';
      var endColor = '#D00234';
      var colorScale = d3.scaleLinear()
        .domain([0, 5])
        .range([startColor, endColor]);
      _.forEach(nodes, function (d) {
        d.stage = 0;
        var ind = 0;
        while (d.stageDates[ind] && date > d.stageDates[ind]) {
          ind++;
        }
        d.currentStageIndex = Math.max(0, ind - 1);
        d.fillColor = "steelblue"// colorScale(d.priority);
        d.use = "#blue-blue"
        d.strokeColor = 'white';
        d.strokeWidth = 0;
        d.minutesWaitingTotal = Math.max(0, Math.min(d.timeAtHospital, Number(date - d.timeArrived) / 1000 / 60));

        if (d.currentStageIndex == 0) { // not initiated
          d.waitingTime = 0;
          d.r = 1e-6;
        } else if (d.currentStageIndex == 4) { // exited
          d.waitingTime = Math.min(0, Number(date - d.stageDates[d.currentStageIndex]) / 1000 / 60);
          d.strokeColor = 'white';
          d.strokeWidth = 0;
          d.r = r(d.waitingTime);
        } else if (d.currentStageIndex == undefined) { // one of the stages
          d.waitingTime = Math.max(0, Number(date - d.stageDates[d.currentStageIndex]) / 1000 / 60);
          var amountLeft = d.totalQuantity - d.palettesPerMinute * d.waitingTime;
          d.r = r(amountLeft);
          if (d.minutesWaitingTotal > 20 && d.minutesWaitingTotal < 20) {
            d.strokeColor = '#ff880f';
            d.strokeWidth = 5;
          } else if (d.minutesWaitingTotal > 20) {
            d.strokeColor = '#ff0000';
            d.fillColor = '#ff0000';
            d.use = "#red-red"
            d.strokeWidth = 8;
          }
        } else { // regular stage
          d.waitingTime = Math.max(0, Number(date - d.stageDates[d.currentStageIndex]) / 1000 / 60);
          d.r = 80;
          if (d.minutesWaitingTotal > 20 && d.minutesWaitingTotal < 20) {
            d.strokeColor = '#ff880f';
            d.strokeWidth = 5;
          } else if (d.minutesWaitingTotal > 20) {
            d.strokeColor = '#ff0000';
            d.fillColor = '#ff0000';
            d.use = "#red-red"

            d.strokeWidth = 8;
          }
        }
        if (d.currentStageIndex == 3) {
          d.strokeWidth = 0;
        }
      });

      // remove the nodes which are in the last stage and waiting time is longer than 30 minutes
      var displayNodes = _.filter(nodes, function (d) {
        if (d.waitingTime > 30 && d.currentStageIndex >= 4 && false) {
          return false;
        }
        return true;
      });

      stageFlowChart.nodes(displayNodes);
      d3.select('#time').text(tickDateFormat(date));
    }

}