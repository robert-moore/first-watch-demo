function handleFirstWatchData(raw) {
    var ret = {}
    var dateParse = d3.timeParse("%Y-%m-%d %H:%M:%S")
  
    var id = 0;
    _.forEach(raw, function(d) {
      if (+d3.timeDay.floor((dateParse(d["Avail Time"]))) !== +d3.timeDay.floor((dateParse(d["Depart Scene"])))) {
        d.toDelete = true
      } else {
        d.id = id++;
        d.dateTime = dateParse(d["Depart Scene"]);
        d.day = d3.timeDay.floor(d.dateTime);
        d.minuteOfDay = d3.timeMinute.count(d.day, d.dateTime);
        d.entryMinute = d.minuteOfDay;
        d.timeArrived = dateParse(d["At Hosp"])
  
        d.OverflowEntrance = d3.timeMinute.count(dateParse(d["Depart Scene"]), dateParse(d["At Hosp"]))
        d.SiteYard = d3.timeMinute.count(dateParse(d["At Hosp"]), dateParse(d["Transfer of Care Time"]))
        d.YardExit = d3.timeMinute.count(dateParse(d["Transfer of Care Time"]), dateParse(d["Avail Time"]))
  
        d.stageTimes = [+d.OverflowEntrance, +d.SiteYard, +d.YardExit];
        d.stageDates = [d.day, d.dateTime];
        var cumulativeMinutes = 0;
        _.forEach(d.stageTimes, function (m) {
          cumulativeMinutes += m;
          d.stageDates.push(d3.timeMinute.offset(d.dateTime, cumulativeMinutes));
        });
        d.totalTime = d3.sum(d.stageTimes);
        d.timeAtHospital = d.SiteYard
        d.exitMinute = d.minuteOfDay + d.totalTime;
        d.priority = +d["Pri"]
      }
    });
    _.remove(raw, function(d) {
      return d.toDelete
    });
    var trucksByDate = _.groupBy(raw, 'day');
    _.forEach(trucksByDate, function(trucks, date) {
      ret[date] = {
        "trucks": trucks,
        "date": d3.timeSecond.offset(new Date(date), 1),
        "maxTotalTime": d3.max(trucks, function(d) { return d.totalTime })
      };
      var minutes = [];
      for(var min = 0; min < 60*24; min++) {
        var obj = {
          "min": min,
          "enteringTrucks": 0,
          "exitingTrucks": 0,
          "palettesPresent": 0,
          "palettesPerMinute": 0,
          "trucksPerStage": [0, 0, 0],
          "expectedWaitingTime": 0,
          "trucks": []
        };
        minutes.push(obj);
      }
      _.forEach(trucks, function(truck) {
        minutes[truck.entryMinute].enteringTrucks++;
        if(truck.exitMinute < 24 * 60) {
          minutes[truck.exitMinute].exitingTrucks++;
        }
        for(var min = truck.entryMinute; min < truck.exitMinute && min < 24 * 60; min++) {
          minutes[min].trucks.push(truck);
          if(isNaN(truck.palettesPerMinute)) {
          } else {
            minutes[min].palettesPerMinute += truck.palettesPerMinute;
          }
          // finding the right stage and incrementing
          var stage = 0;
          var cumulativeTime = 0;
          var relativeMin = min - truck.entryMinute;
          while(relativeMin > cumulativeTime && stage < 2) {
            cumulativeTime += truck.stageTimes[stage];
            stage++;
          }
          minutes[min].trucksPerStage[stage]++;
        }
      });
  
      _.forEach(minutes, function(minuteObj, min) {
        if(minuteObj.trucks.length > 0) {
          minuteObj.expectedWaitingTime = _.reduce(minuteObj.trucks, function(acc, e) {
            return acc + e.timeAtHospital;
          }, 0) / minuteObj.trucks.length;
        } else {
          minuteObj.expectedWaitingTime = 0;
        }
  
      });
      ret[date].minuteData = minutes;
      ret[date].heatmapData = getHeatmapData(trucks);
    });
  
    return ret;
  
    // map each day to an array where each element
    // is an array where each element
    // represents the average time in stage i in hour block j
    function getHeatmapData(data) { // data for one day
      var stageHours = [0,3,6,9,12,15,18,21];
      var groupedByHours = _.groupBy(data, function(truck) {
        var hour = d3.timeHour.count(d3.timeDay(truck.dateTime), truck.dateTime);
        var stageHour = Math.floor(hour / 3) * 3;
        return stageHour;
      });
      var heatmap = _.map(stageHours, function(hour) {
        var hourTrucks = groupedByHours[hour];
        var cumulativeTimes =  _.reduce(hourTrucks, function(acc, truck) {
          return _.map(acc, function(stageTime, index) {
            return stageTime + truck.stageTimes[index];
          })
        }, [0, 0, 0]);
        return _.map(cumulativeTimes, function(d) {
          if(hourTrucks) {
            return d / (Math.max(1, hourTrucks.length));
          } else {
            return [0,0,0];
          }
        })
      });
      return heatmap;
    }
    return ret;
  }
  
  function handleData(raw) {
      var ret = {};
      var dateParse = d3.timeParse('%d/%m/%Y %H:%M');
      var id = 0;
      _.forEach(raw, function(d) {
  
          d.id = id++;
          d.dateTime = dateParse(d.Date + " " + d.Time);
          d.day = d3.timeDay.floor(d.dateTime);
          d.minuteOfDay = d3.timeMinute.count(d.day, d.dateTime);
          d.entryMinute = d.minuteOfDay;
          d.stageTimes = [+d.OverflowEntrance, +d.SiteYard, +d.YardExit];
          d.stageDates = [d.day, d.dateTime];
          var cumulativeMinutes = 0;
          _.forEach(d.stageTimes, function (m) {
              cumulativeMinutes += m;
              d.stageDates.push(d3.timeMinute.offset(d.dateTime, cumulativeMinutes));
          });
          d.totalTime = d3.sum(d.stageTimes);
          d.exitMinute = d.minuteOfDay + d.totalTime;
          d.quantityIssued = +d.quantity_issued;
          d.quantityDroppedOff = +(d.quantity.split("\/")[0]);
          d.totalQuantity = d.quantityIssued + d.quantityDroppedOff;
          d.palettesPerMinute = Math.min(20, d.totalQuantity / (d.totalTime || 1));
  
          if (d.quantityIssued > 0 && d.quantityDroppedOff > 0) {
              d.type = "Both"
          } else if (d.quantityIssued > 0) {
              d.type = "Issued"
          } else if (d.quantityDroppedOff > 0) {
              d.type = "Dropoff"
          } else {
              d.type = "Neither"
          }
          if (isNaN(d.totalQuantity)) {
              d.toDelete = true;
          }
      });
  
      _.remove(raw, function(d) {
          return d.toDelete
      });
  
      var trucksByDate = _.groupBy(raw, 'day');
  
      _.forEach(trucksByDate, function(trucks, date) {
          ret[date] = {
              "trucks": trucks,
              "date": d3.timeSecond.offset(new Date(date), 1),
              "maxTotalTime": d3.max(trucks, function(d) { return d.totalTime })
          };
          var minutes = [];
          for(var min = 0; min < 60*24; min++) {
              var obj = {
                  "min": min,
                  "enteringTrucks": 0,
                  "exitingTrucks": 0,
                  "palettesPresent": 0,
                  "palettesPerMinute": 0,
                  "trucksPerStage": [0, 0, 0],
                  "expectedWaitingTime": 0,
                  "trucks": []
              };
              minutes.push(obj);
          }
          _.forEach(trucks, function(truck) {
              minutes[truck.entryMinute].enteringTrucks++;
              if(truck.exitMinute < 24 * 60) {
                  minutes[truck.exitMinute].exitingTrucks++;
              }
              for(var min = truck.entryMinute; min < truck.exitMinute && min < 24 * 60; min++) {
                  minutes[min].trucks.push(truck);
                  if(isNaN(truck.palettesPerMinute)) {
                  } else {
                      minutes[min].palettesPerMinute += truck.palettesPerMinute;
                  }
                  // finding the right stage and incrementing
                  var stage = 0;
                  var cumulativeTime = 0;
                  var relativeMin = min - truck.entryMinute;
                  while(relativeMin > cumulativeTime && stage < 2) {
                      cumulativeTime += truck.stageTimes[stage];
                      stage++;
                  }
                  minutes[min].trucksPerStage[stage]++;
              }
          });
  
          _.forEach(minutes, function(minuteObj, min) {
              if(minuteObj.trucks.length > 0) {
                  minuteObj.expectedWaitingTime = _.reduce(minuteObj.trucks, function(acc, e) {
                          return acc + e.totalTime;
                      }, 0) / minuteObj.trucks.length;
              } else {
                  minuteObj.expectedWaitingTime = 0;
              }
  
          });
          ret[date].minuteData = minutes;
          ret[date].heatmapData = getHeatmapData(trucks);
      });
  
      return ret;
  
      // map each day to an array where each element
      // is an array where each element
      // represents the average time in stage i in hour block j
      function getHeatmapData(data) { // data for one day
          var stageHours = [0,3,6,9,12,15,18,21];
          var groupedByHours = _.groupBy(data, function(truck) {
              var hour = d3.timeHour.count(d3.timeDay(truck.dateTime), truck.dateTime);
              var stageHour = Math.floor(hour / 3) * 3;
              return stageHour;
          });
          var heatmap = _.map(stageHours, function(hour) {
              var hourTrucks = groupedByHours[hour];
              var cumulativeTimes =  _.reduce(hourTrucks, function(acc, truck) {
                  return _.map(acc, function(stageTime, index) {
                      return stageTime + truck.stageTimes[index];
                  })
              }, [0, 0, 0]);
              return _.map(cumulativeTimes, function(d) {
                  if(hourTrucks) {
                      return d / (Math.max(1, hourTrucks.length));
                  } else {
                      return [0,0,0];
                  }
              })
          });
          return heatmap;
      }
      return ret;
  }