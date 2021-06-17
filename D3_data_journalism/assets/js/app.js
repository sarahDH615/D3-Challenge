// function to allow graph to fit on any page size
function makeResponsive() {
  // select area where svg would be
  var svgArea = d3.select('body').select('svg');
  // if there is a chart there, remove it (then redraw below)
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // sizes of the svg based on the window width/height
  var svgWidth = window.innerWidth * 5/6;
  var svgHeight = window.innerHeight * 4.5/6;

  // margins between svg and chart
  var margin = {
    top: 50,
    right: 10,
    bottom: 70,
    left: 60
  };

  // chart width and height
  var chartWidth = svgWidth - margin.left - margin.right;
  var chartHeight = svgHeight - margin.top - margin.bottom;

  // svg wrapper, shifted down and right by margins
  var svg = d3
    .select('#scatter')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .classed('chart', true);

  // create and append chart group, shifted down and right by margins
  var chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // starting axes display
  var xAxisChoice = 'poverty';
  var yAxisChoice = 'obesity';

  // functions
  // ---------------------------------------------------------------------------------------------
  // creation of scales - will be adding to min and max values to make some space for the circle radii
  // creation of x axis scale
  function xScale(data, xAxisChoice) {
    var xLinScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[xAxisChoice]) - (d3.min(data, d => d[xAxisChoice])*0.2), d3.max(data, d => d[xAxisChoice]) + (d3.max(data, d => d[xAxisChoice])*0.1)])
      .range([0, chartWidth]);

    return xLinScale;
  };

  // creation of y axis scale
  function yScale(data, yAxisChoice) {
      var yLinScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[yAxisChoice]) - (d3.min(data, d => d[yAxisChoice])*0.2), d3.max(data, d => d[yAxisChoice]) + ((d3.max(data, d => d[yAxisChoice])*0.1))])
        .range([chartHeight, 0]);

      return yLinScale;
  };

  // function to update x axis upon click
  function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    // having the x axis change over 1 second
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    return xAxis;
  };

  // function to update y axis upon click
  function renderYAxis(newYScale, yAxis) {
      var leftAxis = d3.axisLeft(newYScale);
      // change will happen over 1 second
      yAxis.transition()
        .duration(1000)
        .call(leftAxis);

      return yAxis;
  };

  // function used for updating circles group with a transition to new circles
  function renderCircles(circlesGroup, newXScale, xAxisChoice, newYScale, yAxisChoice) {

    circlesGroup.transition()
      .duration(1000)
      .attr('cx', d => newXScale(d[xAxisChoice]))
      .attr('cy', d => newYScale(d[yAxisChoice]))

    return circlesGroup;
  }

  // function used for updating circles group with new tooltip
  function updateToolTip(xAxisChoice, yAxisChoice, circlesGroup) {

    var xLabel; var yLabel;

    if (xAxisChoice === 'poverty') {
      xLabel = 'Poverty (%):';
    }
    else {
      xLabel = 'Income (Mdn.):';
    }

    if (yAxisChoice === 'obesity') {
      yLabel = 'Obese (%):';
    }
    else {
      yLabel = 'Smokers (%):';
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

    // initial data display --------------------------------------------------------------
    // Axes -------------------------------------------
    // calling function to create x scale
    var xLinScale = xScale(healthData, xAxisChoice);

    // calling funct to create y scale
    var yLinScale = yScale(healthData, yAxisChoice);

    // create initial axis functions
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

    // Circles -----------------------------------------
    // creating labels for the circles   
    var circleLabels = chartGroup.selectAll('circle').data(healthData)
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
      .attr('alignment-baseline', 'middle')
      .classed('stateText', true);
    
    // append circles
    var circlesGroup = chartGroup.selectAll('circle')
      .data(healthData)
      .enter()
      .append('circle')
      .attr('cx', d => xLinScale(d[xAxisChoice]))
      .attr('cy', d => yLinScale(d[yAxisChoice]))
      .attr('r', 10)
      .classed('stateCircle', true);

    // Labels ----------------------------------------
    // Create group for two x-axis labels
    var xLabelsGroup = chartGroup.append('g')
      .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    var povertyLabel = xLabelsGroup.append('text')
      .attr('x', 0)
      .attr('y', 20)
      .attr('value', 'poverty') // value to grab for event listener
      .classed('active', true)
      .classed('aText', true)
      .text('% in Poverty');

    var incomeLabel = xLabelsGroup.append('text')
      .attr('x', 0)
      .attr('y', 40)
      .attr('value', 'income') // value to grab for event listener
      .classed('inactive', true)
      .classed('aText', true)
      .text('Median Household Income');

    // append y axis label
    var yLabelsGroup = chartGroup.append('g')
      .attr('transform', 'rotate(-90)');

    var obesityLabel = yLabelsGroup.append('text')
      .attr('y', 0 - margin.left - 3)
      .attr('x', 0 - (chartHeight / 2))
      .attr('value', 'obesity')
      .attr('dy', '1em')
      .classed('active', true)
      .classed('aText', true)
      .text('% Obese');

    var smokingLabel = yLabelsGroup.append('text')
      .attr('y', 0 - margin.left + 15)
      .attr('x', 0 - (chartHeight / 2))
      .attr('value', 'smokes')
      .attr('dy', '1em')
      .classed('inactive', true)
      .classed('aText', true)
      .text('% who Smoke');
    
    // Title -------------------------------------------
    // append title
    var title_dict = {
      'poverty': 'Percentage in Poverty',
      'obesity': 'Percent Obese',
      'smokes': 'Percentage who Smoke',
      'income': 'Median Household Income'
    };

    var titleGroup = svg.append('g')
      .attr('transform', `translate(${svgWidth / 2}, 0)`)
    var chartTitle = titleGroup.append('text')
      .attr('x', 0)
      .attr('y', 10)
      .attr('dy', '1em')
      .attr('text-align', 'center')
      .classed('title-text', true)
      .text(`${title_dict[xAxisChoice]} vs. ${title_dict[yAxisChoice]}`);

    // Tooltip ----------------------------------------
    // add tooltips on the circles
    var circlesGroup = updateToolTip(xAxisChoice, yAxisChoice, circlesGroup);

    // updating data -------------------------------------------------------------------------
    // function to update the data on user selection
    function updateData() {
      var value = d3.select(this).attr('value');

      if (value == 'poverty' || value == 'income') {
          xAxisChoice = value;
      } else if (value == 'obesity' || value == 'smokes') {
          yAxisChoice = value;
      }

      // Axes --------------------------------------------
      // updates x scale for new data
      xLinScale = xScale(healthData, xAxisChoice);
      yLinScale = yScale(healthData, yAxisChoice);

      // updates axes with transition
      xAxis = renderXAxis(xLinScale, xAxis);
      yAxis = renderYAxis(yLinScale, yAxis);

      // Circles ----------------------------------------
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
        });
      
      // updates circles with new values
      circlesGroup = renderCircles(circlesGroup, xLinScale, xAxisChoice, yLinScale, yAxisChoice);
      
      // Tooltip ----------------------------------------
      // updates tooltips with new info
      circlesGroup = updateToolTip(xAxisChoice, yAxisChoice, circlesGroup);

      // Title -----------------------------------------
      // appending new title
      chartTitle.text(`${title_dict[xAxisChoice]} vs. ${title_dict[yAxisChoice]}`);
      
      // axis labels in/active status
      // changes classes to change bold text
      if (xAxisChoice == 'income') {
          incomeLabel
              .classed('active', true)
              .classed('inactive', false);
          povertyLabel
              .classed('active', false)
              .classed('inactive', true);
      }
      else if (xAxisChoice == 'poverty') {
        povertyLabel
            .classed('active', true)
            .classed('inactive', false);
        incomeLabel
            .classed('active', false)
            .classed('inactive', true);
      }

      if (yAxisChoice == 'smokes'){
        smokingLabel
            .classed('active', true)
            .classed('inactive', false);
        obesityLabel
            .classed('active', false)
            .classed('inactive', true);
      }
      else if (yAxisChoice == 'obesity') {
        obesityLabel
            .classed('active', true)
            .classed('inactive', false);
        smokingLabel
            .classed('active', false)
            .classed('inactive', true);
      }
    }

    // event listeners -------------------------------------------------------
    // x axis labels event listener
    xLabelsGroup.selectAll('text')
      .on('click', updateData);
    // y axis labels event listener
    yLabelsGroup.selectAll('text')
      .on('click', updateData);
  }).catch(function(error) {
    console.log(error);
  })
};
makeResponsive();
// event listener for resizing graphs
d3.select(window).on('resize', makeResponsive);