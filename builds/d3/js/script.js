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
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  mod_data = {};
  data.forEach(d => {
    if (d.Asin in mod_data) {
      mod_data[d.Asin].overall += parseInt(d.Overall);
      mod_data[d.Asin].review_count += 1;

    }
    else {
      let date = new Date(parseInt(d.Unix_Review_Time));
      mod_data[d.Asin] = {
        id: d.Asin,
        description: d.Description,
        price: parseFloat(d.Price),
        review_count: 1,
        category: d.Category,
        overall: parseInt(d.Overall),
        day: dayNames[date.getDay()],
        date: date.getDate()
      }
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

      let filtered_data = Object.fromEntries(Object.entries(mod_data).filter(([k, v]) => v.category.localeCompare(selectedCategory) == 0));
      filtered_data = Object.keys(filtered_data).map(function (key) {
        return filtered_data[key];
      });
      filtered_data.forEach(d => {
        d.overall = Math.round(d.overall / d.review_count);
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
          tooltip.html("Description: " + d.description + "<br/>" +
            "Price: " + d.price + "<br/>" +
            "Rating: " + d.overall + "<br/>" +
            "No. of reviews: " + d.review_count)
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        })
        .on("click", function (d) {
          showViz3(d.id);
          showViz4(d.id);
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

      showViz6();
      showViz5();

      //Viz3

      function showViz3(productId) {
        // set the dimensions and margins of the graph
        var margin3 = { top: 30, right: 30, bottom: 70, left: 60 },
          width3 = 460 - margin3.left - margin3.right,
          height3 = 400 - margin3.top - margin3.bottom;

        d3.select("#viz3").selectAll("*").remove();
        // append the svg object to the body of the page
        var svg3 = d3.select("#viz3")
          .append("svg")
          .attr("width", width3 + margin3.left + margin3.right)
          .attr("height", height3 + margin3.top + margin3.bottom)
          .append("g")
          .attr("transform",
            "translate(" + margin3.left + "," + margin3.top + ")");

        bar_data = {
          "January": 0, "February": 0, "March": 0, "April": 0, "May": 0, "June": 0, "July": 0,
          "August": 0, "September": 0, "October": 0, "November": 0, "December": 0
        };

        monthNames = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"];
        data.forEach((d) => {
          if (d.Asin.localeCompare(productId) == 0) {
            let date = new Date(parseInt(d.Unix_Review_Time));
            bar_data[monthNames[date.getMonth()]] += 1;
          }

        });
        // X axis
        var x = d3.scaleBand()
          .range([0, width3])
          .domain(monthNames)
          .padding(0.2);
        svg3.append("g")
          .attr("transform", "translate(0," + height3 + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");

        let arr = Object.values(bar_data);
        let min = Math.min(...arr);
        let max = Math.max(...arr);
        // Add Y axis
        var y = d3.scaleLinear()
          .domain([min, max])
          .range([height3, 0]);
        svg3.append("g")
          .call(d3.axisLeft(y));

        // x axis


        svg3.append("text")
          .style("text-anchor", "end")
          .attr("x", width3)
          .attr("y", height3 - 8)
          .text("Month");

        // y axis


        svg3.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -50)
          .attr("dy", "1em")
          .style("text-anchor", "end")
          .text("Number of reviews");

        let keys = Object.keys(bar_data);
        bar_data = []
        for (let i = 0; i < keys.length; i++) {
          bar_data.push({ key: keys[i], value: arr[i] });
        }
        // Bars
        svg3.selectAll(".bar")
          .data(bar_data)
          .enter()
          .append("rect")
          .attr("x", function (d) { return x(d.key); })
          .attr("y", function (d) { return y(d.value); })
          .attr("width", x.bandwidth())
          .attr("height", function (d) { return height3 - y(d.value); })
          .attr("fill", "#69b3a2")
      }

      //Viz4

      function showViz4(productId) {
        var margin = { top: 20, right: 100, bottom: 90, left: 50 },
          margin2 = { top: 430, right: 20, bottom: 30, left: 50 },
          width = 960,
          height = 500 - margin.top - margin.bottom,
          height2 = 500 - margin2.top - margin2.bottom;



        //add svg with margin !important
        //this is svg is actually group
        d3.select("#viz4").selectAll('*').remove();
        var svg = d3.select("#viz4").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);

        var focus = svg.append("g")  //add group to leave margin for axis
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var context = svg.append("g")
          .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

        bar_data = {};
        sum_of_rating = {};
        review_count = {};
        data.forEach((d) => {
          if (d.Asin == productId) {
            bar_data[d.Reviewer_ID] = parseInt(d.Overall);
            sum_of_rating[d.Reviewer_ID] = parseInt(d.Overall);
            review_count[d.Reviewer_ID] = 1;
          }
          else if (d.Reviewer_ID in sum_of_rating) {
            sum_of_rating[d.Reviewer_ID] += parseInt(d.Overall);
            review_count[d.Reviewer_ID] += 1;
          }
        });

        let arr = Object.values(bar_data);
        let min = Math.min(...arr);
        let max = Math.max(...arr);

        let keys = Object.keys(bar_data);
        bar_data_array = []
        for (let i = 0; i < keys.length; i++) {
          bar_data_array.push({ key: keys[i], value: arr[i] });
        }

        bar_data_array.sort((a, b) => (a.value > b.value) ? 1 : ((b.value > a.value) ? -1 : 0));

        bar_data = {};
        bar_data_array.forEach(d => {
          bar_data[d.key] = d.value;
        });

        var dataset = bar_data_array;
        var maxHeight = d3.max(dataset, function (d) { return d.value });
        var minHeight = d3.min(dataset, function (d) { return d.value })

        //set y scale
        var yScale = d3.scaleLinear().range([0, height]).domain([maxHeight, 0]);
        //add x axis
        var xScale = d3.scaleBand().rangeRound([0, width]).padding(0.1);//scaleBand is used for  bar chart
        xScale.domain(d3.range(0, dataset.length, 1));
        //set y scale
        var yScale2 = d3.scaleLinear().range([0, height2]).domain([maxHeight, 0]);
        //add x axis
        var xScale2 = d3.scaleBand().rangeRound([0, width]).padding(0.1);//scaleBand is used for  bar chart
        xScale2.domain(d3.range(0, dataset.length, 1));
        //add x and y axis
        focus.append("text")
          .style("text-anchor", "end")
          .attr("x", width + 20)
          .attr("y", height + 10)
          .text("Reviewer");
        var yAxis = d3.axisLeft(yScale).tickSize(-width);
        var yAxisGroup = focus.append("g").call(yAxis);

        svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "1em")
          .style("text-anchor", "end")
          .text("Rating for product " + productId);

        var xAxis = d3.axisBottom(xScale).tickSize(-height);

        var xAxisGroup = focus.append("g").attr("transform", "translate(0," + height + ")").call(xAxis).selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-90)")
          .style("text-anchor", "end");


        var bars1 = focus.selectAll("rect").data(dataset).enter().append("rect");
        bars1.attr("x", function (d, i) {
          return xScale(i);//i*(width/dataset.length);
        })
          .attr("y", function (d) {
            return yScale(d.value);
          })//for bottom to top
          .attr("width", xScale.bandwidth()/*width/dataset.length-barpadding*/)
          .attr("height", function (d) {
            return height - yScale(d.value);
          });
        bars1.attr("fill", function (d) {
          return color(Math.round(sum_of_rating[d.key] / review_count[d.key]));
        });

        bars1.on("mouseover", function (d) {
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
          tooltip.html("Reviewer ID: " + d.key + "<br/>" +
            "Rating: " + d.value + "<br/>" +
            "Avg rating to all products: " + Math.round(sum_of_rating[d.key] / review_count[d.key]) + "<br/>" +
            "Total no. of reviews given on Amazon:" + review_count[d.key] + "<br/>")
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
          .on("mouseout", function (d) {
            tooltip.transition()
              .duration(500)
              .style("opacity", 0);
          })
        var bars2 = context.selectAll("rect").data(dataset).enter().append("rect");
        bars2.attr("x", function (d, i) {
          return xScale2(i);//i*(width/dataset.length);
        })
          .attr("y", function (d) {
            return yScale2(d.value);
          })//for bottom to top
          .attr("width", xScale2.bandwidth()/*width/dataset.length-barpadding*/)
          .attr("height", function (d) {
            return height2 - yScale2(d.value);
          });
        bars2.attr("fill", function (d) {
          return color(Math.round(sum_of_rating[d.key] / review_count[d.key]));
        });

        //add brush
        //Brush must be added in a group
        var brush = d3.brushX()
          .extent([[0, 0], [width, height2]])//(x0,y0)  (x1,y1)
          .on("brush", brushed)//when mouse up, move the selection to the exact tick //start(mouse down), brush(mouse move), end(mouse up)
          .on("end", brushend);
        context.append("g")
          .attr("class", "brush")
          .call(brush)
          .call(brush.move, xScale2.range());


        // draw legend
        var legend = focus.selectAll(".legend")
          .data(color.domain())
          .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

        // draw legend colored rectangles
        legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("opacity", 1)
          .style("fill", color);

        // draw legend text
        legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function (d) { return d; });

        function brushed() {
          if (!d3.event.sourceEvent) return; // Only transition after input.
          if (!d3.event.selection) return; // Ignore empty selections.
          if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-
          //scaleBand of bar chart is not continuous. Thus we cannot use method in line chart.
          //The idea here is to count all the bar chart in the brush area. And reset the domain
          var newInput = [];
          var brushArea = d3.event.selection;
          if (brushArea === null) brushArea = xScale.range();

          xScale2.domain().forEach(function (d) {
            var pos = xScale2(d) + xScale2.bandwidth() / 2;
            if (pos >= brushArea[0] && pos <= brushArea[1]) {
              newInput.push(d);
            }
          });

          xScale.domain(newInput);
          //	console.log(xScale.domain());
          //realocate the bar chart
          bars1.attr("x", function (d, i) {//data set is still data
            return xScale(i)/*xScale(xScale.domain().indexOf(i))*/;
          })
            .attr("y", function (d) {
              return yScale(d.value);
            })//for bottom to top
            .attr("width", xScale.bandwidth())//if you want to change the width of bar. Set the width to xScale.bandwidth(); If you want a fixed width, use xScale2.bandwidth(). Note because we use padding() in the scale, we should use xScale.bandwidth()
            .attr("height", function (d, i) {
              if (xScale.domain().indexOf(i) === -1) {
                return 0;
              }
              else
                return height - yScale(d.value);
            })
		/*.style("opacity", function(d,i){
		  return xScale.domain().indexOf(i) === -1 ? 0 : 100;
		})*/;

          xAxisGroup.call(xAxis);


          /*svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
           .scale(width / (brushArea[1] - brushArea[0]))
           .translate(-brushArea[0], 0));*/

        }
        function brushend() {
          if (!d3.event.sourceEvent) return; // Only transition after input.
          if (!d3.event.selection) return; // Ignore empty selections.
          if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-
          //scaleBand of bar chart is not continuous. Thus we cannot use method in line chart.
          //The idea here is to count all the bar chart in the brush area. And reset the domain
          var newInput = [];
          var brushArea = d3.event.selection;
          if (brushArea === null) brushArea = xScale.range();


          xScale2.domain().forEach(function (d) {
            var pos = xScale2(d) + xScale2.bandwidth() / 2;
            if (pos >= brushArea[0] && pos <= brushArea[1]) {
              newInput.push(d);
            }
          });
          //relocate the position of brush area
          var increment = 0;
          var left = xScale2(d3.min(newInput));
          var right = xScale2(d3.max(newInput)) + xScale2.bandwidth();

          d3.select(this).transition().call(d3.event.target.move, [left, right]);//The inner padding determines the ratio of the range that is reserved for blank space between bands.
        }
      }

      //viz 5


      function showViz5() {
        // set the dimensions and margins of the graph
        var margin3 = { top: 30, right: 30, bottom: 70, left: 60 },
          width3 = 460 - margin3.left - margin3.right,
          height3 = 400 - margin3.top - margin3.bottom;

        d3.select("#viz5").selectAll("*").remove();
        // append the svg object to the body of the page
        var svg3 = d3.select("#viz5")
          .append("svg")
          .attr("width", width3 + margin3.left + margin3.right)
          .attr("height", height3 + margin3.top + margin3.bottom)
          .append("g")
          .attr("transform",
            "translate(" + margin3.left + "," + margin3.top + ")");

        bar_data = { "Sunday": 0, "Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0, "Saturday": 0 };

        data.forEach((d) => {

          let date = new Date(parseInt(d.Unix_Review_Time));
          bar_data[dayNames[date.getDay()]] += 1;

        });
        // X axis
        var x = d3.scaleBand()
          .range([0, width3])
          .domain(dayNames)
          .padding(0.2);
        svg3.append("g")
          .attr("transform", "translate(0," + height3 + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");

        let arr = Object.values(bar_data);
        let min = Math.min(...arr);
        let max = Math.max(...arr);
        // Add Y axis
        var y = d3.scaleLinear()
          .domain([min, max])
          .range([height3, 0]);
        svg3.append("g")
          .call(d3.axisLeft(y));

        let keys = Object.keys(bar_data);
        bar_data = []
        for (let i = 0; i < keys.length; i++) {
          bar_data.push({ key: keys[i], value: arr[i] });
        }
        svg.append("text")
          .style("text-anchor", "end")
          .attr("x", width)
          .attr("y", height + 50)
          .text("Month");

        // y axis


        svg.append("text")
          .attr("transform", "rotate(0)")
          .attr("y", -30)
          .attr("dy", "1em")
          .style("text-anchor", "end")
          .text("Number of reviews");
        // Bars
        svg3.selectAll(".bar")
          .data(bar_data)
          .enter()
          .append("rect")
          .attr("x", function (d) { return x(d.key); })
          .attr("y", function (d) { return y(d.value); })
          .attr("width", x.bandwidth())
          .attr("height", function (d) { return height3 - y(d.value); })
          .attr("fill", "#69b3a2")
      }

      //viz 6


      function showViz6() {
        // set the dimensions and margins of the graph
        var margin = { top: 10, right: 30, bottom: 30, left: 40 },
          width = 460 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select("#viz6")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

        // get the data
        bar_data = [];

        data.forEach((d) => {

          let date = new Date(parseInt(d.Unix_Review_Time));
          bar_data.push(date.getHours());

        });

        // X axis: scale and draw:
        var x = d3.scaleLinear()
          .domain([0, 23])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
          .range([0, width]);
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

        // set the parameters for the histogram
        var histogram = d3.histogram()
          .value(function (d) { return d; })   // I need to give the vector of value
          .domain(x.domain())  // then the domain of the graphic
          .thresholds(x.ticks(23)); // then the numbers of bins

        // And apply this function to data to get the bins
        var bins = histogram(bar_data);

        // Y axis: scale and draw:
        var y = d3.scaleLinear()
          .range([height, 0]);
        y.domain([0, d3.max(bins, function (d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
        svg.append("g")
          .call(d3.axisLeft(y));

        // x axis


        svg.append("text")
          .style("text-anchor", "end")
          .attr("x", width)
          .attr("y", height + 50)
          .text("Month");

        // y axis


        svg.append("text")
          .attr("transform", "rotate(0)")
          .attr("y", -30)
          .attr("dy", "1em")
          .style("text-anchor", "end")
          .text("Number of reviews");
        // append the bar rectangles to the svg element
        svg.selectAll("rect")
          .data(bins)
          .enter()
          .append("rect")
          .attr("x", 1)
          .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
          .attr("width", function (d) { return x(d.x1) - x(d.x0) - 1; })
          .attr("height", function (d) { return height - y(d.length); })
          .style("fill", "#69b3a2")


      }
    });
});





