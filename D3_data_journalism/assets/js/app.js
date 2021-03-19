function makeResponsive() {
  var svgArea = d3.select('body').select('svg');

  if (!svgArea.empty()) {
    svgArea.remove();
  }

  
  var svgWidth = window.innerWidth * 5/6;
  var svgHeight = window.innerHeight;

  var margin = {
    top: 50,
    right: 10,
    bottom: 70,
    left: 60
  };

  var chartWidth = svgWidth - margin.left - margin.right;
  var chartHeight = svgHeight - margin.top - margin.bottom;

  // svg wrapper, shifted down and right by margins
  var svg = d3
    .select('#scatter')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

  // Append an SVG group
  var chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Initial Params
  var xAxisChoice = 'poverty';
  var yAxisChoice = 'obesity';

  // functions
  // ---------------------------------------------------------------------------------------------
  // creation of x axis scale
  function xScale(data, xAxisChoice) {
    // create scales
    var xLinScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[xAxisChoice]) - (d3.min(data, d => d[xAxisChoice])*0.2), d3.max(data, d => d[xAxisChoice]) + (d3.max(data, d => d[xAxisChoice])*0.1)])
      .range([0, chartWidth]);

    return xLinScale;
  };

  // creation of y axis scale
  function yScale(data, yAxisChoice) {
      // create scales
      var yLinScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[yAxisChoice]) - (d3.min(data, d => d[yAxisChoice])*0.2), d3.max(data, d => d[yAxisChoice]) + ((d3.max(data, d => d[yAxisChoice])*0.1))])
        .range([chartHeight, 0]);

      return yLinScale;
  };

  // function to update x axis upon click
  function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    return xAxis;
  };

  // function to update y axis upon click
  function renderYAxis(newYScale, yAxis) {
      var leftAxis = d3.axisLeft(newYScale);

      yAxis.transition()
        .duration(1000)
        .call(leftAxis);

      return yAxis;
  };

  // function used for updating circles group with a transition to
  // new circles
  function renderCircles(circlesGroup, newXScale, xAxisChoice, newYScale, yAxisChoice) {

    circlesGroup.transition()
      .duration(1000)
      .attr('cx', d => newXScale(d[xAxisChoice]))
      .attr('cy', d => newYScale(d[yAxisChoice]));

    return circlesGroup;
  }

  // function to label circles
  function renderCircleLabels(circleLabels, xAxisChoice, yAxisChoice) {
      circleLabels.text('');
      circleLabels
          .attr('x', function(d) {
            return xScale(d[xAxisChoice]);
          })
          .attr('y', function(d) {
            return yScale(d[yAxisChoice]);
          })
          .text(function(d) {
            return d.abbr;
          })
          .attr('font-family', 'sans-serif')
          .attr('font-size', '10px')
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'middle')
          .attr('fill', 'black');
  }

  // function used for updating circles group with new tooltip
  function updateToolTip(xAxisChoice, yAxisChoice, circlesGroup) {

    var xLabel; var yLabel;

    if (xAxisChoice === 'poverty') {
      xLabel = 'Poverty Rate:';
    }
    else {
      xLabel = 'Income:';
    }

    if (yAxisChoice === 'obesity') {
      yLabel = 'Obesity Rate:';
    }
    else {
      yLabel = 'Smoking Rate:';
    }

    var toolTip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${xLabel} ${d[xAxisChoice]}<br>${yLabel} ${d[yAxisChoice]}`);
      });

    circlesGroup.call(toolTip);

    circlesGroup.on('mouseover', function(data, index, element) {
      toolTip.show(data, element[index]);
    })
      // onmouseout event
      .on('mouseout', function(data, element, index) {
        toolTip.hide(data, element[index]);
      });

    return circlesGroup;
  }
  // making labels titlecased
  function toTitleCase(str) {
      return str.replace(
        /\w\S*/g,
        function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
      );
    }


  // Retrieve data from the CSV file and execute everything below
  // ---------------------------------------------------------------------------------------------
  var path = 'assets/data/data.csv '
  d3.csv(path).then(function(healthData, err) {
      if (err) throw err;
      // console.log(healthData);
    // parse data
    healthData.forEach(function(d) {
      d.poverty = +d.poverty;
      d.obesity = +d.obesity;
      d.income = +d.income;
      d.smokes = +d.smokes;
    });

    // xLinearScale function above csv import
    var xLinScale = xScale(healthData, xAxisChoice);

    // Create y scale function
    var yLinScale = yScale(healthData, yAxisChoice);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinScale);
    var leftAxis = d3.axisLeft(yLinScale);

    // append x axis
    var xAxis = chartGroup.append('g')
      // .classed('x-axis', true)
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append('g')
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll('circle')
      .data(healthData)
      .enter()
      .append('circle')
      .attr('cx', d => xLinScale(d[xAxisChoice]))
      .attr('cy', d => yLinScale(d[yAxisChoice]))
      .attr('r', 10)
      .attr('fill', 'pink')
      .attr('opacity', '.5');

    // creating labels on the circles   
    var circleLabels = chartGroup.selectAll(null).data(healthData)
      .enter().append('text');

    circleLabels
      .attr('x', function(d) {
        return xLinScale(d[xAxisChoice]);
      })
      .attr('y', function(d) {
        return yLinScale(d[yAxisChoice]);
      })
      .text(function(d) {
        return d.abbr;
      })
      .attr('font-family', 'sans-serif')
      .attr('font-size', '10px')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('fill', 'black');

    // Create group for two x-axis labels
    var xLabelsGroup = chartGroup.append('g')
      .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    var povertyLabel = xLabelsGroup.append('text')
      .attr('x', 0)
      .attr('y', 20)
      .attr('value', 'poverty') // value to grab for event listener
      .classed('active', true)
      .classed('axis-label', true)
      .text('Poverty Rate');

    var incomeLabel = xLabelsGroup.append('text')
      .attr('x', 0)
      .attr('y', 40)
      .attr('value', 'income') // value to grab for event listener
      .classed('inactive', true)
      .classed('axis-label', true)
      .text('Income Rate');

    // append y axis
    var yLabelsGroup = chartGroup.append('g')
      .attr('transform', 'rotate(-90)');

    var obesityLabel = yLabelsGroup.append('text')
      .attr('y', 0 - margin.left - 3)
      .attr('x', 0 - (chartHeight / 2))
      .attr('value', 'obesity')
      .attr('dy', '1em')
      .classed('active', true)
      .classed('axis-label', true)
      .text('Obesity Rate');

    var smokingLabel = yLabelsGroup.append('text')
      .attr('y', 0 - margin.left + 15)
      .attr('x', 0 - (chartHeight / 2))
      .attr('value', 'smokes')
      .attr('dy', '1em')
      .classed('inactive', true)
      .classed('axis-label', true)
      .text('Smoking Rate');
    
    // append title
    var titleGroup = svg.append('g')
      .attr('transform', `translate(${svgWidth / 2}, 0)`)
    var chartTitle = titleGroup.append('text')
      .attr('x', 0)
      .attr('y', 10)
      .attr('dy', '1em')
      .attr('value', 'poverty_obesity')
      .attr('text-align', 'center')
      .classed('active', true)
      .text(`${toTitleCase(xAxisChoice)} Rate vs. ${toTitleCase(yAxisChoice)} Rate`);


    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(xAxisChoice, yAxisChoice, circlesGroup);

    // function to update the data on user selection
    function updateData() {
      var value = d3.select(this).attr('value');

      if (value == 'poverty' || value == 'income') {
          xAxisChoice = value;
      } else if (value == 'obesity' || value == 'smokes') {
          yAxisChoice = value;
      }

      // functions here found above csv import
      // updates x scale for new data
      xLinScale = xScale(healthData, xAxisChoice);
      yLinScale = yScale(healthData, yAxisChoice);

      // updates axes with transition
      xAxis = renderXAxis(xLinScale, xAxis);
      yAxis = renderYAxis(yLinScale, yAxis);

      // updates circles with new values
      circlesGroup = renderCircles(circlesGroup, xLinScale, xAxisChoice, yLinScale, yAxisChoice);

      // updates tooltips with new info
      circlesGroup = updateToolTip(xAxisChoice, yAxisChoice, circlesGroup);

      // updating labels
      circleLabels.text('');
      circleLabels.transition()
        .duration(1000)
        .attr('x', function(d) {
          return xLinScale(d[xAxisChoice]);
        })
        .attr('y', function(d) {
          return yLinScale(d[yAxisChoice]);
        })
        .text(function(d) {
          return d.abbr;
        })
        .attr('font-family', 'sans-serif')
        .attr('font-size', '10px')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('fill', 'black');
      
      // new title
      // title options
      var yTitleLabel;
      if (yAxisChoice == 'smokes') {
          yTitleLabel = 'smoking';
      } else {yTitleLabel = yAxisChoice};
      // appending new title
      chartTitle.text(`${toTitleCase(xAxisChoice)} Rate vs. ${toTitleCase(yTitleLabel)} Rate`);

      // changes classes to change bold text
      if (xAxisChoice === 'income') {
          incomeLabel
              .classed('active', true)
              .classed('inactive', false);
          povertyLabel
              .classed('active', false)
              .classed('inactive', true);
      }
      else if (yAxisChoice === 'smokes'){
          smokingLabel
              .classed('active', true)
              .classed('inactive', false);
          obesityLabel
              .classed('active', false)
              .classed('inactive', true);
      }
    }

    // x axis labels event listener
    xLabelsGroup.selectAll('text')
      .on('click', updateData);
    yLabelsGroup.selectAll('text')
      .on('click', updateData);
  }).catch(function(error) {
    console.log(error);
  })
};
makeResponsive();

d3.select(window).on('resize', makeResponsive);
