const tiles = [];
const tileImages = [];
let myCell = "";
let state = "paused"; // Set initial state to paused
let progressFlag = false; // Flag to indicate whether to progress
let stepCount = 0; // Step counter

let grid = [];
const cellHistory = []; // Create an array to store the cell history
const DIM = 10;

function preload() {
  const path = "tiles/mytiles/"
  for (let i = 0; i < 24; i++) {
    tileImages[i] = loadImage(`${path}${i}.jpg`);
    console.log(`${path}${i}.jpg`)
  }
}

function setup() {
  createCanvas(1000, 1000);

  // add event listener for right click
  canvas.addEventListener("contextmenu", function(e) { e.preventDefault() }, false);
  //randomSeed(10);

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
  tiles[11] = new Tile(tileImages[11], ['BCB', 'BBA', 'BCA', 'BBB']);
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
  //console.log("tiles length = " + tiles.length)


  // generate the adjacency rules based on edges
  for (let i = 0; i < tiles.length; i ++) {
    const tile = tiles[i];
    tile.analyze(tiles);
  }

  setupCells()
  console.log("first setup cells")

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
      cellHistory.push({row: row, col: col}); // Add the cell's position to the cell history
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
 //   console.log(element);
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
  if (keyCode === RIGHT_ARROW) {
    progressFlag = true; // Set flag to progress
    intervalId = setInterval(continueProgress, 100); // Call handleProgress() every 0.1 seconds

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
    if (myCell.collapsed) {
      console.log("cell collapsed, tileNumber " + myCell.options)
    }  else {
      console.log("not collapsed, numOptions = " + myCell.options.length)
      console.log(myCell.options);
    }
  }
}

function rightMousePressed() {
 // setupCells()
 console.log(cellHistory)
}


function draw() {
  background(20,20,20);
  redrawCollapsedCells(); // Call the new function to redraw collapsed cells

  if (state === "running" && progressFlag) { // Only progress if flag is set or state is running
    pickNextCell();
    drawNextCell();
    progressFlag = false; // Reset flag
  }
  mouseOverCell()
}



function mouseOverCell() {
  const w = width / DIM;
  const h = height / DIM;
  for (let row = 0; row < DIM; row++) {
    for (let col = 0; col < DIM; col++) {
      let rectX = col * w;
      let rectY = row * h;
      let cell = grid [col + row * DIM];
      if (mouseX >= rectX && mouseX <= rectX + w && mouseY >= rectY && mouseY <= rectY + h) {
        fill(255, 0, 0, 128);
        rect(rectX, rectY, w, h);
       // return {cell: cell, row: row, col: col}; // return the row and column of the cell
       return cell; // return the entire cell object

      }
    }
  }
  return null; // if the mouse is not over any cell, return null
}

function mouseMoved() {
  // let myCell = mouseOverCell();
  // if (myCell != null) {
  //  // console.log(`Mouse is over cell (${myCell.row}, ${myCell.col})`);
  // }
}

function redrawCollapsedCells() {
  const w = width / DIM;
  const h = height / DIM;
  for (let row = 0; row < DIM; row++) {
    for (let col = 0; col < DIM; col++) {
      let rectX = col * w;
      let rectY = row * h;
      let cell = grid[col + row * DIM];
      if (cell.collapsed) { 
        // Only draw collapsed cells
        let index = cell.options[0];
        if (index !== undefined) {
          image(tiles[index].img, rectX, rectY, w, h); // Draw the image of the collapsed tile
        }
      } else {
        fill(0);
        stroke(255);
        rect(rectX, rectY, w, h)
      }
    }
  }
}


function drawNextCell() {
  const w = width / DIM;
  const h = height / DIM;
  for (let row = 0; row < DIM; row++) {
    for (let col = 0; col < DIM; col++) {
      let cell = grid [col + row * DIM];
      
      let rectX = col * w
      let rectY = row * h
      if (cell.collapsed) {
        let index = cell.options[0];
          if (index == undefined) {
            console.log("broken")
            state = "running"
            console.log(state)
          } else {
            image(tiles[index].img, col * w, row * h, w, h);
          }
    //    debugger;
      } else {
        fill(0);
        stroke(255);
        rect(rectX, rectY, w, h)
      }

    }
  }
}

function pickNextCell() {
   //pick cell with least entropy
  let gridCopy = grid.slice();
  gridCopy = gridCopy.filter((a) => !a.collapsed);
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
 // console.log(gridCopy)
//  console.log ("gridcopy length " + gridCopy.length)
  const cell = random(gridCopy);
//  console.log(cell.options)
  cell.collapsed = true;
  const pick = random(cell.options);
   if (pick === undefined) {
    console.log(`Cell ${cell} has no options available`);
    
    noLoop()
   // startOver();
    return;
  }
  cell.options = [pick];

  setupGrid()
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
         nextGrid[index] = new Cell(options, row, col);
       }
     }
   }
 grid = nextGrid; 
}

