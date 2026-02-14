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
	AVAILABLE_BEAM_HEIGHT_PIXELS, AVAILABLE_BEAM_WIDTH_PIXELS,
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
	currentShapeSetKey, selectedBeamByShapeSet, listScrollTopByShapeSet, selectedSectionTypeByShapeSet, standardScaleBySectionTypeByShapeSet, canvasCopyFeedbackTimeoutId;

// Current section dimensions.
var b, d, t, w, k, k1, rf, rtoe, sectionType, flangeTipThickness, flangeWebThickness, flangeThicknessReferenceXOffset;

// Current section properties.
var mass, area,	ix,	sx,	rx,	zx,	iy,	sy,	ry,	zy, j, cw;

// UI state and specification names.
var zoom, showDimensions,
	currentSpecName, currentSourceCreditText,
	CANADIAN_SPEC_NAME, AMERICAN_SPEC_NAME, EUROPEAN_SPEC_NAME, BRITISH_SPEC_NAME,
	AUSTRALIAN_SPEC_NAME, INDIAN_SPEC_NAME, BRAZILIAN_SPEC_NAME, CHINESE_SPEC_NAME, SOUTH_AFRICAN_SPEC_NAME,
	CANADIAN_SOURCE_CREDIT_TEXT, AMERICAN_SOURCE_CREDIT_TEXT, EUROPEAN_SOURCE_CREDIT_TEXT, BRITISH_SOURCE_CREDIT_TEXT,
	AUSTRALIAN_SOURCE_CREDIT_TEXT, INDIAN_SOURCE_CREDIT_TEXT, BRAZILIAN_SOURCE_CREDIT_TEXT, CHINESE_SOURCE_CREDIT_TEXT,
	SOUTH_AFRICAN_SOURCE_CREDIT_TEXT;

// Fixed UI layout and drawing constants.
var CANVAS_WIDTH = 580,
	CANVAS_HEIGHT = 650,
	SECTION_ORIGIN_Y = 65,
	TITLE_Y = 490,
	SPEC_Y = 505,
	PROPERTY_X_COL_1 = 20,
	PROPERTY_X_COL_2 = 210,
	PROPERTY_X_COL_3 = 400,
	PROPERTY_Y_ROW_1 = 540,
	PROPERTY_ROW_STEP = 30,
	GRAVITY = 9.80665;
var DIMENSION_ANCHOR_OFFSET = 25;
var DIMENSION_TICK_OFFSET = 10;
var LEFT_DEPTH_DIMENSION_EXTRA_OFFSET = 8;
var RIGHT_DIMENSION_CLEARANCE = DIMENSION_ANCHOR_OFFSET + 20;
var RIGHT_DIMENSION_TEXT_OFFSET = DIMENSION_TICK_OFFSET + 5;
var SCALE_PRESENTATION_FACTOR = 0.82;
var TOP_WIDTH_DIMENSION_GAP = 35;
var WEB_THICKNESS_DIMENSION_Y_OFFSET = 4;

var PROPERTY_LABELS = ['title', 'Dead Load: ', 'Area: ', 'Ix: ', 'Sx: ', 'rx: ', 'Zx: ', 'Iy: ', 'Sy: ', 'ry: ', 'Zy: ', 'J: ', 'Cw: '];
var PROPERTY_X_LAYOUT = [0, PROPERTY_X_COL_1, PROPERTY_X_COL_1, PROPERTY_X_COL_2, PROPERTY_X_COL_2, PROPERTY_X_COL_2, PROPERTY_X_COL_2, PROPERTY_X_COL_3, PROPERTY_X_COL_3, PROPERTY_X_COL_3, PROPERTY_X_COL_3, PROPERTY_X_COL_1, PROPERTY_X_COL_1];
var PROPERTY_Y_LAYOUT = [0, PROPERTY_Y_ROW_1, PROPERTY_Y_ROW_1 + PROPERTY_ROW_STEP, PROPERTY_Y_ROW_1, PROPERTY_Y_ROW_1 + PROPERTY_ROW_STEP, PROPERTY_Y_ROW_1 + (2 * PROPERTY_ROW_STEP), PROPERTY_Y_ROW_1 + (3 * PROPERTY_ROW_STEP), PROPERTY_Y_ROW_1, PROPERTY_Y_ROW_1 + PROPERTY_ROW_STEP, PROPERTY_Y_ROW_1 + (2 * PROPERTY_ROW_STEP), PROPERTY_Y_ROW_1 + (3 * PROPERTY_ROW_STEP), PROPERTY_Y_ROW_1 + (2 * PROPERTY_ROW_STEP), PROPERTY_Y_ROW_1 + (3 * PROPERTY_ROW_STEP)];
var SECTION_TYPE_FILTER_ORDER = ['W', 'M', 'S', 'HP', 'C', 'MC', 'L', 'WT', 'MT', 'ST', 'HSS', 'PIPE'];
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
	SLB: 'SLB',
	L: 'L',
	'L E': 'L',
	'L U': 'L',
	LE: 'L',
	LU: 'L',
	EA: 'L',
	UA: 'L',
	CEA: 'L',
	'A E': 'L',
	'A U': 'L',
	'LC E': 'L',
	'LC U': 'L',
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
	JST: 'ST',
	'HSS C': 'HSS',
	'HSS C A500': 'HSS',
	'HSS R': 'HSS',
	'HSS R A500': 'HSS',
	'HSS S': 'HSS',
	'HSS S A500': 'HSS',
	SHS: 'HSS',
	RHS: 'HSS',
	CHS: 'HSS',
	'CHS C250': 'HSS',
	'CHS C350': 'HSS',
	'RHS C350': 'HSS',
	'RHS C450': 'HSS',
	'SHS C350': 'HSS',
	'SHS C450': 'HSS',
	TUBE: 'HSS',
	TQ: 'HSS',
	TR: 'HSS',
	TC: 'HSS',
	PIPE: 'PIPE',
	PIP: 'PIPE'
};

