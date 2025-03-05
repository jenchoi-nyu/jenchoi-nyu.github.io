// Countdown Animation Logic
const startButton = document.getElementById("startButton");
const countdown = document.getElementById("countdown");
const countdownNumber = document.getElementById("countdown-number");
const controls = document.getElementById("controls");
const stopResumeButton = document.getElementById("stopResumeButton");
const resetButton = document.getElementById("resetButton");
const screenshotButton = document.getElementById("screenshotButton");

let countdownInterval;
let p5Started = false;
let growing = true;

startButton.addEventListener("click", () => {
  startButton.style.display = "none";
  countdown.style.display = "block";

  let count = 3;
  countdownInterval = setInterval(() => {
    countdownNumber.textContent = count;
    count--;

    if (count < 0) {
      clearInterval(countdownInterval);
      countdown.style.display = "none";

      if (!p5Started) {
        p5Started = true;
        startP5Sketch();
        controls.style.display = "block"; // Show controls after countdown
      }
    }
  }, 1000);
});

// Start p5.js Sketch
function startP5Sketch() {
  const canvasContainer = document.getElementById("p5-canvas-container");
  canvasContainer.style.display = "block";
  new p5(sketch, canvasContainer);
}

// p5.js Sketch
const sketch = (p) => {
  let mic, fft;
  let path = [];
  const maxHeight = 500, numSides = 30, maxLayers = 300;
  let currentLayer = 0;
  let startTime;

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight, p.P2D);
    mic = new p5.AudioIn();
    mic.start();
    fft = new p5.FFT();
    fft.setInput(mic);
    startTime = p.millis();
  };

  p.draw = function () {
    p.background(200);
    p.orbitControl();

    let spectrum = fft.analyze();
    let centroid = fft.getCentroid();
    let volume = mic.getLevel();

    let currentHeight = path.length > 0 ? path[path.length - 1][0].z : 0;
    if (currentHeight >= maxHeight) {
      growing = false;
    }

    if (p.millis() - startTime > 1000 && growing) {
      let radius = p.constrain(p.map(centroid, 500, 15000, 50, 200), 50, 200);
      let zOffset = path.length > 0 ? path[path.length - 1][0].z + p.map(volume, 0, 1, 10, 10) : 0;

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
  };

  stopResumeButton.addEventListener("click", () => {
    growing = !growing;
    stopResumeButton.textContent = growing ? "Stop" : "Resume";
  });

  resetButton.addEventListener("click", () => {
    path = [];
    currentLayer = 0;
    startTime = p.millis();
    growing = true;
  });

  screenshotButton.addEventListener("click", () => {
    p.saveCanvas('screenshot', 'png');
  });
};
