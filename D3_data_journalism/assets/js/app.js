// svg and chart setup
var svgWidth = window.innerWidth * 2/3;
var svgHeight = window.innerHeight * 2/3;

var margins = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
};

var chartWidth = svgWidth - (margins.left + margins.right);
var chartHeight = svgHeight - (margins.top + margins.bottom);

// svg wrapper
var svg = d3.select('#scatter')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

var chartGroup = svg.append('g')
    .attr('transform', `translate(${margins.left}, ${margins.top})`);

// read in csv
var path = 'assets/data/data.csv'

d3.csv(path).then(function(data) {
    console.log(data);

    // converting to numeric types
    data.forEach(function(d) {
        d.age = +d.age;
        d.poverty = +d.poverty;
    })

    // defining state abbrev array
    var abbrevs = data.map(datum => datum.abbr);
    // variables age and poverty
    // age - is it avg, median??
    var age = data.map(datum => datum.age);
    // poverty
    var poverty_rate = data.map(datum => datum.poverty);

    // axis scales
    var xScale = d3.scaleLinear()
    .domain([0, d3.max(age)])
    .range([0, chartWidth]);

    var yScale = d3.scaleLinear()
      .domain([0, d3.max(poverty_rate)])
      .range([chartHeight, 0]);

    // create the axes
    var bottomAxis = d3.axisBottom(xScale);
    var leftAxis = d3.axisLeft(yScale);

    // append axes
    chartGroup.append('g')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(bottomAxis);
    
    chartGroup.append('g')
        .call(leftAxis);
    
    // data append
    var circlesGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.age))
      .attr("cy", d => yScale(d.poverty))
      .attr("r", "5")
      .attr("fill", "red");
  

});
