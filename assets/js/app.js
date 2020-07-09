
var svgW = 1000;
var svgH = 800;

var margin = {
  top: 50,
  right: 50,
  bottom: 100,
  left: 100
};

var width = svgW - margin.left - margin.right;
var height = svgH - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgW)
  .attr("height", svgH);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);



var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

function xScale(data, chosenXAxis) {
    
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  };
  
function yScale(data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  };

  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  };
  

  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }
  
  // update circles group with transitions
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }  
  // update circles group with transitions
  function renderLabels(cLabels, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  
    cLabels.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
  
    return cLabels;
  }
  
  // update circles group with new tooltip
  function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {
  
    if (chosenXAxis === "poverty") {
      var xlabel = "% in Poverty: ";
    }
    else if (chosenXAxis === "age") {
        var xlabel = "Median Age: ";
    }
    else {
      var xlabel = "Median Household Income: $";
    };  

    if (chosenYAxis === "healthcare") {
      var ylabel = "% that lack healthcare: ";
    }
    else if (chosenXAxis === "obesity") {
        var ylabel = "% Obese: ";
    }
    else {
      var ylabel = "% Smokers: ";
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(d => {
        return (`${d.state} (${d.abbr})<br>${ylabel}${d[chosenYAxis]}<br>${xlabel}${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);


    circlesGroup
   
        .on("mouseover", function(data) {
      toolTip.show(data);
        })
  
        .on("mouseout", function(data, index) {
        toolTip.hide(data);
        });
  
    return circlesGroup;
  };


d3.csv("../data/data.csv").then(function(censusData, err) {
    if (err) throw err;
  
    // parse data
    censusData.forEach(data => {
      data.poverty = parseFloat(data.poverty);
      data.age = parseFloat(data.age);
      data.income = parseFloat(data.income);
      data.healthcare = parseFloat(data.healthcare);
      data.smokes = parseFloat(data.smokes);
      data.obesity = parseFloat(data.obesity);
    });
  

    var xLinearScale = xScale(censusData, chosenXAxis);    

    var yLinearScale = yScale(censusData, chosenYAxis);
  

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  

    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  

    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    var gGroup = chartGroup.selectAll("g")
        .data(censusData)
        .enter()
        .append("g")
        .classed("circles", true);
    
    var circlesGroup = gGroup.append("circle")
        .data(censusData)
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 20)
      .attr("fill", "blue")
      .attr("opacity", ".5");
  

    var cLabels = chartGroup.selectAll(".circles")
     .append("text")
     .text( d => d.abbr)
     .attr("text-anchor", "middle")
     .attr("alignment-baseline", "middle")
     .attr("font-size",".8em")
     .attr("style","stroke:white;")
     .attr("x", d => xLinearScale(d[chosenXAxis]))  
     .attr("y", d => yLinearScale(d[chosenYAxis]));

    var xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var povertyLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 15)
      .attr("value", "poverty")
      .classed("active", true)
      .text("% in Poverty");
  
    var ageLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 35)
      .attr("value", "age") 
      .classed("inactive", true)
      .text("Median Age");
      
    var incomeLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 55)
      .attr("value", "income") 
      .classed("inactive", true)
      .text("Median Household Income");

    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")

    var healthcareLabel = yLabelsGroup.append("text")
      .attr("x", 0 - (height/2))
      .attr("y", 0 - (margin.left/3))
      .attr("value", "healthcare") 
      .classed("active", true)
      .text("Lacks Healthcare (%)");    
      
    var obesityLabel = yLabelsGroup.append("text")
      .attr("x", 0 - (height/2))
      .attr("y", -20 - (margin.left/3))
      .attr("value", "obesity") 
      .classed("inactive", true)
      .text("% Obese");   

    var smokesLabel = yLabelsGroup.append("text")
      .attr("x", 0 - (height/2))
      .attr("y", -40 - (margin.left/3))
      .attr("value", "smokes") 
      .classed("inactive", true)
      .text("% Smokers");
  

    var circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);
  
    xLabelsGroup.selectAll("text")
      .on("click", function() {

        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  

          chosenXAxis = value;
  

          xLinearScale = xScale(censusData, chosenXAxis);
  
          xAxis = renderXAxes(xLinearScale, xAxis);
  

          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,  yLinearScale, chosenYAxis);
  

          circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

 
          cLabels = renderLabels(cLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
  

          if (chosenXAxis === "income") {
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "age") {
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

    yLabelsGroup.selectAll("text")
      .on("click", function() {

        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

          chosenYAxis = value;
  

          yLinearScale = yScale(censusData, chosenYAxis);
  

          yAxis = renderYAxes(yLinearScale, yAxis);
  

          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,  yLinearScale, chosenYAxis);
  

          circlesGroup = updateToolTip(circlesGroup, chosenYAxis);
          

          cLabels = renderLabels(cLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          if (chosenYAxis === "smokes") {
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "obesity") {
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

  }).catch(function(error) {
    console.log(error);
  });