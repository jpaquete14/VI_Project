var datasetSeasons, full_datasetSeasons;
var datasetStats, full_datasetStats;
var datasetStandings, full_datasetStandings;
var datasetProfit, full_datasetProfit;
var datasetRef, full_datasetRef;
var svg_seasons_chart, svg_lollipop_chart, svg_standings, svg_diverging_bar_chart, svg_circular;
var optionsGroup = ["TeamOddSuccessRate", "AvgOddHome", "AvgOddAway"]
var selectedSeason = "2010-2011";
var selectedStat = "TeamOddSuccessRate";
var selectedStatText = "Team Odd Success Rate";
var labels_lollipop;
var bars, labels_diverging;
var bars_standings, labels_standings;
var nodes;
var team_highlighted, ref_highlighted;
var sliderSeasons;
var coordXbarraVerde;
var BluesImgPosition = 460;

var widthSlider = 700, widthSeasons = 600, widthLollipop = 1200, widthStandings = 600, widthDiverging = 597.5, widthCircular = 597.5;
var heightUp = 410, heightDown = 512;
var padding = 60;
var radius = 7;

var tooltipSeasonsChart, tooltipLollipop, tooltipStandings, tooltipDiverging, tooltip_circular_packing;


//CONNECTED SCATTER PLOT COM SEASON SUCCESS RATE
d3.dsv(";","SeasonSuccessRate.csv").then(function(data) {
  full_datasetSeasons = data;
  datasetSeasons = data;
  init_slider();
  gen_seasons_chart();
  init_teamStats();
  init_Standings();
  init_Profit();
  init_circular();
  prepare_slider();
  prepare_StatsButtons();
});

function init_slider(){
  var arraySeasons = datasetSeasons.map((a) => a.Season);
  var numerosSeasons = arraySeasons.map((b) => parseInt(b.substring(5,9)));
  var dominio = [parseInt(arraySeasons[0].substring(5,9)),parseInt(arraySeasons[arraySeasons.length -1].substring(5,9))];
  
  sliderSeasons = d3
    .sliderBottom()
    .domain(dominio)
    .step(1)
    .width(widthSlider-60)
    .default(numerosSeasons[0])
    .tickFormat(d3.format(".0f"))
  svg_slider = d3.select("#slider")
    .append("svg")
    .attr("width", widthSlider)
    .attr("height", 45)
    .append("g")
    .attr("transform", "translate(30,13)")
    .call(sliderSeasons)
  svg_slider
    .selectAll("text")
    .style("font-size", 12)
    .style("fill", "white")
    .attr("transform", "translate(0, -10)");
}

// CONNECTED SCATTER PLOT - SEASONS //////////////////////////////////////

function gen_seasons_chart(){
  
  //Viz area
  svg_seasons_chart = d3
    .select("#seasons_chart")
    .append("svg")
    .attr("width", widthSeasons )
    .attr("height", heightUp)
    .append("g")
    .attr("transform","translate(" + 0 + "," + 0 + ")");

  // X axis
  var xscaleData = datasetSeasons.map((a) => a.Season);
  var xscale = d3
    .scaleBand()
    .domain(xscaleData)
    .range([84, widthSeasons - 36]);
  var xaxis = d3
    .axisBottom()
    .scale(xscale)
  svg_seasons_chart
    .append("g")
    .attr("transform", "translate(-24," + (heightUp - padding - 15) + ")")
    .attr("class", "axis")
    .call(xaxis)
    .selectAll("text")
    .attr("transform","translate(3,8) rotate(15)");
  svg_seasons_chart
    .append("text")
    .attr(
      "transform",
      "translate(" + widthSeasons / 2 + " ," + (heightUp - 15) + ")"
    )
    .attr("class", "axis-label")
    .text("Season");

  // Add Y axis
  var yscale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([heightUp-75, 25]);
  var yaxis = d3
    .axisLeft()     // create the Y axis
    .scale(yscale)  // fit it to our scale
  svg_seasons_chart
    .append("g")
    .attr("transform", "translate(" + padding + ",0)")
    .attr("class", "axis")
    .call(yaxis);
  svg_seasons_chart
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("x", 0 - (heightUp) / 2)
    .attr("dy", "1em")
    .attr("class", "axis-label")
    .text("Odd Success Rate")

  // Add the line
  svg_seasons_chart
    .append("path")
    .datum(datasetSeasons)
    .attr("fill", "none")
    .attr("stroke", "purple")
    .attr("stroke-width", 3)
    .attr("d", d3.line()
      .x(function(d) { return xscale(d.Season) })
      .y(function(d) { return yscale(parseFloat(d.OddSuccessRate))})
    )
      
  // Add the circles
  svg_seasons_chart
    .selectAll("circle")
    .data(datasetSeasons)
    .enter()
    .append("circle")
      .attr("cx", function(d) { return xscale(d.Season) } )
      .attr("cy", function(d) { return yscale(parseFloat(d.OddSuccessRate)) } )
      .attr("r", radius)
      .attr("fill", "purple")
      .attr("stroke", "white")
      .attr("stroke-width", "2.5")
      .attr("id", function(d) {return "Season"+d.Season})
  // Create the Highlighted Default Selected Season Circle
  svg_seasons_chart
      .data(datasetSeasons)
      .append("circle")
        .attr("id","highlightSeason")
        .attr("cx", xscale(selectedSeason))
        .attr("cy", yscale(parseFloat(datasetSeasons[0].OddSuccessRate)))
        .attr("r", radius)
        .attr("fill", "#black")
        .attr("stroke", "red")
        .attr("stroke-width", "2.5")

  prepare_eventSeasons();
}

// LOLLIPOP CHART - STATS ////////////////////////////////////////////////

function init_teamStats(){
  //LOLLIPOP CHART COM TEAM STATS
  d3.dsv(";",selectedSeason+"TeamsStats.csv").then(function(data){
    full_datasetStats = data;
    datasetStats = data;

    gen_lollipop_chart();
  });
}

