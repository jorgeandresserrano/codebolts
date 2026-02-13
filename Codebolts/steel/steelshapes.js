/* SteelShapes v1.0.0 | (c) 2014 Jorge Andres Serrano Ardila */

/*
	Some references:
	Canvas in general -- http://www.html5canvastutorials.com/tutorials/html5-canvas-line-width/
	Arcs -- http://www.dbp-consulting.com/tutorials/canvas/CanvasArcTo.html
	1px blurred line -- http://stackoverflow.com/questions/7530593/html5-canvas-and-line-width
*/

 "use strict";
 
// Canvas and drawing configuration.
var X0,
	Y0,
	AVAILABLE_BEAM_HEIGHT_PIXELS,
	standardScale, STD_CANADIAN_SCALE, STD_AMERICAN_SCALE, STD_EUROPEAN_SCALE, STD_BRITISH_SCALE,
	STD_AUSTRALIAN_SCALE, STD_INDIAN_SCALE, STD_BRAZILIAN_SCALE, STD_CHINESE_SCALE, STD_SOUTH_AFRICAN_SCALE,
	SCALE,
	LINE_WIDTH,
	LINE_COLOR,
	FILL_COLOR,
	canv,
	context;

// Shapes data and selected shape state.
var currentShapes, canadianShapes, americanShapes, europeanShapes, britishShapes, australianShapes, indianShapes, brazilianShapes, chineseShapes, southAfricanShapes,
	beamCoordinates,
	beamName,
	xArray,	yArray,
	currentShapeSetKey, selectedBeamByShapeSet, listScrollTopByShapeSet, selectedSectionTypeByShapeSet;

// Current section dimensions.
var b, d, t, w, k, k1, sectionType, flangeTipThickness, flangeWebThickness, flangeThicknessReferenceXOffset;

// Current section properties.
var mass, area,	ix,	sx,	rx,	zx,	iy,	sy,	ry,	zy, j, cw;

// UI state and specification names.
var zoom, showDimensions,
	currentSpecName, CANADIAN_SPEC_NAME, AMERICAN_SPEC_NAME, EUROPEAN_SPEC_NAME, BRITISH_SPEC_NAME,
	AUSTRALIAN_SPEC_NAME, INDIAN_SPEC_NAME, BRAZILIAN_SPEC_NAME, CHINESE_SPEC_NAME, SOUTH_AFRICAN_SPEC_NAME;

// Fixed UI layout and drawing constants.
var CANVAS_WIDTH = 580,
	CANVAS_HEIGHT = 650,
	TITLE_Y = 490,
	SPEC_Y = 505,
	PROPERTY_X_COL_1 = 20,
	PROPERTY_X_COL_2 = 210,
	PROPERTY_X_COL_3 = 400,
	PROPERTY_Y_ROW_1 = 540,
	PROPERTY_ROW_STEP = 30,
	GRAVITY = 9.80665;

var PROPERTY_LABELS = ['title', 'Dead Load: ', 'Area: ', 'Ix: ', 'Sx: ', 'rx: ', 'Zx: ', 'Iy: ', 'Sy: ', 'ry: ', 'Zy: ', 'J: ', 'Cw: '];
var PROPERTY_X_LAYOUT = [0, PROPERTY_X_COL_1, PROPERTY_X_COL_1, PROPERTY_X_COL_2, PROPERTY_X_COL_2, PROPERTY_X_COL_2, PROPERTY_X_COL_2, PROPERTY_X_COL_3, PROPERTY_X_COL_3, PROPERTY_X_COL_3, PROPERTY_X_COL_3, PROPERTY_X_COL_1, PROPERTY_X_COL_1];
var PROPERTY_Y_LAYOUT = [0, PROPERTY_Y_ROW_1, PROPERTY_Y_ROW_1 + PROPERTY_ROW_STEP, PROPERTY_Y_ROW_1, PROPERTY_Y_ROW_1 + PROPERTY_ROW_STEP, PROPERTY_Y_ROW_1 + (2 * PROPERTY_ROW_STEP), PROPERTY_Y_ROW_1 + (3 * PROPERTY_ROW_STEP), PROPERTY_Y_ROW_1, PROPERTY_Y_ROW_1 + PROPERTY_ROW_STEP, PROPERTY_Y_ROW_1 + (2 * PROPERTY_ROW_STEP), PROPERTY_Y_ROW_1 + (3 * PROPERTY_ROW_STEP), PROPERTY_Y_ROW_1 + (2 * PROPERTY_ROW_STEP), PROPERTY_Y_ROW_1 + (3 * PROPERTY_ROW_STEP)];
var SECTION_TYPE_FILTER_ORDER = ['W', 'M', 'HP', 'C', 'MC', 'S', 'WT', 'MT', 'ST'];
var SECTION_TYPE_FILTER_MAP = {
	W: 'W',
	UB: 'W',
	UC: 'W',
	WB: 'W',
	WC: 'W',
	UBP: 'W',
	HB: 'W',
	LB: 'W',
	MB: 'W',
	H: 'W',
	HN: 'W',
	HW: 'W',
	HE: 'W',
	IPE: 'W',
	IPN: 'W',
	I: 'W',
	VS: 'W',
	CVS: 'W',
	M: 'M',
	HP: 'HP',
	HD: 'HP',
	HL: 'HP',
	C: 'C',
	PFC: 'C',
	UPE: 'C',
	UPN: 'C',
	PG: 'C',
	LC: 'C',
	JC: 'C',
	CS: 'C',
	'CC BTB': 'C',
	'CC TTT': 'C',
	MC: 'MC',
	MCP: 'MC',
	'MCMC BTB': 'MC',
	'MCMC TTT': 'MC',
	S: 'S',
	SC: 'S',
	TFB: 'S',
	SLB: 'S',
	WT: 'WT',
	UBT: 'WT',
	UCT: 'WT',
	IPET: 'WT',
	HEBT: 'WT',
	HEAT: 'WT',
	TN: 'WT',
	TW: 'WT',
	NT: 'WT',
	HT: 'WT',
	IT: 'WT',
	TFC: 'WT',
	MT: 'MT',
	TM: 'MT',
	ST: 'ST',
	JST: 'ST'
};

