




var mainComp = app.project.activeItem;
var selectedLayers =mainComp.selectedLayers; 
var numLayers = selectedLayers.length;

var frameBias = 			           4  ,																			// 								which frames to move on
	frameRange = 			      [ 0, 50 ],	
	frameRate = 						24,																		// [ startFrame, endFrame ]		sets frame range			
	centerPoint = 			  [ 500, 500 ],																			// [ X, Y ]						center of glitch (assume nullPos is centerPoint, take incoming pos at time)
	masks =						  [ 10, 0 ],																		// [ maskAmount, variance ]  	how many masks, and general scale variance on freq min/max scale
	freq = 			 		   [ 0, 0, 0 ],																			// [ min, max, bias ] 			range for glitch jitter with bias (set at beginning per mask, keep consistent throughout execution)
	amp = 	   	  [ 100, -100, 100, -100 ],																			// [ X+, X-, Y+, Y- ] 			amplitude in each direction XY
	createdMasks = []
	;
	
for (var i = 0; i < numLayers; i++)																					// per layer selected
{

	var currentLayer = selectedLayers[i],																			// current layer of selected layers
		newMasks																									// array of new masks following maskAmount	
		boundsShape = new Shape()
		boundsMask = currentLayer.property("ADBE Mask Parade").addProperty("Mask")
		boundsRange = [ [ 0, 0 ], [ 0, 0 ], [ 0, 0 ], [ 0, 0 ] ]
		;

	currentLayer.property("Position").setValue([ 0,0 ]); 															// reposition layer to 0,0

	boundsRange[0][0] = centerPoint[0] + amp[1]; 																	// set bounds range for testing
	boundsRange[0][1] = centerPoint[1] + amp[2];

	boundsRange[1][0] = centerPoint[0] + amp[0]; 
	boundsRange[1][1] = centerPoint[1] + amp[2];

	boundsRange[2][0] = centerPoint[0] + amp[0]; 
	boundsRange[2][1] = centerPoint[1] + amp[3];

	boundsRange[3][0] = centerPoint[0] + amp[1]; 
	boundsRange[3][1] = centerPoint[1] + amp[3];

	boundsShape.vertices = boundsRange;
	boundsMask.property("ADBE Mask Shape").setValue(boundsShape);
	boundsMask.color = [ 1, 0, 0 ];
	boundsMask.name = "_glitchBOUNDS";
	boundsMask.maskMode = MaskMode.NONE;


	for (var i = 0; i < masks[0]; i++)																				// loop through each mask
	{

		var maskVerts = randomVertsInRange();

		var maskName =  "mask" + i.toString();
			newShape = new Shape(),
			newMask = currentLayer.property("ADBE Mask Parade").addProperty("Mask")
			;		
			
 		newShape.vertices = maskVerts;

		newMask.property("ADBE Mask Shape").setValue(newShape);
		newMask.name = "_" + maskName;

		createdMasks.push(newShape);

	}

	for (var i = 0; i < createdMasks.length; i++)																	// loop again through existing masks
	{
		var randVerts,
			randShape = new Shape(),
			masksGrp,
			masksGrpLen,
			currKey
			;

		paths = [];
		pathNames = [];

		masksGrp = selectedLayers[0].property("ADBE Mask Parade");
		masksGrpLen = masksGrp.numProperties;

		if (masksGrpLen > 0)
		{
			var currentTime,
				startTime = convertFPSToTime(frameRange[0], 24),
				endTime =  convertFPSToTime(frameRange[1], 24),
				i = 0
				;

			currentTime = startTime;

			// for(var f = startTime; f <= endTime; f + frameBias)				// go through each frame in the range
			// {
			// 	currentTime = convertFPSToTime(f, 24);

			// 	for(var f = 1; f <= masksGrpLen; f++)
			// 	{
			// 		setMaskVertsAtTime(currentTime, f, randomVertsInRange());
			// 	}

			// 	i++;
			// }

			//alert(i);
		}

		// if (masksGrpLen > 0)
		// {
		// 	for(var f = 2; f <= masksGrpLen; f++)
		// 	{
		// 		currKey = 0;

		// 		for(var i = 0; i < 10; i++)
		// 		{
		// 		randVerts = randomVertsInRange();
		// 		randShape.vertices = randVerts;

		// 		currKey++;
				
		// 		masksGrp.property(f).property("ADBE Mask Shape").setValueAtTime(i, randShape);
		// 		masksGrp.property(f).property("ADBE Mask Shape").setInterpolationTypeAtKey(currKey, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);

		// 		}
		// 	}
		// }
	}


	var maskLen = createdMasks.length;
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

	convertedFPS = Math.floor(frame / targetFPS);
	return convertedFPS;
}

