let canvas = document.getElementById("gameCanvas");
let informationDiv = document.getElementById("information");
let addressDiv = document.getElementById("address");
let inventoryDiv = document.getElementById("inventory");
let ctx = canvas.getContext("2d");

// Define the tile types
let TILE_GRASS = 0;
let TILE_DIRT = 1;
let TILE_WATER = 2;
let TILE_BUILDING = 3;
let TILE_BOULDER = 4;
let TILE_ROCK = 5;

// Define the tile size and the number of rows and columns
let TILE_SIZE = 20;
let ROWS = 20;
let COLS = 20;

// Create a 2D array to store the tile types for each cell
let tiles = new Array(ROWS);
for (let i = 0; i < ROWS; i++) {
  tiles[i] = new Array(COLS);
  for (let j = 0; j < COLS; j++) {
    tiles[i][j] = TILE_GRASS;
  }
}

// Define the player's starting position
let playerRow = 0;
let playerCol = 0;
let inventoryCount = 0;
let playerSteps = 0;

// Draw the tiles
function drawTiles() {
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      switch (tiles[i][j]) {
        case TILE_GRASS:
          ctx.fillStyle = "green";
          ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          break;
        case TILE_DIRT:
          ctx.fillStyle = "brown";
          ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          break;
        case TILE_WATER:
          ctx.fillStyle = "blue";
          ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          break;
        case TILE_BUILDING:
          ctx.fillStyle = "red";
          ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          break;
        case TILE_BOULDER:
          ctx.fillStyle = "gray";
          ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          break;
        case TILE_ROCK:
          ctx.fillStyle = "green";
          ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = "gray";
          ctx.beginPath();
          ctx.arc((j + 0.5) * TILE_SIZE, (i + 0.5) * TILE_SIZE, TILE_SIZE / 2, 0, 2 * Math.PI);
          ctx.fill();
          break;
      }
    }
  }
}

// Global variable to store the user's avatar
let userAvatar = null;

// Draw the player
function drawPlayer() {
  if (userAvatar) {
    ctx.drawImage(userAvatar, playerCol * TILE_SIZE, playerRow * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  } else {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc((playerCol + 0.5) * TILE_SIZE, (playerRow + 0.5) * TILE_SIZE, TILE_SIZE / 2, 0, 2 * Math.PI);
    ctx.fill();
  }
}

// Update the game state when a key is pressed
function handleKeyPress(event) {
  let newRow = playerRow;
  let newCol = playerCol;

  switch (event.key) {
    case "ArrowUp":
      newRow--;
      break;
    case "w":
      newRow--;
      break;
    case "ArrowDown":
      newRow++;
      break;
    case "s":
      newRow++;
      break;
    case "ArrowLeft":
      newCol--;
      break;
    case "a":
      newCol--;
      break;
    case "ArrowRight":
      newCol++;
      break;
    case "d":
      newCol++;
      break;
    default:
      return;
  }

  if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) {
    return;
  }

  switch (tiles[newRow][newCol]) {
    case TILE_GRASS:
      playerRow = newRow;
      playerCol = newCol;
      playerSteps++;
      inventoryDiv.innerHTML = "Rocks Broken: " + inventoryCount + "<br/>Steps Taken: " + playerSteps;
      break;
    case TILE_DIRT:
      playerCol = newCol;
      playerRow = newRow;
      playerSteps++;
      inventoryDiv.innerHTML = "Rocks Broken: " + inventoryCount + "<br/>Steps Taken: " + playerSteps;
      break;
    case TILE_WATER:
      break;
    case TILE_BUILDING:
      break;
    case TILE_BOULDER:
      tiles[newRow][newCol] = TILE_ROCK;
      break;
    case TILE_ROCK:
      tiles[newRow][newCol] = TILE_GRASS;
      inventoryCount++;
      inventoryDiv.innerHTML = "Rocks Broken: " + inventoryCount + "<br/>Steps Taken: " + playerSteps;
      break;
  }

  drawTiles();
  drawPlayer();
}

// Simple hash function based on user's address
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Initialize the game
async function initGame() {
  informationDiv.innerHTML = "Version: 0.0.x<br/>Controls: WASD or Arrow Keys";
  inventoryDiv.innerHTML = "Rocks Broken: 0<br/>Steps Taken: 0";

  try {
    // Get the address of the logged-in user
    let address = await new Promise((resolve, reject) => {
      let timeoutValue = 60 * 60 * 1000; //getDefaultTimeout("GET_USER_ACCOUNT");
      let timeout = setTimeout(() => {
        clearTimeout(timeout);
        reject("Timeout: Could not get user address");
      }, timeoutValue);

      qortalRequest({
        action: "GET_USER_ACCOUNT"
      }).then(account => {
        clearTimeout(timeout);
        resolve(account.address);
      }).catch(error => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    // Generate a seed value for the random number generator using the simple hash function
    let seed = simpleHash(address);

    // Set up the tile types
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        // Generate a random number based on the seed value
        let rand = Math.abs(Math.sin(seed * 10000 + i * 100 + j)) * 100;

        if (rand < 20) {
          tiles[i][j] = TILE_WATER;
        } else if (rand < 50) {
          tiles[i][j] = TILE_DIRT;
        } else if (rand < 60) {
          tiles[i][j] = TILE_BUILDING;
        } else if (rand < 70) {
          tiles[i][j] = TILE_BOULDER;
        } else if (rand < 80) {
          tiles[i][j] = TILE_ROCK;
        }
      }
    }

    // Display the user's address
    addressDiv.innerHTML = "Playing as: " + address + "<br/>Game Seed: " + seed;

    // Get the user's avatar
    let names = await qortalRequest({
      action: "GET_ACCOUNT_NAMES",
      address: address
    });

    if (names.length > 0) {
      addressDiv.innerHTML = "Playing as: " + names[0].name + "<br/>Game Seed: " + seed;

      let avatarBase64 = await qortalRequest({
        action: "FETCH_QDN_RESOURCE",
        name: names[0].name,
        service: "THUMBNAIL",
        identifier: "qortal_avatar",
        encoding: "base64"
      });

      userAvatar = new Image();
      userAvatar.src = "data:image/png;base64," + avatarBase64;
    }

  } catch (error) {
    console.log(error);
    addressDiv.innerHTML = "Error: " + error + "<br/>Unable to access account.";
    // Set up the tile types randomly
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (Math.random() < 0.1) {
          tiles[i][j] = TILE_WATER;
        } else if (Math.random() < 0.2) {
          tiles[i][j] = TILE_DIRT;
        } else if (Math.random() < 0.3) {
          tiles[i][j] = TILE_BUILDING;
        } else if (Math.random() < 0.4) {
          tiles[i][j] = TILE_BOULDER;
        } else if (Math.random() < 0.5) {
          tiles[i][j] = TILE_ROCK;
        }
      }
    }
  }

  // Draw the initial game state
  drawTiles();
  drawPlayer();

  // Add event listener to handle key presses
  document.addEventListener("keydown", handleKeyPress);
}

// Start the game
initGame();

