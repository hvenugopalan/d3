d3.csv('js/data/CDs_And_Vinyl.csv', function (data) {


  var margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  let categories = d3.map(data, function (d) { return d.Category; }).keys();
  categories.sort();
  var select = d3.select("#viz2_select_category")
  let selectedCategory = "";

  mod_data = {};
  data.forEach(d => {
    if (d.Asin in mod_data) {
      mod_data[d.Asin].review_count += 1;
    }
    else {
      mod_data[d.Asin] = { description: d.Description, price: parseFloat(d.Price), review_count: 1, category: d.Category, overall: parseFloat(d.Overall) }
    }
  });

  select.selectAll("option")
    .data(categories)
    .enter()
    .append("option")
    .text(function (d) { return d; })
    .attr("value", function (d) { return d; });

  // setup x 
  var xValue = function (d) { return d.price; }, // data -> value
    xScale = d3.scaleLinear().range([0, width]), // value -> display
    xMap = function (d) { return xScale(xValue(d)); }, // data -> display
    xAxis = d3.axisBottom().scale(xScale);

  // setup y
  var yValue = function (d) { return d.review_count; }, // data -> value
    yScale = d3.scaleLinear().range([height, 0]), // value -> display
    yMap = function (d) { return yScale(yValue(d)); }, // data -> display
    yAxis = d3.axisLeft().scale(yScale);

  // add the graph canvas to the body of the webpage
  var svg = d3.select("#viz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // add the tooltip area to the webpage
  var tooltip = d3.select("#viz").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);



  // setup fill color
  var cValue = function (d) { return d.overall; },
    color = d3.scaleOrdinal(d3.schemeCategory10);





  // draw dots
  select
    .on("change", function (c) {
      var value = d3.select(this).property("value");
      selectedCategory = value;
      filtered_data = Object.fromEntries(Object.entries(mod_data).filter(([k, v]) => v.category.localeCompare(selectedCategory) == 0));
      filtered_data = Object.keys(filtered_data).map(function (key) {
        return filtered_data[key];
      });
      console.log(filtered_data);

      // don't want dots overlapping axis, so add in buffer to data domain
      xScale.domain([d3.min(filtered_data, xValue) - 1, d3.max(filtered_data, xValue) + 1]);
      yScale.domain([d3.min(filtered_data, yValue) - 1, d3.max(filtered_data, yValue) + 1]);
      //filtered_data = Array.from(mod_data).filter((d) => d.category.localeCompare(selectedCategory) == 0);
      svg.selectAll("*").remove();
      // x-axis
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end");

      // y-axis
      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");

      svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom) + ")")
        .style("text-anchor", "middle")
        .text("Price (in USD)");

      // text label for the y axis
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of reviews");

        function updateChart() {

          extent = d3.event.selection
      
          // If no selection, back to initial coordinate. Otherwise, update X axis domain
          if(!extent){
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            xAxis.domain([ 4,8])
          }else{
            xAxis.domain([ xAxis.invert(extent[0]), xAxis.invert(extent[1]) ])
            scatter.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
          }
      
          // Update axis and circle position
          xAxis.transition().duration(1000).call(d3.axisBottom(xAxis))
          scatter
            .selectAll("circle")
            .transition().duration(1000)
            .attr("cx", function (d) { return xAxis(d.price); } )
            .attr("cy", function (d) { return yAxis(d.review_count); } )
      
          }

      // create the d3-brush generator
      const brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on('brush end', updateChart);

      // attach the brush to the chart
      const gBrush = svg.append("g")
        .attr('class', 'brush')
        .call(brush);


      svg.selectAll("dot")
        .data(filtered_data)
        .enter().append("circle")
        .attr("r", 3.0)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function (d) { return color(cValue(d)); })
        .on("mouseover", function (d) {
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
          tooltip.html(d.description + "<br/> (" + xValue(d)
            + ", " + yValue(d) + ")")
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });

      // draw legend
      var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

      // draw legend colored rectangles
      legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

      // draw legend text
      legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) { return d; })
    });



});