var INSIDE_ARC_SEGMENT_INDEX = {3: true, 4: true, 9: true, 10: true};
var OUTSIDE_ARC_SEGMENT_INDEX = {2: true, 5: true, 8: true, 11: true};
var CHANNEL_INSIDE_ARC_SEGMENT_INDEX = {3: true, 4: true};
var CHANNEL_OUTSIDE_ARC_SEGMENT_INDEX = {2: true, 5: true};
var TEE_INSIDE_ARC_SEGMENT_INDEX = {3: true, 6: true};
var TEE_OUTSIDE_ARC_SEGMENT_INDEX = {2: true, 7: true};
var ANGLE_INSIDE_ARC_SEGMENT_INDEX = {2: true};
var ANGLE_OUTSIDE_ARC_SEGMENT_INDEX = {1: true, 3: true};
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
		canadianShapes: {dataset: canadianShapes, specName: CANADIAN_SPEC_NAME, sourceCreditText: CANADIAN_SOURCE_CREDIT_TEXT, scale: STD_CANADIAN_SCALE},
		americanShapes: {dataset: americanShapes, specName: AMERICAN_SPEC_NAME, sourceCreditText: AMERICAN_SOURCE_CREDIT_TEXT, scale: STD_AMERICAN_SCALE},
		europeanShapes: {dataset: europeanShapes, specName: EUROPEAN_SPEC_NAME, sourceCreditText: EUROPEAN_SOURCE_CREDIT_TEXT, scale: STD_EUROPEAN_SCALE},
		britishShapes: {dataset: britishShapes, specName: BRITISH_SPEC_NAME, sourceCreditText: BRITISH_SOURCE_CREDIT_TEXT, scale: STD_BRITISH_SCALE},
		australianShapes: {dataset: australianShapes, specName: AUSTRALIAN_SPEC_NAME, sourceCreditText: AUSTRALIAN_SOURCE_CREDIT_TEXT, scale: STD_AUSTRALIAN_SCALE},
		indianShapes: {dataset: indianShapes, specName: INDIAN_SPEC_NAME, sourceCreditText: INDIAN_SOURCE_CREDIT_TEXT, scale: STD_INDIAN_SCALE},
		brazilianShapes: {dataset: brazilianShapes, specName: BRAZILIAN_SPEC_NAME, sourceCreditText: BRAZILIAN_SOURCE_CREDIT_TEXT, scale: STD_BRAZILIAN_SCALE},
		chineseShapes: {dataset: chineseShapes, specName: CHINESE_SPEC_NAME, sourceCreditText: CHINESE_SOURCE_CREDIT_TEXT, scale: STD_CHINESE_SCALE},
		southAfricanShapes: {dataset: southAfricanShapes, specName: SOUTH_AFRICAN_SPEC_NAME, sourceCreditText: SOUTH_AFRICAN_SOURCE_CREDIT_TEXT, scale: STD_SOUTH_AFRICAN_SCALE}
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


function isPipeRawType(rawType){
	var normalizedRawType = String(rawType || '').toUpperCase();

	return normalizedRawType === 'PIPE' || normalizedRawType === 'PIP';
}


function isDoubleMcSectionRow(row){
	var rowType;
	var rowName;
	var normalizedNameNoSpaces;

	if (!row){
		return false;
	}

	rowType = firstNonEmptyString([row.type, row.Type]).toUpperCase();
	if (rowType === 'MCMC BTB' || rowType === 'MCMC TTT'){
		return true;
	}

	rowName = firstNonEmptyString([row.name, row.Name]).toUpperCase();
	normalizedNameNoSpaces = rowName.replace(/\s+/g, '');

	return /^2MC/.test(normalizedNameNoSpaces);
}


function isDoubleCSectionRow(row){
	var rowName;
	var normalizedNameNoSpaces;

	if (!row){
		return false;
	}

	rowName = firstNonEmptyString([row.name, row.Name]).toUpperCase();
	normalizedNameNoSpaces = rowName.replace(/\s+/g, '');

	return /^2C/.test(normalizedNameNoSpaces);
}


function getFilterSectionType(row){
	var rawType = getRowSectionType(row);
	var filterType = mapRawSectionTypeToFilterType(rawType);

	// Double-channel built-up sections (2MC...) are intentionally excluded from the MC list.
	if (filterType === 'MC' && isDoubleMcSectionRow(row) === true){
		return '';
	}
	if (filterType === 'C' && isDoubleCSectionRow(row) === true){
		return '';
	}

	return filterType;
}


function getAvailableBeamWidthPixels(){
	// Horizontal fit budget is measured from the section centerline and reserves
	// room for witness/arrow/text offsets used by dimension annotations.
	var centerX = CANVAS_WIDTH / 2;
	var leftReserved = (2 * DIMENSION_ANCHOR_OFFSET) + LEFT_DEPTH_DIMENSION_EXTRA_OFFSET + DIMENSION_TICK_OFFSET;
	var rightReserved = RIGHT_DIMENSION_CLEARANCE + RIGHT_DIMENSION_TEXT_OFFSET;
	var halfAvailableWidth = Math.min(centerX - leftReserved, (CANVAS_WIDTH - centerX) - rightReserved);

	return Math.max(1, 2 * halfAvailableWidth);
}


function getScaleByExtent(availablePixels, extent){
	if (!isFinite(availablePixels) || !isFinite(extent) || extent <= 0){
		return Infinity;
	}

	return (availablePixels / extent) * SCALE_PRESENTATION_FACTOR;
}


function calculateShapeSetStandardScale(shapeSet){
	var rows = getNormalizedRows(shapeSet);
	var maxDepth = 0;
	var maxWidth = 0;
	var maxTeeDepth = 0;
	var maxTeeWidth = 0;

	for (var i = 0; i < rows.length; i++){
		var row = rows[i];
		var filterType;
		var depth;
		var width;

		if (isDrawableShapeRow(row) !== true){
			continue;
		}

		filterType = getFilterSectionType(row);
		if (!filterType){
			continue;
		}

		depth = toNumber(row.d);
		width = toNumber(row.b);
		if (!isFinite(depth) || !isFinite(width) || depth <= 0 || width <= 0){
			continue;
		}

		maxDepth = Math.max(maxDepth, depth);
		maxWidth = Math.max(maxWidth, width);

		if (filterType === 'WT' || filterType === 'MT' || filterType === 'ST'){
			maxTeeDepth = Math.max(maxTeeDepth, depth);
			maxTeeWidth = Math.max(maxTeeWidth, width);
		}
	}

	// Global fit constraints.
	var scaleByTallestSection = getScaleByExtent(AVAILABLE_BEAM_HEIGHT_PIXELS, maxDepth);
	var scaleByWidestSection = getScaleByExtent(AVAILABLE_BEAM_WIDTH_PIXELS, maxWidth);
	// Explicit tee-family fit constraints (WT/MT/ST): keep both depth and flange width in bounds.
	var scaleByTallestTee = getScaleByExtent(AVAILABLE_BEAM_HEIGHT_PIXELS, maxTeeDepth);
	var scaleByWidestTee = getScaleByExtent(AVAILABLE_BEAM_WIDTH_PIXELS, maxTeeWidth);
	var governingScale = Math.min(scaleByTallestSection, scaleByWidestSection, scaleByTallestTee, scaleByWidestTee);

	if (!isFinite(governingScale) || governingScale <= 0){
		return 1;
	}

	return governingScale;
}