var INSIDE_ARC_SEGMENT_INDEX = {3: true, 4: true, 9: true, 10: true};
var OUTSIDE_ARC_SEGMENT_INDEX = {2: true, 5: true, 8: true, 11: true};
var CHANNEL_INSIDE_ARC_SEGMENT_INDEX = {3: true, 4: true};
var CHANNEL_OUTSIDE_ARC_SEGMENT_INDEX = {2: true, 5: true};
var activeInsideArcSegmentIndex = INSIDE_ARC_SEGMENT_INDEX;
var activeOutsideArcSegmentIndex = OUTSIDE_ARC_SEGMENT_INDEX;
var S_FLANGE_INNER_FACE_SLOPE = 2 / 12;


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


function toCrispPixel(value){
	// Draw on half pixels to keep 1px strokes crisp on canvas.
	return Math.round(value) + 0.5;
}


function toInt(value){
	return parseInt(value, 10);
}


function isAmericanSpec(){
	return currentSpecName === AMERICAN_SPEC_NAME;
}


function getDeadLoadValue(){
	if (isAmericanSpec()){
		return mass;
	}
	return Math.round((mass * GRAVITY / 1000) * 100) / 100;
}


function getPropertyUnitsForSpec(){
	if (currentSpecName === AMERICAN_SPEC_NAME){
		return ['', 'lb/ft', 'in^2', 'in^4', 'in^3', 'in', 'in^3', 'in^4', 'in^3', 'in', 'in^3', 'in^4', 'in^6'];
	}
	// European and British datasets share these units.
	if (currentSpecName === EUROPEAN_SPEC_NAME || currentSpecName === BRITISH_SPEC_NAME){
		return ['', 'kN/m', 'mm^2', 'x10^4 mm^4', 'x10^3 mm^3', 'x10 mm', 'x10^3 mm^3', 'x10^4 mm^4', 'x10^3 mm^3', 'x10 mm', 'x10^3 mm^3', 'x10^4 mm^4', 'x10^9 mm^6'];
	}
	// Canada, Australia, India, Brazil, China and South Africa use this metric formatting.
	return ['', 'kN/m', 'mm^2', 'x10^6 mm^4', 'x10^3 mm^3', 'mm', 'x10^3 mm^3', 'x10^6 mm^4', 'x10^3 mm^3', 'mm', 'x10^3 mm^3', 'x10^3 mm^4', 'x10^9 mm^6'];
}


function getDefaultSectionTypeSelectionByShapeSet(){
	return {
		canadianShapes: 'W',
		americanShapes: 'W',
		europeanShapes: 'W',
		britishShapes: 'W',
		australianShapes: 'W',
		indianShapes: 'W',
		brazilianShapes: 'W',
		chineseShapes: 'W',
		southAfricanShapes: 'W'
	};
}


function getShapeSetConfig(shapeSetKey){
	var shapeSets = {
		canadianShapes: {dataset: canadianShapes, specName: CANADIAN_SPEC_NAME, scale: STD_CANADIAN_SCALE},
		americanShapes: {dataset: americanShapes, specName: AMERICAN_SPEC_NAME, scale: STD_AMERICAN_SCALE},
		europeanShapes: {dataset: europeanShapes, specName: EUROPEAN_SPEC_NAME, scale: STD_EUROPEAN_SCALE},
		britishShapes: {dataset: britishShapes, specName: BRITISH_SPEC_NAME, scale: STD_BRITISH_SCALE},
		australianShapes: {dataset: australianShapes, specName: AUSTRALIAN_SPEC_NAME, scale: STD_AUSTRALIAN_SCALE},
		indianShapes: {dataset: indianShapes, specName: INDIAN_SPEC_NAME, scale: STD_INDIAN_SCALE},
		brazilianShapes: {dataset: brazilianShapes, specName: BRAZILIAN_SPEC_NAME, scale: STD_BRAZILIAN_SCALE},
		chineseShapes: {dataset: chineseShapes, specName: CHINESE_SPEC_NAME, scale: STD_CHINESE_SCALE},
		southAfricanShapes: {dataset: southAfricanShapes, specName: SOUTH_AFRICAN_SPEC_NAME, scale: STD_SOUTH_AFRICAN_SCALE}
	};

	return shapeSets[shapeSetKey];
}


function isSectionTypeFilterEnabledForShapeSet(shapeSetKey){
	return !!getShapeSetConfig(shapeSetKey);
}


function mapRawSectionTypeToFilterType(rawType){
	if (!rawType){
		return '';
	}

	return SECTION_TYPE_FILTER_MAP[rawType] || '';
}


function getFilterSectionType(row){
	var rawType = getRowSectionType(row);
	return mapRawSectionTypeToFilterType(rawType);
}


function getPropertyValues(){
	return [beamName, getDeadLoadValue(), area, ix, sx, rx, zx, iy, sy, ry, zy, j, cw];
}


function getUnitScaleDivisor(unitLabel){
	var unitMatch = String(unitLabel || '').match(/^x10(?:\^([0-9]+))?\b/i);
	var exponent;

	if (!unitMatch){
		return 1;
	}

	// "x10 mm" means divide by 10^1. "x10^3 mm^3" means divide by 10^3.
	exponent = unitMatch[1] ? parseInt(unitMatch[1], 10) : 1;
	if (!isFinite(exponent)){
		return 1;
	}

	return Math.pow(10, exponent);
}


function scalePropertyValueForDisplay(index, value, units){
	var numericValue = parseFloat(value);
	var divisor = getUnitScaleDivisor(units[index]);

	if (!isFinite(numericValue)){
		return value;
	}

	if (!isFinite(divisor) || divisor === 0){
		return numericValue;
	}

	return numericValue / divisor;
}


function formatPropertyValue(index, value){
	// rx (index 5) and ry (index 9) are shown with a fixed single decimal place.
	if (index === 5 || index === 9){
		var numericValue = parseFloat(value);
		if (isFinite(numericValue)){
			return numericValue.toFixed(1);
		}
	}

	return value;
}


