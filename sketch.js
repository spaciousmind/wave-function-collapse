const tiles = [];
const tileImages = [];

let grid = [];
const DIM = 5;

function preload() {
  const path = "tiles/mytiles/"
  for (let i = 0; i < 24; i++) {
    tileImages[i] = loadImage(`${path}${i}.jpg`);
    console.log(`${path}${i}.jpg`)
  }
}

function setup() {
createCanvas(1000, 1000);
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

//addTileRotations()

function addTileRotations(){
  for (let i = 2; i < 24; i++) {
    for (let j = 1; j < 4; j++) {
    tiles.push(tiles[i].rotate(j));
    }
  }
}

console.log("tiles length = " + tiles.length)



// generate the adjacency rules based on edges
for (let i = 0; i < tiles.length; i ++) {
  const tile = tiles[i];
  tile.analyze(tiles);
}



// create cell for each spot on the grid
// for (let i = 0; i < DIM * DIM; i++) {
//     grid[i] = new Cell(tiles.length);
//     grid[i] = i //add index as a property
//     console.log(i);
 
startOver()

//broken collapse to zero code
// for (let i = 0; i < DIM * DIM; i++) {
//       // Check if cell is on the edge of the grid
//     const row = Math.floor(i / DIM);
//     const col = i % DIM;
//     if (row === 0 || row === DIM - 1 || col === 0 || col === DIM - 1) {
//       grid[i].options = [0];
//       grid[i].collapsed = true;
//          console.log(grid[i])
//     }
// }



 //   console.log(i)
noLoop()
}
 // noLoop();
 

function startOver() {
  for (let row = 0; row < DIM; row++) {
    for (let col = 0; col < DIM; col++) {
      let index = col + row * DIM;
      grid[index] = new Cell(tiles.length, col, row);
    }
  }
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
  console.log("------");
  startOver();
 // loop(); // start drawing
 redraw();
}

// }


function draw() {
  console.log("redraw")
  background(20,20,20);






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
  const cell = random(gridCopy);
//  console.log(cell.options)
  cell.collapsed = true;
  const pick = random(cell.options);
  console.log(cell.options)
  if (pick === undefined) {
    console.log(`Cell ${cell} has no options available`);
    
    noLoop()
   // startOver();
    return;
  }
  cell.options = [pick];

  const nextGrid = [];
 // console.log(grid);
;  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++){
      let index = i + j * DIM;
      if (grid[index].collapsed){
        nextGrid[index] = grid[index];
      } else {
          let options = new Array(tiles.length).fill(0).map((x, i) => i);
      //look up
          if (j > 0) {
            let up = grid[i + (j - 1) * DIM];
            let validOptions = [];
            for (let option of up.options) {
              let valid = tiles[option].down;
              validOptions = validOptions.concat(valid);
            }
            checkValid(options, validOptions);
          }

          //look right
          if (i < DIM - 1) {
            let right = grid[i + 1 + j * DIM];
            let validOptions = [];
            for (let option of right.options) {
              let valid = tiles[option].left;
              validOptions = validOptions.concat(valid);
            }
            checkValid(options, validOptions);
          }

          //look down
          if (j < DIM - 1) {
            let down = grid[i + (j + 1) * DIM];
            let validOptions = [];
            for (let option of down.options) {
              let valid = tiles[option].up;
              validOptions = validOptions.concat(valid);
            }
             checkValid(options, validOptions);
          }

          //look left
          if (i > 0) {
            let left = grid[i - 1 + j * DIM];
            let validOptions = [];
            for (let option of left.options) {
              let valid = tiles[option].right;
              validOptions = validOptions.concat(valid);
            }
            checkValid(options, validOptions);
          }

          //I could immediately collapse if only one option
          nextGrid[index] = new Cell(options);
        }
      }
    }
  grid = nextGrid; 


  const w = width / DIM;
  const h = height / DIM;
  for (let row = 0; row < DIM; row++) {
    for (let col = 0; col < DIM; col++) {
      let cell = grid [col + row * DIM];
      console.log(cell)
      let rectX = col * w
      let rectY = row * h
      if (cell.collapsed) {
        let index = cell.options[0];
        image(tiles[index].img, col * w, row * h, w, h);
    //    debugger;
      } else {

        fill(0);
        stroke(255);
        rect(rectX, rectY, w, h)
        

      }
      if (mouseX >= rectX && mouseX <= rectX + w && mouseY >= rectY && mouseY <= rectY + h) {
        console.log(`Available options for cell (${col},${row}): ${cell.options}`);
        console.log(cell)
 
        fill(255, 0, 0, 128);
        rect(rectX, rectY, w, h);
      }

    }
  }
}