function calculateScaleForRows(rows){
	var maxDepth = 0;
	var maxWidth = 0;

	for (var i = 0; i < rows.length; i++){
		var depth = toNumber(rows[i].d);
		var width = toNumber(rows[i].b);

		if (!isFinite(depth) || !isFinite(width) || depth <= 0 || width <= 0){
			continue;
		}

		maxDepth = Math.max(maxDepth, depth);
		maxWidth = Math.max(maxWidth, width);
	}

	var scaleByTallestSection = getScaleByExtent(AVAILABLE_BEAM_HEIGHT_PIXELS, maxDepth);
	var scaleByWidestSection = getScaleByExtent(AVAILABLE_BEAM_WIDTH_PIXELS, maxWidth);
	var governingScale = Math.min(scaleByTallestSection, scaleByWidestSection);

	if (!isFinite(governingScale) || governingScale <= 0){
		return 1;
	}

	return governingScale;
}


function calculateShapeSetTypeStandardScales(shapeSet){
	var rows = getNormalizedRows(shapeSet);
	var rowsByFilterType = {};
	var scales = {};
	var i;

	for (i = 0; i < SECTION_TYPE_FILTER_ORDER.length; i++){
		rowsByFilterType[SECTION_TYPE_FILTER_ORDER[i]] = [];
	}

	for (i = 0; i < rows.length; i++){
		var row = rows[i];
		var filterType;

		if (isDrawableShapeRow(row) !== true){
			continue;
		}

		filterType = getFilterSectionType(row);
		if (!filterType || !rowsByFilterType[filterType]){
			continue;
		}

		rowsByFilterType[filterType].push(row);
	}

	// Each displayed section-type tab gets its own standard scale from its own available rows.
	for (i = 0; i < SECTION_TYPE_FILTER_ORDER.length; i++){
		var sectionType = SECTION_TYPE_FILTER_ORDER[i];
		var typeRows = rowsByFilterType[sectionType];
		if (typeRows.length === 0){
			continue;
		}
		scales[sectionType] = calculateScaleForRows(typeRows);
	}

	return scales;
}


function getStandardScaleForShapeSetAndSectionType(shapeSetKey, sectionType){
	var shapeSetScales;
	var scaleForType;

	if (!shapeSetKey || !sectionType || !standardScaleBySectionTypeByShapeSet){
		return NaN;
	}

	shapeSetScales = standardScaleBySectionTypeByShapeSet[shapeSetKey];
	if (!shapeSetScales){
		return NaN;
	}

	scaleForType = shapeSetScales[sectionType];
	if (!isFinite(scaleForType) || scaleForType <= 0){
		return NaN;
	}

	return scaleForType;
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


function normalizeDisplayNumericValue(value){
	var numericValue = parseFloat(value);

	if (!isFinite(numericValue)){
		return value;
	}

	// Remove binary floating-point display noise (e.g. 0.49821499999999996).
	return Number(numericValue.toPrecision(15));
}


function scalePropertyValueForDisplay(index, value, units){
	var numericValue = parseFloat(value);
	var divisor = getUnitScaleDivisor(units[index]);

	if (!isFinite(numericValue)){
		return value;
	}

	if (!isFinite(divisor) || divisor === 0){
		return normalizeDisplayNumericValue(numericValue);
	}

	return normalizeDisplayNumericValue(numericValue / divisor);
}


function formatPropertyValue(index, value){
	var normalizedNumericValue = normalizeDisplayNumericValue(value);
	var numericValue = parseFloat(normalizedNumericValue);

	if (!isFinite(numericValue)){
		return 'N/A';
	}

	// rx (index 5) and ry (index 9) are shown with a fixed single decimal place.
	if (index === 5 || index === 9){
		return numericValue.toFixed(1);
	}

	return normalizedNumericValue;
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
	CANADIAN_SOURCE_CREDIT_TEXT = 'Courtesy of HatchTools 2026-Feb-12';
	AMERICAN_SOURCE_CREDIT_TEXT = 'Courtesy of HatchTools 2026-Feb-12';
	EUROPEAN_SOURCE_CREDIT_TEXT = 'Courtesy of HatchTools 2026-Feb-12';
	BRITISH_SOURCE_CREDIT_TEXT = 'Courtesy of HatchTools 2026-Feb-12';
	AUSTRALIAN_SOURCE_CREDIT_TEXT = 'Courtesy of HatchTools 2026-Feb-12';
	INDIAN_SOURCE_CREDIT_TEXT = 'Courtesy of HatchTools 2026-Feb-12';
	BRAZILIAN_SOURCE_CREDIT_TEXT = 'Courtesy of HatchTools 2026-Feb-12';
	CHINESE_SOURCE_CREDIT_TEXT = 'Courtesy of HatchTools 2026-Feb-12';
	SOUTH_AFRICAN_SOURCE_CREDIT_TEXT = 'Courtesy of HatchTools 2026-Feb-12';
	currentSpecName = CANADIAN_SPEC_NAME;
	currentSourceCreditText = CANADIAN_SOURCE_CREDIT_TEXT;
	currentShapeSetKey = 'canadianShapes';
	selectedBeamByShapeSet = {};
	listScrollTopByShapeSet = {};
	selectedSectionTypeByShapeSet = getDefaultSectionTypeSelectionByShapeSet();
	
	currentShapes = canadianShapes;
	
	AVAILABLE_BEAM_HEIGHT_PIXELS = 430;
	AVAILABLE_BEAM_WIDTH_PIXELS = getAvailableBeamWidthPixels();

	// Standard (non-zoom) fallback scales are derived from current datasets, not hardcoded.
	// Governing global fallback per shape set is the worst case among:
	// 1) tallest drawable section
	// 2) widest drawable section
	// 3) tallest tee (WT/MT/ST)
	// 4) widest tee (WT/MT/ST)
	STD_CANADIAN_SCALE = calculateShapeSetStandardScale(canadianShapes);
	STD_AMERICAN_SCALE = calculateShapeSetStandardScale(americanShapes);
	STD_EUROPEAN_SCALE = calculateShapeSetStandardScale(europeanShapes);
	STD_BRITISH_SCALE = calculateShapeSetStandardScale(britishShapes);
	STD_AUSTRALIAN_SCALE = calculateShapeSetStandardScale(australianShapes);
	STD_INDIAN_SCALE = calculateShapeSetStandardScale(indianShapes);
	STD_BRAZILIAN_SCALE = calculateShapeSetStandardScale(brazilianShapes);
	STD_CHINESE_SCALE = calculateShapeSetStandardScale(chineseShapes);
	STD_SOUTH_AFRICAN_SCALE = calculateShapeSetStandardScale(southAfricanShapes);
	// Per-type non-zoom scales (W, M, HP, C, MC, S, WT, MT, ST) are computed
	// from only the rows available in each displayed type tab.
	standardScaleBySectionTypeByShapeSet = {
		canadianShapes: calculateShapeSetTypeStandardScales(canadianShapes),
		americanShapes: calculateShapeSetTypeStandardScales(americanShapes),
		europeanShapes: calculateShapeSetTypeStandardScales(europeanShapes),
		britishShapes: calculateShapeSetTypeStandardScales(britishShapes),
		australianShapes: calculateShapeSetTypeStandardScales(australianShapes),
		indianShapes: calculateShapeSetTypeStandardScales(indianShapes),
		brazilianShapes: calculateShapeSetTypeStandardScales(brazilianShapes),
		chineseShapes: calculateShapeSetTypeStandardScales(chineseShapes),
		southAfricanShapes: calculateShapeSetTypeStandardScales(southAfricanShapes)
	};
	standardScale = STD_CANADIAN_SCALE;
	
	LINE_WIDTH = 1;
	LINE_COLOR = '#484848';
	FILL_COLOR = '#484848';
	
	beamCoordinates = [];
	canv = document.getElementById("canvas");
	canv.width = CANVAS_WIDTH;
	canv.height = CANVAS_HEIGHT;
	X0 = Math.round(canv.width/2);
	Y0 = SECTION_ORIGIN_Y;
	context = canv.getContext("2d");
	zoom = true;
	showDimensions = true;
	canvasCopyFeedbackTimeoutId = null;
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
		sectionType: sectionType,
		b: b,
		d: d,
		t: t,
		rf: rf,
		rtoe: rtoe,
		k1: k1,
		w: w,
		k: k,
		flangeWebThickness: flangeWebThickness,
		flangeTipThickness: flangeTipThickness
	}, SCALE);

	if (isHssSectionType(sectionType) === true || isPipeSectionType(sectionType) === true){
		drawHssSection();
		return;
	}

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
	writeOneText('400', '10', 'Roboto', 'center', '#484848', currentSourceCreditText, x, y);
	
	for (var i=1; i<PROPERTY_LABELS.length; i++){
		var scaledValue = scalePropertyValueForDisplay(i, values[i], units);
		var formattedValue = formatPropertyValue(i, scaledValue);
		var unitSuffix = (formattedValue === 'N/A') ? '' : (' ' + String(units[i]));
		var propertyText = String(PROPERTY_LABELS[i]) + String(formattedValue) + unitSuffix;
		writeOneText('400', '15', 'Roboto', 'left', '#2B2B2B', propertyText, PROPERTY_X_LAYOUT[i], PROPERTY_Y_LAYOUT[i]);
	}
	
}


