function Button(unique,title,color=null,bg_color=null){
    var div_id = "box_"+String(unique);
    var label = "On";
    var color = color;
    var title = String(title);
    var bg_color = bg_color;
    var value; //holds toggle value right now
    var unique = String(unique); //unique identifying number
    var overall_div = document.getElementById(div_id);
    var holder;
    var button_element;
    var setup = function(){
        //var button_title = document.createElement("div");
        //button_title.innerHTML=title;
        var handle = document.createElement("div");
        handle.setAttribute("class","handle");
        holder = document.createElement("div");
        holder.setAttribute("id", div_id+unique+"_holder");
        holder.setAttribute("class", "button_holder");
        //holder.appendChild(button_title);
        overall_div.appendChild(handle);
        overall_div.appendChild(holder);
        button_element = document.createElement("button");
        button_element.setAttribute("class","gui_button");
        button_element.setAttribute("id",div_id+unique+"button");
        button_element.innerHTML = title;
        holder.appendChild(button_element);
           
        if (bg_color===null || color===null){
            console.log("no color");
        }else{
            button_element.setAttribute("style","background-color:"+bg_color+";color: "+color);
        }
        //$("#"+div_id+unique+"_holder").trigger("create");
    }
    setup();

    button_element.addEventListener("mousedown",function(){
        var local_change = new CustomEvent('ui_change',{detail:{"message":String(unique)+":"+String(true)}});
        document.dispatchEvent(local_change);
        //var local_change = new CustomEvent('ui_change',{unique:"True"});
        //document.dispatchEvent(local_change);        
    });
    button_element.addEventListener('mouseup',function(){
        var local_change = new CustomEvent('ui_change',{detail:{"message":String(unique)+":"+String(false)}});
        document.dispatchEvent(local_change);
    });

};
