var ui_change = new CustomEvent('ui_change');
var field_built = new CustomEvent('field_built');

//These two lines are used in conjunction with the ui_change event to make sure we don't fire hundreds off in a second for no reason(limits to ten max a second
var ready_to_fire = true;
var isActive = true;

//Use these when laying out colors!
var standard_colors = ["blue","red","green","yellow","purple"];
var mouseX=0;
var mouseY = 0;
document.addEventListener("mousemove",function(e){
        mouseX = e.pageX;
        mouseY = e.pageY;
});

//constants used for plot sizing:
var PLOT_HEIGHT = 200;
var PLOT_WIDTH = 300;


//constants used for WS state machine:
var IDLE = 0;
var BUILDING = 1; 
var UPDATE =2;
var RUNNING = 3;
//system state variable for WS state machine
var system_state = IDLE;

//data for building up csv logs:
var data_for_csv=[];
var recording_csv = false;
var csv_header_inputs = []; //headers of inputs in order
var csv_header_outputs = []; //headers of outputs in order

var csv_dom; 

//
var user_inputs = []; //array of hooks for toggle and slider objects

var div_list = [];
var unique_counter = 0;
var displayers = []; //array of hooks for plot and numerical reporter objects
var report_count = []; //total number of displays (will have length of modules)
var report_depth = []; //depth of displays

var old_input = [];

var current_inputs = [];

var ws;

var gui_land = document.getElementById("gui_land"); //where draggables end up!

window.onfocus = function () { 
  console.log("IN FOCUS");
  isActive = true; 
  document.body.style.background = "#eeeeee";
}; 

window.onblur = function () { 
  console.log("OUT OF FOCUS");
  isActive = false; 
  document.body.style.background = "red";
};

window.onload = function(){
    console.log("here");
    console.log(Cookies);
    var ip =  Cookies.get('ip');
    var port = Cookies.get("port");

    if (ip==undefined){
        ip = "127.0.0.1";
    }
    if (port==undefined){
        port = "6306";
    }
    document.getElementById("ipaddress").value = ip;
    document.getElementById("port").value = port;
    ws = new WebSocket("ws://"+ip+":"+port); //create new websocket to the ip of interest
    ws.binaryType="arraybuffer";
    ws.onopen = function(){
    // Web Socket is connected, send data using send()
      console.log("web socket established");
      ws.send("\n"); 
    }; 
    ws.onmessage = function (evt) {
        MessageParser(evt);
    };

    ws.onclose = function(){ 
      // websocket is closed.
      console.log("Connection is closed..."); 
    };  

    document.addEventListener("ui_change", inputEmit);
}

var inputEmit = function(e){
    ws.send(String(e.detail["message"])+"\n");
}

document.getElementById("ipportsubmit").addEventListener("mousedown",function(){
    var ip = document.getElementById("ipaddress").value; //collect the ip address
    var port = document.getElementById("port").value;
    //Should add in some checker/an alert that comes up if you can't actually connect.
    Cookies.set("ip",ip,{expiry : new Date(2030, 0, 1)});
    Cookies.set("port",port,{expiry : new Date(2030, 0, 1)});
    ws = new WebSocket("ws://"+ip+":"+port); //create new websocket to the ip of interest
    ws.binaryType="arraybuffer";
    ws.onopen = function(){
    // Web Socket is connected, send data using send()
      var buf = new Uint8Array(1);
      buf[0] = 10;
        ws.send("\n"); 
      //ws.send(buf); 
    }; 
    ws.onmessage = function (evt) {
        MessageParser(evt);
    };

    ws.onclose = function(){ 
      // websocket is closed.
    };  
});

document.getElementById("csv_enable").addEventListener("change",function() {
    if (document.getElementById("csv_enable").checked){
        recording_csv = true;
    }else{ //when you shut it off
        recording_csv = false;
        var nameo = document.getElementById("csv_name").value+"_"+String(Date.now()); //bingo was his nameo
        var header = [csv_header_inputs.concat(csv_header_outputs)];
        var to_out = header.concat(data_for_csv);
        exportCSV(nameo, to_out);
    }
});