function formatDimensionValue(value){
	var numericValue = parseFloat(value);
	if (isFinite(numericValue)){
		return numericValue.toFixed(1);
	}
	return value;
}


function getClosedSectionWallThickness(){
	var wallThickness = isFinite(t) && t > 0 ? t : w;

	if (!isFinite(wallThickness) || wallThickness <= 0){
		wallThickness = Math.max(0, Math.min(b, d) * 0.1);
	}

	return Math.min(wallThickness, b / 2, d / 2);
}


function drawRoundedRectPath(x, y, width, height, radius){
	var r = Math.max(0, Math.min(radius, width / 2, height / 2));

	context.moveTo(x + r, y);
	context.lineTo(x + width - r, y);
	context.arcTo(x + width, y, x + width, y + r, r);
	context.lineTo(x + width, y + height - r);
	context.arcTo(x + width, y + height, x + width - r, y + height, r);
	context.lineTo(x + r, y + height);
	context.arcTo(x, y + height, x, y + height - r, r);
	context.lineTo(x, y + r);
	context.arcTo(x, y, x + r, y, r);
	context.closePath();
}


function getHssCornerRadii(){
	var wallThickness = getClosedSectionWallThickness();
	var insideRadius = (isFinite(rf) && rf > 0) ? rf : NaN;
	var outsideRadius = (isFinite(rtoe) && rtoe > 0) ? rtoe : NaN;
	var maxOuterRadius = Math.max(0, Math.min(b, d) / 2);
	var maxInnerRadius = Math.max(0, Math.min((b - 2 * wallThickness) / 2, (d - 2 * wallThickness) / 2));

	// Keep radii physically consistent when only one side is provided.
	if (!isFinite(insideRadius) && isFinite(outsideRadius)){
		insideRadius = outsideRadius - wallThickness;
	}
	if (!isFinite(outsideRadius) && isFinite(insideRadius)){
		outsideRadius = insideRadius + wallThickness;
	}

	// HSS datasets frequently store Rf/Rtoe as zero placeholders. Use a realistic fallback.
	if (!isFinite(insideRadius) || insideRadius <= 0){
		insideRadius = wallThickness;
	}
	if (!isFinite(outsideRadius) || outsideRadius <= 0){
		outsideRadius = insideRadius + wallThickness;
	}

	insideRadius = Math.max(0, Math.min(insideRadius, maxInnerRadius));
	outsideRadius = Math.max(0, Math.min(outsideRadius, maxOuterRadius));

	// Ensure outside corner is not tighter than inside + thickness.
	if (outsideRadius < insideRadius + wallThickness){
		outsideRadius = Math.min(maxOuterRadius, insideRadius + wallThickness);
	}
	if (insideRadius > outsideRadius - wallThickness){
		insideRadius = Math.max(0, outsideRadius - wallThickness);
	}

	return {
		inside: insideRadius,
		outside: outsideRadius
	};
}


