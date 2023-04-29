let versionString = "Q-App Game Demo - Version: 0.0.1a<br/>KB Controls: WASD / Arrow Keys / NumPad<br/>Mouse/Touch: On-Screen Buttons";

let canvas = document.getElementById("gameCanvas");
let gameInfoDiv = document.getElementById("gameInfo");
let chainInfoDiv = document.getElementById("chainInfo");
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

let tileImageGrass = new Image();
tileImageGrass.src = "grass.jpeg";
let tileImageDirt = new Image();
tileImageDirt.src = "dirt.jpeg";
let tileImageWater = new Image();
tileImageWater.src = "water.jpeg";
let tileImageSand = new Image();
tileImageSand.src = "sand.jpeg";
let tileImageRock = new Image();
tileImageRock.src = "rock.png";
let tileImageQortal = new Image();
tileImageQortal.src = "qlogo.png";

// Define the tile size and the number of rows and columns
let TILE_SIZE = 20;
let ROWS = 20;
let COLS = 20;

const DEFAULT_PLAYER_COLOR = "yellow";

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
let playerDirection = "down";

// Draw the tiles
function drawTiles() {
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      switch (tiles[i][j]) {
        case TileType.GRASS:
          ctx.drawImage(tileImageGrass, j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          break;
        case TileType.DIRT:
          ctx.drawImage(tileImageDirt, j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          break;
        case TileType.WATER:
          ctx.drawImage(tileImageWater, j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          break;
        case TileType.SAND:
          ctx.drawImage(tileImageSand, j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          break;
        case TileType.BOULDER:
          ctx.drawImage(tileImageGrass, j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileImageRock, j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          break;
        case TileType.ROCK:
          ctx.drawImage(tileImageGrass, j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.drawImage(tileImageRock, (j * TILE_SIZE)+(TILE_SIZE/5), (i * TILE_SIZE)+(TILE_SIZE/5), TILE_SIZE*3/5, TILE_SIZE*3/5);
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
    ctx.drawImage(tileImageQortal, playerCol * TILE_SIZE, playerRow * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  // Draw direction indicator
  ctx.fillStyle = 'blue';
  let indicatorX, indicatorY;
  let indicatorSize = 4;

  switch (playerDirection) {
    case "up":
      indicatorX = playerCol * TILE_SIZE + TILE_SIZE / 2 - indicatorSize / 2;
      indicatorY = playerRow * TILE_SIZE - indicatorSize;
      break;
    case "down":
      indicatorX = playerCol * TILE_SIZE + TILE_SIZE / 2 - indicatorSize / 2;
      indicatorY = (playerRow + 1) * TILE_SIZE;
      break;
    case "left":
      indicatorX = playerCol * TILE_SIZE - indicatorSize;
      indicatorY = playerRow * TILE_SIZE + TILE_SIZE / 2 - indicatorSize / 2;
      break;
    case "right":
      indicatorX = (playerCol + 1) * TILE_SIZE;
      indicatorY = playerRow * TILE_SIZE + TILE_SIZE / 2 - indicatorSize / 2;
      break;
  }

  ctx.fillRect(indicatorX, indicatorY, indicatorSize, indicatorSize);

}

function updatePlayer(newRow, newCol) {
  // Update player position and information
  switch (tiles[newRow][newCol]) {
    case TileType.GRASS:
    case TileType.DIRT:
    case TileType.SAND:
      // Passable, player moves, steps increases
      playerRow = newRow;
      playerCol = newCol;
      playerSteps++;
      playerInfoDiv.innerHTML = "Rocks Broken: " + inventoryCount + "<br/>Steps Taken: " + playerSteps;
      break;
    case TileType.WATER:
      // Not passable
      break;
    case TileType.BOULDER:
      // Boulder becomes rock
      tiles[newRow][newCol] = TileType.ROCK;
      break;
    case TileType.ROCK:
      // Rock becomes grass, inventory increases
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
      if (playerDirection == "up") {
        newRow--;
      }
      playerDirection = "up";
      break;
    case "ArrowDown":
    case "s":
    case "S":
    case "2":
      if (playerDirection == "down") {
        newRow++;
      }
      playerDirection = "down";
      break;
    case "ArrowLeft":
    case "a":
    case "A":
    case "4":
      if (playerDirection == "left") {
        newCol--;
      }
      playerDirection = "left";
      break;
    case "ArrowRight":
    case "d":
    case "D":
    case "6":
      if (playerDirection == "right") {
        newCol++;
      }
      playerDirection = "right";
      break;
    default:
      return;
  }

  if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) {
    return;
  }

  updatePlayer(newRow, newCol);
}

function handleButtonClick(direction) {
  let newRow = playerRow;
  let newCol = playerCol;

  switch (direction) {
    case "up":
      newRow--;
      break;
    case "down":
      newRow++;
      break;
    case "left":
      newCol--;
      break;
    case "right":
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

// Add these lines to define chat elements
let chatMessagesDiv = document.getElementById("chatMessages");
let chatInput = document.getElementById("chatInput");

// Add a function to update the chat messages
async function updateChatMessages() {
  try {
    let res = await qortalRequest({
      action: "SEARCH_CHAT_MESSAGES",
      txGroupId: 4,
      limit: 100,
      reverse: false
    });

    chatMessagesDiv.innerHTML = "";
    let MAP = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let from_b58 = function(S,A){var d=[],b=[],i,j,c,n;for(i in S){j=0,c=A.indexOf(S[i]);if(c<0)return undefined;c||b.length^i?i:b.push(0);while(j in d||c){n=d[j];n=n?n*58+c:c;c=n>>8;d[j]=n%256;j++}}while(j--)b.push(d[j]);return new Uint8Array(b)};

    for (const element of res) {
      // Decode the base58 encoded data
      const decodedData = from_b58(element.data, MAP);
      // Convert the decoded Uint8Array to a string
      const decodedString = new TextDecoder().decode(decodedData);
      // Parse the string as JSON
      const messageJSON = JSON.parse(decodedString);
      // Access the "text" value
      const messageText = messageJSON.messageText.content[0].content[0].text;

      chatMessagesDiv.innerHTML += "<p><strong>" + element.senderName + "</strong>: " + messageText + "</p>";
    }

    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
  } catch (error) {
    chatMessagesDiv.innerHTML = "";
    chatMessagesDiv.innerHTML += "<p><strong>Error</strong>: " + error + "</p>";
    chatMessagesDiv.innerHTML += "<p><strong>Error</strong>: " + JSON.stringify(error) + "</p>";
    console.error("Error updating chat messages:", error);
  }
}

// Add a function to send a chat message
async function sendChatMessage(message) {
  try {
    await qortalRequest({
      action: "SEND_CHAT_MESSAGE",
      groupId: 4,
      message: message
    });
    updateChatMessages();
  } catch (error) {
    console.error("Error sending chat message:", error);
    chatMessagesDiv.innerHTML += "<p><strong>Error</strong>: " + JSON.stringify(error) + "</p>";
  }
}

// Add event listeners for the chat input
chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    if (chatInput.value.trim() !== "") {
      sendChatMessage(chatInput.value.trim());
      chatInput.value = "";
    }
  }
});

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

// Get current Qortal blockchain height
async function getCurrentHeight() {
  let heightResponse = await fetch("/blocks/height");
  let currentHeight = await heightResponse.json();
  if (currentHeight) {
      chainInfoDiv.innerHTML = "Current Height: " + JSON.stringify(currentHeight);
  } else {
      chainInfoDiv.innerHTML = "Current Height Unavailable";
  }
}

// Initialize the game
async function initGame() {
  gameInfoDiv.innerHTML = versionString;
  playerInfoDiv.innerHTML = "Rocks Broken: 0<br/>Steps Taken: 0";
  document.getElementById("upButton").addEventListener("click", () => handleButtonClick("up"));
  document.getElementById("downButton").addEventListener("click", () => handleButtonClick("down"));
  document.getElementById("leftButton").addEventListener("click", () => handleButtonClick("left"));
  document.getElementById("rightButton").addEventListener("click", () => handleButtonClick("right"));

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
    accountInfoDiv.innerHTML = "Error: " + error + "<br/>Error: " + JSON.stringify(error) + "<br/>Unable to access account.";
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

  // Periodically check blockchain height and chat messages
  getCurrentHeight();  
  setInterval(getCurrentHeight, 10000);
  updateChatMessages();
  setInterval(updateChatMessages, 29000);
}

// Start the game
initGame();
