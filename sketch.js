function preload() {
  mapImg = loadImage('https://raw.githubusercontent.com/Ryan-Te/EWOW-Globe-JS/main/assets/map.png')
  testBook = loadImage('https://raw.githubusercontent.com/Ryan-Te/EWOW-Globe-JS/main/assets/aa.png')
  
  font = loadFont('https://raw.githubusercontent.com/Ryan-Te/EWOW-Globe-JS/main/assets/calibri.ttf')
  mapData = loadStrings('https://raw.githubusercontent.com/Ryan-Te/EWOW-Globe-JS/main/conts.txt')

  R6Lives = loadStrings('https://raw.githubusercontent.com/Ryan-Te/EWOW-Globe-JS/main/R6lives.txt')
}

function sign(p1, p2, p3) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

function PointInTriangle(pt, v1, v2, v3) {
    let d1, d2, d3;
    let has_neg, has_pos;

    d1 = sign(pt, v1, v2);
    d2 = sign(pt, v2, v3);
    d3 = sign(pt, v3, v1);

    has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

    return !(has_neg && has_pos);
}

books = {}

let scrollValue = 10;
let bookMap = {};

let counter = 0;
let minLives = 1;

let screenLocs = {}
let clicked = 0;

let loaded = false;
let numLoaded = 0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL)
  addScreenPositionFunction();

  globeLayer = createFramebuffer()
  infoLayer = createFramebuffer()

  for (let y = -70; y <= 70; y++) {
    bookMap[y] = {}
    for (let x = 0; x < 360; x++) {
      //hasBook[y][x] = (floor(random(0, 10)) == 0)
      bookMap[y][x] = int(mapData[(140 - (y + 70)) * 360 + x])
    }
  }

  for (let i = 1; i < 16607; i++) {
    if (!(R6Lives[i - 1] === "0")) {
      books[i] = loadImage('https://raw.githubusercontent.com/Ryan-Te/EWOW-Globe-JS/main/assets/books/' + i + '.png', doneLoading)
      screenLocs[i] = {}
    } else {
      screenLocs[i] = false
    }
  }
}

function doneLoading() {
  numLoaded ++;
  if (numLoaded == 2570) {
    loaded = true;
    console.log("Done loading books");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
}

function draw() {
  //3D SECTION
  globeLayer.begin()
  background(64)
  perspective(2 * atan(height / 2 / 800), width/height, 0.1 * 50, 10 * 800)
  let sentitivity = (22 - scrollValue) / 8;
  let sphereSize = height * 0.4
  orbitControl(sentitivity, sentitivity, 0)
  scale(scrollValue / 10)

  texture(mapImg)
  noStroke()
  sphere(sphereSize, 96, 64)

  //texture(testBook)
  for(let y = -70; y <= 70; y++) {
    let numX = floor(360 * Math.cos(radians(Math.abs(y))))
    for(let x = 0; x < numX; x++) {
      let book = bookMap[y][x];
      if (book != 0) {
        let lives = int(R6Lives[book - 1])
        if (lives >= minLives) {
          texture(books[book])
        }else {
          fill(0, 0, 0, 0)
        }
        resetMatrix()
        scale(scrollValue / 10)
        rotateY(radians(x * (360 / numX)))
        rotateX(radians(y))
        translate(0, 0, sphereSize)
        rect(0, 0, sphereSize / 90, sphereSize / 90)

        screenLocs[book][1] = screenPosition(0, 0, 0);
        screenLocs[book][1].x += width / 2
        screenLocs[book][1].y = height - (screenLocs[book][1].y + height / 2)

        screenLocs[book][2] = screenPosition(1, 0, 0);
        screenLocs[book][2].x += width / 2
        screenLocs[book][2].y = height - (screenLocs[book][2].y + height / 2)

        screenLocs[book][3] = screenPosition(0, 1, 0);
        screenLocs[book][3].x += width / 2
        screenLocs[book][3].y = height - (screenLocs[book][3].y + height / 2)

        screenLocs[book][4] = screenPosition(1, 1, 0);
        screenLocs[book][4].x += width / 2
        screenLocs[book][4].y = height - (screenLocs[book][4].y + height / 2)
      }
    }
  }



  //END OF 3D SECTION
  globeLayer.end()
  clearDepth()
  image(globeLayer, -width / 2, -height / 2)

  //2D SECTION
  infoLayer.begin()
  translate(-width / 2, -height / 2)
  clear()

  textFont(font)
  textSize(36)
  if (!loaded) {
    fill('white')
    rect(0, 0, 600, 80)
    fill('black')
    text("Loading Book Images... (" + numLoaded + " / 2570)", 0, 36)
    text("Map will be laggy until loading finishes.", 0, 72)
  }

  infoLayer.end()
  image(infoLayer, -width / 2, -height / 2)
}

function mouseClicked() {
  let click = createVector(mouseX, mouseY);

  for (let i = 1; i < 16607; i++) {
    if (!(R6Lives[i - 1] === "0")) {
      let TL = screenLocs[i][1]
      let TR = screenLocs[i][2]
      let BL = screenLocs[i][3]
      let BR = screenLocs[i][4]

      if (TL.x < BR.x && TL.y < BR.y) {
        if (PointInTriangle(click, TL, TR, BL) || PointInTriangle(click, BR, TR, BL)) {
          clicked = i
        }
      }
    }
  }
}

function mouseWheel(event) {
  if (event.delta > 0) {
    if (scrollValue > 5) {
      scrollValue --
    }
  } else {
    if (scrollValue < 21) {
      scrollValue ++
    }
  }
  return false
}
//peterruette