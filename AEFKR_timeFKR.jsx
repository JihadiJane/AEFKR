
var myComp = app.project.activeItem,  											// get the selected layer
	layerIndex = myComp.selectedLayers[0].index,  								// grab index of selected layer
	layer = myComp.layer(layerIndex),   										//set the selected layer
	propIndex = layer.selectedProperties.length - 1,  							//Get how many properties are selected if more than one only the last one is retained
	prop = layer.selectedProperties[propIndex],   								// set variable to point to the last selected propertiies
	frameBias 				= 4,
	frameRange 		= [ 0, 50 ],
	amp						= 2,												// how much variance to add to value mixup
	fps = 24
	;

app.beginUndoGroup("undo script");
execute();
app.endUndoGroup();

////////////////////////

function execute()
{
	var startFrame = convertTimeToFPS(prop.keyTime(1), fps) + frameBias,
		endFrame = convertTimeToFPS(prop.keyTime(prop.numKeys), fps),
		currentFrame = startFrame,
		kf = 2,
		numPropKeys = 0,
		frameValues = []
		;

	while (currentFrame < endFrame)
	{
		var _time = convertFPSToTime(currentFrame, fps);
		
		frameValues.push(prop.valueAtTime(_time, true));
		currentFrame += frameBias;
	}

	currentFrame = startFrame;
	kf = 2;
	while (currentFrame < endFrame)
	{
		var _time = convertFPSToTime(currentFrame, fps);
		prop.setValueAtTime(_time, frameValues[kf -2]);
		currentFrame += frameBias;
		//prop.setInterpolationTypeAtKey(kf, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
		kf++;
	}

	alert(frameValues.length)
	prop.setInterpolationTypeAtKey(1, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
	
	numPropKeys = kf;
	kf = 2;
	while (kf < numPropKeys + 1)
	{
	prop.setInterpolationTypeAtKey(kf, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
	kf++;

	}
}

function convertTimeToFPS(time, targetFPS)
{
	var convertedTime;

	convertedTime = Math.round(parseFloat(time) * parseFloat(targetFPS));
	return convertedTime;
}

function convertFPSToTime(frame, targetFPS)
{
	var convertedFPS;

	convertedFPS = parseInt(frame) / parseInt(targetFPS);
	return convertedFPS;
}