function drawHssSection(){
	var outerWidth = b * SCALE;
	var outerHeight = d * SCALE;
	var wallThickness = getClosedSectionWallThickness();
	var wallThicknessPx = wallThickness * SCALE;
	var xLeft = X0 - (outerWidth / 2);
	var yTop = Y0;
	var hssRadii = getHssCornerRadii();
	var outerRadius = hssRadii.outside;
	var innerRadius = hssRadii.inside;
	var outerRadiusPx = Math.max(0, outerRadius * SCALE);
	var innerRadiusPx = Math.max(0, innerRadius * SCALE);
	var innerX;
	var innerY;
	var innerWidth;
	var innerHeight;

	if (isCircularHssType(sectionType) === true){
		var cx = X0;
		var cy = Y0 + (outerHeight / 2);
		var outerRad = Math.min(outerWidth, outerHeight) / 2;
		var innerRad = Math.max(0, outerRad - wallThicknessPx);

		context.beginPath();
		context.arc(cx, cy, outerRad, 0, Math.PI * 2, false);
		if (innerRad > 0){
			context.moveTo(cx + innerRad, cy);
			context.arc(cx, cy, innerRad, 0, Math.PI * 2, false);
		}
		context.lineWidth = LINE_WIDTH;
		context.strokeStyle = LINE_COLOR;
		context.fillStyle = FILL_COLOR;
		context.fill('evenodd');
		context.stroke();
		return;
	}

	innerX = xLeft + wallThicknessPx;
	innerY = yTop + wallThicknessPx;
	innerWidth = outerWidth - (2 * wallThicknessPx);
	innerHeight = outerHeight - (2 * wallThicknessPx);

	context.beginPath();
	drawRoundedRectPath(xLeft, yTop, outerWidth, outerHeight, outerRadiusPx);
	if (innerWidth > 0 && innerHeight > 0){
		drawRoundedRectPath(innerX, innerY, innerWidth, innerHeight, innerRadiusPx);
	}
	context.lineWidth = LINE_WIDTH;
	context.strokeStyle = LINE_COLOR;
	context.fillStyle = FILL_COLOR;
	context.fill('evenodd');
	context.stroke();
}


function drawHssDimensions(){
	var style = 4;
	var which = 3;
	var angle = Math.PI/8;
	var dist = 12;
	var isCircular = isCircularHssType(sectionType) === true;
	var aOff = DIMENSION_ANCHOR_OFFSET;
	var lOff = DIMENSION_TICK_OFFSET;
	var sectionLeftOffset = getSectionLeftOffset(sectionType, b);
	var sectionRightOffset = getSectionRightOffset(sectionType, b);
	var wallThickness = getClosedSectionWallThickness();
	var widthDimensionY = Y0 - TOP_WIDTH_DIMENSION_GAP;
	var leftDepthDimensionX = X0 + sectionLeftOffset*SCALE - 2*aOff - LEFT_DEPTH_DIMENSION_EXTRA_OFFSET;
	var wallThicknessDimensionY = isCircular === true ? (Y0 + d*SCALE*0.5) : (Y0 + d*SCALE*0.35);
	var outerRightWallX = X0 + sectionRightOffset*SCALE;
	var innerRightWallX = outerRightWallX - wallThickness*SCALE;
	var x1;
	var y1;
	var x2;
	var y2;
	var tx;
	var ty;

	// 'b' dimension arrow.
	x1 = X0 + sectionLeftOffset*SCALE;
	y1 = widthDimensionY;
	x2 = X0 + sectionRightOffset*SCALE;
	y2 = y1;
	drawArrow(context, x1, y1, x2, y2, style, which, angle, dist);
	drawOneLine(x1, Y0 - lOff, x1, widthDimensionY - lOff);
	drawOneLine(x2, Y0 - lOff, x2, widthDimensionY - lOff);
	tx = X0;
	ty = widthDimensionY - 4;
	writeOneText('400', '15', 'Roboto', 'center', '#484848', formatDimensionValue(b), tx, ty);

	if (isCircular !== true){
		// 'd' dimension arrow.
		x1 = leftDepthDimensionX;
		y1 = Y0;
		x2 = x1;
		y2 = Y0 + d*SCALE;
		drawArrow(context, x1, y1, x2, y2, style, which, angle, dist);
		drawOneLine(X0 + sectionLeftOffset*SCALE - lOff, y1, leftDepthDimensionX - lOff, y1);
		drawOneLine(X0 + sectionLeftOffset*SCALE - lOff, y2, leftDepthDimensionX - lOff, y2);
		tx = leftDepthDimensionX - 5;
		ty = Y0 + d/2*SCALE + 15/2;
		writeOneText('400', '15', 'Roboto', 'right', '#484848', formatDimensionValue(d), tx, ty);
	}

	// 't' wall thickness shown like beam web thickness: opposing horizontal arrows.
	y1 = wallThicknessDimensionY;
	x1 = innerRightWallX - aOff*0.9;
	x2 = innerRightWallX;
	drawArrow(context, x1, y1, x2, y1, style, 1, angle, dist);
	x1 = outerRightWallX + aOff*0.9;
	x2 = outerRightWallX;
	drawArrow(context, x1, y1, x2, y1, style, 1, angle, dist);
	tx = outerRightWallX + aOff*0.9 + 3;
	ty = y1 + 14/2;
	writeOneText('400', '15', 'Roboto', 'left', '#484848', formatDimensionValue(wallThickness), tx, ty);
}