function initializeVariables(){
	
	CANADIAN_SPEC_NAME = 'CISC Section Tables_SST92';
	AMERICAN_SPEC_NAME = 'AISC Shapes Database v16.0';
	EUROPEAN_SPEC_NAME = 'ArcelorMittal Europe 2014_1';
	BRITISH_SPEC_NAME = 'ArcelorMittal Britain 2014_1';
	AUSTRALIAN_SPEC_NAME = 'Australia c';
	INDIAN_SPEC_NAME = 'India c';
	BRAZILIAN_SPEC_NAME = 'Brazil c';
	CHINESE_SPEC_NAME = 'China c';
	SOUTH_AFRICAN_SPEC_NAME = 'South Africa c';
	currentSpecName = CANADIAN_SPEC_NAME;
	currentShapeSetKey = 'canadianShapes';
	selectedBeamByShapeSet = {};
	listScrollTopByShapeSet = {};
	selectedSectionTypeByShapeSet = getDefaultSectionTypeSelectionByShapeSet();
	
	currentShapes = canadianShapes;
	
	AVAILABLE_BEAM_HEIGHT_PIXELS = 370;
	STD_CANADIAN_SCALE = AVAILABLE_BEAM_HEIGHT_PIXELS / 1118; // d = 1118mm is the tallest commonly used W-shape
	STD_AMERICAN_SCALE = AVAILABLE_BEAM_HEIGHT_PIXELS / 44; // d = 44in is the tallest beam in the filtered families
	STD_EUROPEAN_SCALE = AVAILABLE_BEAM_HEIGHT_PIXELS / 1138; // legacy European visual scale
	STD_BRITISH_SCALE = AVAILABLE_BEAM_HEIGHT_PIXELS / 1056; // legacy British visual scale
	STD_AUSTRALIAN_SCALE = AVAILABLE_BEAM_HEIGHT_PIXELS / 1200;
	STD_INDIAN_SCALE = AVAILABLE_BEAM_HEIGHT_PIXELS / 600;
	STD_BRAZILIAN_SCALE = AVAILABLE_BEAM_HEIGHT_PIXELS / 2000;
	STD_CHINESE_SCALE = AVAILABLE_BEAM_HEIGHT_PIXELS / 1200;
	STD_SOUTH_AFRICAN_SCALE = AVAILABLE_BEAM_HEIGHT_PIXELS / 2150;
	standardScale = STD_CANADIAN_SCALE;
	
	LINE_WIDTH = 1;
	LINE_COLOR = '#484848';
	FILL_COLOR = '#484848';
	
	beamCoordinates = [];
	canv = document.getElementById("canvas");
	canv.width = CANVAS_WIDTH;
	canv.height = CANVAS_HEIGHT;
	X0 = Math.round(canv.width/2);
	Y0 = 25;
	context = canv.getContext("2d");
	zoom = true;
	showDimensions = true;
}


function drawBeam(){
	
	setCoordDimsAndScale();
	
	if (!beamCoordinates[0] || beamCoordinates[0].length === 0){
		context.clearRect(0, 0, canv.width, canv.height);
		return;
	}

	context.clearRect(0, 0, canv.width, canv.height);

	var profile = {
		coordinates: beamCoordinates,
		insideArcSegments: activeInsideArcSegmentIndex,
		outsideArcSegments: activeOutsideArcSegmentIndex
	};
	var radii = getBeamCornerRadii({
		k1: k1,
		w: w,
		k: k,
		flangeWebThickness: flangeWebThickness,
		flangeTipThickness: flangeTipThickness
	}, SCALE);

	drawBeamPath(profile, radii);

}


