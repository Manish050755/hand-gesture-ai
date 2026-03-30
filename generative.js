const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const statusDiv = document.getElementById('status');

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 5});
      drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
      
      // Simple Gesture Logic: If index finger tip is higher than middle finger tip
      const indexTip = landmarks[8].y;
      const thumbTip = landmarks[4].y;
      
      if (indexTip < thumbTip - 0.1) {
        statusDiv.innerText = "☝️ Pointing Up!";
      } else {
        statusDiv.innerText = "🖐️ Open Palm";
      }
    }
  } else {
    statusDiv.innerText = "No Hand Detected";
  }
  canvasCtx.restore();
}

const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => { await hands.send({image: videoElement}); },
  width: 640, height: 480
});
camera.start();
