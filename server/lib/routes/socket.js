var cv = require('opencv');

// camera properties
var camWidth = 320;
var camHeight = 240;
var camFps = 10;
var camInterval = 1000 / camFps;

// face detection properties
var rectColor = [0, 255, 0];
var rectThickness = 2;

// initialize camera
var camera = new cv.VideoCapture(0);
camera.setWidth(camWidth);
camera.setHeight(camHeight);

module.exports = function (socket) {
  setInterval(function() {
	var im = camera.ReadSync();
	if(!im) return;
	var size = im.size();
	if(!size[0]) return;
	if(!size[1]) return;
/*	console.log(size[0]);
	console.log(size[1]);
	console.log(im);
	console.log(im.size());
	console.log("socket function called");*/
	im.detectObject('./node_modules/opencv/data/haarcascade_frontalface_alt2.xml', {}, function(err, faces) {
        if (err) throw err;
        for (var i = 0; i < faces.length; i++) {
          face = faces[i];
          im.rectangle([face.x, face.y], [face.width, face.height], rectColor, rectThickness);
        }
		
		//console.log("Socket Emit");
        socket.emit('frame', { buffer: im.toBuffer() });
		global.gc();
    });
	  
	/*camera.read(function(err, im) {
      if (err) throw err;
	  console.log("Camera read");
      im.detectObject('./node_modules/opencv/data/haarcascade_frontalface_alt2.xml', {}, function(err, faces) {
        if (err) throw err;

        for (var i = 0; i < faces.length; i++) {
          face = faces[i];
          im.rectangle([face.x, face.y], [face.width, face.height], rectColor, rectThickness);
        }
		
		console.log("Socket Emit");
        socket.emit('frame', { buffer: im.toBuffer() });
      });
    });*/
	//console.log("Camera about to close");
  }, camInterval);
};
