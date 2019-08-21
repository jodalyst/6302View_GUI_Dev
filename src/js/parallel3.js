function Parallel_Plot(div_id,num_values,labels,plot_width,plot_height,max_val,min_val,color,unique,type){
  console.log("making a " + type + " graph with id=" + unique + "!");
  console.log("graph has " + num_values + " number of values!");
  console.log("graph will be " + color);

  var start_max = max_val;
  var start_min = min_val;
  var self = this; //handles weird scoping issues
  var margin = {top: 20, right: 30, bottom: 30, left: 40};
  this.axisPadding = 20+margin.left;
  this.dataArray = []; //used to determine spaced needed to allocate for bars
  for(i = 0; i < num_values; i++){
    self.dataArray[i] = 0;
  }

  //create scale for bars
  var scaler = d3.scale.linear()
                .domain([min_val,max_val])
                .range([0,plot_height-margin.top-margin.bottom]);

  //used to place labels for the x axis, also if type is line then also used to place circles
  var ticks = [];
  for(i=0;i<num_values;i++){
    ticks[i] = (i* (plot_width-self.axisPadding)/self.dataArray.length)+self.axisPadding + ((plot_width-self.axisPadding)/self.dataArray.length-20)/2;
  }
  var tickLabels = labels;
  var max = (plot_height-margin.top);
  var min = (margin.bottom+min_val);
  var overall = d3.select("#" + div_id).append("div").attr("id",div_id + unique + "_overall");
  var title = overall.append("div").attr("class","plot_title").attr("id",div_id+unique+"_title").html(div_id);
  var top = overall.append("div").attr("class","chart").attr("id",div_id+unique+"top");

  $("#"+div_id+unique+"top").prepend("<div class ='v_button_container' id = \""+div_id+unique+"BC2\" >");
  $("#"+div_id+unique+"BC2").append("<button class='scalerp' id=\""+div_id+unique+"VP\">Z+</button>");
  $("#"+div_id+unique+"BC2").append("<button class='scalerp' id=\""+div_id+unique+"RS\">RS</button>");
  $("#"+div_id+unique+"BC2").append("<button class='scalerp' id=\""+div_id+unique+"VM\">Z-</button>");
  $("#"+div_id+unique+"top").prepend("<div class ='v_button_container' id = \""+div_id+unique+"BC1\" >");
  $("#"+div_id+unique+"BC1").append("<button class='scalerp' id=\""+div_id+unique+"OI\">O+</button>");
  $("#"+div_id+unique+"BC1").append("<button class='scalerp' id=\""+div_id+unique+"OD\">O-</button>");
  function build_plot(){
    //create x axis scale
    var xScale = d3.scale.linear().domain([margin.left,plot_width]).range([margin.left,plot_width]);
    //create y axis scale
    var yScale = d3.scale.linear()
                  .domain([min_val,max_val])
                  .range([plot_height-margin.top,margin.bottom]);

    //create svg
    this.svg = top.append("svg")
            .attr("height",plot_height+"px")
            .attr("width",plot_width+"px")
            .style("display", "inline-block")
            .attr("id","svg_for_p" + unique);
    this.svg.append("defs").append("svg:clipPath").attr("id",unique+"clip")
    .append("svg:rect").attr("id",unique+"clipRect").attr("x",margin.left)
    .attr("y",margin.top).attr("width",plot_width-margin.left).attr("height",plot_height-margin.bottom-margin.top);

    //create x axis
    this.xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickValues(ticks)
    .tickFormat(function(d,i){ return tickLabels[i] });

    this.svg.append("g").attr("class", "x axis").call(this.xAxis).attr("transform","translate(0,"+(plot_height-margin.bottom)+")");

    //create y axis
    this.yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(15).tickValues(yScale.ticks().concat(yScale.domain()));
    this.svg.append("g").attr("class", "y axis").attr("transform","translate("+margin.left+","+(margin.top-margin.bottom)+")").call(this.yAxis);

    //create the grid
    this.y_grid = d3.svg.axis().scale(yScale).orient("left").ticks(15).tickSize(-plot_width, 1, 1).tickFormat("").tickValues(yScale.ticks().concat(yScale.domain()));
    this.svg.append("g").attr("class", "grid")
          .attr("transform","translate("+margin.left+","+(margin.top-margin.bottom)+")").call(this.y_grid);

    if(type == "bar"){
    //make the bars
    this.svg.append("g").attr("class","bar_container").selectAll("rect")
    .data(self.dataArray).enter().append("rect")
    .attr("height",function(d,i){return scaler(d);})
    .attr("width",function(){return (plot_width-self.axisPadding)/self.dataArray.length-20;})
    .attr("x",function(d,i){
      return (i* (plot_width-self.axisPadding)/self.dataArray.length)+self.axisPadding;
    })
    .attr("transform","scale(1,-1) translate(0,-200)")
    .attr("y",function(d,i){return plot_height-d/10+"px";}).attr("class","bar")
    .style("fill",color);
    }

    else if(type == "line"){
      //make lines
      this.svg.append("g").attr("class","bar_container").attr("clip-path","url(#" + unique+"clip)").selectAll("circle")
      .data(self.dataArray).enter().append("circle")
      .attr("cy",function(d,i){return scaler(d);})
      .attr("stroke",color)
      .attr("stroke-width","3")
      .attr("r","1")
      .attr("cx",function(d,i){
        return ticks[i];
      })
      .attr("class","circle_parallel")
      .style("fill",color);
      for(i = 0; i<self.dataArray.length-1;i++){

        d3.select("#svg_for_p"+unique).select(".bar_container").append("line")
        .attr("id","line"+i)
        .attr("x1",ticks[i])
        .attr("y1",function(d,i){return scaler(d);})
        .attr("y2",function(d,i){return scaler(d);})
        .attr("x2",ticks[i+1])
        .attr("stroke",color)
        .attr("stroke-width","1");
      }

    }
  }
  build_plot();
  function update_scale(){
    yScale = d3.scale.linear()
                .domain([min_val,max_val])
                .range([max,min]);
    scaler = d3.scale.linear()
                .domain([min_val,max_val])
                .range([0,plot_height-margin.top-margin.bottom]);
    update_graph();
  }

  $(document).on("click", ".scalerp",function(event){
      // console.log(event.target.id);
      switch(event.target.id){
          case div_id+unique+"VM":
              max_val = max_val*2;
              update_scale();
              console.log("minus!");
              break;
          case  div_id+unique+"VP":
              max_val = max_val/2;

              update_scale();
              console.log("plus!");
              break;
          case  div_id+unique+"RS":
              max_val = start_max;
              min_val = start_min;

              update_scale();
              console.log("reset!");
              break;

           case  div_id+unique + "OI":
              max_val-= start_max*0.2;
              min_val-= start_max*0.2;
              update_scale();
              console.log("offset increase!");
              break;

           case  div_id+unique + "OD":
              max_val+= start_max*0.2;
              min_val+= start_max*0.2;
              update_scale();
              console.log("offset!");
              break;
    }});

    function update_graph(){
      console.log(yScale(5));
      //remove svg
      d3.select("#svg_for_p"+unique).remove();
      build_plot();

      }
      var element = d3.select(".x.axis").node();
      var bottom_padding = element.getBoundingClientRect().height;
    console.log("gonna add this " + bottom_padding);

  this.step_p = function(values){
    var newData = [];
    for(i = 0; i<values.length;i++){
      newData[i] = scaler(values[i]);
    }
    if(type == "bar"){
    d3.select("#svg_for_p"+unique).selectAll(".bar")
    .attr("transform","scale(1,-1)")
    .attr("height",function(d,i){
      return (newData[i] + "px");})
    .attr("y",function(d,i){
        return  -1*plot_height+margin.bottom;});
    }
    else if(type == "line"){
      d3.select("#svg_for_p"+unique).selectAll(".circle_parallel")
      .attr("cy",function(d,i){
        return (newData[i]);})
        .attr("transform","scale(1,-1) translate(0," + -1*(plot_height-margin.bottom) + ")");
      for(i = 0;i<newData.length-1;i++){
      d3.select("#svg_for_p"+unique).select("#line"+i)
      .attr("y1",newData[i])
      .attr("y2",newData[i+1])
      .attr("transform","scale(1,-1) translate(0,"+ -1*(plot_height-margin.bottom) + ")");
      }
    }
  }
}