function drawAngleDimensions(){
	var style = 4;
	var which = 3;
	var angle = Math.PI/8;
	var dist = 12;
	var aOff = DIMENSION_ANCHOR_OFFSET;
	var lOff = DIMENSION_TICK_OFFSET;
	var sectionLeftOffset = getSectionLeftOffset(sectionType, b);
	var sectionRightOffset = getSectionRightOffset(sectionType, b);
	var legThickness = isFinite(t) && t > 0 ? t : w;
	var widthDimensionY = Y0 - TOP_WIDTH_DIMENSION_GAP;
	var leftDepthDimensionX = X0 + sectionLeftOffset*SCALE - 2*aOff - LEFT_DEPTH_DIMENSION_EXTRA_OFFSET;
	var sectionBottomY = Y0 + d*SCALE;
	var leftLegLeftX = X0 + sectionLeftOffset*SCALE;
	var leftLegRightX;
	var x1;
	var y1;
	var x2;
	var y2;
	var tx;
	var ty;

	if (!isFinite(legThickness) || legThickness <= 0){
		legThickness = Math.min(b, d) * 0.1;
	}
	legThickness = Math.min(legThickness, b, d);
	leftLegRightX = leftLegLeftX + legThickness*SCALE;

	// 'b' (leg length) dimension at the top.
	x1 = X0 + sectionLeftOffset*SCALE;
	y1 = widthDimensionY;
	x2 = X0 + sectionRightOffset*SCALE;
	y2 = y1;
	drawArrow(context, x1, y1, x2, y2, style, which, angle, dist);
	drawOneLine(x1, Y0 - lOff, x1, widthDimensionY - lOff);
	drawOneLine(x2, Y0 - lOff, x2, widthDimensionY - lOff);
	tx = X0;
	ty = widthDimensionY - 4;
	writeOneText('400', '15', 'Roboto', 'center', '#484848', formatDimensionValue(b), tx, ty);

	// 'd' (leg length) dimension on the left.
	x1 = leftDepthDimensionX;
	y1 = Y0;
	x2 = x1;
	y2 = sectionBottomY;
	drawArrow(context, x1, y1, x2, y2, style, which, angle, dist);
	drawOneLine(X0 + sectionLeftOffset*SCALE - lOff, y1, leftDepthDimensionX - lOff, y1);
	drawOneLine(X0 + sectionLeftOffset*SCALE - lOff, y2, leftDepthDimensionX - lOff, y2);
	tx = leftDepthDimensionX - 5;
	ty = Y0 + d/2*SCALE + 15/2;
	writeOneText('400', '15', 'Roboto', 'right', '#484848', formatDimensionValue(d), tx, ty);

	// 'w' (vertical leg thickness) shown with horizontal arrows near the upper-third.
	y1 = Y0 + d*SCALE*0.35;
	x1 = leftLegLeftX - aOff*0.9;
	x2 = leftLegLeftX;
	drawArrow(context, x1, y1, x2, y1, style, 1, angle, dist);
	x1 = leftLegRightX + aOff*0.9;
	x2 = leftLegRightX;
	drawArrow(context, x1, y1, x2, y1, style, 1, angle, dist);
	tx = leftLegRightX + aOff*0.9 + 3;
	ty = y1 + 14/2;
	writeOneText('400', '15', 'Roboto', 'left', '#484848', formatDimensionValue(legThickness), tx, ty);
}