function gen_lollipop_chart(){
  //Viz area
  svg_lollipop_chart = d3
    .select("#lollipop_chart")
    .append("svg")
    .attr("width", widthLollipop )
    .attr("height", heightUp)
    .append("g")
    .attr("transform","translate(" + 0 + "," + 0 + ")");

  // Add X axis
  var xscaleData = datasetStats.map((a) => a.Team);
  var xscale = d3
    .scaleBand()
    .domain(xscaleData)
    .range([padding +20, widthLollipop - padding+20]);
  var xaxis = d3
    .axisBottom()
    .scale(xscale)
  svg_lollipop_chart
    .append("g")
    .attr("transform", "translate(-20," + (heightUp - padding - 25) + ")")
    .attr("class", "axis")
    .attr("id", "xaxis_lollipop")
    .call(xaxis)
    .selectAll("text")
    .style("visibility", "hidden");
  svg_lollipop_chart
    .append("text")
    .attr(
      "transform",
      "translate(" + widthLollipop/2 + " ," + (heightUp - 15) + ")"
    )
    .attr("class", "axis-label")
    .text("Team");

  // Add Y axis
  var yscale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(datasetStats, function(d){
        return parseFloat(d[selectedStat]);
      })+1
    ])
    .range([heightUp-padding - 25, padding - 35]);
  var yaxis = d3
    .axisLeft()     // create the Y axis
    .scale(yscale)  // fit it to our scale
  svg_lollipop_chart
    .append("g")
    .attr("transform", "translate(" + padding + ",0)")
    .attr("class", "axis")
    .attr("id", "yaxis_lollipop")
    .call(yaxis);
  svg_lollipop_chart
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", padding/10)
    .attr("x", 0 - (heightUp-25) / 2)
    .attr("dy", "1em")
    .attr("class", "axis-label")
    .attr("id", "yLabelLollipop")
    .text(selectedStatText);

   // Add Lines
   svg_lollipop_chart
   .selectAll("line")
   .data(datasetStats, function(d,i){
     return d.Team;
   })
   .join("line")
      .attr("id", function(d){
        return d.Team.replace(/\s+/g, '')
      })
      .attr("x1", function(d) { return xscale(d.Team); })
      .attr("x2", function(d) { return xscale(d.Team); })
      .attr("y1", function(d) { return yscale(parseFloat(d[selectedStat])); })
      .attr("y2", yscale(0))
      .attr("stroke", "purple")
      .attr("stroke-width", 1.5)

  // Add the circles
  svg_lollipop_chart
    .selectAll("circle")
    .data(datasetStats, function(d, i){
      return d.Team;
    })
    .join("circle")
      .attr("id", function(d){
        return d.Team.replace(/\s+/g, '')
      })
      .attr("cx", function(d) { return xscale(d.Team) } )
      .attr("cy", function(d) { return yscale(parseFloat(d[selectedStat])) } )
      .attr("r", radius)
      .attr("fill", "white")
      .attr("stroke", "purple")
      .attr("stroke-width", 1.5 )


  //LABELS
  labels_lollipop = svg_lollipop_chart
    .append("g")
    .attr("class", "labels");
  
  var i = 0;
  labels_lollipop.selectAll("text")
    .data(datasetStats, function(d){
      return d.Team;
    })
    .enter()
    .append("text")
    .attr("class", "el-label")
    .attr("text-anchor", "middle")
    .attr("id", function(d) { return d.Team.replace(/\s+/g, '') })
    .attr("x", function(d) { return xscale(d.Team)})
    .attr("y", function(d) {
      i++;
      return i % 2 == 0 ? heightUp-40 : heightUp-60 ;
    })   
    .text(function(d) { return d.Team })

  prepare_eventLollipop();
}

function updateStats(){
  d3.dsv(";",selectedSeason+"TeamsStats.csv").then(function(data){
    full_datasetStats = data;
    datasetStats = data;
    update_stat_lollipop_chart();
  })
}

function update_stat_lollipop_chart(){
  // Update X axis
  var xscaleData = datasetStats.map((a) => a.Team);  
  var xscale = d3
    .scaleBand()
    .domain(xscaleData)
    .range([padding + 20, widthLollipop - padding + 20]);
  var xaxis = d3
    .axisBottom()
    .scale(xscale)
  svg_lollipop_chart.select("#xaxis_lollipop")
    .data(datasetStats)
    .transition()
    .duration(1000)
    .call(xaxis);
  svg_lollipop_chart.select("#xaxis_lollipop")
    .selectAll("text")
    .style("visibility", "hidden");

  // Update Y axis
  var yscale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(datasetStats, function(d){
        return parseFloat(d[selectedStat]);
      })+1,
    ])
    .range([heightUp-padding-25, padding-35]);
  var yaxis = d3
    .axisLeft()     // create the Y axis
    .scale(yscale)  // fit it to our scale
  d3.select("#yaxis_lollipop").transition().duration(1000).call(yaxis);
  svg_lollipop_chart  //Updating Y Axis Label
    .selectAll("#YlabelLollipop")
    .text(selectedStatText)

  // Update the lines
  svg_lollipop_chart     //Get new lines
    .selectAll("line")
    .data(datasetStats, function(d){
      return d.Team;
    })
    .join("line") 
    .attr("id", function(d){
      return d.Team.replace(/\s+/g, '')
    })
  svg_lollipop_chart    //Write them on the X axis with 0 height
    .selectAll("line")
    .attr("x1", function(d) { return xscale(d.Team); })
    .attr("x2", function(d) { return xscale(d.Team); })
    .attr("y1", yscale(0))
    .attr("y2", yscale(0))
  svg_lollipop_chart    //Write them normally with transition
    .selectAll("line")
    .transition()
    .duration(1000)
    .attr("x1", function(d) { return xscale(d.Team); })
    .attr("x2", function(d) { return xscale(d.Team); })
    .attr("y1", function(d) { return yscale(parseFloat(d[selectedStat])); })
    .attr("y2", yscale(0))
    .attr("stroke", function(d){
      return d.Team.replace(/\s+/g, '') == team_highlighted ? "yellow" : "purple"
    })
    .attr("stroke-width", 1.5)

  // Update the circles
  svg_lollipop_chart
    .selectAll("circle")
    .data(datasetStats, function(d){
      return d.Team;
    })
    .join("circle")
    .attr("id", function(d){
      return d.Team.replace(/\s+/g, '')
    })
  svg_lollipop_chart
    .selectAll("circle")
    .attr("r", 0)
    .attr("cx", function(d) { return xscale(d.Team) } )
    .attr("cy", yscale(0))
  svg_lollipop_chart
    .selectAll("circle")
    .transition()
    .duration(1000)
    .attr("r", radius)
    .attr("fill", function(d){
      return d.Team.replace(/\s+/g, '') == team_highlighted ? "yellow" : "white"
    })
    .attr("stroke", "purple")
    .attr("stroke-width", 1.5 )
    .attr("cx", function(d) { return xscale(d.Team) } )
    .attr("cy", function(d) { return yscale(parseFloat(d[selectedStat])) } )

  //UPDATE LABELS
  labels_lollipop
    .selectAll("text")
    .data(datasetStats, function(d){
      return d.Team;
    })
    .join("text")
    .attr("class", "el-label")
    .attr("id", function(d){
      return d.Team.replace(/\s+/g, '')
    })
  
  var i = 0;
  labels_lollipop
    .selectAll("text")
    .attr("y", function(d) {
      i++;
      return i % 2 == 0 ? heightUp-40 : heightUp-60 ;
    }) 
  
  i = 0;
  labels_lollipop
    .selectAll("text")
    .transition()
    .duration(1000)
    .attr("x", function(d){ return xscale(d.Team)})
    .attr("y", function(d) {
      i++;
      return i % 2 == 0 ? heightUp-40 : heightUp-60 ;
    })
    .attr("text-anchor", "middle")
    .text(function(d) { return d.Team })

  prepare_eventLollipop();
}

