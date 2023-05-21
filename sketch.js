const tiles = [];
const tileImages = [];
let myCell = "";
let state = "paused"; // Set initial state to paused
let progressFlag = false; // Flag to indicate whether to progress
let stepCount = 0; // Step counter
let textSizeFactor = 0.4; // Set the text size to 80% of the cell size
let nextCell
let halfRed, halfWhite, halfYellow


let grid = [];
const cellHistory = []; // Create an array to store the cell history
const canvasSize = 1000;
const DIM = 10;
const cellSize = canvasSize / DIM



function preload() {
  const path = "tiles/mytiles/"
  for (let i = 0; i < 24; i++) {
    tileImages[i] = loadImage( `${path}${i}.jpg`);
    console.log(`${path}${i}.jpg`)
  }
}

function setup() {
  createCanvas(canvasSize, canvasSize);

  halfRed = color(255, 0, 0, 128); // Set the color to half-red
  halfWhite = color(255, 255, 255, 128); // Set the color to half-white
  halfYellow = color(255, 255, 0, 128); // Set the color to half-yellow
  // randomSeed(0); // Set the seed value

  // add event listener for right click
  canvas.addEventListener("contextmenu", function(e) { e.preventDefault() }, false);

  // loaded and created the tiles
  tiles[0] = new Tile(tileImages[0], ['AAA', 'AAA', 'AAA', 'AAA']);
  tiles[1] = new Tile(tileImages[1], ['BBA', 'AAA', 'AAA', 'ABB']);
  tiles[2] = new Tile(tileImages[2], ['BCA', 'AAA', 'AAA', 'ACB']);
  tiles[3] = new Tile(tileImages[3], ['BCB', 'BCB', 'BCB', 'BCB']);
  tiles[4] = new Tile(tileImages[4], ['BCB', 'BCB', 'BCB', 'BCB']);
  tiles[5] = new Tile(tileImages[5], ['BBB', 'BBA', 'ABB', 'BBB']);
  tiles[6] = new Tile(tileImages[6], ['BBB', 'BBB', 'BBB', 'BBB']);
  tiles[7] = new Tile(tileImages[7], ['BBB', 'BAB', 'BAB', 'BBB']);
  tiles[8] = new Tile(tileImages[8], ['BCB', 'BAB', 'BAB', 'BCB']);
  tiles[9] = new Tile(tileImages[9], ['BBB', 'BBA', 'AAA', 'ABB']);
  tiles[10] = new Tile(tileImages[10], ['BBB', 'BCA', 'ABB', 'BCB']);
  tiles[11] = new Tile(tileImages[11], ['BCB', 'BBA', 'ACB', 'BBB']);
  tiles[12] = new Tile(tileImages[12], ['BBB', 'BCB', 'BBB', 'BCB']);
  tiles[13] = new Tile(tileImages[13], ['BAB', 'BBB', 'BAB', 'BBB']);
  tiles[14] = new Tile(tileImages[14], ['BAB', 'BCB', 'BAB', 'BCB']);
  tiles[15] = new Tile(tileImages[15], ['BCB', 'BBB', 'BBB', 'BCB']);
  tiles[16] = new Tile(tileImages[16], ['BBB', 'BCA', 'ACB', 'BBB']);
  tiles[17] = new Tile(tileImages[17], ['BBB', 'BBA', 'ACB', 'BCB']);
  tiles[18] = new Tile(tileImages[18], ['BBB', 'BCA', 'AAA', 'ACB']);
  tiles[19] = new Tile(tileImages[19], ['BAB', 'BBA', 'AAA', 'ABB']);
  tiles[20] = new Tile(tileImages[20], ['BAB', 'BCA', 'AAA', 'ACB']);
  tiles[21] = new Tile(tileImages[21], ['BCB', 'BBA', 'AAA', 'ACB']);
  tiles[22] = new Tile(tileImages[22], ['BCB', 'BCA', 'ABB', 'BBB']);
  tiles[23] = new Tile(tileImages[23], ['BCB', 'BBA', 'ABB', 'BCB']);

  addTileRotations()

  // generate the adjacency rules based on edges
  for (let i = 0; i < tiles.length; i ++) {
    const tile = tiles[i];
    tile.analyze(tiles);
  }

  setupCells()
  fillEdgesWithWater()
  setupGrid()
  console.log("first setup cells")
}


