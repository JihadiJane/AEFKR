
var mainComp = app.project.activeItem,
	selectedLayer, 
	inputStartFrame,																		// inputs
	inputEndFrame,
	inputFrameRate,
	inputFrameBias,
	inputNumMasks,
	inputFreqMin,
	inputFreqMax,
	inputFreqBias,
	inputAmpXPos,
	inputAmpXNeg,
	inputAmpYPos,
	inputAmpYNeg
	;


// setup UI

var windowAEFKR = new Window ("dialog", "AEFKR"); 											// create window

var groupInput = windowAEFKR.add ("group");													// create input groups
groupInput.orientation = "column";
groupInput.alignChildren = "left";

var groupFrameRange = groupInput.add ("group");												// frame range
groupFrameRange.add ("statictext", undefined, "Frame range:");									
inputStartFrame = groupFrameRange.add ("edittext", undefined, "in");
inputEndFrame = groupFrameRange.add ("edittext", undefined, "out");
inputStartFrame.characters = 2;
inputEndFrame.characters = 2;
inputStartFrame.active = true;

var groupFrameRate = groupInput.add ("group");												// frame rate
groupFrameRate.add ("statictext", undefined, "Frame rate:");									
inputFrameRate = groupFrameRate.add ("edittext", undefined, "fps");
inputFrameRate.characters = 2;

var groupFrameBias = groupInput.add ("group");												// frame rate
groupFrameBias.add ("statictext", undefined, "Frame bias:");									
inputFrameBias = groupFrameBias.add ("edittext", undefined, "frames");
inputFrameBias.characters = 4;

var groupNumMasks = groupInput.add ("group");												// num masks
groupNumMasks.add ("statictext", undefined, "Number of masks:");									
inputNumMasks = groupNumMasks.add ("edittext", undefined, "?");
inputNumMasks.characters = 2;

var groupFreq = groupInput.add ("group");													// frequency
groupFreq.add ("statictext", undefined, "Frequency:");									
inputFreqMin = groupFreq.add ("edittext", undefined, "min");
inputFreqMax = groupFreq.add ("edittext", undefined, "max");
inputFreqBias = groupFreq.add ("edittext", undefined, "bias");
inputFreqMin.characters = 2;
inputFreqMax.characters = 3;
inputFreqBias.characters = 3;

var groupAmp = groupInput.add ("group");													// amp
groupAmp.add ("statictext", undefined, "Amplitude:");									
inputAmpXPos = groupAmp.add ("edittext", undefined, "X+");
inputAmpXNeg = groupAmp.add ("edittext", undefined, "X-");
inputAmpYPos = groupAmp.add ("edittext", undefined, "Y+");
var inputAmpYNeg = groupAmp.add ("edittext", undefined, "Y-");
inputAmpXPos.characters = 2;
inputAmpXNeg.characters = 2;
inputAmpYPos.characters = 2;
inputAmpYNeg.characters = 2;

var layersList = [];
for (i = 0; i < mainComp.layers.length; i++)
{
	layersList.push(mainComp.layers[i + 1].name);
}

var groupLayerToActOn = groupInput.add ("group");	
groupLayerToActOn.add ('statictext', undefined, 'Layer to glitch: ');
var dropDownAction = groupLayerToActOn.add ('dropdownlist', undefined, layersList);
dropDownAction.selection = 0;

var groupLayerToTrack = groupInput.add ("group");	
groupLayerToTrack.add ('statictext', undefined, 'Layer to track: ');
var dropDownTrack = groupLayerToTrack.add ('dropdownlist', undefined, layersList);
dropDownTrack.selection = 0;


var groupButtons = windowAEFKR.add ("group");
groupButtons.alignment = "right";
var buttonOK = groupButtons.add ("button", undefined, "OK");
var buttonCancel = groupButtons.add ("button", undefined, "Cancel");

windowAEFKR.show();

buttonOK.onClick = execute(groupInput);