// BAR CHART - STANDINGS /////////////////////////////////////////////////

function init_Standings(){
  //BAR CHART WITH FINAL STANDINGS
  d3.dsv(";",selectedSeason+"_standings.csv").then(function(data){
    full_datasetStandings = data;
    datasetStandings = data;

    gen_standings();

  });
}

function gen_standings(){
  //Viz area
  svg_standings = d3
    .select("#finalStandings")
    .append("svg")
    .attr("width", widthStandings)
    .attr("height", heightDown)
    .append("g")
    .attr("transform", "translate(" + 0 + "," + 0 + ")");

  // Add X axis
  var xscale = d3
    .scaleLinear()
    .domain([0 , d3.max(datasetStandings, function(d){
      return parseFloat(d.P);
    })+1])
    .range([120, (widthStandings)-25]);
  var xaxis = d3
    .axisBottom()     // create the X axis
    .scale(xscale)  // fit it to our scale
  svg_standings
    .append("g")
    .attr("transform", "translate(0," + (heightDown - 27) + ")")
    .attr("class", "axis")
    .attr("id", "xaxis_standings")
    .call(xaxis);
  svg_standings
    .append("text")
    .attr(
      "transform",
      "translate(" + widthStandings/2 + " ," + (20) + ")"
    )
    .attr("class", "axis-label")
    .attr("id", "XlabelStandings")
    .text("Final Standings (points)");

  // Add Y axis
  var yscaleData = datasetStandings.map((a) => a.Team);
  var yscale = d3
    .scaleBand()
    .domain(yscaleData)
    .range([35, heightDown-27]);
  var yaxis = d3
    .axisLeft()
    .scale(yscale)
  svg_standings
    .append("g")
    .attr("transform", "translate("+ xscale(0) +",0)")
    .attr("class", "axis")
    .attr("id", "yaxis_standings")
    .call(yaxis)
    .selectAll("text")
    .style("visibility", "hidden");
  
  //Add the Bars
  bars_standings = svg_standings
    .append("g")
    .attr("class","bars")

   bars_standings.selectAll("rect")
    .data(datasetStandings, function(d){
      return d.Team;
    })
    .enter()
    .append("rect")
    .attr("class", "total-points")
    .attr("id", function(d){
      return d.Team.replace(/\s+/g, '')
    })
    .attr("x", function(d){
      return xscale(0.15)
    })
    .attr("y", function(d) { return yscale(d.Team); })
    .attr("height", yscale.bandwidth()/2)
    .attr("width", function(d){
      return Math.abs(xscale(parseFloat(d.P)) - xscale(0))
    })
    .style("fill","purple")

  //Labels for the Bars
  labels_standings = svg_standings
    .append("g")
    .attr("class", "labels");
  
  labels_standings.selectAll("text")
    .data(datasetStandings, function(d){
      return d.Team;
    })
    .enter()
    .append("text")
    .attr("class", "el-label")
    .attr("id", function(d){
      return d.Team.replace(/\s+/g, '')
    })
    .attr("x", xscale(0))
    .attr("y", function(d) { return yscale(d.Team)})
    .attr("dx", -10)
    .attr("dy", yscale.bandwidth())
    .attr("text-anchor", "end")
    .text(function(d) { return d.Team })
    .attr("transform", "translate(4,-12)");

  prepare_eventStandings();
}

function updateStandings(){
  //UPDATE BAR CHART WITH FINAL STANDINGS
  d3.dsv(";",selectedSeason+"_standings.csv").then(function(data){
    full_datasetStandings = data;
    datasetStandings = data;

    update_final_standings();
  });
}

