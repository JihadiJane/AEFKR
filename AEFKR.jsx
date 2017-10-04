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
	// get time length of each layer
	// while tempTime < time length do this, else: tempTime = 0, 
	// // tempTime += rand(frameBias, frameBias + rand(0, frameBias * (1 + amp)) % 2
	// // place keyframe at tempTime

	// repeat while loop for moving keyframes and converting some to holds
	// convert to hold, then probability choose if moved (low probability for moving keys)

	glitchAmp = i;
}

alert(glitchAmp);

