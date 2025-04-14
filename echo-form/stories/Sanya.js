let song;
let fft, amp;
let cols, rows;
let cellWidth, cellHeight;
let duration = 20;
let startTime;
let playing = false;
let playButton;
let saveButton;

function preload() {
  song = loadSound("music/Sanya.mp3");
}

function setup() {
  createCanvas(1100, 500);
  background(255);

  cols = 80;
  rows = 20;
  cellWidth = width / cols;
  cellHeight = height / rows;

  fft = new p5.FFT();
  amp = new p5.Amplitude();

  playButton = createButton("Start Music Translation");
  playButton.position(20, height + 10);
  playButton.mousePressed(startAudio);

  saveButton = createButton("Screenshot");
  saveButton.position(184, height + 10);
  saveButton.mousePressed(saveScreenshot);
}

function startAudio() {
  if (!playing) {
    song.play();
    startTime = millis();
    playing = true;
  }
}

function saveScreenshot() {
  saveCanvas('screenshot', 'png');
}

function draw() {
  if (!playing || !song.isPlaying()) return;

  let elapsedTime = (millis() - startTime) / 8000;
  let progress = elapsedTime / duration;

  if (progress > 1) {
    noLoop();
    return;
  }

  let spectrum = fft.analyze();
  let vol = amp.getLevel();
  let pitch = fft.getCentroid();

  let index = floor(progress * cols * rows);
  let x = (index % cols) * cellWidth;
  let y = floor(index / cols) * cellHeight;

  let shapeType = floor(map(pitch / 2, 100, 5000, 0, 5));

  // Map volume dynamically
  let size = map(vol, 0, 1, 5, cellWidth * 0.8);
  let strokeWeightVal = map(vol, 0, 1, 1, 5);
  let rotationAngle = map(pitch, 100, 5000, -PI / 4, PI / 4); // Map pitch to rotation angle

  stroke(0);
  strokeWeight(strokeWeightVal);
  fill(0);

  if (shapeType === 0) {
    point(x + cellWidth, y + cellHeight);
  } else if (shapeType === 1) {
    circle(x + cellWidth, y + cellHeight, size);
  } else if (shapeType === 2) {
    rect(x + cellWidth, y + cellHeight, size*2, size/10);
  } else if (shapeType === 3) {
    // Rotate the line
    push();
    translate(x + size / 2, y + size / 2);
    rotate(rotationAngle);
    line(-size / 2, -size / 2, size / 2, size / 2);
    pop();
  } else {
    triangle(x, y, x + size/2, y - size, x + size, y);
  }
}