var MessageParser = function(evt){
    var input = event.data;
    var raw_data = new Uint8Array(input);
    if (raw_data[0]==82){
        input = input.slice(1);
        var fa = new Float32Array(input);
        var data;
        var data_count=0;
        for (var i = 0; i < displayers.length; i++){
            data = [];
            for (var j = 0; j < report_count[i];j++){
                data.push([]);
                for (var k=0; k<report_depth[i]; k++){
                    data[j].push(fa[data_count]);
                    data_count+=1;
                }
            }
            displayers[i].step(data);
        }
        //not working right now:
        /*if(recording_csv){
            var fcsv = current_inputs.concat(actual);
            data_for_csv.push(fcsv);
        }*/
    }else if(raw_data[0]==66){ //build string packet!
        system_state = BUILDING;
        user_inputs = [];
        displayers = [];
        report_count = [];
        report_depth = [];
        WipeGUI();
        unique_counter = 0;
        csv_header_inputs = [];
        csv_header_outputs = []; 
        raw_data = raw_data.slice(1);
        var gaps = [];
        for (var i = 0; i < raw_data.length; i++){
            if (raw_data[i]==13) gaps.push(i);
        }
        var current_gap = 0;
        var build_array = [];
        build_array.push(String.fromCharCode.apply(null,raw_data.slice(0,gaps[0])));
        for (var i=0; i<gaps.length-1; i++){
            build_array.push(String.fromCharCode.apply(null,raw_data.slice(gaps[i]+1,gaps[i+1])));
        }
        var i = 0;
        unique_counter = 0;
        while (i <build_array.length){
            var newdiv = document.createElement("div"); //new div to house new widget
            newdiv.setAttribute("id","box_"+String(unique_counter)); //give it unique identifier
            div_list.push(newdiv); //push to div list (for overall DOM management
            newdiv.setAttribute("class","cp-item");
            gui_land.appendChild(newdiv);
            switch (build_array[i]){ //check the first part of build array for type of widget to build
                case "S": //slider
                    var title = build_array[i+1];
                    var low = parseFloat(build_array[i+2]);
                    var high = parseFloat(build_array[i+3]);
                    var res = parseFloat(build_array[i+4]);
                    console.log('here we go');
                    var toggle = build_array[i+5]==="True"?true:false;
                    console.log(toggle);
                    user_inputs.push(new Slider(unique_counter,title,low,high,res,toggle));
                    csv_header_inputs.push(title);
                    i+=6;
                    break;
                case "T": //toggle
                    var title = build_array[i+1];
                    csv_header_inputs.push(title);
                    user_inputs.push(new Toggle(unique_counter,title));
                    i+=2;
                    break;
                case "B": //button
                    var title = build_array[i+1];
                    csv_header_inputs.push(title);
                    user_inputs.push(new Button(unique_counter,title));
                    i+=2;
                    break;
                case "J": //joystick (NO  CLUE ON HOW TO FORMAT THIS ONE JDS7/30/2019)
                    var title = build_array[i+1];
                    var low = parseFloat(build_array[i+2]);
                    var high = parseFloat(build_array[i+3]);
                    var res = parseFloat(build_array[i+4]);
                    var toggle = build_array[i+5]==="1"?true:false;
                    user_inputs.push(new Joystick(unique_counter,title,low,high,res,toggle));
                    csv_header_inputs.push(title);
                    i+=6;
                    break;
                case "P": //plot:
                    var title = build_array[i+1];
                    var v_low = parseFloat(build_array[i+2]);
                    var v_high = parseFloat(build_array[i+3]);
                    var h_count = parseInt(build_array[i+4]);
                    var trace_depth = parseInt(build_array[i+5]); //need to change
                    var trace_count = parseFloat(build_array[i+6]);
                    report_count.push(trace_count);
                    report_depth.push(trace_depth);
                    if (trace_count ===1){
                        displayers.push(new Time_Series(unique_counter,title,PLOT_WIDTH,PLOT_HEIGHT,h_count,[v_low,v_high],1,["blue"]));
                        csv_header_outputs.push(title);
                    }else{
                        var colors = standard_colors.slice(0,trace_count+1);
                        displayers.push(new Time_Series(unique_counter,title,PLOT_WIDTH,PLOT_HEIGHT,h_count,[v_low,v_high],trace_count,colors));
                        for (var j = 0; j<trace_count;j++) csv_header_outputs.push(title+"_"+String(j));
                    }
                    i+=7;
                    break;
                case "N": //numerical reporter:
                    var title = build_array[i+1];
                    var type = build_array[i+2];
                    var depth = parseInt(build_array[i+3]); //need to change
                    report_count.push(1);
                    report_depth.push(depth);
                    displayers.push(new Numerical_Reporter("box_"+String(unique_counter),unique_counter,title,type,"red","black"));
                    csv_header_outputs.push(title);
                    i+=4;
                    break;
            }

            unique_counter+=1;
        }
        document.dispatchEvent(field_built);
    }if(raw_data[0]==68){ //debug message!
        console.log("Debug Message:\n"+String.fromCharCode.apply(null,evt.data.slice(1,evt.data.length-1)));
    }
};