function update_final_standings(){

  // Update X axis
  var xscale = d3
    .scaleLinear()
    .domain([0 , d3.max(datasetStandings, function(d){
      return parseFloat(d.P);
    })+1])
    .range([120, (widthStandings)-25]);
  var xaxis = d3
    .axisBottom()     // create the X axis
    .scale(xscale)  // fit it to our scale
  d3.select("#xaxis_standings")
    .transition()
    .duration(1000)
    .call(xaxis)

  // Update Y axis
  var yscaleData = datasetStandings.map((a) => a.Team);
  var yscale = d3
    .scaleBand()
    .domain(yscaleData)
    .range([35, heightDown-27]);
  var yaxis = d3
    .axisLeft()
    .scale(yscale)
  svg_standings.select("#yaxis_standings")
    .transition()
    .duration(1000)
    .call(yaxis)
    .attr("transform", "translate(" + xscale(0) + ",0)")
    .selectAll("text")
    .style("visibility", "hidden");

  //Update the Bars
  bars_standings
    .selectAll("rect")
    .data(datasetStandings)
    .join("rect")
    .attr("class","total-points")
    .attr("id", function(d){
      return d.Team.replace(/\s+/g, '')
    })

  
  bars_standings
    .selectAll("rect")
    .attr("x", function(d){
      return xscale(0.15)
    })
    .attr("y", function(d){return yscale(d.Team); })
    .attr("height", yscale.bandwidth()/2)
    .attr("width", 0)
    .style("fill", function(d){
      return d.Team.replace(/\s+/g, '') == team_highlighted ? "yellow" : "purple"
    })

  bars_standings
    .selectAll("rect")
    .transition()
    .duration(1000)
    .attr("width", function(d){
      return Math.abs(xscale(parseFloat(d.P)) - xscale(0))
    });

  //Update Labels of the Bars
  labels_standings
    .selectAll("text")
    .data(datasetStandings, function(d){
      return d.Team;
    })
    .join("text")
    .attr("class", "el-label")
    .attr("id", function(d){
      return d.Team.replace(/\s+/g, '')
    })
  labels_standings
    .selectAll("text")
    .attr("x", xscale(0))
  labels_standings
    .selectAll("text")
    .transition()
    .duration(1000)
    .attr("x", xscale(0))
    .attr("y", function(d) {return yscale(d.Team)})
    .attr("dx", -10)
    .attr("dy", yscale.bandwidth())
    .attr("text-anchor", "end")
    .text(function(d) { return d.Team })
    .attr("transform", "translate(4,-12)");

  prepare_eventStandings();
}

// DIVERGING BAR CHART - PROFIT //////////////////////////////////////////

function init_Profit(){
  //DIVERGING BAR CHART COM TEAMS PROFIT
  d3.dsv(";",selectedSeason+"TeamsProfit.csv").then(function(data){
    full_datasetProfit = data;
    datasetProfit = data;

    gen_diverging_bar_chart();
  });
}

function gen_diverging_bar_chart(){
  //Viz area
  svg_diverging_bar_chart = d3
    .select("#diverging_bar_chart")
    .append("svg")
    .attr("width", widthDiverging)
    .attr("height", heightDown)
    .append("g")
    .attr("transform","translate(" + 0 + "," + 0 + ")");

  // Add X axis
  var xscale = d3
    .scaleLinear()
    .domain([-35 , 35])
    .range([60, (widthDiverging)-60]);
  var xaxis = d3
    .axisBottom()     // create the X axis
    .scale(xscale)  // fit it to our scale
  svg_diverging_bar_chart
    .append("g")
    .attr("transform", "translate(0," + (heightDown - 27) + ")")
    .attr("class", "axis")
    .attr("id", "xaxis_diverging")
    .call(xaxis);
  svg_diverging_bar_chart
    .append("text")
    .attr(
      "transform",
      "translate(" + xscale(0) + " ," + (20) + ")"
    )
    .attr("class", "axis-label")
    .attr("id", "XlabelDiverging")
    .text("Total Profit (€)");

  // Add Y axis
  var yscaleData = datasetProfit.map((a) => a.Team);
  var yscale = d3
    .scaleBand()
    .domain(yscaleData)
    .range([35, heightDown - 27]);
  var yaxis = d3
    .axisLeft()
    .scale(yscale)
  svg_diverging_bar_chart
    .append("g")
    .attr("transform", "translate(" + xscale(0) + ",0)")
    .attr("class", "axis")
    .attr("id", "yaxis_diverging")
    .call(yaxis)
    .selectAll("text")
    .style("visibility", "hidden");
  svg_diverging_bar_chart
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("x", - (heightDown)/2)
    .attr("dy", "1em")
    .attr("class", "axis-label")
    .text("Team");


  //Add the Bars
  bars = svg_diverging_bar_chart
    .append("g")
    .attr("class","bars")

   bars.selectAll("rect")
    .data(datasetProfit, function(d){
      return d.Team;
    })
    .enter()
    .append("rect")
    .attr("class", "total-profit")
    .attr("id", function(d){
      return d.Team.replace(/\s+/g, '')
    })
    .attr("x", function(d){
      return xscale(Math.min(0.15, parseFloat(d.TotalProfit)))
    })
    .attr("y", function(d) { return yscale(d.Team); })
    .attr("height", yscale.bandwidth()/2)
    .attr("width", function(d){
      return Math.abs(xscale(parseFloat(d.TotalProfit)) - xscale(0))
    })
    .style("fill", function(d){
      return parseFloat(d.TotalProfit) > 0 ? "green" : "red" ;
    })

    coordXbarraVerde = bars.select("rect").attr("x")

  //Labels for the Bars
  labels_diverging = svg_diverging_bar_chart
    .append("g")
    .attr("class", "labels");
  
  labels_diverging.selectAll("text")
    .data(datasetProfit, function(d){
      return d.Team;
    })
    .enter()
    .append("text")
    .attr("class", "el-label")
    .attr("id", function(d) { return d.Team.replace(/\s+/g, '') })
    .attr("x", xscale(0))
    .attr("y", function(d) { return yscale(d.Team)})
    .attr("dx", function(d) {
      return parseFloat(d.TotalProfit) < 0 ? 10 : -10;
    })
    .attr("dy", yscale.bandwidth())
    .attr("text-anchor", function(d) {
      return parseFloat(d.TotalProfit) < 0 ? "start" : "end";
    })
    .text(function(d) { return d.Team })
    .attr("transform", "translate(0,-12)");

  prepare_eventDiverging();
}

function updateProfit(){
  //DIVERGING BAR CHART COM TEAMS PROFIT
  d3.dsv(";",selectedSeason+"TeamsProfit.csv").then(function(data){
    full_datasetProfit = data;
    datasetProfit = data;

    update_diverging_bar_chart();
  });
}

