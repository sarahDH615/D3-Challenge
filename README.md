## D3-Challenge

### contains
- D3_data_journalism:
    - index.html: contains html components for the webpage
    - assets:
        - data:
            - data.csv: a CSV file containing data from the US Census Bureau 2014 Census
        - css:
            - d3Style.css: containing stylings for the D3 elements created in JavaScript
            - style.css: contains stylings for the html elements contained in index.html
        - js:
            - app.js: contains code for a responsive scatterplot based on the census data
### description

This project's purpose was to create a scatterplot of information from each US state, derived from the 2014 US Census, which could respond to user interaction by varying one of two variables on each axis; the x-axis could either display median household income or percentage in poverty, and the y axis could display either percentage of surveyed obese, or percentage of surveyed who were smokers. Furthermore, the scatterplot circles would display the x and y values chosen when hovered over by the user's mouse. Finally, the graph should resize depending on the page width. The following steps were taken within app.js to achieve this:

- making the page responsive:
    - creating a function that deletes any existing chart (and its containing element, an SVG), draws the chart, basing the chart's containing SVG on a proportion of the window's width and height
    - creating an event listener to note when the page is resized, and triggers the above function
    - calling the function to create the SVG and chart upon page load
- creating an interactive chart
    - creating functions that scale x and y axes, render the axes, append a title, and create circles for the scatter plot, all based on a chosen x and y axis value
    - setting starting x and y axis values for first displaying the chart
    - reading the source data in using d3.csv()
    - calling the functions for initial page load
    - creating event listeners attached to the axis texts that calls an update function, which:
        - updates the x and y axis choice values
        - recalls the drawing functions
- having hover text over each scatter plot circle
    - creating a function that updates the tooltip, which takes in the x and y axis choice, and returns a text string, which appears on mouseover and disappears on mouseout events
    - calling the function with the other drawing functions under d3.csv()
    - re-calling the function within the update function

### challenges

