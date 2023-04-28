let canvas = document.getElementById("gameCanvas");
let gameInfoDiv = document.getElementById("gameInfo");
let accountInfoDiv = document.getElementById("accountInfo");
let playerInfoDiv = document.getElementById("playerInfo");
let ctx = canvas.getContext("2d");

// Define the tile types
const TileType = {
  GRASS: 0,
  DIRT: 1,
  WATER: 2,
  SAND: 3,
  BOULDER: 4,
  ROCK: 5
};

// Define the tile size and the number of rows and columns
let TILE_SIZE = 20;
let ROWS = 20;
let COLS = 20;

// Create a 2D array to store the tile types for each cell
let tiles = new Array(ROWS);
for (let i = 0; i < ROWS; i++) {
  tiles[i] = new Array(COLS);
  for (let j = 0; j < COLS; j++) {
    tiles[i][j] = TileType.GRASS;
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
        case TileType.GRASS:
          ctx.fillStyle = "green";
          ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          break;
        case TileType.DIRT:
          ctx.fillStyle = "brown";
          ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          break;
        case TileType.WATER:
          ctx.fillStyle = "blue";
          ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          break;
        case TileType.SAND:
          ctx.fillStyle = "tan";
          ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          break;
        case TileType.BOULDER:
          ctx.fillStyle = "gray";
          ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          break;
        case TileType.ROCK:
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

function updatePlayer(newRow, newCol) {
  // Update player position and information
  switch (tiles[newRow][newCol]) {
    case TileType.GRASS:
    case TileType.DIRT:
    case TileType.SAND:
      playerRow = newRow;
      playerCol = newCol;
      playerSteps++;
      playerInfoDiv.innerHTML = "Rocks Broken: " + inventoryCount + "<br/>Steps Taken: " + playerSteps;
      break;
    case TileType.WATER:
      break;
    case TileType.BOULDER:
      tiles[newRow][newCol] = TileType.ROCK;
      break;
    case TileType.ROCK:
      tiles[newRow][newCol] = TileType.GRASS;
      inventoryCount++;
      playerInfoDiv.innerHTML = "Rocks Broken: " + inventoryCount + "<br/>Steps Taken: " + playerSteps;
      break;
  }

  drawTiles();
  drawPlayer();
}

// Update the game state when a key is pressed
function handleKeyPress(event) {
  let newRow = playerRow;
  let newCol = playerCol;

  switch (event.key) {
    case "ArrowUp":
    case "w":
    case "W":
    case "8":
      newRow--;
      break;
    case "ArrowDown":
    case "s":
    case "S":
    case "2":
      newRow++;
      break;
    case "ArrowLeft":
    case "a":
    case "A":
    case "4":
      newCol--;
      break;
    case "ArrowRight":
    case "d":
    case "D":
    case "6":
      newCol++;
      break;
    default:
      return;
  }

  if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) {
    return;
  }

  updatePlayer(newRow, newCol);
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

function generateRandomTiles(seed) {
  // Generate tiles based on the seed
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      // Generate a random number based on the seed value
      let rand = Math.abs(Math.sin(seed * 10000 + i * 100 + j)) * 100;

      if (rand < 20) {
        tiles[i][j] = TileType.WATER;
      } else if (rand < 50) {
        tiles[i][j] = TileType.DIRT;
      } else if (rand < 60) {
        tiles[i][j] = TileType.SAND;
      } else if (rand < 70) {
        tiles[i][j] = TileType.BOULDER;
      } else if (rand < 80) {
        tiles[i][j] = TileType.ROCK;
      }
    }
  }
}

// Initialize the game
async function initGame() {
  gameInfoDiv.innerHTML = "Version: 0.0.x<br/>Controls: WASD / Arrow Keys / NumPad";
  playerInfoDiv.innerHTML = "Rocks Broken: 0<br/>Steps Taken: 0";

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
    generateRandomTiles(seed);

    // Display the user's address
    accountInfoDiv.innerHTML = "Playing as: " + address + "<br/>Game Seed: " + seed;

    // Get the user's avatar
    let names = await qortalRequest({
      action: "GET_ACCOUNT_NAMES",
      address: address
    });

    if (names.length > 0) {
      accountInfoDiv.innerHTML = "Playing as: " + names[0].name + "<br/>Game Seed: " + seed;

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
    accountInfoDiv.innerHTML = "Error: " + error + "<br/>Unable to access account.";
    // Set up the tile types randomly
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (Math.random() < 0.018) {
          tiles[i][j] = TileType.WATER;
        } else if (Math.random() < 0.018) {
          tiles[i][j] = TileType.SAND;
        } else if (Math.random() < 0.075) {
          tiles[i][j] = TileType.DIRT;
        } else if (Math.random() < 0.018) {
          tiles[i][j] = TileType.BOULDER;
        } else if (Math.random() < 0.018) {
          tiles[i][j] = TileType.ROCK;
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

