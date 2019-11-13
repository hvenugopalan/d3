d3.csv('js/data/CDs_And_Vinyl.csv', function (data) {


  var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40
  },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var x = d3.scaleLinear()
    .range([0, width])
    .nice();

  var y = d3.scaleLinear()
    .range([height, 0]);

  var xAxis = d3.axisBottom(x),
    yAxis = d3.axisLeft(y);

  var cValue = function (d) { return d.overall; },
    color = d3.scaleOrdinal() // D3 Version 4
      .domain([1, 2, 3, 4, 5])
      .range(["#d7191c",
        "#fdae61",
        "#ffffbf",
        "#a6d96a",
        "#1a9641"]);

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

  var tooltip = d3.select('body').append('div')
    .attr('id', 'tooltip');

  var svg = d3.select("#dataviz_axisZoom").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  // draw dots
  select
    .on("change", function (c) {
      var value = d3.select(this).property("value");
      selectedCategory = value;
      filtered_data = Object.fromEntries(Object.entries(mod_data).filter(([k, v]) => v.category.localeCompare(selectedCategory) == 0));
      filtered_data = Object.keys(filtered_data).map(function (key) {
        return filtered_data[key];
      });

     svg.selectAll("*").remove();
      var brush = d3.brush().extent([
        [0, 0],
        [width, height]
      ]).on("end", brushended),
        idleTimeout,
        idleDelay = 350;


      x.domain(d3.extent(filtered_data, function (d) {
        return d.price;
      })).nice();
      y.domain(d3.extent(filtered_data, function (d) {
        return d.review_count;
      })).nice();

      var scatter = svg.append("g")
        .attr("id", "scatterplot")
        .attr("clip-path", "url(#clip)");

      scatter.append("g")
        .attr("class", "brush")
        .call(brush);

      scatter
        .selectAll("circle")
        .data(filtered_data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.price); })
        .attr("cy", function (d) { return y(d.review_count); })
        .attr("r", 8)
        .style("fill", function (d) { return color(cValue(d)); })
        .style("opacity", 0.5)
        .on("mouseover", function (d) {
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
          tooltip.html("Description: " + d.description+  "<br/>" +
          "Price: " + d.price + "<br/>" + 
          "Overall rating: " + d.overall + "<br/>" +
          "No. of reviews: " + d.review_count)
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });

      // x axis
      svg.append("g")
        .attr("class", "x axis")
        .attr('id', "axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      svg.append("text")
        .style("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 8)
        .text("Price");

      // y axis
      svg.append("g")
        .attr("class", "y axis")
        .attr('id', "axis--y")
        .call(yAxis);

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "1em")
        .style("text-anchor", "end")
        .text("Number of reviews");

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
        .style("opacity", 0.5)
        .style("fill", color);

      // draw legend text
      legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) { return d; });


      function brushended() {

        var s = d3.event.selection;
        if (!s) {
          if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
          x.domain(d3.extent(filtered_data, function (d) {
            return d.price;
          })).nice();
          y.domain(d3.extent(filtered_data, function (d) {
            return d.review_count;
          })).nice();
        } else {

          x.domain([s[0][0], s[1][0]].map(x.invert, x));
          y.domain([s[1][1], s[0][1]].map(y.invert, y));
          scatter.select(".brush").call(brush.move, null);
        }
        zoom();
      }

      function idled() {
        idleTimeout = null;
      }

      function zoom() {

        var t = scatter.transition().duration(750);
        svg.select("#axis--x").transition(t).call(xAxis);
        svg.select("#axis--y").transition(t).call(yAxis);
        scatter.selectAll("circle").transition(t)
          .attr("cx", function (d) {
            return x(d.price);
          })
          .attr("cy", function (d) {
            return y(d.review_count);
          });
      }



    });



});





