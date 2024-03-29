//#region PRELOAD
// ========================================================================== //
// 
const tiles = [];
const tileImages = [];
let myCell = "";
let gameState = "paused"; // Set initial state to paused
let progressFlag = false; // Flag to indicate whether to progress
let stepCount = 0; // Step counter
let textSizeFactor = 0.4; // Set the text size to 80% of the cell size
let nextCell = null
let halfRed, halfWhite, halfYellow
let pick = null
var lastCell = null

let grid = [];
const cellHistory = []; // Create an array to store the cell history
const canvasSize = 1000;
const DIM = 5;
const cellSize = canvasSize / DIM

function preload() {
  const path = "tiles/mytiles/"
  for (let i = 0; i < 24; i++) {
    tileImages[i] = loadImage( `${path}${i}.jpg`);
    console.log(`${path}${i}.jpg`)
  }
}
// ========================================================================== //
// 
//#endregion

//#region SETUP_FUNCTIONS
// ========================================================================== //
// 

function setup() {
  myCanvas = createCanvas(canvasSize, canvasSize);
  createUIButtons(myCanvas)
  halfRed = color(255, 0, 0, 100); // Set the color to half-red
  halfWhite = color(255, 255, 255, 128); // Set the color to half-white
  halfYellow = color(255, 255, 0, 128); // Set the color to half-yellow
  //let currentSeed = floor(random(1, 999)); // Set the seed value
  let currentSeed = 846;
  //currentSeed = random(1, 999); // Set the seed value
  randomSeed(currentSeed); // Set the seed value
  console.log("currentSeed = " + currentSeed);

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
  //stepCount += 1;
  console.log("step: " + cellHistory.length)
  console.log("first setup cells")
  console.log("--------------")

  nextCell = findNextCell()

 // advanceSteps(12)

}

function advanceSteps(num){
  for (let i = 0; i < num; i++) {
    advanceOneStep()
  }
}

function fillEdgesWithWater(){
  for (let i = 0; i < grid.length; i++) {
    const cell = grid[i];
    if (cell.col === 0 || cell.col === DIM - 1 || cell.row === 0 || cell.row === DIM - 1) {
      cell.state = "collapsed";
      cell.options = [0];
      cell.step = 0;
    }
  }
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
    //cellHistory.push({col: col, row: row }); // Add the cell's position to the cell history
    }
  }
  // state == "running"
  // console.log(state)
}

function createUIButtons(canvas) {
  // Create the reverse button
  const reverseButton = document.createElement("button");
  reverseButton.textContent = "<<";
  reverseButton.addEventListener("click", reverse);
  reverseButton.style.marginRight = "10px";

  // Create the fast forward button
  const fastForwardButton = document.createElement("button");
  fastForwardButton.textContent = ">>";
  fastForwardButton.addEventListener("click", fastForward);
  fastForwardButton.style.marginRight = "100px";

  // Create the go back one step button
  const backButton = document.createElement("button");
  backButton.textContent = "|<";
  backButton.addEventListener("click", undoOneStep);
  backButton.style.marginRight = "10px";

  // Create the advance one step button
  const advanceButton = document.createElement("button");
  advanceButton.textContent = ">|";
  advanceButton.addEventListener("click", advanceOneStep);
 
  // Add the buttons to the document body
  document.body.appendChild(reverseButton);
  document.body.appendChild(fastForwardButton);
  document.body.appendChild(backButton);
  document.body.appendChild(advanceButton);
}

// ========================================================================== //
//#endregion

//#region USER_INPUTS
// ========================================================================== //
// 

function fastForward() {
  if (nextCell != null) {
    nextCell = drawCell(nextCell);
   // console.log(cellHistory.length);
    intervalId = setInterval(function() {
      nextCell = drawCell(nextCell);
     // console.log(cellHistory.length);
    }, 50);
  }
}







function keyPressed() {
  // if (state === "error") return

  if (keyCode === LEFT_ARROW) { // Left arrow key
    rewind();
  } else if (keyCode === RIGHT_ARROW) { // Right arrow key
    fastForward();
  } else if (keyCode === 219) { // "[" key
    undoOneStep();
  } else if (keyCode === 221) { // "]" key
    advanceOneStep();
  }
}

function restoreCellState(lastCell) {
  unCollapseCell(lastCell)
 // setupGrid()
 // unDrawLastCell(lastCell);
  return findNextCell();
}

function undoOneStep() {
  if (cellHistory.length > 0) {
    console.log("------------ |<")

    lastCell = cellHistory.pop();
    lastCell.state = "uncertain";
    nextCell = restoreCellState(lastCell);
    setupGrid()

   // console.log(cellHistory.length);
    gameState = "paused";
   // console.log(gameState);
  }
}


