function brushTimer() {
    var width = 400;
    var height = 20;
    var margin = {top: 0, right: 50, bottom: 30, left: 20};
    var accentColor = "#C70909";
    var autoResize = true;
    var minValue = 0;
    var maxValue = 10;
    var startingValue;
    var stepValue = 0.05;
    var stepsPerSecond = 10;
    var stepsPerCallback = 10;
    var sliderHeight = 10;
    var autoplay = false;
    var loop = false;
    var playState = autoplay;
    var tickFormat = function(d) { return d; };
    var tickSize = 0;
    var tickPadding = 12;
    var tickValues;

    var updateCallback;
    var playCallback;
    var pauseCallback;

    var updateWidth;
    var setCurrentValue;
    var getCurrentValue;
    var setPlaying;

    function timer(selection){
        selection.each(function () {

            var intervalStep = 0;
            var refreshTime = 1000 / stepsPerSecond;
            var currValue = startingValue || minValue;

            var playButtonWidth = 30;
            var playButtonHeight = 12;
            var sliderWidth = width - playButtonWidth - margin.left - margin.right;

            var x = d3.scaleLinear()
                .domain([minValue, maxValue])
                .range([0, sliderWidth])
                .clamp(true);

            var xAxis = d3.axisBottom(x)
                .tickFormat(tickFormat)
                .tickSize(tickSize)
                .tickPadding(tickPadding);

            if(tickValues) {
                xAxis.tickValues(tickValues);
            }

            var brush = d3.brushX()
                .extent([[0, 0], [sliderWidth, height]])
                .on("start brush end", brushed);

            var dom = d3.select(this);
            var svg = dom.append("svg")
                .attr("class", "d3-brush-timer")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

            var g = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")");

            var sliderGroup = g.append('g')
                .attr("transform", "translate(" + playButtonWidth + "," + (playButtonHeight / 2) + ")");

            var playPath = "M12 9l12 7-12 7z";
            var pausePath = "M10 10h4v12h-4zM18 10h4v12h-4z";
            var targetPath = "M26 4h-20c-3.3 0-6 2.7-6 6v12c0 3.3 2.7 6 6 6h20c3.3 0 6-2.7 6-6v-12c0-3.3-2.7-6-6-6z"

            var playButtonGroup = g.append("g")
                .attr("transform", "translate(" + (-margin.left) + "," + (0) + ")")
                .attr("class", "play-button")
                .style('cursor', 'pointer')
                .on("click", togglePlay);

            playButtonGroup.append('path')
                .attr('class', 'play-target')
                .attr('d', targetPath)
                .attr('fill', accentColor)
                .attr('stroke', 'none')
                .on('mouseover', function() { d3.select(this).style('fill-opacity', 0.7 )})
                .on('mouseout', function() { d3.select(this).style('fill-opacity', 1 )});

            var playButton = playButtonGroup.append("path")
                .attr("d", playPath)
                .attr("class", "play-pause")
                .attr('pointer-events', 'none')
                .style('fill', '#fff');

            var sliderAxisGroup = sliderGroup.append('g')
                .attr("transform", "translate(0," + height / 2 + ")");

            var backdrop = sliderAxisGroup.append("path")
                .attr('class', 'slider-backdrop')
                .attr('d', "M0,0V0H" + sliderWidth + "V0")
                .attr('stroke-linecap', 'round').attr('fill', 'none').attr('stroke', '#959595').attr('stroke-width', sliderHeight)
                .attr('pointer-events', 'none');

            var halo = sliderAxisGroup.append("path")
                .attr('d', "M0,0V0H" + sliderWidth + "V0")
                .attr('stroke-linecap', 'round').attr('fill', 'none').attr('stroke', '#ddd').attr('stroke-width', sliderHeight - 2)
                .attr('pointer-events', 'none');

            var sliderFill = sliderAxisGroup.append("path")
                .attr('d', "M0,0V0H0V0")
                .attr('stroke-linecap', 'round').attr('fill', 'none').attr('stroke', accentColor).attr('stroke-width', sliderHeight - 2);

            sliderAxisGroup.append('g')
                .attr("class", "x axis")
                .call(xAxis)
                .select('.domain')
                .attr('stroke', 'none');

            var sliderBrush = sliderGroup.append("g")
                .attr("class", "slider")
                .call(brush);

            sliderBrush.selectAll(".extent,.resize,.handle,.selection")
                .remove();

            var handle = sliderGroup.append("circle")
                .attr("class", "handle")
                .attr("transform", "translate(0," + height / 2 + ")")
                .attr("r", 9)
                .attr('fill', '#fff').attr('stroke', '#888').attr('pointer-events', 'none');

            changeValue(currValue);

            setInterval(function () {
                    if (playState) {
                        if (currValue < maxValue) {
                            intervalStep++;
                            currValue = Math.min(maxValue, stepValue + currValue);;
                            changeValue(currValue);
                            if (intervalStep > stepsPerCallback) {
                                intervalStep = 0;
                                updateCallbackWrapper(currValue);
                            }
                        } else {
                            if(!loop) {
                                pause();
                            } else {
                                currValue = minValue;
                            }
                            updateCallbackWrapper(currValue);
                        }
                    }
                }
                , refreshTime);


            function brushed() {
                if (d3.event.sourceEvent) { // not a programmatic event
                    if(!isNaN(x.invert(d3.mouse(this)[0]))) {
                        currValue = x.invert(d3.mouse(this)[0]);
                    }
                    if(playState) {
                        pause();
                    }
                    updateCallbackWrapper(currValue);
                }
                fillBarValue(currValue);
                handle.attr("cx", x(currValue));
            }

            function togglePlay() {
                if (playState) {
                    pause();
                } else {
                    play();
                    if (currValue >= maxValue) {
                        currValue = minValue;
                    }
                }
            }

            function pause() {
                playState = false;
                playButton.attr('d', playPath);
                pauseCallbackWrapper(currValue)
            }

            function play() {
                playState = true;
                playButton.attr('d', pausePath);
                playCallbackWrapper(currValue);
            }

            function fillBarValue(value) {
                var xPos = x(value);
                var path = "M0,0V0H" + xPos + "V0";
                sliderFill.attr("d", path);
            }

            function changeValue(d) {
                currValue = d;
                sliderBrush.call(brush.move, [d,d])
            }

            function updateCallbackWrapper(_) {
                if(typeof updateCallback === 'function') {
                    updateCallback(_)
                }
            }
            function playCallbackWrapper(_) {
                if(typeof playCallback === 'function') {
                    playCallback(_)
                }
            }
            function pauseCallbackWrapper(_) {
                if(typeof pauseCallback === 'function') {
                    pauseCallback(_)
                }
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

            setCurrentValue = function(value) {
                changeValue(value);
            };
            getCurrentValue = function() {
                return currValue;
            };

            setPlaying = function(value) {
                if(value) {
                    play();
                } else {
                    pause();
                }
            };

            updateWidth = function() {
                var t = svg.transition().duration(750);
                sliderWidth = width - playButtonWidth - margin.left - margin.right;
                x.range([0, sliderWidth]);
                brush.extent([[0, 0], [sliderWidth, height]]);
                svg.attr("width", width + margin.left + margin.right);
                backdrop.transition(t).attr('d', "M0,0V0H" + sliderWidth + "V0");
                halo.transition(t).attr('d', "M0,0V0H" + sliderWidth + "V0");
                sliderAxisGroup.select('.axis').transition(t).call(xAxis);
                sliderFill.transition(t).attr("d", "M0,0V0H" + x(currValue) + "V0");
                handle.transition(t).attr("cx", x(currValue));
            };
        });
    }


    timer.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        if (typeof updateWidth === 'function') updateWidth();
        return timer;
    };

    timer.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return timer;
    };

    timer.margin = function(value) {
        if (!arguments.length) return margin;
        margin = value;
        return timer;
    };

    timer.autoResize = function(value) {
        if (!arguments.length) return autoResize;
        autoResize = value;
        return timer;
    };

    timer.sliderHeight = function(value) {
        if (!arguments.length) return sliderHeight;
        sliderHeight = value;
        return timer;
    };

    timer.accentColor = function(value) {
        if (!arguments.length) return accentColor;
        accentColor = value;
        return timer;
    };

    timer.minValue = function(value) {
        if (!arguments.length) return minValue;
        minValue = value;
        return timer;
    };

    timer.maxValue = function(value) {
        if (!arguments.length) return maxValue;
        maxValue = value;
        return timer;
    };

    timer.startingValue = function(value) {
        if (!arguments.length) return startingValue;
        startingValue = value;
        return timer;
    };

    timer.stepValue = function(value) {
        if (!arguments.length) return stepValue;
        stepValue = value;
        return timer;
    };

    timer.stepsPerSecond = function(value) {
        if (!arguments.length) return stepsPerSecond;
        stepsPerSecond = value;
        return timer;
    };

    timer.stepsPerCallback = function(value) {
        if (!arguments.length) return stepsPerCallback;
        stepsPerCallback = value;
        return timer;
    };

    timer.autoplay = function(value) {
        if (!arguments.length) return autoplay;
        autoplay = value;
        return timer;
    };

    timer.loop = function(value) {
        if (!arguments.length) return loop;
        loop = value;
        return timer;
    };

    timer.tickSize = function(value) {
        if (!arguments.length) return tickSize;
        tickSize = value;
        return timer;
    };

    timer.tickPadding = function(value) {
        if (!arguments.length) return tickPadding;
        tickPadding = value;
        return timer;
    };

    timer.tickValues = function(value) {
        if (!arguments.length) return tickValues;
        tickValues = value;
        return timer;
    };

    timer.loop = function(value) {
        if (!arguments.length) return loop;
        loop = value;
        return timer;
    };

    timer.playing = function(value) {
        if (!arguments.length) return playState;
        setPlaying(value);
        return timer;
    };

    timer.tickFormat = function(value) {
        if (!arguments.length) return tickFormat;
        if(typeof value === 'function') {
            tickFormat = value;
        }
        return timer;
    };

    timer.updateCallback = function(value) {
        if (!arguments.length) return updateCallback;
        if(typeof value === 'function') {
            updateCallback = value;
        }
        return timer;
    };

    timer.playCallback = function(value) {
        if (!arguments.length) return playCallback;
        if(typeof value === 'function') {
            playCallback = value;
        }
        return timer;
    };

    timer.pauseCallback = function(value) {
        if (!arguments.length) return pauseCallback;
        if(typeof value === 'function') {
            pauseCallback = value;
        }
        return timer;
    };

    timer.currentValue = function(value) {
        if(!arguments.length) return getCurrentValue();
        if(typeof setCurrentValue === 'function') {
            setCurrentValue(value);
        } else {
            startingValue = value;
        }
        return timer;
    };

    return timer;
}