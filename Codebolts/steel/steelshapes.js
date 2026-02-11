/* SteelShapes v1.0.0 | (c) 2014 Jorge Andres Serrano Ardila */

/*
	Some references:
	Canvas in general -- http://www.html5canvastutorials.com/tutorials/html5-canvas-line-width/
	Arcs -- http://www.dbp-consulting.com/tutorials/canvas/CanvasArcTo.html
	1px blurred line -- http://stackoverflow.com/questions/7530593/html5-canvas-and-line-width
*/

 "use strict";
 
var X0,
	Y0,
	AVAILABLE_BEAM_HEIGHT_PIXELS,
	standardScale, STD_CANADIAN_SCALE, STD_AMERICAN_SCALE, STD_EUROPEAN_SCALE, STD_BRITISH_SCALE,
	SCALE,
	LINE_WIDTH,
	LINE_COLOR,
	FILL_COLOR,
	currentShapes, canadianShapes, americanShapes, europeanShapes, britishShapes,
	beamCoordinates,
	beamName,
	canv,
	context,
	xArray,	yArray,
	b, d, t, w, k, k1,
	b_det, d_det, t_det, w_det, k_det, k1_det,
	mass, area,	ix,	sx,	rx,	zx,	iy,	sy,	ry,	zy, j, cw,
	zoom, showDimensions,
	currentSpecName, CANADIAN_SPEC_NAME, AMERICAN_SPEC_NAME, EUROPEAN_SPEC_NAME, BRITISH_SPEC_NAME,
	currentShapeSetKey, selectedBeamByShapeSet;


$(document).ready(function() {
	 
	 if (isIE() === true){
		var msg = "Still using Internet Explorer?! <br/><br/> No offense friend, but please upgrade to a real browser otherwise this page will not work properly. They are all free. Get <a href='https://www.google.com/chrome/browser/'>Google Chrome</a>";
		$('#container').html('');
		$('#IE').html(msg);
		$('#IE').show();
	 }
	 
	 initializeVariables();
	showList();
	setMostListeners();
	// List's listener is set in its function.
	
});


function initializeVariables(){
	
	CANADIAN_SPEC_NAME = 'CISC Section Tables_SST92';
	AMERICAN_SPEC_NAME = 'AISC Shapes Database v14.1';
	EUROPEAN_SPEC_NAME = 'ArcelorMittal 2014_1';
	BRITISH_SPEC_NAME = 'ArcelorMittal 2014_1';
	currentSpecName = CANADIAN_SPEC_NAME;
	currentShapeSetKey = 'canadianShapes';
	selectedBeamByShapeSet = {};
	
	currentShapes = canadianShapes;
	
	AVAILABLE_BEAM_HEIGHT_PIXELS = 370;
	STD_CANADIAN_SCALE = AVAILABLE_BEAM_HEIGHT_PIXELS / 1118; // d = 1118mm is the tallest beam
	STD_AMERICAN_SCALE = AVAILABLE_BEAM_HEIGHT_PIXELS / 44; // d = 44in is the tallest beam
	STD_EUROPEAN_SCALE = AVAILABLE_BEAM_HEIGHT_PIXELS / 1138; // d = 1138mm is the tallest beam
	STD_BRITISH_SCALE = AVAILABLE_BEAM_HEIGHT_PIXELS / 1056; // d = 1056mm is the tallest beam
	standardScale = STD_CANADIAN_SCALE;
	
	LINE_WIDTH = 1;
	LINE_COLOR = '#484848';
	FILL_COLOR = '#484848';
	
	beamCoordinates = [];
	canv = document.getElementById("canvas");
	canv.width = 580;
	canv.height = 650;
	X0 = Math.round(canv.width/2);
	Y0 = 25;
	context = canv.getContext("2d");
	zoom = true;
	showDimensions = true;
}