function execute(_groupInput)
{
	var frameBias =							 parseInt(inputFrameBias.text),																			// 								which frames to move on
		frameRange =				[ parseInt(inputStartFrame.text), parseInt(inputEndFrame.text) ],	
		frameRate = 						parseInt(inputFrameRate.text),																		// [ startFrame, endFrame ]		sets frame range			
		centerPoint = 			  [ parseInt(app.project.item(1).layer(dropDownTrack.selection.text).property("Transform").property("Position").value[0]), parseInt(app.project.item(1).layer(dropDownTrack.selection.text).property("Transform").property("Position").value[1]) ],																			// [ X, Y ]						center of glitch (assume nullPos is centerPoint, take incoming pos at time)
		numMasks =						  	 parseInt(inputNumMasks.text),																		// [ maskAmount, variance ]  	how many masks, and general scale variance on freq min/max scale
		freq = 			 		   [ parseInt(inputFreqMin.text), parseInt(inputFreqMax.text), parseInt(inputFreqBias.text) ],																			// [ min, max, bias ] 			range for glitch jitter with bias (set at beginning per mask, keep consistent throughout execution)
		amp =		  [ parseInt(inputAmpXPos.text), parseInt(inputAmpXNeg.text), parseInt(inputAmpYPos.text), parseInt(inputAmpYNeg.text) ],																			// [ X+, X-, Y+, Y- ] 			amplitude in each direction XY
		createdMasks = [],
		//currentLayer = selectedLayer,	// replace																		// current layer of selected layers
		newMasks,																									// array of new masks following maskAmount	
		boundsShape = new Shape(),
		boundsMask,
		boundsRange = [ [ 0, 0 ], [ 0, 0 ], [ 0, 0 ], [ 0, 0 ] ]
		;

	selectedLayer = app.project.item(1).layer(dropDownAction.selection.text);
	selectedLayer.property("Position").setValue([ 0,0 ]); 															// reposition layer to 0,0

	boundsMask = selectedLayer.property("ADBE Mask Parade").addProperty("Mask");
	boundsRange = setBoundsRange(centerPoint, amp);
	boundsShape.vertices = boundsRange;
	boundsMask.property("ADBE Mask Shape").setValue(boundsShape);
	boundsMask.color = [ 1, 0, 0 ];
	boundsMask.name = "_glitchBOUNDS";
	boundsMask.maskMode = MaskMode.NONE;

	createdMasks.push(boundsShape);


	for (var i = 0; i < numMasks; i++)																				// make each of the masks with random verts
	{

		var maskVerts = randomVertsInRange(centerPoint, amp);

		var maskName =  "mask" + i.toString();
			newShape = new Shape(),
			newMask = selectedLayer.property("ADBE Mask Parade").addProperty("Mask")
			;		
			
 		newShape.vertices = maskVerts;

		newMask.property("ADBE Mask Shape").setValue(newShape);
		newMask.name = "_" + maskName;

		createdMasks.push(newShape);																				// put all masks in createdMasks array

	}

	for (var i = 0; i < createdMasks.length; i++)																	// loop through existing masks
	{
		var randVerts,
			randShape = new Shape(),
			masksGrp,
			masksGrpLen,
			currentTime = convertFPSToTime(frameRange[0], frameRate),
			f = frameRange[0],
			kf = 1
			;

		masksGrp = selectedLayer.property("ADBE Mask Parade");
		masksGrpLen = masksGrp.numProperties;

		while (f <= frameRange[1])															// loop through each frame in the range
		{
			currentTime = convertFPSToTime(f, frameRate);
			centerPoint = app.project.item(1).layer(dropDownTrack.selection.text).property("Transform").property("Position").valueAtTime(currentTime, true); //replace

			if (i > 0) 
			{
				setMaskVertsAtTime(currentTime, i, randomVertsInRange(centerPoint, amp), masksGrp);					
				masksGrp.property(i + 1).property("ADBE Mask Shape").setInterpolationTypeAtKey(kf, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
			}
			else
			{
				boundsRange = setBoundsRange(centerPoint, amp);
				setMaskVertsAtTime(currentTime, i, boundsRange, masksGrp);
				masksGrp.property(i + 1).property("ADBE Mask Shape").setInterpolationTypeAtKey(kf, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
			}

			
			f += frameBias;
			kf++;

		}
	}
}

function setBoundsRange(_centerPoint, _amp)
{
	var _boundsRange =  [ [ 0, 0 ], [ 0, 0 ], [ 0, 0 ], [ 0, 0 ] ];

	_boundsRange[0][0] = _centerPoint[0] + _amp[1]; 																	// set bounds range for testing
	_boundsRange[0][1] = _centerPoint[1] + _amp[2];

	_boundsRange[1][0] = _centerPoint[0] + _amp[0]; 
	_boundsRange[1][1] = _centerPoint[1] + _amp[2];

	_boundsRange[2][0] = _centerPoint[0] + _amp[0]; 
	_boundsRange[2][1] = _centerPoint[1] + _amp[3];

	_boundsRange[3][0] = _centerPoint[0] + _amp[1]; 
	_boundsRange[3][1] = _centerPoint[1] + _amp[3];

	return _boundsRange;
}

function convertTimeToFPS(time, targetFPS)
{
	var convertedTime;

	convertedTime = Math.floor(time * targetFPS);

	return convertedTime;
}

function convertFPSToTime(frame, targetFPS)
{
	var convertedFPS;

	convertedFPS = frame / targetFPS;
	return convertedFPS;
}

function setMaskVertsAtTime(time, maskIndex, keyVerts, _masksGrp)
{
	var tempShape = new Shape();
		
		tempShape.vertices = keyVerts;	

		_masksGrp.property(maskIndex + 1).property("ADBE Mask Shape").setValueAtTime(time, tempShape);
}

function randomVertsInRange(_centerPoint, _amp) 
{
		var verts = [ [ 0, 0 ], [ 0, 0 ], [ 0, 0 ], [ 0, 0 ] ], 													// array of [ X+, X-, Y+, Y- ] vertices per newMasks
		newVert,																								// newVert to be changed per loop	
		point0 = [ 0, 0 ],  																					// random point0 within range of amp
		point1 = [ 0, 0 ]																						// random point1 within range of amp
		;		

		point0[0] = Math.random() * ((_centerPoint[0] + _amp[0]) - (_centerPoint[0] + _amp[1])) + (_centerPoint[0] + _amp[1]);
		point0[1] = Math.random() * ((_centerPoint[1] + _amp[2]) - (_centerPoint[1] + _amp[3])) + (_centerPoint[1] + _amp[3]);

		point1[0] = Math.random() * ((_centerPoint[0] + _amp[0]) - (_centerPoint[0] + _amp[1])) + (_centerPoint[0] + _amp[1]);
		point1[1] = Math.random() * ((_centerPoint[1] + _amp[2]) - (_centerPoint[1] + _amp[3])) + (_centerPoint[1] + _amp[3]);

		// vert 0
		verts[0][0] = point0[0];	// per vert
		verts[0][1] = point0[1];

		// vert 1
		verts[1][0] = point1[0];
		verts[1][1] = point0[1];

		// vert 2
		verts[2][0] = point1[0];
		verts[2][1] = point1[1];

		// vert 3
		verts[3][0] = point0[0];
		verts[3][1] = point1[1];

		return verts;
}