function writePropAndTitle(){
	// Build the displayed properties as [label + value + unit].
	var values = getPropertyValues();
	var units = getPropertyUnitsForSpec();
	var x = canv.width / 2;
	var y = TITLE_Y;
	
	writeOneText('700', '30', 'Roboto', 'center', '#2B2B2B', beamName, x, y);
	y = SPEC_Y;
	writeOneText('400', '10', 'Roboto', 'center', '#484848', currentSpecName, x, y);
	
	for (var i=1; i<PROPERTY_LABELS.length; i++){
		var scaledValue = scalePropertyValueForDisplay(i, values[i], units);
		var formattedValue = formatPropertyValue(i, scaledValue);
		var propertyText = String(PROPERTY_LABELS[i]) + String(formattedValue) + ' ' + String(units[i]);
		writeOneText('400', '15', 'Roboto', 'left', '#2B2B2B', propertyText, PROPERTY_X_LAYOUT[i], PROPERTY_Y_LAYOUT[i]);
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
	var sectionLeftOffset = getSectionLeftOffset(sectionType, b);
	var sectionRightOffset = getSectionRightOffset(sectionType, b);
	var webLeftOffset = getWebLeftOffset(sectionType, b, w);
	var webRightOffset = getWebRightOffset(sectionType, b, w);
	var webToeOffset = getWebToeOffset(sectionType, b, w);
	var leftDepthDimensionExtraOffset = 8;
	var leftDepthDimensionX = X0 + sectionLeftOffset*SCALE - 2*aOff - leftDepthDimensionExtraOffset;
	var leftInnerDimensionExtraOffset = 20;
	var leftInnerDimensionX = X0 + sectionLeftOffset*SCALE - aOff - leftInnerDimensionExtraOffset;
	var thicknessReferenceXOffset = flangeThicknessReferenceXOffset;
	var rightSectionFaceX = X0 + sectionRightOffset*SCALE;
	var rightDimensionClearance = aOff + 20;
	var rightWitnessObjectGap = 8;
	var rightDimensionX = rightSectionFaceX + rightDimensionClearance;
	var rightDimensionTickX = rightDimensionX + lOff;
	var rightDimensionTextX = rightDimensionTickX + 5;
	var thicknessReferenceX = X0 + thicknessReferenceXOffset*SCALE;
	var rightWitnessStartX = Math.max(thicknessReferenceX, rightSectionFaceX + rightWitnessObjectGap);
	var formatDimensionValue = function(value){
		var numericValue = parseFloat(value);
		if (isFinite(numericValue)){
			return numericValue.toFixed(1);
		}
		return value;
	};
	
	// 'b' dimension arrow. 
	// Function 'drawArrow()' takes care about pixel precision to draw the arrow
	x1 = X0 + sectionLeftOffset*SCALE;
	y1 = Y0 + d*SCALE + aOff;
	x2 = X0 + sectionRightOffset*SCALE;
	y2 = y1;
	drawArrow (context,x1,y1,x2,y2,style,which,angle,dist);
	y1 = Y0 + d*SCALE + lOff;
	y2 = Y0 + d*SCALE + aOff + lOff;
	drawOneLine(x1,y1,x1,y2);
	drawOneLine(x2,y1,x2,y2);
	tx = X0;
	ty = Y0 + d*SCALE + aOff + 18;
	writeOneText('400', '15', 'Roboto', 'center', '#484848', formatDimensionValue(b), tx, ty);
	
	// 'd' dimension arrow. 
	// Function 'drawArrow()' takes care about pixel precision to draw the arrow
	x1 = leftDepthDimensionX;
	y1 = Y0;
	x2 = x1;
	y2 = Y0 + d*SCALE;
	drawArrow (context,x1,y1,x2,y2,style,which,angle,dist);
	x1 = X0 + sectionLeftOffset*SCALE - lOff;
	x2 = leftDepthDimensionX - lOff;
	drawOneLine(x1,y1,x2,y1);
	drawOneLine(x1,y2,x2,y2);
	tx = leftDepthDimensionX - 5;
	ty = Y0 + d/2*SCALE + 15/2;
	writeOneText('400', '15', 'Roboto', 'right', '#484848', formatDimensionValue(d), tx, ty);
	
	// 'T' distance arrow. 
	// Function 'drawArrow()' takes care about pixel precision to draw the arrow
	x1 = leftInnerDimensionX;
	y1 = Y0 + k*SCALE;
	x2 = x1;
	y2 = Y0 + (d-k)*SCALE;
	drawArrow (context,x1,y1,x2,y2,style,which,angle,dist);
	x1 = X0 + webToeOffset*SCALE - lOff;
	x2 = leftInnerDimensionX - lOff;
	drawOneLine(x1,y1,x2,y1);
	drawOneLine(x1,y2,x2,y2);
	tx = leftInnerDimensionX + 5;
	ty = Y0 + d/2*SCALE + 15/2;
	writeOneText('400', '15', 'Roboto', 'left', '#484848', formatDimensionValue(distT), tx, ty);
	
	// 't' dimension arrows. 
	// Function 'drawArrow()' takes care about pixel precision to draw the arrow
	x1 = rightDimensionX;
	y1 = Y0 - aOff*0.9;
	x2 = x1;
	y2 = Y0;
	drawArrow (context,x1,y1,x2,y2,style,1,angle,dist);
	// The second arrow is drew by 'inside height' dimension
	x1 = rightWitnessStartX;
	x2 = rightDimensionTickX;
	y1 = Y0;
	y2 = Y0 + t*SCALE;
	drawOneLine(x1,y1,x2,y1);
	drawOneLine(x1,y2,x2,y2);
	tx = rightDimensionTextX;
	ty = Y0 + t/2*SCALE + 14/2;
	writeOneText('400', '15', 'Roboto', 'left', '#484848', formatDimensionValue(t), tx, ty);
	
	// 'w' dimension arrows. 
	// Function 'drawArrow()' takes care about pixel precision to draw the arrow
	x1 = X0 + webLeftOffset*SCALE - aOff*0.9;
	y1 = Y0 + (t + distT*0.30)*SCALE;
	x2 = X0 + webLeftOffset*SCALE;
	y2 = y1;
	drawArrow (context,x1,y1,x2,y2,style,1,angle,dist);
	x1 = X0 + webRightOffset*SCALE + aOff*0.9;
	x2 = X0 + webRightOffset*SCALE;
	drawArrow (context,x1,y1,x2,y2,style,1,angle,dist);
	tx = X0 + webRightOffset*SCALE + aOff*0.9 + 3;
	ty = y1 + 14/2;
	writeOneText('400', '15', 'Roboto', 'left', '#484848', formatDimensionValue(w), tx, ty);
		
	// 'k' dimension arrows. 
	// Function 'drawArrow()' takes care about pixel precision to draw the arrow
	x1 = leftInnerDimensionX;
	y1 = Y0 + d*SCALE + aOff*0.9;
	x2 = x1;
	y2 = Y0 + d*SCALE;
	drawArrow (context,x1,y1,x2,y2,style,1,angle,dist);
	tx = leftInnerDimensionX;
	ty = y1 + 17;
	writeOneText('400', '15', 'Roboto', 'right', '#484848', formatDimensionValue(k), tx, ty);
	
	// 'inside height' : variable 'freeD' dimension arrow. 
	// Function 'drawArrow()' takes care about pixel precision to draw the arrow
	x1 = rightDimensionX;
	y1 = Y0 + t*SCALE;
	x2 = x1;
	y2 = Y0 + (d-t)*SCALE;
	drawArrow (context,x1,y1,x2,y2,style,which,angle,dist);
	x1 = rightWitnessStartX;
	x2 = rightDimensionTickX;
	drawOneLine(x1,y2,x2,y2);
	tx = rightDimensionTextX;
	ty = Y0 + d/2*SCALE + 14/2;
	writeOneText('400', '15', 'Roboto', 'left', '#484848', formatDimensionValue(freeD), tx, ty);
	
}


function drawOneLine(x1,y1,x2,y2){
	x1 = toCrispPixel(x1);
	y1 = toCrispPixel(y1);
	x2 = toCrispPixel(x2);
	y2 = toCrispPixel(y2);
	
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


function findBeamRowByName(rows, name){
	for (var i=0; i<rows.length; i++){
		if (rows[i].name === name){
			return rows[i];
		}
	}
	return null;
}


function toNumber(value){
	var number = parseFloat(value);

	if (isNaN(number)){
		return NaN;
	}

	return number;
}


function firstFiniteNumber(values){
	for (var i = 0; i < values.length; i++){
		var number = toNumber(values[i]);
		if (isFinite(number)){
			return number;
		}
	}
	return NaN;
}


function firstNonEmptyString(values){
	for (var i = 0; i < values.length; i++){
		if (values[i] === undefined || values[i] === null){
			continue;
		}

		var asString = String(values[i]).trim();
		if (asString !== ''){
			return asString;
		}
	}
	return '';
}


function computeRadius(ixValue, areaValue){
	if (!isFinite(ixValue) || !isFinite(areaValue) || areaValue <= 0){
		return NaN;
	}

	return Math.sqrt(ixValue / areaValue);
}


function normalizeLegacyShapeRow(row){
	var normalized = {};
	var areaValue = firstFiniteNumber([row.a]);
	var ixValue = firstFiniteNumber([row.ix]);
	var iyValue = firstFiniteNumber([row.iy]);

	normalized.name = firstNonEmptyString([row.name, row.Name]);
	normalized.type = firstNonEmptyString([row.type, row.Type]);
	normalized.mass = firstFiniteNumber([row.mass, row.mu]);
	normalized.a = areaValue;
	normalized.d = firstFiniteNumber([row.d, row.D]);
	normalized.b = firstFiniteNumber([row.b, row.Bf1, row.Bf2]);
	normalized.w = firstFiniteNumber([row.w, row.tw]);
	normalized.t = firstFiniteNumber([row.t, row.tf1, row.tf2]);
	normalized.k = firstFiniteNumber([row.k]);
	normalized.k1 = firstFiniteNumber([row.k1]);
	normalized.ix = ixValue;
	normalized.sx = firstFiniteNumber([row.sx, row.Zex]);
	normalized.rx = computeRadius(ixValue, areaValue);
	normalized.zx = firstFiniteNumber([row.zx, row.Zpx]);
	normalized.iy = iyValue;
	normalized.sy = firstFiniteNumber([row.sy, row.Zey]);
	normalized.ry = computeRadius(iyValue, areaValue);
	normalized.zy = firstFiniteNumber([row.zy, row.Zpy]);
	normalized.j = firstFiniteNumber([row.j, row.Jt]);
	normalized.cw = firstFiniteNumber([row.cw, row.Iw]);
	normalized._raw = row;

	return normalized;
}


function normalizeWorkbookShapeRow(row){
	var normalized = {};
	var flangeThickness = firstFiniteNumber([row.tf1, row.tf2]);
	var webThickness = firstFiniteNumber([row.tw]);
	var rootRadius = firstFiniteNumber([row.Rf]);
	var kValue = firstFiniteNumber([
		row.k,
		flangeThickness + rootRadius,
		flangeThickness
	]);
	var k1Value = firstFiniteNumber([
		row.k1,
		kValue - (webThickness / 2),
		kValue
	]);
	var areaValue = firstFiniteNumber([row.Ag, row.a]);
	var ixValue = firstFiniteNumber([row.Ix, row.ix]);
	var iyValue = firstFiniteNumber([row.Iy, row.iy]);

	normalized.name = firstNonEmptyString([row.Name, row.name]);
	normalized.type = firstNonEmptyString([row.Type, row.type]);
	normalized.mass = firstFiniteNumber([row.mu, row.mass]);
	normalized.a = areaValue;
	normalized.d = firstFiniteNumber([row.D, row.d]);
	normalized.b = firstFiniteNumber([row.Bf1, row.Bf2, row.b]);
	normalized.w = webThickness;
	normalized.t = flangeThickness;
	normalized.k = kValue;
	normalized.k1 = k1Value;
	normalized.ix = ixValue;
	normalized.sx = firstFiniteNumber([row.Zex, row.sx]);
	normalized.rx = computeRadius(ixValue, areaValue);
	normalized.zx = firstFiniteNumber([row.Zpx, row.zx]);
	normalized.iy = iyValue;
	normalized.sy = firstFiniteNumber([row.Zey, row.sy]);
	normalized.ry = computeRadius(iyValue, areaValue);
	normalized.zy = firstFiniteNumber([row.Zpy, row.zy]);
	normalized.j = firstFiniteNumber([row.Jt, row.j]);
	normalized.cw = firstFiniteNumber([row.Iw, row.cw]);
	normalized._raw = row;

	return normalized;
}


function normalizeShapeRow(row){
	if (!row){
		return null;
	}

	if (row.name !== undefined || row.mass !== undefined || row.d !== undefined){
		return normalizeLegacyShapeRow(row);
	}

	return normalizeWorkbookShapeRow(row);
}


function getShapeRows(shapeSet){
	var sectionProperties;

	if (!shapeSet){
		return [];
	}

	if (shapeSet.row && shapeSet.row.length){
		return shapeSet.row;
	}

	sectionProperties = shapeSet.sheets && shapeSet.sheets.sectionProperties;
	if (sectionProperties && sectionProperties.rows && sectionProperties.rows.length){
		return sectionProperties.rows;
	}

	return [];
}


function getNormalizedRows(shapeSet){
	var sourceRows;
	var normalizedRows = [];

	if (!shapeSet){
		return [];
	}

	if (shapeSet._normalizedRows){
		return shapeSet._normalizedRows;
	}

	sourceRows = getShapeRows(shapeSet);
	for (var i = 0; i < sourceRows.length; i++){
		var normalized = normalizeShapeRow(sourceRows[i]);
		if (!normalized || !normalized.name){
			continue;
		}
		normalizedRows.push(normalized);
	}

	shapeSet._normalizedRows = normalizedRows;
	return normalizedRows;
}


function getCurrentShapeRows(){
	return getNormalizedRows(currentShapes);
}


function isDrawableShapeRow(row){
	if (!row){
		return false;
	}

	return isFinite(toNumber(row.d)) &&
		isFinite(toNumber(row.b)) &&
		isFinite(toNumber(row.w)) &&
		isFinite(toNumber(row.t)) &&
		toNumber(row.d) > 0 &&
		toNumber(row.b) > 0 &&
		toNumber(row.w) > 0 &&
		toNumber(row.t) > 0;
}


function setDimensionValues(shapeRow){
	applySectionModel(buildSectionModel(shapeRow));
}


function buildSectionModel(shapeRow){
	var model = {};

	model.b = parseFloat(shapeRow.b);
	model.d = parseFloat(shapeRow.d);
	model.t = parseFloat(shapeRow.t);
	model.w = parseFloat(shapeRow.w);
	model.k = parseFloat(shapeRow.k);
	model.k1 = parseFloat(shapeRow.k1);
	model.sectionType = getRowSectionType(shapeRow);
	model.flangeTipThickness = getFlangeTipThickness(model.sectionType, model.b, model.w, model.t);
	model.flangeWebThickness = getFlangeWebThickness(model.sectionType, model.b, model.w, model.t, model.k);
	model.flangeThicknessReferenceXOffset = getFlangeThicknessReferenceXOffset(model.sectionType, model.b, model.w);

	return model;
}


function applySectionModel(model){
	b = model.b;
	d = model.d;
	t = model.t;
	w = model.w;
	k = model.k;
	k1 = model.k1;
	sectionType = model.sectionType;
	flangeTipThickness = model.flangeTipThickness;
	flangeWebThickness = model.flangeWebThickness;
	flangeThicknessReferenceXOffset = model.flangeThicknessReferenceXOffset;
}


function isSlopedFlangeSectionType(type){
	return type === 'S' || type === 'C' || type === 'MC';
}


function isChannelSectionType(type){
	return type === 'C' || type === 'MC';
}


function getSectionLeftOffset(type, flangeWidth){
	return -flangeWidth / 2;
}


function getSectionRightOffset(type, flangeWidth){
	return flangeWidth / 2;
}


function getWebLeftOffset(type, flangeWidth, webThickness){
	if (isChannelSectionType(type) === true){
		return -flangeWidth / 2;
	}
	return -webThickness / 2;
}


function getWebRightOffset(type, flangeWidth, webThickness){
	if (isChannelSectionType(type) === true){
		return (-flangeWidth / 2) + webThickness;
	}
	return webThickness / 2;
}


function getWebToeOffset(type, flangeWidth, webThickness){
	if (isChannelSectionType(type) === true){
		return getWebRightOffset(type, flangeWidth, webThickness);
	}
	return getWebLeftOffset(type, flangeWidth, webThickness);
}


function getFlangeProjection(type, flangeWidth, webThickness){
	if (!isFinite(flangeWidth) || !isFinite(webThickness)){
		return 0;
	}

	if (isChannelSectionType(type) === true){
		return flangeWidth - webThickness;
	}

	return (flangeWidth - webThickness) / 2;
}


function getFlangeReferenceHalfRun(type, flangeWidth, webThickness){
	return getFlangeProjection(type, flangeWidth, webThickness) / 2;
}


function getFlangeTipThickness(type, flangeWidth, webThickness, flangeThickness){
	var referenceHalfRun;
	var computedTipThickness;

	if (!isFinite(flangeThickness)){
		return 0;
	}

	if (isSlopedFlangeSectionType(type) !== true){
		return Math.max(0, flangeThickness);
	}

	// For sloped-flange sections, tf is referenced midway between web face and flange tip.
	referenceHalfRun = getFlangeReferenceHalfRun(type, flangeWidth, webThickness);
	computedTipThickness = flangeThickness - (referenceHalfRun * S_FLANGE_INNER_FACE_SLOPE);

	if (!isFinite(computedTipThickness)){
		return Math.max(0, flangeThickness);
	}

	return Math.max(0, computedTipThickness);
}


function getFlangeWebThickness(type, flangeWidth, webThickness, flangeThickness, kDimension){
	var referenceHalfRun;
	var computedWebThickness;

	if (isSlopedFlangeSectionType(type) !== true){
		return flangeThickness;
	}

	// AISC S/C/MC sections use a tapered inner flange face with 2:12 slope.
	referenceHalfRun = getFlangeReferenceHalfRun(type, flangeWidth, webThickness);
	computedWebThickness = flangeThickness + (referenceHalfRun * S_FLANGE_INNER_FACE_SLOPE);

	if (!isFinite(computedWebThickness)){
		return flangeThickness;
	}

	if (isFinite(kDimension)){
		computedWebThickness = Math.min(computedWebThickness, kDimension);
	}

	return Math.max(flangeThickness, computedWebThickness);
}


function getFlangeThicknessReferenceXOffset(type, flangeWidth, webThickness){
	var flangeProjection;
	var webRightOffset;

	if (!isFinite(flangeWidth)){
		return 0;
	}

	if (isSlopedFlangeSectionType(type) !== true || !isFinite(webThickness)){
		return flangeWidth / 2;
	}

	flangeProjection = getFlangeProjection(type, flangeWidth, webThickness);
	webRightOffset = getWebRightOffset(type, flangeWidth, webThickness);

	// For sloped flanges, tf is defined at the midpoint between web face and flange tip.
	return webRightOffset + (flangeProjection / 2);
}


function setPropertyValues(shapeRow){
	mass = parseFloat(shapeRow.mass);
	area = parseFloat(shapeRow.a);
	ix = parseFloat(shapeRow.ix);
	sx = parseFloat(shapeRow.sx);
	rx = computeRadius(ix, area);
	zx = parseFloat(shapeRow.zx);
	iy = parseFloat(shapeRow.iy);
	sy = parseFloat(shapeRow.sy);
	ry = computeRadius(iy, area);
	zy = parseFloat(shapeRow.zy);
	j = parseFloat(shapeRow.j);
	cw = parseFloat(shapeRow.cw);
}


function getCurrentScale(){
	if (zoom === true){
		return AVAILABLE_BEAM_HEIGHT_PIXELS / d;
	}
	return standardScale;
}


function projectOffsetsToCanvas(xOffsets, yOffsets, scale){
	var xCoords = [];
	var yCoords = [];

	// Coordinates are intentionally integer-truncated. The 0.5 offset is applied during draw calls.
	for (var i=0; i<xOffsets.length; i++){
		xCoords.push(toInt(X0 + scale * xOffsets[i]));
		yCoords.push(toInt(Y0 + scale * yOffsets[i]));
	}

	return [xCoords, yCoords];
}


function buildSymmetricIBeamGeometry(model, scale){
	var halfB = model.b / 2;
	var halfW = model.w / 2;
	var insideTopAtTip = model.flangeTipThickness;
	var insideTopAtWeb = model.flangeWebThickness;
	var insideBottomAtWeb = model.d - model.flangeWebThickness;
	var insideBottomAtTip = model.d - model.flangeTipThickness;
	var xOffsets = [0, halfB, halfB, halfW, halfW, halfB, halfB, -halfB, -halfB, -halfW, -halfW, -halfB, -halfB, 0];
	var yOffsets = [0, 0, insideTopAtTip, insideTopAtWeb, insideBottomAtWeb, insideBottomAtTip, model.d, model.d, insideBottomAtTip, insideBottomAtWeb, insideTopAtWeb, insideTopAtTip, 0, 0];

	return {
		coordinates: projectOffsetsToCanvas(xOffsets, yOffsets, scale),
		insideArcSegments: INSIDE_ARC_SEGMENT_INDEX,
		outsideArcSegments: OUTSIDE_ARC_SEGMENT_INDEX
	};
}


function buildChannelGeometry(model, scale){
	var left = -model.b / 2;
	var right = model.b / 2;
	var webRight = left + model.w;
	var insideTopAtTip = model.flangeTipThickness;
	var insideTopAtWeb = model.flangeWebThickness;
	var insideBottomAtWeb = model.d - model.flangeWebThickness;
	var insideBottomAtTip = model.d - model.flangeTipThickness;
	var xOffsets = [left, right, right, webRight, webRight, right, right, left, left];
	var yOffsets = [0, 0, insideTopAtTip, insideTopAtWeb, insideBottomAtWeb, insideBottomAtTip, model.d, model.d, 0];

	return {
		coordinates: projectOffsetsToCanvas(xOffsets, yOffsets, scale),
		insideArcSegments: CHANNEL_INSIDE_ARC_SEGMENT_INDEX,
		outsideArcSegments: CHANNEL_OUTSIDE_ARC_SEGMENT_INDEX
	};
}


function isWideFlangeFamily(type){
	return type === 'W' || type === 'M' || type === 'MP' || type === 'HP';
}


function buildBeamGeometry(model, scale){
	if (isChannelSectionType(model.sectionType) === true){
		return buildChannelGeometry(model, scale);
	}

	// W, M and MP (plus HP) share the same symmetric I-beam drawing strategy.
	if (isWideFlangeFamily(model.sectionType) === true){
		return buildSymmetricIBeamGeometry(model, scale);
	}

	return buildSymmetricIBeamGeometry(model, scale);
}


function getBeamCornerRadii(model, scale){
	var inRadiusFromK1 = isFinite(model.k1) ? (model.k1 - (model.w / 2)) : NaN;
	var inRadiusFromK = model.k - model.flangeWebThickness;
	var inRadius = inRadiusFromK;
	var outRadius = 0.3 * model.flangeTipThickness * scale;

	if (isFinite(inRadiusFromK1) && inRadiusFromK1 < inRadiusFromK){
		inRadius = inRadiusFromK1;
	}

	return {
		inside: isFinite(inRadius) ? Math.max(0, inRadius * scale) : 0,
		outside: isFinite(outRadius) ? Math.max(0, outRadius) : 0
	};
}


function drawBeamPath(profile, radii){
	var points = profile.coordinates[0].length;

	context.beginPath();
	context.moveTo(toCrispPixel(profile.coordinates[0][0]), toCrispPixel(profile.coordinates[1][0]));

	for (var i=1; i < points; i++){
		if (profile.insideArcSegments[i] === true){
			// inside arc
			context.arcTo(toCrispPixel(profile.coordinates[0][i]),
							toCrispPixel(profile.coordinates[1][i]),
							toCrispPixel(profile.coordinates[0][i+1]),
							toCrispPixel(profile.coordinates[1][i+1]),
							radii.inside);
		} else if (profile.outsideArcSegments[i] === true) {
			// outside arc
			context.arcTo(toCrispPixel(profile.coordinates[0][i]),
							toCrispPixel(profile.coordinates[1][i]),
							toCrispPixel(profile.coordinates[0][i+1]),
							toCrispPixel(profile.coordinates[1][i+1]),
							radii.outside);
		} else {
			// line
			context.lineTo(toCrispPixel(profile.coordinates[0][i]),
							toCrispPixel(profile.coordinates[1][i]));
		}
	}

	context.lineWidth = LINE_WIDTH;
	context.strokeStyle = LINE_COLOR;
	context.fillStyle = FILL_COLOR;
	context.fill();
	context.stroke();
}


function setCoordDimsAndScale(){
	// Sets:
	// 1) unscaled beam dimensions/properties
	// 2) active drawing scale
	// 3) scaled beam coordinates
	var shapeRows = getCurrentShapeRows();

	if (!shapeRows || shapeRows.length === 0){
		beamCoordinates = [];
		return;
	}

	var shapeRow = findBeamRowByName(shapeRows, beamName);

	if (!shapeRow || isDrawableShapeRow(shapeRow) !== true){
		beamCoordinates = [];
		return;
	}

	var sectionModel = buildSectionModel(shapeRow);
	applySectionModel(sectionModel);
	setPropertyValues(shapeRow);

	SCALE = getCurrentScale();
	var profile = buildBeamGeometry(sectionModel, SCALE);
	beamCoordinates = profile.coordinates;
	activeInsideArcSegmentIndex = profile.insideArcSegments;
	activeOutsideArcSegmentIndex = profile.outsideArcSegments;
	xArray = beamCoordinates[0];
	yArray = beamCoordinates[1];

}


function moveSelectionBy(step, listContainerElement, scrollStep){
	var row = toInt($('.sel').attr('row'));

	if (isNaN(row)){
		return;
	}

	row += step;
	$("div[row='" + row + "']").trigger('mouseover');

	listContainerElement.scrollTop(listContainerElement.scrollTop() + (step * scrollStep));
}


function setCurrentShapeSet(shapeSetKey){
	var selectedShapeSet = getShapeSetConfig(shapeSetKey);

	if (!selectedShapeSet){
		return false;
	}

	currentShapes = selectedShapeSet.dataset;
	currentSpecName = selectedShapeSet.specName;
	standardScale = selectedShapeSet.scale;
	currentShapeSetKey = shapeSetKey;

	return true;
}


function setMostListeners(){

	$('#list-container').on('scroll', function() {
		listScrollTopByShapeSet[currentShapeSetKey] = this.scrollTop;
	});

	$(document).keydown(function(e) {
		var listContainer = $('#list-container');
		var scrollStep = 29; // height + top padding of one list row
		
		switch(e.which) {
			case 38: // up
				moveSelectionBy(-1, listContainer, scrollStep);
			break;

			case 40: // down
				moveSelectionBy(1, listContainer, scrollStep);
			break;

			default: return; // exit this handler for other keys
		}
		e.preventDefault(); // prevent the default action (scroll / move caret)
	});
	
	
	$('#show-dimensions').click(function () {
		showDimensions = !$('#show-dimensions').hasClass('on');
		$('#show-dimensions').toggleClass('on', showDimensions);
		
		drawCanvas();
	});
	
	
	$('#zoom').click(function () {
		zoom = !$('#zoom').hasClass('on');
		$('#zoom').toggleClass('on', zoom);
		
		drawCanvas();
	});
	
	
	$(".shapes").click(function(){
		var shapeSelection = $(this).attr('id');
		var listContainer = document.getElementById('list-container');
		
		if (beamName && currentShapeSetKey) {
			selectedBeamByShapeSet[currentShapeSetKey] = beamName;
		}
		if (currentShapeSetKey && listContainer) {
			listScrollTopByShapeSet[currentShapeSetKey] = listContainer.scrollTop;
		}
		
		if (setCurrentShapeSet(shapeSelection) === false){
			alert('Oops! This is an unexpected error. Please contact the developer ;)');
			return;
		}
		
		$('.shapes').removeClass('on');
		$(this).addClass('on');
		
		showList();
	});

	$('#section-filter-container').on('click', '.section-type', function(){
		var sectionType = $(this).attr('data-section-type');

		if (!sectionType || !currentShapeSetKey){
			return;
		}

		selectedSectionTypeByShapeSet[currentShapeSetKey] = sectionType;
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
	var listContainer = $('#list-container');

	// Rebind with a namespace so repeated showList() calls keep a single handler set.
	listContainer.off('mouseover.steel click.steel', '.w');

	listContainer.on('mouseover.steel', '.w', function(){
		selectBeam($(this).attr('id'), this);
	});

	listContainer.on('click.steel', '.w', function(){
		selectBeam($(this).attr('id'), this);
	});

}


function drawCanvas(){
	drawBeam();
	writePropAndTitle();
	if(showDimensions === true){drawDimensions();}
}


function getRowSectionType(row){
	var normalizedName;
	var normalizedNameNoSpaces;
	var prefixedTypeMatch;
	var explicitType;
	var rowName;

	if (!row){
		return '';
	}

	explicitType = firstNonEmptyString([row.type, row.Type]);
	if (explicitType){
		return explicitType.toUpperCase();
	}

	rowName = firstNonEmptyString([row.name, row.Name]);
	if (!rowName){
		return '';
	}

	normalizedName = rowName.toUpperCase();
	normalizedNameNoSpaces = normalizedName.replace(/\s+/g, '');

	prefixedTypeMatch = normalizedNameNoSpaces.match(/^([0-9]*[A-Z]+)/);
	if (prefixedTypeMatch && prefixedTypeMatch[1]){
		return prefixedTypeMatch[1];
	}

	return '';
}


function getAvailableSectionTypes(rows){
	var seen = {};
	var availableTypes = [];
	var i;

	for (i = 0; i < rows.length; i++){
		if (isDrawableShapeRow(rows[i]) !== true){
			continue;
		}

		var type = getFilterSectionType(rows[i]);
		if (!type){
			continue;
		}

		seen[type] = true;
	}

	for (i = 0; i < SECTION_TYPE_FILTER_ORDER.length; i++){
		var orderedType = SECTION_TYPE_FILTER_ORDER[i];
		if (seen[orderedType] === true){
			availableTypes.push(orderedType);
		}
	}

	return availableTypes;
}


function getActiveSectionType(rows){
	var availableTypes = getAvailableSectionTypes(rows);
	var savedType;

	if (availableTypes.length === 0){
		return '';
	}

	savedType = selectedSectionTypeByShapeSet[currentShapeSetKey];
	if (savedType && availableTypes.indexOf(savedType) >= 0){
		return savedType;
	}

	if (availableTypes.indexOf('W') >= 0){
		selectedSectionTypeByShapeSet[currentShapeSetKey] = 'W';
		return 'W';
	}

	selectedSectionTypeByShapeSet[currentShapeSetKey] = availableTypes[0];
	return availableTypes[0];
}


function renderSectionTypeFilter(rows){
	var container = $('#section-filter-container');
	var availableTypes;
	var activeType;
	var html = [];

	if (container.length === 0){
		return;
	}

	if (!isSectionTypeFilterEnabledForShapeSet(currentShapeSetKey)){
		container.hide().html('');
		return;
	}

	availableTypes = getAvailableSectionTypes(rows);
	if (availableTypes.length === 0){
		container.hide().html('');
		return;
	}

	activeType = getActiveSectionType(rows);

	html.push("<div class='section-filter-title'>Section Type</div>");
	for (var i = 0; i < availableTypes.length; i++){
		var type = availableTypes[i];
		var onClass = (type === activeType) ? ' on' : '';
		html.push("<div class='button section-type" + onClass + "' data-section-type='" + type + "'>" + type + "</div>");
	}

	container.html(html.join('')).show();
}


function getVisibleRowsForCurrentShapeSet(rows){
	var activeType;
	var drawableRows;

	drawableRows = rows.filter(function (row) {
		return isDrawableShapeRow(row) === true;
	});

	if (!isSectionTypeFilterEnabledForShapeSet(currentShapeSetKey)){
		return drawableRows;
	}

	activeType = getActiveSectionType(drawableRows);
	if (!activeType){
		return drawableRows;
	}

	return drawableRows.filter(function (row) {
		return getFilterSectionType(row) === activeType;
	});
}


function showList(){
	var rows;
	var visibleRows;
	var displayRows;
	var itemsHtml = [];
	var restoredBeamName;
	var restoredBeamElement;
	var defaultBeamName;
	var defaultBeamElement;
	var restoredScrollTop;
	var listContainer = document.getElementById('list-container');
	
	if (!listContainer || !currentShapes){
		return;
	}

	rows = getCurrentShapeRows();
	if (!rows || rows.length === 0){
		$('#list-container').html('');
		$('#section-filter-container').hide().html('');
		context.clearRect(0, 0, canv.width, canv.height);
		return;
	}

	renderSectionTypeFilter(rows);
	visibleRows = getVisibleRowsForCurrentShapeSet(rows);
	displayRows = visibleRows.slice().reverse();

	// Remove previous list and rebuild it for the current shape set.
	$('#list-container').html('');
	
	for (var i = 0; i < displayRows.length; i++) {
		itemsHtml.push("<div id='" + displayRows[i].name + "' class='w' row='" + (i+1) + "'>" + displayRows[i].name + "</div>");
	}
	
	$('#list-container').append(itemsHtml.join(''));
	
	setMouseHoverListener();
	
	// Restore scrolling position for this shape set if available.
	restoredScrollTop = listScrollTopByShapeSet[currentShapeSetKey];
	if (restoredScrollTop !== undefined) {
		listContainer.scrollTop = restoredScrollTop;
	}
	
	// Restore previously selected beam for this shape set.
	restoredBeamName = selectedBeamByShapeSet[currentShapeSetKey];
	if (restoredBeamName) {
		restoredBeamElement = document.getElementById(restoredBeamName);
	}
	
	if (restoredBeamElement) {
		selectBeam(restoredBeamName, restoredBeamElement);
		restoredBeamElement.scrollIntoView({block: 'nearest'});
		return;
	}

	// If nothing is restored, select the last item by default.
	if (displayRows.length === 0){
		context.clearRect(0, 0, canv.width, canv.height);
		return;
	}

	defaultBeamName = displayRows[displayRows.length - 1].name;
	defaultBeamElement = document.getElementById(defaultBeamName);

	if (defaultBeamElement) {
		listContainer.scrollTop = listContainer.scrollHeight;
		listScrollTopByShapeSet[currentShapeSetKey] = listContainer.scrollTop;
		selectBeam(defaultBeamName, defaultBeamElement);
		defaultBeamElement.scrollIntoView({block: 'end'});
	} else {
		context.clearRect(0, 0, canv.width, canv.height);
	}
}


function isIE(){
	var ua = window.navigator.userAgent;
	var hasMsieToken = ua.indexOf("MSIE") > 0;

	return navigator.appName === 'Microsoft Internet Explorer' || hasMsieToken;
}



			