function drawBeam(){
	
	setCoordDimsAndScale();
	
	var points = beamCoordinates[0].length; // will be the same as 'beamCoordinates[1].length'

	context.clearRect(0, 0, canv.width, canv.height);
	
	context.beginPath();
	context.moveTo(Math.round(beamCoordinates[0][0])+0.5, Math.round(beamCoordinates[1][0])+0.5);
	
	var inRadius = (k1-w/2 < k-t) ? (k1-w/2)*SCALE : (k-t)*SCALE;
	var outRadius = 0.3*t*SCALE;

	for (var i=1; i < points; i++){
		if (i == 3 || i == 4 || i == 9 || i == 10){
			// inside arc
			context.arcTo(Math.round(beamCoordinates[0][i])+0.5,
							Math.round(beamCoordinates[1][i])+0.5,
							Math.round(beamCoordinates[0][i+1])+0.5,
							Math.round(beamCoordinates[1][i+1])+0.5,
							inRadius);
		} else if (i == 2 || i == 5 || i == 8 || i == 11) {
			// outside arc
			context.arcTo(Math.round(beamCoordinates[0][i])+0.5,
							Math.round(beamCoordinates[1][i])+0.5,
							Math.round(beamCoordinates[0][i+1])+0.5,
							Math.round(beamCoordinates[1][i+1])+0.5,
							outRadius);
		} else {
			// line
			context.lineTo(Math.round(beamCoordinates[0][i])+0.5,
							Math.round(beamCoordinates[1][i])+0.5);
		}
	}
	
	context.lineWidth = LINE_WIDTH;
	context.strokeStyle = LINE_COLOR;
	context.fillStyle = FILL_COLOR;
	context.fill();
	context.stroke();

}


function writePropAndTitle(){
	
	var G,
		data,
		xCol1,
		xCol2,
		xCol3,
		yRow1,
		yRow2,
		yRow3,
		yRow4,
		deadLoad,
		x,
		y;
	
	G = 9.80665; // gravity
	xCol1 = 20;
	xCol2 = 210;
	xCol3 = 400;
	yRow1 = 540;
	yRow2 = yRow1 + 30;
	yRow3 = yRow2 + 30;
	yRow4 = yRow3 + 30;
	
	if (currentSpecName == CANADIAN_SPEC_NAME){	
		deadLoad = Math.round(mass*G/1000 * 100)/100;
		data = [['title',	'Dead Load: ',	'Area: ',	'Ix: ',      	'Sx: ',			'rx: ',		'Zx: ',			'Iy: ',			'Sy: ',			'ry: ',		'Zy: ',			'J: ',			'Cw: '],
			[beamName,	deadLoad,		area,    	ix,          	sx,				rx,			zx,				iy,				sy,				ry,			zy,				j,				cw],
			['',		'kN/m',			'mm^2',		'x10^6 mm^4',	'x10^3 mm^3',	'mm',		'x10^3 mm^3',	'x10^6 mm^4',	'x10^3 mm^3',	'mm',		'x10^3 mm^3',	'x10^3 mm^4',	'x10^9 mm^6'],
			[0,			xCol1,			xCol1,		xCol2,			xCol2,			xCol2,		xCol2,			xCol3,			xCol3,			xCol3,		xCol3,			xCol1,			xCol1],
			[0,			yRow1,			yRow2,		yRow1,			yRow2,			yRow3,		yRow4,			yRow1,			yRow2,			yRow3,		yRow4,			yRow3,			yRow4]];
	}
	
	if (currentSpecName == AMERICAN_SPEC_NAME){
		data = [['title',	'Dead Load: ',	'Area: ',	'Ix: ',      	'Sx: ',			'rx: ',		'Zx: ',			'Iy: ',			'Sy: ',			'ry: ',		'Zy: ',			'J: ',			'Cw: '],
				[beamName,	mass,		area,    	ix,          	sx,				rx,			zx,				iy,				sy,				ry,			zy,				j,				cw],
				['',		'lb/ft',		'in^2',		'in^4',			'in^3',			'in',		'in^3',			'in^4',			'in^3',			'in',		'in^3',			'in^4',			'in^6'],
				[0,			xCol1,			xCol1,		xCol2,			xCol2,			xCol2,		xCol2,			xCol3,			xCol3,			xCol3,		xCol3,			xCol1,			xCol1],
				[0,			yRow1,			yRow2,		yRow1,			yRow2,			yRow3,		yRow4,			yRow1,			yRow2,			yRow3,		yRow4,			yRow3,			yRow4]];
	}
	
	if (currentSpecName == EUROPEAN_SPEC_NAME || currentSpecName == BRITISH_SPEC_NAME){
		deadLoad = Math.round(mass*G/1000 * 100)/100;
		data = [['title',	'Dead Load: ',	'Area: ',	'Ix: ',      	'Sx: ',			'rx: ',		'Zx: ',			'Iy: ',			'Sy: ',			'ry: ',		'Zy: ',			'J: ',			'Cw: '],
				[beamName,	deadLoad,		area,    	ix,          	sx,				rx,			zx,				iy,				sy,				ry,			zy,				j,				cw],
				['',		'kN/m',			'mm^2',		'x10^4 mm^4',	'x10^3 mm^3',	'x10 mm',	'x10^3 mm^3',	'x10^4 mm^4',	'x10^3 mm^3',	'x10 mm',	'x10^3 mm^3',	'x10^4 mm^4',	'x10^9 mm^6'],
				[0,			xCol1,			xCol1,		xCol2,			xCol2,			xCol2,		xCol2,			xCol3,			xCol3,			xCol3,		xCol3,			xCol1,			xCol1],
				[0,			yRow1,			yRow2,		yRow1,			yRow2,			yRow3,		yRow4,			yRow1,			yRow2,			yRow3,		yRow4,			yRow3,			yRow4]];
	}
		
	// 'title'
	x = canvas.width / 2;
	y = 490;
	writeOneText('700', '30', 'Roboto', 'center', '#2B2B2B',  beamName, x, y);
	y = 505;
	writeOneText('400', '10', 'Roboto', 'center', '#484848',  currentSpecName, x, y);
	
	// 'data' except 'title'
	for (var i=1; i<data[0].length; i++){
		var s = String(data[0][i]) + String(data[1][i]) + ' ' + String(data[2][i]);
		writeOneText('400', '15', 'Roboto', 'left', '#2B2B2B',  s, data[3][i], data[4][i]);
	}
	
}