// function rewind() {
//   if (cellHistory.length > 0) {
//     lastCell = cellHistory.pop();
//     nextCell = unDrawCell(lastCell);
//    // console.log(cellHistory.length);
//     intervalId = setInterval(function() {
//       lastCell = cellHistory.pop();
//       nextCell = unDrawCell(lastCell);
//      // console.log(cellHistory.length);
//     }, 50);
//   }
// }

function advanceOneStep() {
  if (gameState != "STUCK"){ // If the game is not stuck, advance one step
    console.log("------------ >|")
    lastCell = nextCell
    nextCell = drawCell(nextCell);
  }
}


function drawCell(nextCell) {
  collapseNextCell(nextCell)
  setupGrid()
  drawNextCell(nextCell);
  if (nextCell.state === "STUCK") {
      return null;
  } else {
      return findNextCell();
  }
}


function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    clearInterval(intervalId);
  }
  if (keyCode === RIGHT_ARROW) {
    clearInterval(intervalId); // Stop calling handleProgress()
  }
}

function mousePressed() {
  if (mouseButton === LEFT) {
    leftMousePressed();
  } else if (mouseButton === RIGHT) {
    rightMousePressed();
  }
}

function leftMousePressed() {
  let myCell = mouseOverCell();
  if (myCell != null) {
    console.log(myCell.state)
  }

}

