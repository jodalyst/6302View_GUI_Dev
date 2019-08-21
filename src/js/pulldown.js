function Pulldown(div_id,unique,title,names,socket=null){
    var div_id = String(div_id);
    var title = String(title);
    var names = names; //should be 2-long array of values for when switch is low or high
    var value; //holds toggle value right now
    var unique = String(unique); //unique identifying number
    var socket = socket;
    var built = false;
    var holder; //div containing title, value, and pullldown
    var overall_div = document.getElementById(div_id);
    var title_disp; //title of module
    var pulldowner;
    var options = [];
    var setup = function(){
        holder = document.createElement('div');
        overall_div.appendChild(holder);
        holder.setAttribute("id", div_id+unique+"_holder");
        holder.setAttribute("class", "pd_holder");
        pulldowner = document.createElement('select');
        pulldowner.setAttribute('name',div_id+unique+"pulldowner");
        pulldowner.setAttribute('id',div_id+unique+"pulldown");     
        title_disp = document.createElement('div');
        title_disp.setAttribute("id",div_id+unique+"_title");
        title_disp.setAttribute("class","pd_title");
        title_disp.innerHTML=title;
        for (var i=0; i<names.length; i++){
            options.push(document.createElement('option'));
            options[i].setAttribute('value',names[i]);
            options[i].innerHTML = names[i];
            pulldowner.appendChild(options[i]);
        }
        holder.appendChild(title_disp);
        holder.appendChild(pulldowner);
        built = true;
        //$("#"+div_id+unique+"_holder").trigger("create");
    }
    setup();
    if (socket != null){
        socket.on("update_"+unique,function(va){console.log("hit");
            if (built){
                for (var i=0; i<options.length; i++){
                    pulldowner.removeChild(options[i]);
                }
                options = [];
                for (var i=0; i<va['options'].length; i++){
                    options.push(document.createElement('option')); 
                    options[i].setAttribute('value',va['options'][i]);
                    options[i].innerHTML = va['options'][i];
                    pulldowner.appendChild(options[i]); 
                }
            } 

        });

        pulldowner.addEventListener('change',function(){
            socket.emit('reporting', {'unique':unique, 'data':pulldowner.value});
        });
    };
};
