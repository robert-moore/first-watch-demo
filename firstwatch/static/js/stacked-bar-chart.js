function stackedBarChart() {
    
        var width = 1200;
        var height = 150;
        var margin = {top: 10, right: 20, bottom: 10, left: 50};
        var valueFormat = function(d) { return d; }
        var yLabel = 'y';
        var currentInterval;
        var autoResize = true;
        var data = [];
    
        var updateWidth;
        var updateData;
        var highlightInterval;
        var clearHighlightedInterval;
    
        function chart(selection){
            selection.each(function () {
    
                var dom = d3.select(this);
                var svg = dom.append("svg")
                    .attr("class", "chart-class")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);
    
                var g = svg.append("g")
                    .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")");
    
                var intervalHighlightG = g.append('g');
    
                var intervalHighlightRect = intervalHighlightG.append('rect')
                    .attr('fill', '#ddd')
                    .attr('fill-opacity', 0.4)
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('height', height)
                    .attr('width', 0);
    
                var intervalHighlightText = intervalHighlightG.append('text')
                    .attr('y', 15)
                    .attr('text-anchor', 'end')
                    .attr('font-size', 12)
                    .attr('fill', '#444444');
    
                // var x = d3.scaleBand().rangeRound([0, width]);
                var x = d3.scaleLinear().range([0, width]);
                var y = d3.scaleLinear().rangeRound([height, 0]);
                var z = d3.scaleOrdinal()
                    // .range(["#364d73", "#3a6289", "steelblue"])
                  .range(["steelblue", "steelblue", "steelblue"])
    
                var xAxis = d3.axisBottom(x).ticks(0);
                var yAxis = d3.axisLeft(y).ticks(3);
    
                var xAxisG = g.append("g")
                    .attr("class", "axis axis--x")
                    .attr("transform", "translate(0," + height + ")");
    
                var yAxisG = g.append("g")
                    .attr("class", "axis axis--y");
    
                yAxisG.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", -36)
                  .attr("x", -30)
                    .attr('fill', '#333')
                    .attr("dy", "0.71em")
                    .attr("text-anchor", "end")
                    .text(yLabel);
    
                var serie = g.append('g').attr('class', 'serie-group').selectAll('.serie');
    
                var stack = d3.stack().keys(["0","1","2"]);
    
                draw();
    
                function draw() {
                    var stackedData = stack(data);
                    var t = svg.transition().duration(250);
                    x.domain([0, data.length]);
                    y.domain([0, d3.max(stackedData[2], function(d) { return d[1]})*1.5]);
                    xAxisG.transition(t).call(xAxis);
                    yAxisG.transition(t).call(yAxis);
    
                    d3.select('.serie-group').html('');
                    serie = d3.select('.serie-group').selectAll('serie');
    
                    serie = serie.data(stackedData);
    
                    var serieEnter = serie.enter().append("g")
                        .attr("fill", function(d, i) { return z(i); })
                        .attr('class', 'serie')
                        .selectAll("rect")
                        .data(function(d) { return d; })
                        .enter().append("rect")
                        .attr("x", function(d, i) { return x(i); })
                        .attr("y", function(d) { return y(d[1]); })
                        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
                        .attr("width", 1);
    
                    // bars.transition(t)
                    //     .attr("x", function(d, i) { return x(i); })
                    //     .attr("y", function(d) { return y(d); })
                    //     .attr("width", 1)
                    //     .attr("height", function(d) { return height - y(d); });
                    //
                    // bars.exit().remove();
                    //
                    // var barsEnter = bars.enter().append('rect')
                    //     .attr('fill', 'steelblue')
                    //     .attr("class", "bar")
                    //     .attr("x", function(d, i) { return x(i); })
                    //     .attr("y", function(d) { return y(d); })
                    //     .attr("width", 1)
                    //     .attr("height", function(d) { return height - y(d); });
                    //
                    // bars = barsEnter.merge(bars);
                }
    
    
                if(autoResize) {
                    var resizeTimeout;
                    var initWidth = width;
                    var minWidth = 100;
                    window.addEventListener("resize", resizeListener);
                    function resizeListener(){
                        clearTimeout(resizeTimeout);
                        resizeTimeout = setTimeout(resize, 200);
                    }
                    function resize() {
                        var previousWidth = width;
                        var domWidth = Math.floor(parseInt(dom.style("width"))) - margin.left - margin.right;
                        if(domWidth < initWidth) {
                            width = Math.max(minWidth, domWidth);
                            updateWidth();
                        } else if(previousWidth < initWidth) {
                            width = initWidth;
                            updateWidth();
                        }
                    }
                }
    
                highlightInterval = function(value) {
                    intervalHighlightRect.attr('width', x(value));
                    var total = data[value][0] + data[value][1] + data[value][2];
    
                    if(x(value) < 150) {
                        intervalHighlightText.attr('text-anchor', 'start')
                        intervalHighlightText.attr('x', x(value)  + 3)
                            .text(valueFormat(total));
                    } else {
                        intervalHighlightText.attr('text-anchor', 'end')
                        intervalHighlightText.attr('x', x(value)  - 3)
                            .text(valueFormat(total));
                    }
                };
    
                clearHighlightedInterval = function() {
                    intervalHighlightRect.attr('width', 0);
                    intervalHighlightText.text('');
                };
    
                updateData = function() {
                    draw();
                };
    
                updateWidth = function() {
                    svg.attr('width', width + margin.left + margin.right);
                };
    
            });
    
        }
    
        chart.width = function(value) {
            if (!arguments.length) return width;
            width = value;
            if (typeof updateWidth === 'function') updateWidth();
            return chart;
        };
    
        chart.height = function(value) {
            if (!arguments.length) return height;
            height = value;
            return chart;
        };
    
        chart.margin = function(value) {
            if (!arguments.length) return margin;
            margin = value;
            return chart;
        };
    
        chart.valueFormat = function(value) {
            if (!arguments.length) return valueFormat;
            valueFormat = value;
            return chart;
        };
    
        chart.yLabel = function(value) {
            if (!arguments.length) return yLabel;
            yLabel = value;
            return chart;
        };
    
        chart.autoResize = function(value) {
            if (!arguments.length) return autoResize;
            autoResize = value;
            return chart;
        };
    
        chart.data = function(value) {
            if (!arguments.length) return data;
            data = value;
            if (typeof updateData === 'function') updateData();
            return chart;
        };
    
        chart.highlightInterval = function(value) {
            if( !arguments.length) return chart;
            if(typeof highlightInterval === 'function') highlightInterval(Math.max(1, value));
            return chart;
        };
    
        chart.clearHighlightedInterval = function() {
            if(typeof clearHighlightedInterval === 'function') clearHighlightedInterval();
            return chart;
        };
    
        return chart;
    }