function drawDimensions(){
	if (isHssSectionType(sectionType) === true || isPipeSectionType(sectionType) === true){
		drawHssDimensions();
		return;
	}

	if (isAngleSectionType(sectionType) === true){
		drawAngleDimensions();
		return;
	}

	var isTeeSection = isTeeSectionType(sectionType);
	var style = 4,
	which = 3,
	angle = Math.PI/8,
	dist = 12,
	aOff = DIMENSION_ANCHOR_OFFSET,
	lOff = DIMENSION_TICK_OFFSET,
	x1,
	y1,
	x2,
	y2,
	tx,
	ty,
	distT = Math.round((isTeeSection ? (d - k) : (d - 2*k))*100)/100,
	freeD = Math.round((isTeeSection ? (d - t) : (d - 2*t))*100)/100;
	var sectionLeftOffset = getSectionLeftOffset(sectionType, b);
	var sectionRightOffset = getSectionRightOffset(sectionType, b);
	var webLeftOffset = getWebLeftOffset(sectionType, b, w);
	var webRightOffset = getWebRightOffset(sectionType, b, w);
	var webToeOffset = getWebToeOffset(sectionType, b, w);
	var distTopY = Y0 + k*SCALE;
	var distBottomY = isTeeSection ? (Y0 + d*SCALE) : (Y0 + (d-k)*SCALE);
	var freeDepthTopY = Y0 + t*SCALE;
	var freeDepthBottomY = isTeeSection ? (Y0 + d*SCALE) : (Y0 + (d-t)*SCALE);
	var widthDimensionOffset = TOP_WIDTH_DIMENSION_GAP;
	var widthDimensionY = Y0 - widthDimensionOffset;
	var leftDepthDimensionExtraOffset = LEFT_DEPTH_DIMENSION_EXTRA_OFFSET;
	var leftDepthDimensionX = X0 + sectionLeftOffset*SCALE - 2*aOff - leftDepthDimensionExtraOffset;
	var leftInnerDimensionExtraOffset = 20;
	var leftInnerDimensionX = X0 + sectionLeftOffset*SCALE - aOff - leftInnerDimensionExtraOffset;
	var thicknessReferenceXOffset = flangeThicknessReferenceXOffset;
	var rightSectionFaceX = X0 + sectionRightOffset*SCALE;
	var rightDimensionClearance = RIGHT_DIMENSION_CLEARANCE;
	var rightWitnessObjectGap = 8;
	var rightDimensionX = rightSectionFaceX + rightDimensionClearance;
	var rightDimensionTickX = rightDimensionX + lOff;
	var rightDimensionTextX = rightDimensionX + RIGHT_DIMENSION_TEXT_OFFSET;
	var thicknessReferenceX = X0 + thicknessReferenceXOffset*SCALE;
	var rightWitnessStartX = Math.max(thicknessReferenceX, rightSectionFaceX + rightWitnessObjectGap);
	
	// 'b' dimension arrow. 
	// Function 'drawArrow()' takes care about pixel precision to draw the arrow
	x1 = X0 + sectionLeftOffset*SCALE;
	y1 = widthDimensionY;
	x2 = X0 + sectionRightOffset*SCALE;
	y2 = y1;
	drawArrow (context,x1,y1,x2,y2,style,which,angle,dist);
	y1 = Y0 - lOff;
	y2 = widthDimensionY - lOff;
	drawOneLine(x1,y1,x1,y2);
	drawOneLine(x2,y1,x2,y2);
	tx = X0;
	ty = widthDimensionY - 4;
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
	y1 = distTopY;
	x2 = x1;
	y2 = distBottomY;
	drawArrow (context,x1,y1,x2,y2,style,which,angle,dist);
	x1 = X0 + webToeOffset*SCALE - lOff;
	x2 = leftInnerDimensionX - lOff;
	drawOneLine(x1,y1,x2,y1);
	drawOneLine(x1,y2,x2,y2);
	tx = leftInnerDimensionX + 5;
	ty = (y1 + y2)/2 + 15/2;
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
	var webThicknessDimensionY = distTopY + distT*0.30*SCALE + WEB_THICKNESS_DIMENSION_Y_OFFSET;
	x1 = X0 + webLeftOffset*SCALE - aOff*0.9;
	y1 = webThicknessDimensionY;
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
	y1 = Y0 - aOff*0.9;
	x2 = x1;
	y2 = Y0;
	drawArrow (context,x1,y1,x2,y2,style,1,angle,dist);
	tx = leftInnerDimensionX;
	ty = y1 - 15/2;
	writeOneText('400', '15', 'Roboto', 'right', '#484848', formatDimensionValue(k), tx, ty);
	
	// 'inside height' : variable 'freeD' dimension arrow. 
	// Function 'drawArrow()' takes care about pixel precision to draw the arrow
	x1 = rightDimensionX;
	y1 = freeDepthTopY;
	x2 = x1;
	y2 = freeDepthBottomY;
	drawArrow (context,x1,y1,x2,y2,style,which,angle,dist);
	x1 = rightWitnessStartX;
	x2 = rightDimensionTickX;
	drawOneLine(x1,y2,x2,y2);
	tx = rightDimensionTextX;
	ty = (y1 + y2)/2 + 14/2;
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
	var explicitType = firstNonEmptyString([row.type, row.Type]);
	var depth = firstFiniteNumber([row.d, row.D]);
	var width = firstFiniteNumber([row.b, row.Bf1, row.Bf2]);

	if (!isFinite(width) && isPipeRawType(explicitType) === true){
		// PIPE/PIP rows usually store only diameter (D). Use D as width for rendering/filtering.
		width = depth;
	}

	normalized.name = firstNonEmptyString([row.name, row.Name]);
	normalized.type = explicitType;
	normalized.mass = firstFiniteNumber([row.mass, row.mu]);
	normalized.a = areaValue;
	normalized.d = depth;
	normalized.b = width;
	normalized.w = firstFiniteNumber([row.w, row.tw, row.t, row.tf1, row.tf2]);
	normalized.t = firstFiniteNumber([row.t, row.tf1, row.tf2]);
	normalized.k = firstFiniteNumber([row.k]);
	normalized.k1 = firstFiniteNumber([row.k1]);
	normalized.rf = firstFiniteNumber([row.rf, row.Rf]);
	normalized.rtoe = firstFiniteNumber([row.rtoe, row.Rtoe]);
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
	var explicitType = firstNonEmptyString([row.Type, row.type]);
	var flangeThickness = firstFiniteNumber([row.tf1, row.tf2]);
	var webThickness = firstFiniteNumber([row.tw, flangeThickness]);
	var rootRadius = firstFiniteNumber([row.Rf]);
	var depth = firstFiniteNumber([row.D, row.d]);
	var width = firstFiniteNumber([row.Bf1, row.Bf2, row.b]);
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

	if (!isFinite(width) && isPipeRawType(explicitType) === true){
		// PIPE/PIP rows usually store only diameter (D). Use D as width for rendering/filtering.
		width = depth;
	}

	normalized.name = firstNonEmptyString([row.Name, row.name]);
	normalized.type = explicitType;
	normalized.mass = firstFiniteNumber([row.mu, row.mass]);
	normalized.a = areaValue;
	normalized.d = depth;
	normalized.b = width;
	normalized.w = webThickness;
	normalized.t = flangeThickness;
	normalized.k = kValue;
	normalized.k1 = k1Value;
	normalized.rf = firstFiniteNumber([row.Rf, row.rf]);
	normalized.rtoe = firstFiniteNumber([row.Rtoe, row.rtoe]);
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
	model.rf = parseFloat(shapeRow.rf);
	model.rtoe = parseFloat(shapeRow.rtoe);
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
	rf = model.rf;
	rtoe = model.rtoe;
	sectionType = model.sectionType;
	flangeTipThickness = model.flangeTipThickness;
	flangeWebThickness = model.flangeWebThickness;
	flangeThicknessReferenceXOffset = model.flangeThicknessReferenceXOffset;
}