function update_diverging_bar_chart(){
  
  // Update X axis
  var xscale = d3
    .scaleLinear()
    .domain([-35, 35])
    .range([60, (widthDiverging)-60]);
  var xaxis = d3
    .axisBottom()     // create the X axis
    .scale(xscale)  // fit it to our scale
  d3.select("#xaxis_diverging")
    .transition()
    .duration(1000)
    .call(xaxis)
  d3.select("#XlabelDiverging")
    .transition()
    .duration(1000)
    .attr(
      "transform",
      "translate(" + xscale(0) + " ," + (20) + ")"
    )

  // Update Y axis
  var yscaleData = datasetProfit.map((a) => a.Team);
  var yscale = d3
    .scaleBand()
    .domain(yscaleData)
    .range([35, heightDown - 27]);
  var yaxis = d3
    .axisLeft()
    .scale(yscale)
  svg_diverging_bar_chart.select("#yaxis_diverging")
    .transition()
    .duration(1000)
    .call(yaxis)
    .attr("transform", "translate(" + xscale(0) + ",0)")
    .selectAll("text")
    .style("visibility", "hidden");

  //Update the Bars
  bars
    .selectAll("rect")
    .data(datasetProfit, function(d){
      return d.Team;
    })
    .join("rect")
    .attr("class","total-profit")
    .attr("id", function(d){
      return d.Team.replace(/\s+/g, '')
    })

  bars
    .selectAll("rect")
    .attr("x", function(d){
      return xscale(Math.min(0.15, parseFloat(d.TotalProfit)))
    })
    .attr("y", function(d){return yscale(d.Team); })
    .attr("height", yscale.bandwidth()/2)
    .attr("width", 0)
    .style("fill", function(d){
      return d.Team.replace(/\s+/g, '') == team_highlighted ? "yellow" : parseFloat(d.TotalProfit) > 0 ? "green" : "red" ;
    })

  bars
    .selectAll("rect")
    .transition()
    .duration(1000)
    .attr("width", function(d){
      return Math.abs(xscale(parseFloat(d.TotalProfit)) - xscale(0))
    });

  //Update Labels of the Bars
  labels_diverging
    .selectAll("text")
    .data(datasetProfit, function(d){
      return d.Team;
    })
    .join("text")
    .attr("class", "el-label")
    .attr("id", function(d){
      return d.Team.replace(/\s+/g, '')
    })
    .attr("y", function(d) { return yscale(d.Team)})
  labels_diverging
    .selectAll("text")
    .attr("x", function(d) {
      return parseFloat(d.TotalProfit) < 0 ? xscale(5) : xscale(-5);
    })
  labels_diverging
    .selectAll("text")
    .transition()
    .duration(1000)
    .attr("x", xscale(0))
    .attr("y", function(d) {return yscale(d.Team)})
    .attr("dx", function(d) {
      return parseFloat(d.TotalProfit) < 0 ? 10 : -10;
    })
    .attr("dy", yscale.bandwidth())
    .attr("text-anchor", function(d) {
      return parseFloat(d.TotalProfit) < 0 ? "start" : "end";
    })
    .text(function(d) { return d.Team })
    .attr("transform", "translate(0,-12)");

  prepare_eventDiverging();
}

// CIRCULAR PACKING - REFEREES ///////////////////////////////////////////

function init_circular(){
  d3.dsv(";",selectedSeason+"RefSuccessRate.csv").then(function(data){
      full_datasetRef = data;
      datasetRef = data;
      circular();
    });
}

function circular(){
  svg_circular = d3
    .select("#circular_packing")
    .append("svg")
    .attr("width", widthCircular)
    .attr("height", heightDown)
    .append("g")
    .attr("transform","translate(" + 0 + "," + 0 + ")");

  var size = d3.scaleLinear()
    .domain([0,100])
    .range([7,55]);  // circle will be between 7 and 55 px wide

  svg_circular
    .append("text")
    .attr(
      "transform",
      "translate("+ widthCircular/2 + "," + (20) +")"
    )
    .attr("class", "axis-label")
    .attr("id", "TitleCircular")
    .text("Referee Odd Success Rate");


  nodes = svg_circular.append("g")
      .attr("class", "nodes");
  
  var node = nodes.selectAll("node")
      .data(datasetRef, function(d){
        return d.Referee;
      })
      .enter()
      .append("g")
      .attr("class","node_circular_packing")
      .attr("id", function(d) {return d.Referee.replace(/\s+/g, '');})
      .call(d3.drag() // call specific function when circle is dragged
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))
    
  var circle = node.append("circle")
      .data(datasetRef, function(d){
        return d.Referee;
      })
      .attr("class", "nodeCircle")
      .attr("id", function(d) {return d.Referee.replace(/\s+/g, '');})
      .attr("r", function(d){ return size(d.RefOddSuccessRate)})
      .style("fill", function(d){ return /*"purple"*/ d3.interpolateBlues(parseFloat(d.RefTotalPredictions)/38)})
      .style("fill-opacity", 1)
      .attr("stroke", "black")
      .attr("stroke-width", 1)


  var text = node.append("text")
      .data(datasetRef, function(d){
        return d.Referee;
      })
      .attr("class", "nodeText")
      .attr("id", function(d) {return d.Referee.replace(/\s+/g, '');})
      .text(function(d){
        var nomes = d.Referee.split(' ')
        return nomes[0].charAt(0) + nomes[1].charAt(0);
      })
      .attr("y", 4)
      .attr("fill", "black")
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")

  // Features of the forces applied to the nodes:
  var simulation = d3.forceSimulation()
    .force("center", d3.forceCenter().x(widthCircular/2).y(heightDown/2)) // Attraction to the center of the svg area
    .force("charge", d3.forceManyBody().strength(.1 )) // Nodes are attracted one each other of value is > 0
    .force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (size(d.RefOddSuccessRate)+3) }).iterations(1)) // Force that avoids circle overlapping

  // Apply these forces to the nodes and update their positions.
  // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
  simulation
    .nodes(datasetRef)
    .on("tick", function(d){
      node.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")"
      });
    });

  // a circle is dragged
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(event, d) {
    if(event.x > 0 && event.x < widthCircular)
      d.fx = event.x;
    if(event.y > 20 && event.y < BluesImgPosition)
      d.fy = event.y;
  }
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  prepare_eventCircular();
}

function update_Referee(){
  d3.dsv(";",selectedSeason+"RefSuccessRate.csv").then(function(data){
      full_datasetRef = data;
      datasetRef = data;
      update_circular_packing();
    });
}