function draw() {
  background(20,20,20);
  redrawCollapsedCells(); // Call the new function to redraw collapsed cells

  if (state === "running" && progressFlag) { // Only progress if flag is set or state is running
    pickNextCell();
    highlightCell(nextCell.col, nextCell.row, halfWhite);

    drawNextCell();
    progressFlag = false; // Reset flag
  }
  mouseOverCell()
}


function fillEdgesWithWater(){
  for (let i = 0; i < grid.length; i++) {
    const cell = grid[i];
    if (cell.col === 0 || cell.col === DIM - 1 || cell.row === 0 || cell.row === DIM - 1) {
      cell.collapsed = true;
      cell.options = [0];
      cell.step = 0;
    }
  }
  stepCount += 1;
}

function addTileRotations(){
  for (let i = 2; i < 24; i++) {
    for (let j = 1; j < 4; j++) {
      tiles.push(tiles[i].rotate(j));
    }
  }
}

function setupCells() {
  for (let row = 0; row < DIM; row++) {
    for (let col = 0; col < DIM; col++) {
      let index = col + row * DIM;
      grid[index] = new Cell(tiles.length, col, row);
      cellHistory.push({col: col, row: row }); // Add the cell's position to the cell history
    }
  }
  state = "running"
}


function checkValid(arr, valid) {
  for (let i = arr.length - 1; i >= 0; i--) {

    //VALID: [BLANK, RIGHT]
    //ARR: [BLANK, UP, RIGHT, DOWN, LEFT]
    //result in removing UP, DOWN, LEFT
    let element = arr[i];
    if (!valid.includes(element)){
      arr.splice(i, 1);
    }
  }
}

function mousePressed() {
  if (mouseButton === LEFT) {
    leftMousePressed();
  } else if (mouseButton === RIGHT) {
    rightMousePressed();
  }
}

function keyPressed() {
  if (state === "error") return
  if (keyCode === RIGHT_ARROW) {
    progressFlag = true; // Set flag to progress
    intervalId = setInterval(continueProgress, 50); // Call handleProgress() every 0.1 seconds
  }
  if (keyCode === 221) {
    progressFlag = true; // Set flag to progress
  }
}

function keyReleased() {
  if (keyCode === RIGHT_ARROW) {
    progressFlag = false; // Clear flag to progress
    clearInterval(intervalId); // Stop calling handleProgress()
  }
}


function continueProgress() {
  progressFlag = true;
}


function leftMousePressed() {
  let myCell = mouseOverCell();
  if (myCell != null) {
  //  console.log(grid)
    if (myCell.collapsed) {
      console.log("{" + myCell.col + "," + myCell.row + "} collapsed, tileNumber " + myCell.options + ", numOptions = " + myCell.options.length)
    }  else {
     console.log("{" + myCell.col + "," + myCell.row + "} not collapsed, numOptions = " + myCell.options.length)

    }
  //  console.log(grid)
  //  console.log(myCell.options);
  }
}

function rightMousePressed() {
 // setupCells()
 console.log(cellHistory)
}






function mouseOverCell() {
  for (let row = 0; row < DIM; row++) {
    for (let col = 0; col < DIM; col++) {
      let cell = grid [col + row * DIM];
      if (mouseX >= getRect(col) && mouseX <= getRect(col) + cellSize && mouseY >= getRect(row) && mouseY <= getRect(row) + cellSize) {
        highlightCell(col, row, halfYellow);
        drawDebugText(col, row);
        return cell; // return the entire cell object
      }
    }
  }
  return null; // if the mouse is not over any cell, return null
}

function drawDebugText(col, row) {
  centerX = getRect(col) + cellSize / 2;
  centerY = getRect(row) + cellSize / 2;
  textSize(cellSize * textSizeFactor);
  fill(255);
  textAlign(CENTER, CENTER);
  text(`(${col},${row})`, centerX , centerY);
}

function mouseMoved() {
//do nothing
}

