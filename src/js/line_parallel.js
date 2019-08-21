function Line_Parallel_Plot(div_id,name,num_values,plot_width,plot_height,max_val,min_val,color,unique){
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


  var max = (plot_height-margin.top);
  var min = (margin.bottom+min_val);

  var overall = d3.select("#" + div_id).append("div").attr("id",div_id + unique + "_overall");

  var title = overall.append("div").attr("class","plot_title").attr("id",div_id+unique+"_title").html(name);
  var top = overall.append("div").attr("class","chart").attr("id",div_id+unique+"top");

  $("#"+div_id+unique+"top").prepend("<div class ='v_button_container' id = \""+div_id+unique+"BC2\" >");
  $("#"+div_id+unique+"BC2").append("<button class='scaler' id=\""+div_id+unique+"VP\">Z+</button>");
  $("#"+div_id+unique+"BC2").append("<button class='scaler' id=\""+div_id+unique+"RS\">RS</button>");
  $("#"+div_id+unique+"BC2").append("<button class='scaler' id=\""+div_id+unique+"VM\">Z-</button>");
  $("#"+div_id+unique+"top").prepend("<div class ='v_button_container' id = \""+div_id+unique+"BC1\" >");
  $("#"+div_id+unique+"BC1").append("<button class='scaler' id=\""+div_id+unique+"OI\">O+</button>");
  $("#"+div_id+unique+"BC1").append("<button class='scaler' id=\""+div_id+unique+"OD\">O-</button>");
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
    this.xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickValues(ticks).tickFormat(function (d) { return ''; });
    //hide ticks

    this.svg.append("g").attr("class", "x axis").call(this.xAxis).attr("transform","translate(0,"+(plot_height-margin.bottom)+")");
    d3.select(".x.axis").style("visibility","hidden")
    //create y axis
    this.yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(15).tickValues(yScale.ticks().concat(yScale.domain()));
    this.svg.append("g").attr("class", "y axis").attr("transform","translate("+margin.left+","+(margin.top-margin.bottom)+")").call(this.yAxis);

    //create the grid
    this.y_grid = d3.svg.axis().scale(yScale).orient("left").ticks(15).tickSize(-plot_width, 1, 1).tickFormat("").tickValues(yScale.ticks().concat(yScale.domain()));
    this.svg.append("g").attr("class", "grid")
          .attr("transform","translate("+margin.left+","+(margin.top-margin.bottom)+")").call(this.y_grid);



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
              max_val = max_val*1.5;
              update_scale();
              console.log("minus!");
              break;
          case  div_id+unique+"VP":
              max_val = max_val/1.5;

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
      //remove svg
      d3.select("#svg_for_p"+unique).remove();
      build_plot();

      }
      var element = d3.select(".x.axis").node();
      var bottom_padding = element.getBoundingClientRect().height;

  this.step = function(values){
    var newData = [];
    for(i = 0; i<values.length;i++){
      newData[i] = scaler(values[i]);
    }

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

function Time_Parallel(div_id,title,width,height,x_range,y_range,num_traces,colors, unique, dots= false, starting_vals = 10, socket=null){
    var div_id = div_id;
    var title = title;
    var unique = unique;
    var socket = socket;
    var colors = colors;
    var dots = dots;
    if (dots){
      var dots_mult = 1;
    }else{
      dots_mult = 0;
    }
    var y_range_orig = y_range.slice(0); //used for reset mechanisms.
    var x_range_orig = x_range.slice(0);
    var vals_orig = starting_vals;
    var y_range = y_range.slice(0);
    var num_traces = num_traces;
    var vals = starting_vals;
    var total_height = height;
    var xchange = false;
    var margin = {top: 20, right: 30, bottom: 30, left: 40};
    var data = [];
    for (var i = 0; i<num_traces; i++){
        data.push(d3.range(vals).map(function() { return 0; }));
    }
    var height = total_height - margin.top - margin.bottom;
    var total_width = width;
    var overall_div = document.getElementById(div_id);  //overall handler to that dom element
    var width = total_width - margin.right - margin.left;
    var overall = document.createElement('div');
    overall.setAttribute("id", div_id+unique+"_overall");
    document.getElementById(div_id).appendChild(overall);
    var title_div = document.createElement('div');
    title_div.setAttribute("id", div_id+unique+"_title");
    title_div.setAttribute("class", div_id+unique+"plot_title");
    overall.appendChild(title_div);
    var top_row = document.createElement('div');
    top_row.setAttribute('id', div_id+unique+"top");
    top_row.setAttribute('class',"chart");
    overall.appendChild(top_row);
    var bottom_row = document.createElement('div');
    bottom_row.setAttribute('id', div_id+unique+"bot");
    bottom_row.setAttribute('class',"h_chart");
    overall.appendChild(bottom_row);
    var line;
    var traces;
    

    var x_axis;
    var y_axis;
    var x;
    var y;
    var x_grid;
    var y_grid;
    var chart;
    var chartBody;
    
    var draw_plot_region = function(){
        if (xchange){
            xchange = false;
            if (vals> data[0].length){//increasing amount
                for (var i = 0; i<num_traces;i++){
                    var tempdata = d3.range(vals-data[i].length).map(function() { return 0; });
                    data[i] = tempdata.concat(data[i]);
                }
            }else if (vals< data[0].length){
                var to_remove = data[0].length-vals;
                for(var i =0; i<num_traces; i++){
                    data[i] = data[i].slice(-vals);
                }
            }
        }
        chart = d3.select("#"+div_id+unique+"top").append("svg")
        .attr("id","svg_for_"+div_id+unique).attr("width",total_width).attr("height",total_height).attr('style',"display:inline-block;").attr("class", "gsc");
        y = d3.scale.linear().domain([y_range[0],y_range[1]]).range([height,0]);
        x = d3.scale.linear().domain([x_range[0],x_range[1]]).range([0,width]);
        x_axis = d3.svg.axis().scale(x).orient("bottom").ticks(11);
        y_axis = d3.svg.axis().scale(y).orient("left").ticks(11);
        x_grid = d3.svg.axis().scale(x).orient("bottom").ticks(20).tickSize(-height, 0, 0).tickFormat("");
        y_grid = d3.svg.axis().scale(y).orient("left").ticks(11).tickSize(-width, 0, 0).tickFormat("");
        chart.append("g").attr("transform","translate("+margin.left +","+ margin.top + ")");
        chart.append("g").attr("class", "grid").attr("transform","translate("+margin.left+","+(height+margin.top)+")").call(x_grid);
        chart.append("g").attr("class", "grid").attr("transform","translate("+margin.left+","+margin.top+")").call(y_grid);
        clippy = chart.append("defs").append("svg:clipPath").attr("id",div_id+unique+"clip").append("svg:rect").attr("id",div_id+unique+"clipRect").attr("x",margin.left).attr("y",margin.top).attr("width",width).attr("height",height);
        chartBody = chart.append("g").attr("clip-path","url(#"+div_id+unique+"clip"+")");
        line = new d3.svg.line().x(function(d, i) { return x(i)+margin.left; }.bind(this)).y(function(d, i) { return y(d)+margin.top; }.bind(this));
        traces = [];
        for (var i=0; i<num_traces; i++){
            traces.push(chartBody.append("path").datum(data[i]).attr("class","line").attr("d",line).attr("stroke",colors[i]));
            if (dots){
              traces.push(chartBody.append("circle").attr("cy",function(d,i){return scaler(d);}).attr("stroke",color)
                .attr("stroke-width","3").attr("r","1").attr("cx",function(d,i){return ticks[i];})
                .attr("class","circle_parallel").style("fill",colors[i]));
            }
        }
        chart.append("g").attr("class", "x axis").attr("transform","translate("+margin.left+","+(height+margin.top)+")").call(x_axis).selectAll("text")
        .attr("y", -5).attr("x", 20).attr("transform", "rotate(90)");
        chart.append("g").attr("class", "y axis").attr("transform","translate("+margin.left+","+margin.top+")").call(y_axis);
    };
    draw_plot_region();
    var BC2 = document.createElement('div');
    BC2.setAttribute("id", div_id+unique+"BC2");
    BC2.setAttribute("class", "v_button_container");
    top_row.insertBefore(BC2,top_row.firstChild); 
    //$("#"+div_id+unique+"top").prepend("<div class ='v_button_container' id = \""+div_id+unique+"BC2\" >");
    $("#"+div_id+unique+"BC2").append("<button class='scaler' id=\""+div_id+unique+"VP\">Z+</button>");
    $("#"+div_id+unique+"BC2").append("<button class='scaler' id=\""+div_id+unique+"VRS\">RS</button>");
    $("#"+div_id+unique+"BC2").append("<button class='scaler' id=\""+div_id+unique+"VM\">Z-</button>");
    var BC1 = document.createElement('div');
    BC1.setAttribute("id", div_id+unique+"BC1");
    BC1.setAttribute("class", "v_button_container");
    top_row.insertBefore(BC1,top_row.firstChild); 
    //$("#"+div_id+unique+"top").prepend("<div class ='v_button_container' id = \""+div_id+unique+"BC1\" >");
    $("#"+div_id+unique+"BC1").append("<button class='scaler' id=\""+div_id+unique+"OI\">O+</button>");
    $("#"+div_id+unique+"BC1").append("<button class='scaler' id=\""+div_id+unique+"OD\">O-</button>");
    var BC4 = document.createElement('div');
    BC4.setAttribute("id", div_id+unique+"BC4");
    BC4.setAttribute("class", "h_button_container");
    bottom_row.appendChild(BC4);
    //$("#"+div_id+unique+"bot").append("<div class ='h_button_container' id = \""+div_id+unique+"BC4\" >");
    $("#"+div_id+unique+"BC4").append("<button class='scaler' id=\""+div_id+unique+"HM\">Z-</button>");
    $("#"+div_id+unique+"BC4").append("<button class='scaler' id=\""+div_id+unique+"HRS\">RS</button>");
    $("#"+div_id+unique+"BC4").append("<button class='scaler' id=\""+div_id+unique+"HP\">Z+</button>");
    var BC3 = document.createElement('div');
    BC3.setAttribute("id", div_id+unique+"BC3");
    BC3.setAttribute("class", "h_button_container");
    bottom_row.appendChild(BC3) 
    //$("#"+div_id+unique+"top").prepend("<div class ='v_button_container' id = \""+div_id+unique+"BC1\" >");
    $("#"+div_id+unique+"BC3").append("<button class='scaler' id=\""+div_id+unique+"HOD\">O-</button>");
    $("#"+div_id+unique+"BC3").append("<button class='scaler' id=\""+div_id+unique+"HOI\">O+</button>");

    this.step = function(values){
            //this.trace.attr("d",this.line).attr("transform",null).transition().duration(0).ease("linear").attr("transform","translate("+this.x(-1)+",0)");
            for (var i=0; i<values.length; i++){
                traces[(dots_mult+1)*i].attr("d",line).attr("transform",null);
                for (var j=0; j<values[i].length;j++){
                    data[(dots_mult+1)*i] = values[i];
                    //data[i].push(values[i][j]);
                    //data[i].shift();
                }
            }
    };
    var steppo = this.step; //need to do this for scoping issues when we get inside the socket callback!
    var update_scales = function(){
        d3.select("#svg_for_"+div_id+unique).remove();
        draw_plot_region();
    };
    if (socket != null){
        socket.on("update_"+unique,function(values){steppo(values);});
    }
    $("#"+div_id).on("click",function(event){
        switch(event.target.id){
            case div_id+unique+"VM": 
                var parent_range = y_range[1] - y_range[0];
                var parent_mid = (y_range[1] - y_range[0])/2 + y_range[0];
                y_range[1] = (y_range[1] - parent_mid)*2+parent_mid;
                y_range[0] = parent_mid-(parent_mid - y_range[0])*2;
                update_scales();
                break;
            case div_id+unique+"VP":
                var parent_range = y_range[1] - y_range[0];
                var parent_mid = (y_range[1] - y_range[0])/2 + y_range[0];
                y_range[1] = (y_range[1] - parent_mid)*0.5+parent_mid;
                y_range[0] = parent_mid-(parent_mid - y_range[0])*0.5;
                update_scales();
                break;
            case div_id+unique+"VRS":
                y_range =y_range_orig.slice(0);
                update_scales();
                break;
            case div_id+unique+"HM": 
                var parent_range = x_range[1] - x_range[0];
                var parent_mid = (x_range[1] - x_range[0])/2 + x_range[0];
                x_range[1] = (x_range[1] - parent_mid)*2+parent_mid;
                x_range[0] = parent_mid-(parent_mid - x_range[0])*2;
                update_scales();
                break;
            case div_id+unique+"HP":
                var parent_range = x_range[1] - x_range[0];
                var parent_mid = (x_range[1] - x_range[0])/2 + x_range[0];
                x_range[1] = (x_range[1] - parent_mid)*0.5+parent_mid;
                x_range[0] = parent_mid-(parent_mid - x_range[0])*0.5;
                update_scales();
                break;
            case div_id+unique+"HRS":
                x_range =x_range_orig.slice(0);
                vals =vals_orig;
                xchange = true;
                update_scales();
                break;
            case div_id+unique+"HOD":
                var diff = x_range[1] - x_range[0];
                var tp = diff*0.1;
                x_range[1] = x_range[1]+tp;
                x_range[0]=x_range[0]+tp;
                update_scales();
                break;
            case div_id+unique+"HOI":
                var diff = x_range[1] - x_range[0];
                var tp = diff*0.1;
                x_range[1] = x_range[1]-tp;
                x_range[0] = x_range[0]-tp;
                update_scales();
                break;
            case div_id+unique+"OD":
                var diff = y_range[1] - y_range[0];
                var tp = diff*0.1;
                y_range[1] = y_range[1]+tp;
                y_range[0]=y_range[0]+tp;
                update_scales();
                break;
            case div_id+unique+"OI":
                var diff = y_range[1] - y_range[0];
                var tp = diff*0.1;
                y_range[1] = y_range[1]-tp;
                y_range[0] = y_range[0]-tp;
                update_scales();
                break;
        }
    });
};

            // case div_id+unique+"HM":
            //     if (vals >4){
            //         vals = Math.round(vals/2);
            //     }
            //     xchange = true;
            //     update_scales();
            //     break;
            // case div_id+unique+"HP":
            //     vals = vals*2;
            //     xchange = true;
            //     update_scales();
            //     break;