function rightMousePressed() {
  whiteSquare = true;
  console.log(nextCell)
  console.log(mouseOverCell().options)
  setupGrid()
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

function mouseMoved() {
  //do nothing
}


  
function drawDebugText(col, row) {
  centerX = getRect(col) + cellSize / 2;
  centerY = getRect(row) + cellSize / 2;
  textSize(cellSize * textSizeFactor);
  fill(255);
  textAlign(CENTER, CENTER);
  text(`(${row},${col})`, centerX , centerY);
}
//#endregion

//#region DRAW_LOOP
// ========================================================================== //
// 
function draw() {
  background(20,20,20);
  redrawCollapsedCells(); // Call the new function to redraw collapsed cells
  if (nextCell != null) {
    highlightCell(nextCell.col, nextCell.row, halfWhite);
  }
  if (lastCell != null) {
    highlightCell(lastCell.col, lastCell.row, halfRed);
  }

  mouseOverCell()
  nextCellDebugText()
  allCellsDebugText()
  gameDebugText()
}
//#endregion

//#region DEBUG_FUNCTIONS
// ========================================================================== //
// 
function allCellsDebugText(){
  for (let row = 0; row < DIM; row++) {
    for (let col = 0; col < DIM; col++) {
      let cell = grid [col + row * DIM];
       // let index = cell.options[0];
          textSize(15);
          noStroke(); // Disable the stroke
          fill(255);
          textAlign(LEFT, TOP);
          text(
            ` grid pos xy: (${cell.row},${cell.col})\n` +
            ` step: ${cell.step}\n` +
            ` state: ${cell.state}\n` +
            ` length of options: ${cell.options.length}\n` +
            ` options: ${cell.options}`
            , // Text to be drawn
            getRect(cell.col), // X coordinate of the text
            getRect(cell.row) // Y coordinate of the text
          );
    }
  }
}

nextCellDebugText = () => {
  if (nextCell != null) {
    textSize(25);
    fill(255);
    textAlign(CENTER, CENTER);
    text(`(${nextCell.col},${nextCell.row})`, getRect(nextCell.col) + cellSize / 2, getRect(nextCell.row) + cellSize / 2);
  }
}

function gameDebugText() {
  const x = width - 10;
  const y = height - 10;
  textSize(16);
  textAlign(RIGHT, BOTTOM);
  fill(255);
  if (lastCell != null) {
  text("lastCell: " + lastCell, x, y - 40);
  }
  text("gameState: " + gameState, x, y - 20);
  text("cellHistory.length: " + cellHistory.length, x, y);
}

//#endregion

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

function redrawCollapsedCells() {
  for (let row = 0; row < DIM; row++) {
    for (let col = 0; col < DIM; col++) {
      let cell = grid[col + row * DIM];
      if (cell.state === "collapsed") { 
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

function highlightCell(col, row, colour) {
  fill(colour);
  rect(getRect(col), getRect(row), cellSize, cellSize);
}

function drawNextCell() {
  for (let row = 0; row < DIM; row++) {
    for (let col = 0; col < DIM; col++) {
      let cell = grid [col + row * DIM];
      if (cell.state === "collapsed") {
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

function findNextCell() {
  //pick cell with least entropy
  //make a copy of the grid and filter it so that it only contains uncollapsed cells
  let gridCopy = grid.slice();
  gridCopy = gridCopy.filter((a) => a.state === "uncertain");
  if (gridCopy.length == 0) {
    return "FUCKEDIT";
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
 // console.log(gridCopy.length)
  
  const nextCell = random(gridCopy);

  //is this breaking it?
  nextCell.state = "nextCell"


  pick = random(nextCell.options);

  if (pick == undefined){
    console.log("ERRRRRRRRRROR")
    gameState = "STUCK"
    nextCell.state = "stuck"
  }

  return nextCell
}

function collapseNextCell(cell) {
  cell.step = cellHistory.length + 1;
  cellHistory.push(cell)

  if (pick !== undefined){
    cell.state = "collapsed"
  } else {
    cell.state = "STUCK"
    gameState = "ERROR"
    console.log("STUCK")
  }
  
 // console.log("cell " + cell.step + ": " + cell.state)

  // Save the original options before collapsing the cell
  //cell.originalOptions = cell.options.slice();  // Make a copy of the options array

  cell.options = [pick];
 // console.log(cell.options)
}

function unCollapseCell(cell) {
 // stepCount -= 1;

  // Restore the original options
  //cell.options = cell.originalOptions.slice();  // Restore the original options array

  cell.state === "uncertain";

  cell.options = new Array(tiles.length).fill(0).map((x, i) => i);

  const pick = random(cell.options);

  if (pick === undefined) { // If there are no options available, do something
    gameState = "error"
    return;
  }
  
  //cell.options = [pick];
 //cell.options = new Array(tiles.length).fill(0).map((x, i) => i);
// console.log(cell.options)
}

function setupGrid(){
  const updatedGrid = [];
  for (let row = 0; row < DIM; row++) {
    for (let col = 0; col < DIM; col++) {
      let index = col + row * DIM;
        
      if (grid[index].state === "collapsed" || grid[index].state === "STUCK"){
        updatedGrid[index] = grid[index];
      } else {
          let options = new Array(tiles.length).fill(0).map((x, col) => col);
          // Debug: Log initial options
       // console.log(`Initial options for cell at (${row}, ${col}):`, options);
       // logOptionsForCellAtPosition(1, 2);
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

          //  Debug: Log options after looking up
          //  console.log(`Options after looking up for cell at (${row}, ${col}):`, options);
          //  logOptionsForCellAtPosition(1, 2);
          //  look right
          if (col < DIM - 1) {
            let right = grid[col + 1 + row * DIM];
            let validOptions = [];
            for (let option of right.options) {
              let valid = tiles[option].left;
              validOptions = validOptions.concat(valid);
            }
            checkValid(options, validOptions);
          }
          // Debug: Log options after looking up
         // console.log(`Options after looking right for cell at (${row}, ${col}):`, options);
         // logOptionsForCellAtPosition(1, 2);
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
// Debug: Log options after looking down
//console.log(`Options after looking down for cell at (${row}, ${col}):`, options);
//logOptionsForCellAtPosition(1, 2);
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

// Debug: Log options after looking left
//console.log(`Options after looking left for cell at (${row}, ${col}):`, options);
//console.log(`Options for cell at index ${index}:`, options);
// Debug: Log options after looking down for cell at (${row}, ${col})
if (index === 9) {
  console.log(`Options after looking down for cell at (${row}, ${col}):`, options);
}

console.log (updatedGrid[9])
          //I could immediately collapse if only one option
          updatedGrid[index] = new Cell(options, col, row);

// To use the function and log options for a specific cell (e.g., x: 1, y: 3)
        //logOptionsForCellAtPosition(1, 2);


        //  console.log(updatedGrid[index].row, (updatedGrid[index].col))
        //  console.log(updatedGrid[index].options)
        // Debug: Log options after setting up the cell
      
              // Check if the cell is at a specific position (e.g., x: 1, y: 3)
              // if (col === 1 && row === 3) {
              //   // Debug: Log options for the specific cell at (1, 3) after setting up the cell
              //   console.log(`Options after setting up the cell at (${row}, ${col}):`, options);
              // }
      
      
      }
      }
    }
    grid = updatedGrid;
    console.log (grid[9])
}

function logOptionsForCellAtPosition(x, y) {
  for (let row = 0; row < DIM; row++) {
    for (let col = 0; col < DIM; col++) {
      if (col === x && row === y) {
        const index = col + row * DIM;
        const cell = grid[index];

        // Check if the cell is at the specified position (x, y)
        if (cell.state !== "collapsed" && cell.state !== "STUCK") {
          const options = new Array(tiles.length).fill(0).map((x, col) => col);

          // Debug: Log options for the specific cell
          console.log(`Options for cell at (${x}, ${y}):`, options);
        }
      }
    }
  }
}