function redrawCollapsedCells() {
  for (let row = 0; row < DIM; row++) {
    for (let col = 0; col < DIM; col++) {
      let cell = grid[col + row * DIM];
      if (cell.collapsed) { 
        // Only draw collapsed cells
        let index = cell.options[0];
        if (index !== undefined) {
          image(tiles[index].img, getRect(col), getRect(row), cellSize, cellSize); // Draw the image of the collapsed tile
        } else {
          highlightCell(cell.col, cell.row, halfRed);
        }
      } else {
        fill(0);
        stroke(255);
        rect(getRect(col), getRect(row), cellSize, cellSize)
      }
    }
  }
}

function getRect(gridPos) {
  //takes in column or row and returns the x or y position of the rectangle
  return gridPos * cellSize;
}


function drawNextCell() {
  for (let row = 0; row < DIM; row++) {
    for (let col = 0; col < DIM; col++) {
      let cell = grid [col + row * DIM];

      if (cell.collapsed) {
        let index = cell.options[0];
          if (index == undefined) {
            return
          } else {
            image(tiles[index].img, getRect(col), getRect(row), cellSize, cellSize);
          }
      } else {
        //draw blank squares
        fill(0);
        stroke(255);
        rect(getRect(col), getRect(row), cellSize, cellSize)
      }
    }
  }
}

function pickNextCell() {
   //pick cell with least entropy
  let gridCopy = grid.slice();
  gridCopy = gridCopy.filter((a) => !a.collapsed);
  console.log("grid")
  console.log(grid)
  console.log("gridCopy")
  console.log(gridCopy)
  if (gridCopy.length == 0) {
    return;
  }

  gridCopy.sort((a, b) => {
    return a.options.length - b.options.length
  });

  let len = gridCopy[0].options.length;
  let stopIndex = 0;
  for (let i = 1; i < gridCopy.length; i++) {
    if (gridCopy[i].options.length > len) {
      stopIndex = i;
      break;
    }
  }
  
  if (stopIndex > 0) gridCopy.splice(stopIndex);
  const cell = random(gridCopy);
  nextCell = cell

 // console.log("Picked cell at " + cell.col + ", " + cell.row + " with " + cell.options.length + " options")
  cell.step = stepCount++
  console.log(stepCount)
  cell.collapsed = true
  const pick = random(cell.options);

  if (pick === undefined) { // If there are no options available, do something
   // console.log("cell at " + cell.col + ", " + cell.row + " has no options left");
    state = "error"
    return;
  }

  cell.options = [pick];

  setupGrid()
}

function highlightCell(col, row, colour) {
  fill(colour);
  rect(getRect(col), getRect(row), cellSize, cellSize);
}




function setupGrid(){
  const nextGrid = [];
  // console.log(grid);
  for (let row = 0; row < DIM; row++) {
    for (let col = 0; col < DIM; col++) {
        let index = col + row * DIM;
      if (grid[index].collapsed){
        nextGrid[index] = grid[index];
      } else {
          let options = new Array(tiles.length).fill(0).map((x, col) => col);
      //look up
          if (row > 0) {
            let up = grid[col + (row - 1) * DIM];
            let validOptions = [];
            for (let option of up.options) {
              let valid = tiles[option].down;
              validOptions = validOptions.concat(valid);
            }
            checkValid(options, validOptions);
          }

          //look right
          if (col < DIM - 1) {
            let right = grid[col + 1 + row * DIM];
            let validOptions = [];
            for (let option of right.options) {
              let valid = tiles[option].left;
              validOptions = validOptions.concat(valid);
            }
            checkValid(options, validOptions);
          }

          //look down
          if (row < DIM - 1) {
            let down = grid[col + (row + 1) * DIM];
            let validOptions = [];
            for (let option of down.options) {
              let valid = tiles[option].up;
              validOptions = validOptions.concat(valid);
            }
              checkValid(options, validOptions);
          }

          //look left
          if (col > 0) {
            let left = grid[col - 1 + row * DIM];
            let validOptions = [];
            for (let option of left.options) {
              let valid = tiles[option].right;
              validOptions = validOptions.concat(valid);
            }
            checkValid(options, validOptions);
          }

          //I could immediately collapse if only one option
          nextGrid[index] = new Cell(options, col, row);
        }
      }
    }
    grid = nextGrid; 
  }