function setMaskVertsAtTime(time, maskIndex, keyVerts)
{
	var tempShape = new Shape();
		
		tempShape.vertices = keyVerts;	

		masksGrp.property(maskIndex).property("ADBE Mask Shape").setValueAtTime(time, tempShape);
}



function randomVertsInRange() 
{
		var verts = [ [ 0, 0 ], [ 0, 0 ], [ 0, 0 ], [ 0, 0 ] ], 													// array of [ X+, X-, Y+, Y- ] vertices per newMasks
		newVert,																								// newVert to be changed per loop	
		point0 = [ 0, 0 ],  																					// random point0 within range of amp
		point1 = [ 0, 0 ]																						// random point1 within range of amp
		;		

		point0[0] = Math.random() * ((centerPoint[0] + amp[0]) - (centerPoint[0] + amp[1])) + (centerPoint[0] + amp[1]);
		point0[1] = Math.random() * ((centerPoint[1] + amp[2]) - (centerPoint[1] + amp[3])) + (centerPoint[1] + amp[3]);

		point1[0] = Math.random() * ((centerPoint[0] + amp[0]) - (centerPoint[0] + amp[1])) + (centerPoint[0] + amp[1]);
		point1[1] = Math.random() * ((centerPoint[1] + amp[2]) - (centerPoint[1] + amp[3])) + (centerPoint[1] + amp[3]);

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























// in the for loop
	// make new masks out of masksAmount, put in newMasks
	
	// for each in newMasks {																						// create the initial masks
		// var tempVerts per mask
		// verts.pop(tempVerts) add it to the array of vert arrays (newMask[0].vertices = verts[0])
	
	// 











/*

//////////////////////////////////////////////

centerPoint[ X, Y ]							// center of glitch (assume nullPos is centerPoint, take incoming pos at time)
amp[ X+, X-, Y+, Y- ]					    // amplitude in each direction XY
frameBias									// which frames to move on
freqRange[ min, max, bias ]					// range for glitch jitter with bias (set at beginning per mask, keep consistent throughout execution [stable masks stay, jittery move])


*/








// var glitchFreq = 0; 
// var glitchAmp = 0;
// var frameBias = 2;
// var tempTime = 0;
// var centerPoint,

// // time fucker
// for (var i = 0; i < numLayers; i++)
// {

// 	var currentLayer, 
// 		verts, 
// 		tempMask, 
// 		newMask
// 		;

// 	verts = [[0,0],[0,100],[100,100],[100,0]];

// 	currentLayer = selectedLayers[i];

// 	newShape = new Shape();
// 	newShape.vertices = verts;

// 	newMask = currentLayer.property("ADBE Mask Parade").addProperty("Mask");
// 	newMask.property("ADBE Mask Shape").setValue(newShape);
// 	newMask.name = "newMask_001";

// 	prop1.setValueAtTime(seconds, value);
// 	// tempMask = currentLayer.property("ADBE Mask Parade").property(1);
// 	// tempMask.property("ADBE Mask Shape").setValue(verts);

// 	// get time length of each layer
// 	// while tempTime < time length do this, else: tempTime = 0, 
// 	// // tempTime += rand(frameBias, frameBias + rand(0, frameBias * (1 + amp)) % 2
// 	// // place keyframe at tempTime

// 	// repeat while loop for moving keyframes and converting some to holds
// 	// convert to hold, then probability choose if moved (low probability for moving keys)

// 	glitchAmp = i;
// }

// alert(selectedLayers);

