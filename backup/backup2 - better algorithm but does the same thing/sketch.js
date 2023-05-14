
const tiles = [];
const tileImages = [];

let grid = [];
const DIM = 20;

function preload() {
	tileImages[0] = loadImage("tiles/blank.png");
	tileImages[1] = loadImage("tiles/up.png");
}

function setup() {
createCanvas(500, 500);

// loaded and created the tiles
tiles[0] = new Tile(tileImages[0], [0, 0, 0, 0]);
tiles[1] = new Tile(tileImages[1], [1, 1, 0, 1]);
tiles[2] = tiles[1].rotate(1);
tiles[3] = tiles[1].rotate(2);
tiles[4] = tiles[1].rotate(3);

// generate the adjacency rules based on edges
for (let i = 0; i < tiles.length; i ++) {
  const tile = tiles[i];
  tile.analyze(tiles);
}

// create cell for each spot on the grid
for (let i = 0; i < DIM * DIM; i++) {
    grid[i] = new Cell(tiles.length);
  };
}

function checkValid(arr, valid) {
  for (let i = arr.length - 1; i >= 0; i--) {

    //VALID: [BLANK, RIGHT]
    //ARR: [BLANK, UP, RIGHT, DOWN, LEFT]
    //result in removing UP, DOWN, LEFT
    let element = arr[i];
    console.log(element);
    if (!valid.includes(element)){
      arr.splice(i, 1);
    }
  }
}

function mousePressed() {
  console.log("------");
  //setup();
  redraw();
}

function draw() {
  background(20,20,20);

  const w = width / DIM;
  const h = height / DIM;
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      let cell = grid [i + j * DIM];
      if (cell.collapsed) {
        let index = cell.options[0];
        image(tiles[index].img, i * w, j * h, w, h);
      } else {
        fill(0);
        stroke(255);
        rect(i * w, j * h, w, h);
      }
    }
  }


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
  cell.collapsed = true;
  const pick = random(cell.options);
  cell.options = [pick];

  const nextGrid = [];
  console.log(grid);
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
}

