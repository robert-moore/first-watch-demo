function stageFlow() {
    
      var width = 2000;
      var height = 1000;
      var margin = {top: 30, right: 20, bottom: 0, left: 20};
      var autoResize = false;
      var foci = [];
      var nodes = [];
      var title = ""
    
      var updateWidth;
      var updateNodes;
    
      function chart(selection) {
        selection.each(function () {
    
          var svg = d3.select(this)
            .attr("class", "chart-class")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
    
          var g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")");
    
          var x = d3.scaleLinear()
            .domain([0, 1])
            .range([0, width])
    
          var y = d3.scaleLinear()
            .domain([0, 1])
            .range([50, height])
    
          var r = d3.scaleSqrt()
            .domain([0, 240])
            .range([2, 20]);
    
    
          var forceCollide = d3.forceCollide()
            .strength(1)
            .radius(function (d) {
              return d.r
            })
            .iterations(1);
    
          var simulation = d3.forceSimulation()
            .alphaDecay(0.05)
            .force("charge", d3.forceManyBody().strength(-0.03))
            .force("x", d3.forceX(function (d) {
              return x(foci[d.currentStageIndex].x)
            }).strength(0.015))
            .force("y", d3.forceY(function (d) {
              return y(foci[d.currentStageIndex].y)
            }).strength(0.005))
            .force("collide", forceCollide)
            .nodes(nodes)
            .alphaTarget(1)
            .on("tick", ticked);
    
    
    
          var groupContainer = g.append('g').attr('class', 'group-container');
    
          _.forEach([], function (d) {
            if (d.name === "En Route" || d.name === "Preparing Exit") {
              groupContainer
                .append('rect')
                .attr("x", x(d.x) - 250)
                .attr("y", y(d.y) - 100)
                .attr("height", 200)
                .attr("width", 500)
                .attr('stroke', '#bbb')
                .attr('stroke-width', 0)
                .attr("fill", 'steelblue');
              groupContainer
                .append('rect')
                .attr("x", x(d.x) - 250)
                .attr("y", y(d.y) - 96)
                .attr("height", 192)
                .attr("width", 500)
                .attr('stroke', '#bbb')
                .attr('stroke-width', 0)
                .attr("fill", '#ffffff');
            }
    
            if (d.name === "Transferring Care") {
              groupContainer
                .append('circle')
                .attr("cx", x(d.x))
                .attr("cy", y(d.y))
                .attr("r", 115)
                .attr('stroke', "steelblue")
                .attr('stroke-width', 4)
                .attr("fill", '#ffffff');
              groupContainer
                .append('rect')
                .attr("x", x(d.x) - 125)
                .attr("y", y(d.y) - 70)
                .attr("height", 140)
                .attr("width", 250)
                .attr('stroke', '#bbb')
                .attr('stroke-width', 0)
                .attr("fill", '#ffffff');
    
              // if(d.name !== "Initial" && d.name !== "Exit") {
              //     groupContainer
              //         .append('circle')
              //         .attr("cx", x(d.x) )
              //         .attr("cy", y(d.y))
              //         .attr("r", 115)
              //         .attr('stroke', "steelblue")
              //         .attr('stroke-width', 4)
              //         .attr("fill", '#ffffff');
              // groupContainer
              //     .append('rect')
              //     .attr("x", x(d.x) - 125 )
              //     .attr("y", y(d.y) - 70)
              //     .attr("height", 140)
              //     .attr("width", 250)
              //     .attr('stroke', '#bbb')
              //     .attr('stroke-width', 0)
              //     .attr("fill", '#ffffff');
            }
          });
    
          var facilityTitle = g.append('g').attr('class', 'label-group').selectAll('text')
            .data(foci.filter(function(d) { return d.name === "Transferring Care"}))
            .enter()
            .append('text')
            .attr("x", function (d) {
              return x(d.x) - 10
            })
            .attr("y", function (d) {
              return -5
            })
            .attr("fill", '#888888')
            .attr('font-size', '30')
            .style("text-transform", "uppercase")
            .attr("text-anchor", "middle")
            // .attr("dy", "0.35em")
            .text(title);
    
          // var containers = g.append('g').attr('class', 'group-container').selectAll('circle')
          //     .data(foci)
          //     .enter()
          //     .append('circle')
          //     .attr("cx", function(d) { return x(d.x)} )
          //     .attr("cy", function(d) { return y(d.y)})
          //     .attr("r", function(d) { return 100 })
          //     .attr("fill", '#ddd');
    
          var node = g.append('g').attr('class', 'node-group').selectAll(".node");
    
          restart();
    
          function ticked() {
            node.attr("transform", function(d) {
              if (d.y > height / 2.2) {
                d.y = (height / 2.2) - (d.y - height / 2.2)*2
              }
              d.y = Math.min(d.y, height / 2)
              return "translate(" + d.x + "," + d.y + ")"
            })
          }
    
          function restart() {
            facilityTitle.text(title)
            nodes.forEach(function(node) {
              if (node.y === undefined) {
                node.y = height
              }
            })
    
            node = node.data(nodes, function (d) {
              return d.id;
            });
    
            node.select("use")
              .attr("xlink:href", function(d) { return d.use})
    
    
            node.select("circle").transition().duration(100)
              .attr("r", function (d) {
                return d.r;
              })
              .attr('fill', function (d) {
                return d.fillColor
              })
              .attr("stroke", function (d) {
                return d.strokeColor
              })
              .attr("stroke-width", function (d) {
                return d.strokeWidth
              })
    
    
            node.exit().remove();
    
            var nodeEnter = node.enter().append("g")
              .attr("class", "node")
              .attr("transform", "translate(40," + height/2 + ")")
    
            nodeEnter.append("use")
              .attr("xlink:href", function(d) { return d.use})
            //
            // nodeEnter.append("circle")
            //   .attr("stroke", "#333")
            //   .attr("r", function (d) {
            //     return d.r;
            //   })
            //   .attr("fill", function (d) {
            //     return "white"
            //   })
            //   .attr("stroke", function (d) {
            //     return "white"
            //   })
            //   .attr("stroke-width", 0)
            //   .style("opacity", 1);
    
            // nodeEnter
            //     .transition().delay(10).duration(0) // avoids strange hiccup
            //     .style("opacity", 1);
    
            node = nodeEnter.merge(node);
    
            simulation.nodes(nodes);
            simulation.alpha(1).restart()
          }
    
    
          if (autoResize) {
            var resizeTimeout;
            var initWidth = width;
            var minWidth = 100;
            window.addEventListener("resize", resizeListener);
    
            function resizeListener() {
              clearTimeout(resizeTimeout);
              resizeTimeout = setTimeout(resize, 200);
            }
    
            function resize() {
              var previousWidth = width;
              var domWidth = Math.floor(parseInt(dom.style("width"))) - margin.left - margin.right;
              if (domWidth < initWidth) {
                width = Math.max(minWidth, domWidth);
                updateWidth();
              } else if (previousWidth < initWidth) {
                width = initWidth;
                updateWidth();
              }
            }
          }
    
          updateNodes = function () {
            restart();
          };
    
          updateWidth = function () {
            dom.select('svg').attr('width', width + margin.left + margin.right)
          };
    
          updateHeight = function () {
            dom.select('svg').attr('height', height + margin.bottom + margin.top)
          };
    
        });
    
      }
    
      chart.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        if (typeof updateWidth === 'function') updateWidth();
        return chart;
      };
    
      chart.height = function (value) {
        if (!arguments.length) return height;
        height = value;
        if (typeof updateHeight === 'function') updateHeight();
        return chart;
      };
    
      chart.margin = function (value) {
        if (!arguments.length) return margin;
        margin = value;
        return chart;
      };
    
      chart.title = function (value) {
        if (!arguments.length) return title;
        title = value;
        return chart;
      };
    
      chart.autoResize = function (value) {
        if (!arguments.length) return autoResize;
        autoResize = value;
        return chart;
      };
    
      chart.foci = function (value) {
        if (!arguments.length) return foci;
        foci = value;
        // if (typeof updateData === 'function') updateData();
        return chart;
      };
    
      chart.nodes = function (value) {
        if (!arguments.length) return nodes;
        nodes = value;
        if (typeof updateNodes === 'function') updateNodes();
        return chart;
      };
    
      return chart;
    }