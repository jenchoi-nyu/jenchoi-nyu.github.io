// Countdown Animation Logic
const startButton = document.getElementById("startButton");
const countdown = document.getElementById("countdown");
const countdownNumber = document.getElementById("countdown-number");
let countdownInterval;
let p5Started = false;
let canvasInstance;

startButton.addEventListener("click", () => {
  // Hide the start button and show the countdown
  startButton.style.display = "none";
  countdown.style.display = "block";

  let count = 3;
  countdownInterval = setInterval(() => {
    countdownNumber.textContent = count;
    count--;

    if (count < 0) {
      clearInterval(countdownInterval);
      countdown.style.display = "none";
      // Start the p5.js sketch after countdown
      if (!p5Started) {
        p5Started = true;
        startP5Sketch();
      }
    }
  }, 1000); // Update every second
});

// Function to start p5.js sketch
function startP5Sketch() {
  const canvasContainer = document.getElementById("p5-canvas-container");
  canvasContainer.style.display = "block";
  canvasInstance = new p5(sketch, canvasContainer);
}

// Function to restart the experience
function restartExperience() {
  if (canvasInstance) {
    canvasInstance.remove();
  }
  p5Started = false;
  startButton.style.display = "block";
  document.getElementById("p5-canvas-container").style.display = "none";
}

// p5.js sketch
const sketch = (p) => {
  let mic, fft;
  let path = []; 
  const maxRadius = 200, maxHeight = 400, numSides = 30, maxLayers = 300;
  let currentLayer = 0; // Controls when new layers appear
  let startTime;  // Variable to store the start time
  let growing = true; // Flag to control growth

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    mic = new p5.AudioIn();
    mic.start(); 
    fft = new p5.FFT();
    fft.setInput(mic);
    // Record the start time when the sketch begins
    startTime = p.millis();
  };

  p.draw = function () {
    p.background(200);
    p.orbitControl(); // Enables 360° interaction

    let spectrum = fft.analyze();
    let centroid = fft.getCentroid();
    let volume = mic.getLevel();

    // Only start drawing after 1 second has passed
    if (p.millis() - startTime > 1000 && growing) { // 1 second has passed
      let radius = p.constrain(p.map(centroid, 500, 15000, 50, maxRadius), 50, maxRadius);
      let zOffset = path.length > 0 ? path[path.length - 1][0].z + p.map(volume, 0, 1, 10, 10) : 0;

      // Add a new ring gradually, one at a time, creating an upward spiral effect
      if (p.frameCount % 5 === 0 && path.length < maxLayers) { 
        let newRing = [];
        for (let i = 0; i < numSides; i++) {
          let theta = p.map(i, 0, numSides, 0, p.TWO_PI);
          let x = radius * p.cos(theta);
          let y = radius * p.sin(theta) + 200;
          newRing.push(p.createVector(x, y, zOffset));
        }
        path.push(newRing);
        currentLayer++;
      }
    }

    p.noFill();
    p.stroke(0);

    for (let i = 1; i < path.length; i++) {
      if (i > currentLayer) break; // Controls the spiral effect, ensuring gradual appearance

      let prevRing = path[i - 1];
      let currRing = path[i];

      for (let j = 0; j < numSides; j++) {
        let next = (j + 1) % numSides;

        p.beginShape();
        p.vertex(prevRing[j].x, prevRing[j].y, prevRing[j].z);
        p.vertex(prevRing[next].x, prevRing[next].y, prevRing[next].z);
        p.vertex(currRing[next].x, currRing[next].y, currRing[next].z);
        p.vertex(currRing[j].x, currRing[j].y, currRing[j].z);
        p.endShape(p.CLOSE);
      }
    }

  p.keyPressed = function () {
    if (p.keyCode === 32) {
      growing = !growing; // Toggle growth state on Spacebar press
    }
    if (p.keyCode === p.ENTER) {
      // Save the canvas as a PNG when Enter key is pressed
      p.saveCanvas('screenshot', 'png');
    }
    if (p.keyCode === p.ESCAPE) {
      restartExperience(); // Restart the experience on Escape key press
    }
  };
};