function update_circular_packing(){
  
  var size = d3.scaleLinear()
    .domain([0,100])
    .range([7,55]);  // circle will be between 7 and 55 px wide

  var node = nodes.selectAll(".node_circular_packing")
    .data(datasetRef, function(d){
      return d.Referee;
    })
    .join(
      enter => enter.append("g")
                    .attr("class", "node_circular_packing")
                    .attr("id", function(d) {return d.Referee.replace(/\s+/g, '');})
                    .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended)),
      update => update,
      exit => exit.remove() 
      )

  // Update/Create circles and text
  for(var i = 0; i < node.selectAll(".nodeCircle")._groups.length ; i++){
    var item = node.selectAll(".nodeCircle")._groups[i]

    if (item.length == 0){
      svg_circular.select("#"+node.selectAll(".nodeCircle")._parents[i].id)
        .append("circle")
        .attr("class", "nodeCircle")
        .attr("id", function() {return datasetRef[i].Referee.replace(/\s+/g, '')+"Update";})
        .attr("r", function(){ return size(datasetRef[i].RefOddSuccessRate)})
        .style("fill",  function(){ return d3.interpolateBlues(parseFloat(datasetRef[i].RefTotalPredictions)/38)})
        .style("fill-opacity", 0.8)
        .attr("stroke", "black")
        .attr("stroke-width", 1)

      svg_circular.select("#"+node.selectAll(".nodeText")._parents[i].id)
        .append("text")
        .attr("class", "nodeText")
        .attr("id", function(d) {return d.Referee.replace(/\s+/g, '')+"Update";})
        .text(function(d){
          var nomes = d.Referee.split(' ')
          return nomes[0].charAt(0) + nomes[1].charAt(0);
        })
        .attr("y", 4)
        .attr("fill", "black")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
    }
    if (item.length > 0){
      svg_circular.select("#"+item[0].id+".nodeCircle")
        .attr("r", function(){ return size(datasetRef[i].RefOddSuccessRate)})
        .style("fill",  function(){ return d3.interpolateBlues(parseFloat(datasetRef[i].RefTotalPredictions)/38)})
    }
  }

  svg_circular.selectAll(".nodeCircle")
    .data(datasetRef, function(d){
      return d.Referee;
    })

  svg_circular.selectAll(".nodeText")
    .data(datasetRef, function(d){
      return d.Referee;
  })


  // Features of the forces applied to the nodes:
  var simulation = d3.forceSimulation()
    .force("center", d3.forceCenter().x(widthCircular/2).y(heightDown/2)) // Attraction to the center of the svg area
    .force("charge", d3.forceManyBody().strength(.1 )) // Nodes are attracted one each other of value is > 0
    .force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (size(d.RefOddSuccessRate)+3) }).iterations(1)) // Force that avoids circle overlapping

  // Apply these forces to the nodes and update their positions.
  // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
  simulation
    .nodes(datasetRef)
    .on("tick", function(d){
      node.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")"
      });
    });

  // a circle is dragged
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(event, d) {
    if(event.x > 0 && event.x < widthCircular)
      d.fx = event.x;
    if(event.y > 20 && event.y < BluesImgPosition)
      d.fy = event.y;
  }
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  prepare_eventCircular();
}

// EVENT RELATED STUFF ///////////////////////////////////////////////////

function prepare_StatsButtons(){
  d3.select("#TeamOddSuccessRateBtn").on("click", function(d){
    if(selectedStat != "TeamOddSuccessRate"){
      document.getElementById("TeamOddSuccessRateBtn").className = "btnPressed";
      document.getElementById(selectedStat+"Btn").className = "btn";
      selectedStat = "TeamOddSuccessRate";
      selectedStatText = "Team Odd Success Rate";
      update_stat_lollipop_chart();
    }
  })

  d3.select("#AvgOddHomeBtn").on("click", function(d){
    if(selectedStat != "AvgOddHome"){
      document.getElementById("AvgOddHomeBtn").className = "btnPressed";
      document.getElementById(selectedStat+"Btn").className = "btn";
      selectedStat = "AvgOddHome";
      selectedStatText = "Avg Home Odd";
      update_stat_lollipop_chart();
    }
  })

  d3.select("#AvgOddAwayBtn").on("click", function(d){
    if(selectedStat != "AvgOddAway"){
      document.getElementById("AvgOddAwayBtn").className = "btnPressed";
      document.getElementById(selectedStat+"Btn").className = "btn";
      selectedStat = "AvgOddAway";
      selectedStatText = "Avg Away Odd";
      update_stat_lollipop_chart();
    }
  })
}

function prepare_eventSeasons(){

  svg_seasons_chart.selectAll("circle").on("mouseover", function(event, d){
    
    if(d.Season != selectedSeason){
      d3.select(this)
        .attr("stroke", "black")
    }

    tooltipSeasonsChart = d3.select("#seasons_chart")
      .append("div")
      .style("position", "fixed")
      .style("opacity", 1)
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("left", (event.clientX))
      .style("top", (event.clientY-40))   
      .html(parseFloat(d.OddSuccessRate).toFixed(3) + " %")   
      .attr("id", "tooltipSeasonsId")
  })

  svg_seasons_chart.selectAll("circle").on("mousemove", function(event, d){
    tooltipSeasonsChart
      .style("left", (event.clientX))
      .style("top", (event.clientY-40))
  })

  svg_seasons_chart.selectAll("circle").on("mouseleave", function(event, d){
    d3.select("#tooltipSeasonsId")
      .remove()
    if(d.Season != selectedSeason){
      d3.select(this)
        .attr("stroke", "white")
    }
  })

  svg_seasons_chart.selectAll("circle").on("click", function(event, d){
    if(d.Season != null && d.Season != selectedSeason){      
      //ajustar o slider, por consequencia vai dar update a season tambem
      sliderSeasons.value(parseInt(d.Season.substring(5,9)))
    }
  })
}

