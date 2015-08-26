var cv = require('opencv');
var async = require('async');

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

    async.waterfall([
        function(callback) {

            console.log('read camera')
            camera.read(function (err, im) {
              if (err) return callback(err);

              if(!im) return;
              var size = im.size();
              if(!size[0]) return;
              if(!size[1]) return;  

              callback(null, im);
            });
                   
        },
        
        function(im, callback) {

          console.log('detect object');
          im.detectObject('./node_modules/opencv/data/haarcascade_frontalface_alt2.xml', {}, function(err, faces) {
            if (err) return callback(err)

            console.log('draw face');
            for (var i = 0; i < faces.length; i++) {
              face = faces[i];
              im.rectangle([face.x, face.y], [face.width, face.height], rectColor, rectThickness);
            }

            console.log('emit socket');
            socket.emit('frame', { buffer: im.toBuffer() });

            callback(null, im);

            /* Putting it here results in segmentation fault */

          });

          // callback(null, im);

          /* Putting this here results in the following error, as expected */
          /*
          OpenCV Error: Unknown error code -10 
          (Raw image encoder error: Empty JPEG image (DNL not supported)) in throwOnEror, 
          file /home/pi/installers/opencv-2.4.10/modules/highgui/src/grfmt_base.cpp, line 131
          terminate called after throwing an instance of 'cv::Exception'

          what():  /home/pi/installers/opencv-2.4.10/modules/highgui/src/grfmt_base.cpp:131: 
          error: (-10) Raw image encoder error: Empty JPEG image (DNL not supported) in function throwOnEror

          Aborted 
          */

        },

        function(im, callback) {
          console.log("release im")
          if(im != null || im != {}) {
            im.release();            
          }
        }

    ], function (err, im) {
        if(err) return console.log(err);
        console.log("done");
    });

    /*

    camera.read(function(err, im) {
      if (err) throw err;

      im.detectObject('./node_modules/opencv/data/haarcascade_frontalface_alt2.xml', {}, function(err, faces) {
        if (err) throw err;

        for (var i = 0; i < faces.length; i++) {
          face = faces[i];
          im.rectangle([face.x, face.y], [face.width, face.height], rectColor, rectThickness);
        }

        socket.emit('frame', { buffer: im.toBuffer() , data: im });
        im.release()
      });
    });

    */

  }, camInterval);
};
