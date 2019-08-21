// Storage array for joysticks
var options = new Array();
var joysticks = new Array();

function Joystick(div_id,name,mode,size,color,unique,catchdistance=null,config=false,static=false){
	// If you're building your joystick using main.js from the config.json, it builds here
	if ( config ) {
		var container = document.createElement("div");
		$(container).addClass('draggable joystick-container sbs dump');
		$(container).css({
			height: size,
			width: size,
			border: '1px dashed #CCC',
			padding: '0.5em',
		});
		var package = document.createElement("div");
		$(package).addClass('joystick-item');
		$(package).attr('id',div_id);
		$(package).attr('unique',unique);
		$(package).css({
			top: 0,
			left: 0,
			position:'relative',
			height: size,
			width: size,
		});
		$(package).appendTo(container);
		$(container).appendTo($("#drag_container")).trigger("create");	
	};
	// Compile the options	
	switch (mode) {
		case 'dynamic':
			var option = {
				zone: document.getElementById(div_id),
				color: color,
				size: size,
			};
			break;
		case 'semi':
			var option = {
				zone: document.getElementById(div_id),
				mode: 'semi',
				catchdistance: catchdistance,
				color: color,
				size: size,
			};
			break;
		case 'static':
			var option = {
				zone: document.getElementById(div_id),
				mode: 'static',
				position: {left: '50%', top: '50%'},
				color: color,
				size: size,
			};
			break;
	};
	// If the joystick is going to be built for a static page (i.e. not shape-shifted)
	if ( static ) {
		var joystick = nipplejs.create(option);
		bindNipple(joystick)
		joysticks.push(joystick);
	}
	// Add joystick configuration to array for buildJoysticks()
	options.push(option);
};

// Function that takes goes through joystick configs stored in options array and builds them
function buildJoysticks(){
	for(var i = 0; i < options.length; i++){
		var joystick = nipplejs.create(options[i]);
		bindNipple(joystick);
		joysticks.push(joystick);
	};
};

// Function that goes throuhg all active joysticks (stored in joysticks...)
function clearJoysticks(){
	for(var i = 0; i < joysticks.length; i++){
		joysticks[i].destroy();
	};
};

// Function that destroys and rebuilds joysticks (good for when the page moves around)
function fixJoysticks(){
	clearJoysticks();
	buildJoysticks();
}

// Function that binds every nipple object to it's actions and calls debug from here
function bindNipple (joystick) {
    joystick.on('start end', function (evt, data) {
        log(data);
    }).on('move', function (evt, data) {
        log(data);
    });
}

// Function that will log elements
function log (obj) {
    setTimeout(function () {
        console.log(obj);
    }, 0);
}