function changeSeason(season){
  
  if(season != null && season != selectedSeason){
    d3.select("#highlightSeason").remove();
    selectedSeason = season;
    document.getElementById("SeasonText").innerHTML = selectedSeason;

    d3.select("#Season"+season)
          .attr("stroke", "white")

    var xscaleData = datasetSeasons.map((a) => a.Season);
    var xscale = d3
      .scaleBand()
      .domain(xscaleData)
      .range([84, widthSeasons - 36 ]);
    var yscale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([heightUp-75, 25]);
    svg_seasons_chart
      .data(datasetSeasons)
      .append("circle")
      .attr("id","highlightSeason")
      .attr("cx", xscale(season))
      .attr("cy", yscale(parseFloat(datasetSeasons[season.charAt(3)].OddSuccessRate)))
      .attr("r", radius)
      .attr("fill", "black")
      .attr("stroke", "red")
      .attr("stroke-width", "2.5")
    updateStats();
    updateStandings();
    updateProfit();
    update_Referee();
    prepare_eventSeasonHighlighted();
  }
}

function prepare_eventSeasonHighlighted(){
  svg_seasons_chart.selectAll("#highlightSeason").on("mouseover", function(event,d){
    tooltipSeasonsChart = d3.select("#seasons_chart")
    .append("div")
    .style("position", "fixed")
    .style("opacity", 1)
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("left", (event.clientX))
    .style("top", (event.clientY-40))   
    .html(parseFloat(datasetSeasons[parseInt(selectedSeason.charAt(3))].OddSuccessRate).toFixed(3) + " %")   
    .attr("id", "tooltipSeasonsId")
  })

  svg_seasons_chart.selectAll("#highlightSeason").on("mousemove", function(event,d){
    tooltipSeasonsChart
      .style("left", (event.clientX))
      .style("top", (event.clientY-40))
  })

  svg_seasons_chart.selectAll("#highlightSeason").on("mouseleave", function(event,d) {
    d3.select("#tooltipSeasonsId")
      .remove()
  })
}

function prepare_eventLollipop(){

  svg_lollipop_chart.selectAll("circle").on("mouseover", function(event, d){
    d3.select(this)
      .attr("stroke", "black")
      .attr("stroke-width", 2.5 )
      .attr("r", radius + 1)

    tooltipLollipop = d3.select("#lollipop_chart")
      .append("div")
      .style("position", "fixed")
      .style("opacity", 1)
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("left", (event.clientX))
      .style("top", (event.clientY-40))   
      .html(function(){
        return selectedStat == "TeamOddSuccessRate" ?
         parseFloat(d[selectedStat]).toFixed(3) + " %" : parseFloat(d[selectedStat]).toFixed(3)
      })
      .attr("id", "tooltipLollipopId")
  })

  svg_lollipop_chart.selectAll("circle").on("mousemove", function(event, d){
    tooltipLollipop
      .style("left", (event.clientX))
      .style("top", (event.clientY-40))
  })

  svg_lollipop_chart.selectAll("circle").on("mouseleave", function(event, d){
    d3.select("#tooltipLollipopId")
      .remove()

    d3.select(this)
      .attr("stroke", "purple")
      .attr("stroke-width", 1.5 )
      .attr("r", radius)
  })

  svg_lollipop_chart.selectAll(".el-label").on("mouseover", function(event, d){
    d3.select(this).attr("font-weight","bold")
  })

  svg_lollipop_chart.selectAll(".el-label").on("mouseleave", function(event, d){
    if(d3.select(this).attr("id") != team_highlighted) d3.select(this).attr("font-weight","normal")
  })

  svg_lollipop_chart.selectAll(".el-label").on("click", highlightTeam);

  svg_lollipop_chart.selectAll("circle").on("click", highlightTeam);

  svg_lollipop_chart.selectAll("line").on("click", highlightTeam);

}

function prepare_eventStandings(){

  svg_standings.selectAll("rect").on("mouseover", function(event, d){
    d3.select(this)
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)

    tooltipStandings = d3.select("#finalStandings")
      .append("div")
      .style("position", "fixed")
      .style("opacity", 1)
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("left", (event.clientX))
      .style("top", (event.clientY-40))   
      .html(d.P)
      .attr("id", "tooltipStandingsId")
  })

  svg_standings.selectAll("rect").on("mousemove", function(event, d){
    tooltipStandings
      .style("left", (event.clientX))
      .style("top", (event.clientY-40))
  })

  svg_standings.selectAll("rect").on("mouseleave", function(event, d){
    d3.select("#tooltipStandingsId")
      .remove()

    d3.select(this)
      .attr("stroke", "none")
  })

  svg_standings.selectAll(".el-label").on("mouseover", function(event, d){
    d3.select(this).attr("font-weight","bold")
  })

  svg_standings.selectAll(".el-label").on("mouseleave", function(event, d){
    if(d3.select(this).attr("id") != team_highlighted) d3.select(this).attr("font-weight","normal")
  })

  svg_standings.selectAll(".el-label").on("click", highlightTeam);

  svg_standings.selectAll(".total-points").on("click", highlightTeam);

}

function prepare_eventDiverging(){

  svg_diverging_bar_chart.selectAll("rect").on("mouseover", function(event, d){
    d3.select(this)
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)

    tooltipDiverging = d3.select("#diverging_bar_chart")
      .append("div")
      .style("position", "fixed")
      .style("opacity", 1)
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("left", (event.clientX))
      .style("top", (event.clientY-40))   
      .html(parseFloat(d.TotalProfit).toFixed(2) + " €")
      .attr("id", "tooltipDivergingId")
  })

  svg_diverging_bar_chart.selectAll("rect").on("mousemove", function(event, d){
    tooltipDiverging
      .style("left", (event.clientX))
      .style("top", (event.clientY-40))
  })

  svg_diverging_bar_chart.selectAll("rect").on("mouseleave", function(event, d){
    d3.select("#tooltipDivergingId")
      .remove()

    d3.select(this)
      .attr("stroke", "none")
  })

  svg_diverging_bar_chart.selectAll(".el-label").on("mouseover", function(event, d){
    d3.select(this).attr("font-weight","bold")
  })

  svg_diverging_bar_chart.selectAll(".el-label").on("mouseleave", function(event, d){
    if(d3.select(this).attr("id") != team_highlighted) d3.select(this).attr("font-weight","normal")
  })

  svg_diverging_bar_chart.selectAll(".el-label").on("click", highlightTeam);

  svg_diverging_bar_chart.selectAll(".total-profit").on("click", highlightTeam);

}

