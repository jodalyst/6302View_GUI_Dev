function Toggle(unique,title,names=["OFF","ON"]){
    var div_id = "box_"+String(unique);
    var title = String(title);
    var names = names; //should be 2-long array of values for when switch is low or high
    var val; //holds toggle value right now at any given moment
    var unique = String(unique); //unique identifying number
    var built = false;
    var title_disp; //title of module
    var slider; //div containing slider
    var holder; //div containing title, value, and slider
    var slider_input; //actual "checkbox"
    var label; //needed for css rendering for=divid of slider_input
    var value_div;  //value displayed in module
    var setup = function(){
        var overall_div = document.getElementById(div_id);
        holder = document.createElement('div');
        holder.setAttribute("id", div_id+unique+"_holder");
        holder.setAttribute("class", "toggle_holder");
        overall_div.appendChild(holder);
        title_disp = document.createElement('div');
        value_div = document.createElement('div');
        title_disp.setAttribute("id",div_id+unique+"_title");
        value_div.setAttribute("id",div_id+unique+"_value");
        title_disp.setAttribute("class","handle toggle_title");
        title_disp.innerHTML=title;
        value_div.innerHTML = names[0];
        value_div.setAttribute("class","toggle_value");
        slider = document.createElement('div');
        slider.setAttribute("class","ckbx-style-8");
        slider_input = document.createElement('input');
        slider_input.setAttribute("type","checkbox");
        slider_input.setAttribute("name",div_id+unique+"_checkbox");
        slider_input.setAttribute("id",div_id+unique+"_checkbox");
        slider_input.setAttribute("value",1);
        slider_input.setAttribute("name", div_id+unique+"_checkbox");
        label = document.createElement("label");
        label.setAttribute("for",div_id+unique+"_checkbox"); 
        holder.setAttribute("class", "toggle");
        holder.appendChild(title_disp);
        holder.appendChild(value_div);
        holder.appendChild(slider);
        slider.appendChild(slider_input);
        slider.appendChild(label);
        built = true;
         
    }

    this.update = function(value){
        if(value) slider_input.checked = true;
        else slider_input.checked = false;
        value_div.innerHTML = names[slider_input.checked?1:0];
    }
    this.value = function(){
        return slider_input.checked?1:0;
    }

    setup();
    var checko = function(element){
        ///value_div.innerHTML = names[slider_input.checked?1:0];
        //var local_change = new CustomEvent('ui_change',{unique:slider_input.checked});
        //document.dispatchEvent(local_change);     
        var local_change = new CustomEvent('ui_change',{detail:{"message":String(unique)+":"+String(slider_input.checked)}});
        document.dispatchEvent(local_change);         
    }     
    slider_input.addEventListener('change', checko, false);
};