function isSlopedFlangeSectionType(type){
	return type === 'S' || type === 'ST' || type === 'C' || type === 'MC';
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
		var scaleByHeight = getScaleByExtent(AVAILABLE_BEAM_HEIGHT_PIXELS, d);
		var scaleByWidth = getScaleByExtent(AVAILABLE_BEAM_WIDTH_PIXELS, b);
		var zoomScale = Math.min(scaleByHeight, scaleByWidth);

		if (isFinite(zoomScale) && zoomScale > 0){
			return zoomScale;
		}

		return scaleByHeight;
	}

	var rows = getCurrentShapeRows();
	var activeType = getActiveSectionType(rows);
	var typeScale = getStandardScaleForShapeSetAndSectionType(currentShapeSetKey, activeType);

	if (isFinite(typeScale) && typeScale > 0){
		return typeScale;
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


function buildTeeGeometry(model, scale){
	var halfB = model.b / 2;
	var halfW = model.w / 2;
	var insideTopAtTip = model.flangeTipThickness;
	var insideTopAtWeb = model.flangeWebThickness;
	var xOffsets = [0, halfB, halfB, halfW, halfW, -halfW, -halfW, -halfB, -halfB, 0];
	var yOffsets = [0, 0, insideTopAtTip, insideTopAtWeb, model.d, model.d, insideTopAtWeb, insideTopAtTip, 0, 0];

	return {
		coordinates: projectOffsetsToCanvas(xOffsets, yOffsets, scale),
		insideArcSegments: TEE_INSIDE_ARC_SEGMENT_INDEX,
		outsideArcSegments: TEE_OUTSIDE_ARC_SEGMENT_INDEX
	};
}


function buildAngleGeometry(model, scale){
	var left = -model.b / 2;
	var right = model.b / 2;
	var thickness = isFinite(model.t) && model.t > 0 ? model.t : model.w;
	var xOffsets;
	var yOffsets;

	if (!isFinite(thickness) || thickness <= 0){
		thickness = Math.min(model.b, model.d) * 0.1;
	}
	thickness = Math.min(thickness, model.b, model.d);

	xOffsets = [left, left + thickness, left + thickness, right, right, left, left];
	yOffsets = [0, 0, model.d - thickness, model.d - thickness, model.d, model.d, 0];

	return {
		coordinates: projectOffsetsToCanvas(xOffsets, yOffsets, scale),
		insideArcSegments: ANGLE_INSIDE_ARC_SEGMENT_INDEX,
		outsideArcSegments: ANGLE_OUTSIDE_ARC_SEGMENT_INDEX
	};
}


function isWideFlangeFamily(type){
	return type === 'W' || type === 'M' || type === 'MP' || type === 'HP';
}


function isHssSectionType(type){
	var filterType = mapRawSectionTypeToFilterType(type);

	return filterType === 'HSS';
}


function isCircularHssType(type){
	var rawType = String(type || '').toUpperCase();

	return rawType === 'HSS C' ||
		rawType === 'HSS C A500' ||
		rawType === 'CHS' ||
		rawType === 'CHS C250' ||
		rawType === 'CHS C350' ||
		rawType === 'PIPE' ||
		rawType === 'PIP';
}


function isAngleSectionType(type){
	var filterType = mapRawSectionTypeToFilterType(type);

	return filterType === 'L';
}


function isPipeSectionType(type){
	var filterType = mapRawSectionTypeToFilterType(type);

	return filterType === 'PIPE';
}


function isTeeSectionType(type){
	var filterType = mapRawSectionTypeToFilterType(type);

	return filterType === 'WT' || filterType === 'MT' || filterType === 'ST';
}


function buildBeamGeometry(model, scale){
	if (isChannelSectionType(model.sectionType) === true){
		return buildChannelGeometry(model, scale);
	}

	if (isTeeSectionType(model.sectionType) === true){
		return buildTeeGeometry(model, scale);
	}

	if (isAngleSectionType(model.sectionType) === true){
		return buildAngleGeometry(model, scale);
	}

	// W, M and MP (plus HP) share the same symmetric I-beam drawing strategy.
	if (isWideFlangeFamily(model.sectionType) === true){
		return buildSymmetricIBeamGeometry(model, scale);
	}

	return buildSymmetricIBeamGeometry(model, scale);
}


function getBeamCornerRadii(model, scale){
	if (isAngleSectionType(model.sectionType) === true){
		var angleThickness = isFinite(model.t) && model.t > 0 ? model.t : model.w;
		var maxInsideRadius;
		var maxOutsideRadius;
		var angleInside = isFinite(model.rf) ? model.rf : NaN;
		var angleOutside = isFinite(model.rtoe) ? model.rtoe : NaN;

		if (!isFinite(angleThickness) || angleThickness <= 0){
			angleThickness = Math.max(0, Math.min(model.b, model.d) * 0.1);
		}
		maxInsideRadius = Math.max(0, Math.min(model.b - angleThickness, model.d - angleThickness));
		maxOutsideRadius = Math.max(0, angleThickness);

		if (!isFinite(angleInside) || angleInside < 0){
			angleInside = 0;
		}
		if (!isFinite(angleOutside) || angleOutside < 0){
			angleOutside = 0;
		}

		angleInside = Math.min(angleInside, maxInsideRadius);
		angleOutside = Math.min(angleOutside, maxOutsideRadius);

		return {
			inside: angleInside * scale,
			outside: angleOutside * scale
		};
	}

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
	currentSourceCreditText = selectedShapeSet.sourceCreditText;
	standardScale = selectedShapeSet.scale;
	currentShapeSetKey = shapeSetKey;

	return true;
}


function setCanvasCopyFeedback(message, statusClass){
	var button = $('#copy-canvas');
	var defaultTooltipMessage = 'Copy canvas image to clipboard';

	if (canvasCopyFeedbackTimeoutId){
		window.clearTimeout(canvasCopyFeedbackTimeoutId);
		canvasCopyFeedbackTimeoutId = null;
	}

	button.removeClass('is-success is-error show-tooltip');
	button.attr('data-tooltip', defaultTooltipMessage);

	if (!message){
		return;
	}

	button.attr('data-tooltip', message);
	button.addClass('show-tooltip');

	if (statusClass === 'success'){
		button.addClass('is-success');
	}
	if (statusClass === 'error'){
		button.addClass('is-error');
	}

	if (statusClass !== 'success' && statusClass !== 'error'){
		return;
	}

	canvasCopyFeedbackTimeoutId = window.setTimeout(function(){
		button.removeClass('is-success is-error show-tooltip');
		button.attr('data-tooltip', defaultTooltipMessage);
		canvasCopyFeedbackTimeoutId = null;
	}, 1800);
}


function copyCanvasImageToClipboard(canvasElement){
	return new Promise(function(resolve, reject){
		if (!canvasElement){
			reject(new Error('Canvas element is not available.'));
			return;
		}

		if (!canvasElement.toBlob || !window.ClipboardItem || !navigator.clipboard || !navigator.clipboard.write){
			reject(new Error('Clipboard image copy is not supported in this browser/context.'));
			return;
		}

		canvasElement.toBlob(function(blob){
			if (!blob){
				reject(new Error('Could not read the canvas image.'));
				return;
			}

			navigator.clipboard.write([new ClipboardItem({'image/png': blob})]).then(function(){
				resolve();
			}, function(error){
				reject(error || new Error('Clipboard write failed.'));
			});
		}, 'image/png');
	});
}


function setCanvasCopyListener(){
	var copyButton = $('#copy-canvas');

	if (copyButton.length === 0){
		return;
	}

	copyButton.off('click.steel').on('click.steel', function(){
		var button = $(this);

		if (button.hasClass('is-busy')){
			return;
		}

		button.addClass('is-busy');
		setCanvasCopyFeedback('Copying image...', '');

		copyCanvasImageToClipboard(canv).then(function(){
			button.removeClass('is-busy');
			setCanvasCopyFeedback('Image copied to clipboard.', 'success');
		}, function(){
			button.removeClass('is-busy');
			setCanvasCopyFeedback('Clipboard blocked image copy in this browser/context.', 'error');
		});
	});
}


function setMostListeners(){
	setCanvasCopyListener();

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
	var explicitType;

	if (!row){
		return '';
	}

	explicitType = firstNonEmptyString([row.type, row.Type]);
	if (explicitType){
		return explicitType.toUpperCase();
	}

	// Filtering is strictly Type-driven; do not infer type from the section name.
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
	var i;

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
	for (i = 0; i < SECTION_TYPE_FILTER_ORDER.length; i++){
		var type = SECTION_TYPE_FILTER_ORDER[i];
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



			