function drawDimensions(){
	var style = 4,
	which = 3,
	angle = Math.PI/8,
	dist = 12,
	aOff = 25,
	lOff = 10,
	x1,
	y1,
	x2,
	y2,
	tx,
	ty,
	distT = Math.round((d - 2*k)*100)/100,
	freeD = Math.round((d - 2*t)*100)/100;
	
	// 'b' dimension arrow. 
	// Function 'drawArrow()' takes care about pixel precision to draw the arrow
	x1 = X0 - b/2*SCALE;
	y1 = Y0 + d*SCALE + aOff;
	x2 = X0 + b/2*SCALE;
	y2 = y1;
	drawArrow (context,x1,y1,x2,y2,style,which,angle,dist);
	y1 = Y0 + d*SCALE + lOff;
	y2 = Y0 + d*SCALE + aOff + lOff;
	drawOneLine(x1,y1,x1,y2);
	drawOneLine(x2,y1,x2,y2);
	tx = X0;
	ty = Y0 + d*SCALE + aOff + 18;
	var b_show = currentSpecName == AMERICAN_SPEC_NAME ? b_det : b;	
	writeOneText('400', '15', 'Roboto', 'center', '#484848', b_show, tx, ty);
	
	// 'd' dimension arrow. 
	// Function 'drawArrow()' takes care about pixel precision to draw the arrow
	x1 = X0 - b/2*SCALE - 2*aOff;
	y1 = Y0;
	x2 = x1;
	y2 = Y0 + d*SCALE;
	drawArrow (context,x1,y1,x2,y2,style,which,angle,dist);
	x1 = X0 - b/2*SCALE - lOff;
	x2 = X0 - b/2*SCALE - 2*aOff - lOff;
	drawOneLine(x1,y1,x2,y1);
	drawOneLine(x1,y2,x2,y2);
	tx = X0 - b/2*SCALE - 2*aOff - 5;
	ty = Y0 + d/2*SCALE + 15/2;
	var d_show = currentSpecName == AMERICAN_SPEC_NAME ? d_det : d;	
	writeOneText('400', '15', 'Roboto', 'right', '#484848', d_show, tx, ty);
	
	// 'T' distance arrow. 
	// Function 'drawArrow()' takes care about pixel precision to draw the arrow
	x1 = X0 - b/2*SCALE - aOff;
	y1 = Y0 + k*SCALE;
	x2 = x1;
	y2 = Y0 + (d-k)*SCALE;
	drawArrow (context,x1,y1,x2,y2,style,which,angle,dist);
	x1 = X0 - w/2*SCALE - lOff;
	x2 = X0 - b/2*SCALE - aOff - lOff;
	drawOneLine(x1,y1,x2,y1);
	drawOneLine(x1,y2,x2,y2);
	tx = X0 - b/2*SCALE - aOff + 5;
	ty = Y0 + d/2*SCALE + 15/2;
	writeOneText('400', '15', 'Roboto', 'left', '#484848', distT, tx, ty);
	
	// 't' dimension arrows. 
	// Function 'drawArrow()' takes care about pixel precision to draw the arrow
	x1 = X0 + b/2*SCALE + aOff + 8;
	y1 = Y0 - aOff*0.9;
	x2 = x1;
	y2 = Y0;
	drawArrow (context,x1,y1,x2,y2,style,1,angle,dist);
	// The second arrow is drew by 'inside height' dimension
	x1 = X0 + b/2*SCALE + lOff;
	x2 = X0 + b/2*SCALE + aOff + lOff + 8;
	y1 = Y0;
	y2 = Y0 + t*SCALE;
	drawOneLine(x1,y1,x2,y1);
	drawOneLine(x1,y2,x2,y2);
	tx = X0 + b/2*SCALE + aOff + lOff + 13;
	ty = Y0 + t/2*SCALE + 14/2;
	var t_show = currentSpecName == AMERICAN_SPEC_NAME ? t_det : t;	
	writeOneText('400', '15', 'Roboto', 'left', '#484848', t_show, tx, ty);
	
	// 'w' dimension arrows. 
	// Function 'drawArrow()' takes care about pixel precision to draw the arrow
	x1 = X0 - w/2*SCALE - aOff*0.9;
	y1 = Y0 + (t + distT*0.30)*SCALE;
	x2 = X0 - w/2*SCALE;
	y2 = y1;
	drawArrow (context,x1,y1,x2,y2,style,1,angle,dist);
	x1 = X0 + w/2*SCALE + aOff*0.9;
	x2 = X0 + w/2*SCALE;
	drawArrow (context,x1,y1,x2,y2,style,1,angle,dist);
	tx = X0 + w/2*SCALE + aOff*0.9 + 3;
	ty = y1 + 14/2;
	var w_show = currentSpecName == AMERICAN_SPEC_NAME ? w_det : w;	
	writeOneText('400', '15', 'Roboto', 'left', '#484848', w_show, tx, ty);
		
	// 'k' dimension arrows. 
	// Function 'drawArrow()' takes care about pixel precision to draw the arrow
	x1 = X0 - b/2*SCALE - aOff;
	y1 = Y0 + d*SCALE + aOff*0.9;
	x2 = x1;
	y2 = Y0 + d*SCALE;
	drawArrow (context,x1,y1,x2,y2,style,1,angle,dist);
	tx = X0 - b/2*SCALE - aOff;
	ty = y1 + 17;
	var k_show = currentSpecName == AMERICAN_SPEC_NAME ? k_det : k;	
	writeOneText('400', '15', 'Roboto', 'right', '#484848', k_show, tx, ty);
	
	// 'inside height' : variable 'freeD' dimension arrow. 
	// Function 'drawArrow()' takes care about pixel precision to draw the arrow
	x1 = X0 + b/2*SCALE + aOff + 8;
	y1 = Y0 + t*SCALE;
	x2 = x1;
	y2 = Y0 + (d-t)*SCALE;
	drawArrow (context,x1,y1,x2,y2,style,which,angle,dist);
	x1 = X0 + b/2*SCALE + lOff;
	x2 = X0 + b/2*SCALE + aOff + lOff + 8;
	drawOneLine(x1,y2,x2,y2);
	tx = X0 + b/2*SCALE + aOff + lOff + 13;
	ty = Y0 + d/2*SCALE + 14/2;
	writeOneText('400', '15', 'Roboto', 'left', '#484848', freeD, tx, ty);
	
}


