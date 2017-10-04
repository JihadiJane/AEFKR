var mainComp = app.project.activeItem;
var selectedLayers =mainComp.selectedLayers; 
var numLayers = selectedLayers.length;

var glitchFreq = 0; 
var glitchAmp = 0;
var frameBias = 2;
var tempTime = 0;


// time fucker
for (var i = 0; i < numLayers; i++)
{

	var currentLayer, verts, tempMask, newMask;

	verts = [[0,0],[0,100],[100,100],[100,0]];

	currentLayer = selectedLayers[i];

	newShape = new Shape();
	newShape.vertices = verts;

	newMask = currentLayer.property("ADBE Mask Parade").addProperty("Mask");
	newMask.property("ADBE Mask Shape").setValue(newShape);
	newMask.name = "newMask_001";

	prop1.setValueAtTime(seconds, value);
	// tempMask = currentLayer.property("ADBE Mask Parade").property(1);
	// tempMask.property("ADBE Mask Shape").setValue(verts);

	// get time length of each layer
	// while tempTime < time length do this, else: tempTime = 0, 
	// // tempTime += rand(frameBias, frameBias + rand(0, frameBias * (1 + amp)) % 2
	// // place keyframe at tempTime

	// repeat while loop for moving keyframes and converting some to holds
	// convert to hold, then probability choose if moved (low probability for moving keys)

	glitchAmp = i;
}

alert(selectedLayers);