var WipeGUI = function(){
    var len = div_list.length;
    for (var i = 0; i<len; i++){
        var to_junk = div_list.pop();
        to_junk.remove();
    }
};


//var rate_limit = setInterval(function(){ready_to_fire = true;},100); //leading to disconnects in slider and what gets sent down
/* Based off of code from here:
https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
*/
var exportCSV = function(filename, rows) {
    var processRow = function (row) {
        var finalVal = '';
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            };
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalVal += ',';
            finalVal += result;
        }
        return finalVal + '\n';
    };

    var csvFile = '';
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

var array_equals = function (array1,array2) {
    // if the other array is a falsy value, return
    if (!array1||!array2)
        return false;

    // compare lengths - can save a lot of time 
    if (array1.length != array2.length)
        return false;

    for (var i = 0, l=array1.length; i < l; i++) {
        if (array1[i] instanceof Array && array2[i] instanceof Array) {
            if(!array_equals(array1[i],array2[i])){
                return false;       
            }
        }           
        else if (array1[i] != array2[i]) { 
            return false;   
        }           
    }       
    return true;
}


var pckry;
var draggies = [];
var isDrag = false;

//window.addEventListener("load", function(){
document.addEventListener("field_built",function(){
  pckry = new Packery( '.cp', {
    itemSelector: '.cp-item',
    columnWidth: 1
  });
  // collection of Draggabillies
  pckry.getItemElements().forEach( function( itemElem ) {
    var draggie = new Draggabilly( itemElem ,{handle:'.handle'});
    draggies.push(draggie);
    pckry.bindDraggabillyEvents( draggie );
    draggie['disable']();
  });

});

document.getElementById("grid_lock").addEventListener("change",function() {
    // check if checkbox is checked
    var method = isDrag ? 'disable' : 'enable';
    draggies.forEach( function( draggie ) {
        draggie[ method ]();
    });
    // switch flag
    isDrag = !isDrag;
    if (isDrag){
        document.getElementById("grid_status").innerHTML = "Grid UnLocked";
    }else{
        document.getElementById("grid_status").innerHTML = "Grid Locked";
    }
    /*if (document.querySelector('#my-checkbox').checked) {
      // if checked
      console.log('checked');
    } else {
      // if unchecked
      console.log('unchecked');
    }*/
  });

// https://stackoverflow.com/questions/27078285/simple-throttle-in-js
function throttle(func, wait, options) {
  var context, args, result;
  var timeout = null;
  var previous = 0;
  if (!options) options = {};
  var later = function() {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function() {
    var now = Date.now();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};