function drawOneLine(x1,y1,x2,y2){
	x1 = Math.round(x1)+0.5;
	y1 = Math.round(y1)+0.5;
	x2 = Math.round(x2)+0.5;
	y2 = Math.round(y2)+0.5;
	
	context.beginPath();
	context.moveTo(x1,y1);
	context.lineTo(x2,y2);
	context.lineWidth = 1;
	context.strokeStyle = LINE_COLOR;
	context.stroke();
}


function writeOneText(weight, size, font, align, color, text, x, y){
	var f = weight + ' ' + size + 'px ' + font;
	context.font = f;
	context.textAlign = align; // as string
	context.fillStyle = color; // as string
	context.fillText(text, x, y);
}


function setCoordDimsAndScale(){
	// It sets:
	// The scaled coordinates to array variable
	// The unscaled dimensions to various variables
	// The apropriate scale
	
	for (var i=0; i < currentShapes.row.length; i++){
		
		if (currentShapes.row[i].name === beamName){
			
			beamCoordinates=[];
			xArray = [];
			yArray = [];
			
			b = parseFloat(currentShapes.row[i].b);
			d = parseFloat(currentShapes.row[i].d);
			t = parseFloat(currentShapes.row[i].t);
			w = parseFloat(currentShapes.row[i].w);
			k = parseFloat(currentShapes.row[i].k);
			k1 = parseFloat(currentShapes.row[i].k1);
			
			if (currentSpecName == AMERICAN_SPEC_NAME){
				b_det = String(currentShapes.row[i].b_det);
				d_det = String(currentShapes.row[i].d_det);
				t_det = String(currentShapes.row[i].t_det);
				w_det = String(currentShapes.row[i].w_det);
				k_det = String(currentShapes.row[i].k_det);
				k1_det = String(currentShapes.row[i].k1_det);
			}			
			
			mass = parseFloat(currentShapes.row[i].mass);
			area = parseFloat(currentShapes.row[i].a);
			ix = parseFloat(currentShapes.row[i].ix);
			sx = parseFloat(currentShapes.row[i].sx);
			rx = parseFloat(currentShapes.row[i].rx);
			zx = parseFloat(currentShapes.row[i].zx);
			iy = parseFloat(currentShapes.row[i].iy);
			sy = parseFloat(currentShapes.row[i].sy);
			ry = parseFloat(currentShapes.row[i].ry);
			zy = parseFloat(currentShapes.row[i].zy);
			j = parseFloat(currentShapes.row[i].j);
			cw = parseFloat(currentShapes.row[i].cw);
			
			
			// setting the scale
			if (zoom === true){
				SCALE = AVAILABLE_BEAM_HEIGHT_PIXELS / d;
			} else {
				SCALE = standardScale;
			}
			
			// With parseInt and having a line width of 2px I don't get the blurred line as explained in the link on top of this file
			xArray.push(parseInt(X0));				// 0
			xArray.push(parseInt(X0+SCALE*(b/2)));	// 1
			xArray.push(parseInt(X0+SCALE*(b/2)));	// 2
			xArray.push(parseInt(X0+SCALE*(w/2)));	// 3
			xArray.push(parseInt(X0+SCALE*(w/2)));	// 4
			xArray.push(parseInt(X0+SCALE*(b/2)));	// 5
			xArray.push(parseInt(X0+SCALE*(b/2)));	// 6
			xArray.push(parseInt(X0-SCALE*(b/2)));	// 7
			xArray.push(parseInt(X0-SCALE*(b/2)));	// 8
			xArray.push(parseInt(X0-SCALE*(w/2)));	// 9
			xArray.push(parseInt(X0-SCALE*(w/2)));	// 10
			xArray.push(parseInt(X0-SCALE*(b/2)));	// 11
			xArray.push(parseInt(X0-SCALE*(b/2)));	// 12
			xArray.push(parseInt(X0));				// 13
			
			yArray.push(parseInt(Y0));				// 0
			yArray.push(parseInt(Y0));				// 1
			yArray.push(parseInt(Y0+SCALE*(t)));	// 2
			yArray.push(parseInt(Y0+SCALE*(t)));	// 3
			yArray.push(parseInt(Y0+SCALE*(d-t)));	// 4
			yArray.push(parseInt(Y0+SCALE*(d-t)));	// 5
			yArray.push(parseInt(Y0+SCALE*(d)));	// 6
			yArray.push(parseInt(Y0+SCALE*(d)));	// 7
			yArray.push(parseInt(Y0+SCALE*(d-t)));	// 8
			yArray.push(parseInt(Y0+SCALE*(d-t)));	// 9
			yArray.push(parseInt(Y0+SCALE*(t)));	// 10
			yArray.push(parseInt(Y0+SCALE*(t)));	// 11
			yArray.push(parseInt(Y0));				// 12
			yArray.push(parseInt(Y0));				// 13

			beamCoordinates.push(xArray);
			beamCoordinates.push(yArray);

			break;

		} else {
		}
		
	}

}