function prepare_eventCircular(){
  
  svg_circular.selectAll(".nodeCircle").on("mouseover", function(event, d){
    if(d3.select(this).attr("id") != ref_highlighted) d3.select(this).attr("stroke", "white")

    tooltip_circular_packing = d3.select("#circular_packing")
      .append("div")
      .style("position", "fixed")
      .style("opacity", 1)
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("left", (event.clientX+5))
      .style("top", (event.clientY-75))   
      .html(function(){
        return d.RefTotalPredictions > 1 ?
          '<u>' + d.Referee + '</u>' + "<br>" + parseFloat(d.RefOddSuccessRate).toFixed(3) + " %" + "<br>" + d.RefTotalPredictions + " Matches" :
          '<u>' + d.Referee + '</u>' + "<br>" + parseFloat(d.RefOddSuccessRate).toFixed(3) + " %" + "<br>" + d.RefTotalPredictions + " Match"
      })
      .attr("id", "tooltipCircularId")
  })

  svg_circular.selectAll(".nodeCircle").on("mousemove", function(event, d){
    tooltip_circular_packing
      .style("left", (event.clientX+5))
      .style("top", (event.clientY-75))
  })

  svg_circular.selectAll(".nodeCircle").on("mouseleave", function(event, d){
    d3.select("#tooltipCircularId")
      .remove()

    if(d3.select(this).attr("id") != ref_highlighted) d3.select(this).attr("stroke", "black")
  })

  svg_circular.selectAll(".nodeText").on("mouseover", function(event, d){
    if(d3.select(this).attr("id") != ref_highlighted) d3.select(this.parentNode.childNodes[0]).attr("stroke", "white")

    tooltip_circular_packing = d3.select("#circular_packing")
      .append("div")
      .style("position", "fixed")
      .style("opacity", 1)
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("left", (event.clientX+5))
      .style("top", (event.clientY-75))   
      .html('<u>' + d.Referee + '</u>' + "<br>" + parseFloat(d.RefOddSuccessRate).toFixed(3) + " %" + "<br>" + d.RefTotalPredictions + " Matches")
      .attr("id", "tooltipCircularId")
  })

  svg_circular.selectAll(".nodeText").on("mousemove", function(event, d){
    tooltip_circular_packing
      .style("left", (event.clientX+5))
      .style("top", (event.clientY-75))
  })

  svg_circular.selectAll(".nodeText").on("mouseleave", function(event, d){
    d3.select("#tooltipCircularId")
      .remove()

    if(d3.select(this).attr("id") != ref_highlighted) d3.select(this.parentNode.childNodes[0]).attr("stroke", "black")
  })

  svg_circular.selectAll(".nodeCircle").on("click", highlightRef);
  svg_circular.selectAll(".nodeText").on("click", highlightRef);

  d3.select("#ResetCircularBtn").on("click", resetCircular);
  
}

function resetCircular(){
  update_Referee();
}

function highlightRef() {

  var refId = d3.select(this).attr("id");

  if(ref_highlighted != null && refId != null){
    svg_circular.select("#"+ref_highlighted+".nodeCircle")
      .attr("stroke", function(){return refId==ref_highlighted? "white" : "black"})
      .attr("stroke-width", "1")
    svg_circular.select("#"+ref_highlighted+".nodeText")
      .attr("fill", "black")
  }

  if(ref_highlighted != refId && refId != null){
    svg_circular.select("#"+refId+".nodeCircle")
      .attr("stroke", "deeppink")
      .attr("stroke-width", 1.5)
    svg_circular.select("#"+refId+".nodeText")
      .attr("fill", "deeppink")
  }


  if(ref_highlighted == refId){
    ref_highlighted = null;
  }
  else{
    ref_highlighted = refId;
  }  
}

function highlightTeam() {

    var id = d3.select(this).attr("id");

    if(team_highlighted != null && id != null){
      svg_standings.selectAll(".labels").select("#"+team_highlighted)
        .style("fill", "white")
        .attr("font-weight", "normal");
      svg_standings.selectAll(".bars").select("#"+team_highlighted)
      .style("fill", "purple");
      svg_lollipop_chart.select(".labels").select("#"+team_highlighted)
        .style("fill", "white")
        .attr("font-weight", "normal");
      svg_lollipop_chart.select("line#"+team_highlighted)
        .attr("stroke", "purple")
      svg_lollipop_chart.select("circle#"+team_highlighted)
        .attr("fill", "white")
      svg_diverging_bar_chart.selectAll(".labels").select("#"+team_highlighted)
        .style("fill", "white")
        .attr("font-weight", "normal");
      svg_diverging_bar_chart.selectAll(".bars").select("#"+team_highlighted)
        .style("fill", function(){
          return svg_diverging_bar_chart.selectAll(".bars").select("#"+team_highlighted).attr("x")
            < coordXbarraVerde ? "red" : "green" 
        })
    }

    if(team_highlighted != id && id != null){
      svg_standings.selectAll(".labels").select("#"+id)
        .style("fill", "yellow")
        .attr("font-weight", "bold");
      svg_standings.selectAll(".bars").select("#"+id)
        .style("fill", "yellow");
      svg_lollipop_chart.select(".labels").select("#"+id)
        .style("fill", "yellow")
        .attr("font-weight", "bold");
      svg_lollipop_chart.select("line#"+id)
        .attr("stroke", "yellow")
      svg_lollipop_chart.select("circle#"+id)
        .attr("fill", "yellow")
      svg_diverging_bar_chart.selectAll(".labels").select("#"+id)
        .style("fill", "yellow")
        .attr("font-weight", "bold");
      svg_diverging_bar_chart.selectAll(".bars").select("#"+id)
        .style("fill", "yellow")
    }

    document.getElementById("teamLogo").src = "/images/"+id+".png"

    if(team_highlighted == id){
      document.getElementById("teamLogo").src = ""
      team_highlighted = null;
    }
    else{
      document.getElementById("teamLogo").src = "/images/"+id+".png"
      team_highlighted = id;
    }   

}

function prepare_slider(){
  
  sliderSeasons.on("onchange", function(){
    aux = this.value()-1
    changeSeason(aux+"-"+this.value());
  })
}