function setMostListeners(){

	$(document).keydown(function(e) {
		var ele = $('#list-container');
		var scroll = 29; // Which is height + padding-top
		
		switch(e.which) {
			case 38: // up
				var row = parseInt($('.sel').attr('row'));
				row--;
				$("div[row='" + row + "']").trigger('mouseover');							
				ele.scrollTop(ele.scrollTop() - scroll);
			break;

			case 40: // down
				var row = parseInt($('.sel').attr('row'));
				row++;
				$("div[row='" + row + "']").trigger('mouseover');
				ele.scrollTop(ele.scrollTop() + scroll);
			break;

			default: return; // exit this handler for other keys
		}
		e.preventDefault(); // prevent the default action (scroll / move caret)
	});
	
	
	$('#show-dimensions').click(function () {
		if ($('#show-dimensions').hasClass('on') === true){
			showDimensions = false;
			$('#show-dimensions').removeClass('on');
		} else {
			showDimensions = true;
			$('#show-dimensions').addClass('on');
		}
		
		drawCanvas();
	});
	
	
	$('#zoom').click(function () {
		if ($('#zoom').hasClass('on') === true){
			zoom = false;
			$('#zoom').removeClass('on');
		} else {
			zoom = true;
			$('#zoom').addClass('on');
		}
		
		drawCanvas();
	});
	
	
	$(".shapes").click(function(){
		var shapeSelection = $(this).attr('id');
		
		if (beamName && currentShapeSetKey) {
			selectedBeamByShapeSet[currentShapeSetKey] = beamName;
		}
		
		switch(shapeSelection){
			case 'canadianShapes':
				currentShapes = canadianShapes;
				currentSpecName = CANADIAN_SPEC_NAME;
				standardScale = STD_CANADIAN_SCALE
			break;
			
			case 'americanShapes':
				currentShapes = americanShapes;
				currentSpecName = AMERICAN_SPEC_NAME;
				standardScale = STD_AMERICAN_SCALE
			break;
			
			case 'europeanShapes':
				currentShapes = europeanShapes;
				currentSpecName = EUROPEAN_SPEC_NAME;
				standardScale = STD_EUROPEAN_SCALE;
			break;
			
			case 'britishShapes':
				currentShapes = britishShapes;
				currentSpecName = BRITISH_SPEC_NAME;
				standardScale = STD_BRITISH_SCALE;
			break;
			
			default:
			alert('Oops! This is an unexpected error. Please contact the developer ;)');
		}
		currentShapeSetKey = shapeSelection;
		
		$('.shapes').removeClass('on');
		$(this).addClass('on');
		
		showList();
	});

}


function selectBeam(beamId, element){
	beamName = beamId;
	selectedBeamByShapeSet[currentShapeSetKey] = beamName;
	drawCanvas();
	$('.w').removeClass('sel');
	if (element) {
		$(element).addClass('sel');
	}
}


function setMouseHoverListener(){
	
	$(".w").mouseover(function(){
		selectBeam($(this).attr('id'), this);
	});
	
	$(".w").click(function(){
		selectBeam($(this).attr('id'), this);
	});
	
}


function drawCanvas(){
	drawBeam();
	writePropAndTitle();
	if(showDimensions === true){drawDimensions();}
}


function showList(){
	var items = $();
	var restoredBeamName;
	var restoredBeamElement;
	
	// deleting previuos list, if any
	$('#list-container').html('');
	
	for (var i = 0; i < currentShapes.row.length; i++) {
		items = items.add( "<div id='" + currentShapes.row[i].name + "' class='w' row='" + (i+1) + "'>" + currentShapes.row[i].name + "</div>" );
	}
	
	$('#list-container').append( items );
	
	setMouseHoverListener();
	
	restoredBeamName = selectedBeamByShapeSet[currentShapeSetKey];
	if (restoredBeamName) {
		restoredBeamElement = document.getElementById(restoredBeamName);
	}
	
	if (restoredBeamElement) {
		selectBeam(restoredBeamName, restoredBeamElement);
	} else {
		context.clearRect(0, 0, canv.width, canv.height);
	}
}


function isIE(){
	
	var ua = window.navigator.userAgent;
	var msie = ua.indexOf("MSIE");
	
	if (navigator.appName == 'Microsoft Internet Explorer' || msie > 0){
		return true;
	} else {
		return false;
	}	
}



			
