// Table
let tableWidth;
let tableLength;
let pocketDiameter;
let pockets = [];
let dZoneRadius = 0;

// Balls
let ballDiameter;
let whiteBall;
let redBalls = [];
let colorBalls = [];
// Limit Red Balls Qty
const numRedBalls = 15;
let lastPottedBallType = null;

// Cue
let cueAngle = 0;
let cuePower = 0;
// Limitation for Cue Power
const maxCuePower = 0.4;
const fixedCueLength = 200;

// Game function
let gameStarted = false;
let isWhiteBallVisible = false;
let isCueVisible = false;
let gameMode = 1;
let aimAssist = false;

// Obstacle
let obstacles = [];
const obstacleWidth = 5;
const obstacleHeight = 50;
const obstacleSpeed = 3;
let enableObstacle = false;

// Matter js
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Runner = Matter.Runner;
const Mouse = Matter.Mouse;
const MouseConstraint = Matter.MouseConstraint;
let engine;
let world;
let runner;
let mouseConstraint;
let whiteBallBody;
let redBallBodies = [];
let colorBallBodies = [];
let cushionBodies = [];

// Setup Function
function setup() {
  // Square Kinda Shape Canva to fit everything
  createCanvas(1200, 1000);

  // 2/3 of the width
  tableLength = 800;
  tableWidth = tableLength / 2;
  ballDiameter = tableWidth / 36;
  pocketDiameter = ballDiameter * 1.5;
  dZoneRadius = tableWidth / 6;
  tableAdjustment = 22;

  // Initialize Matter.js
  engine = Engine.create();
  world = engine.world;
  runner = Runner.create();

  // Disable default gravity in matter js
  engine.world.gravity.y = 0;

  initializePockets();
  initializeCushions();
  initializeWhiteBall();
  initializeObstacles();
  // Default mode
  mode1();
  createBodies();

  Runner.run(runner, engine);
}

// Draw Function
function draw() {
  // Black Background to see the Canva
  background(0);

  // Update physics engine
  Engine.update(engine);

  drawTable();
  drawDZone();
  drawPockets();
  drawRedBalls();
  drawColorBalls();

  // Only show the cue stick when the game start and the flag is shown
  if (isCueVisible && gameStarted) {
    drawCue();
  }

  drawWhiteBall();
  drawObstacles();
  drawAimAssist();
  drawInstructions();
  drawCuePowerGauge();

  checkWhiteBallCollisions();
  checkObstacleCollisions();
  updateBallPositions();
  updateObstacles();
  constrainWhiteBallPosition();
  checkPottedBalls();
  checkWhiteBallPotted();
}

// Game Mode Functions

// Mode 1: Default starting positions
function mode1() {
  // Original init
  initializeRedBalls();
  initializeColorBalls();
}

// Mode 2: Randomize all balls except white
function mode2() {
  redBalls = [];
  colorBalls = [];
  // Avoid existing positions
  const existPositions = new Set();

  // Generate random positions for red balls
  for (let i = 0; i < numRedBalls; i++) {
    const pos = getRandomPosition(existPositions);
    redBalls.push(createVector(pos.x, pos.y));
  }

  // Generate random positions for color balls
  const colorBallNames = ["green", "yellow", "brown", "blue", "pink", "black"];
  for (let color of colorBallNames) {
    const pos = getRandomPosition(existPositions);
    const ball = createVector(pos.x, pos.y);
    ball.color = color;
    colorBalls.push(ball);
  }
}

// Mode 3: Randomize red balls only
function mode3() {
  redBalls = [];
  // Avoid existing positions
  const existPositions = new Set();

  // Add color ball positions to the set of used positions
  for (const ball of colorBalls) {
    existPositions.add(Math.round(ball.x) + "-" + Math.round(ball.y));
  }

  // Generate random positions for red balls
  for (let i = 0; i < numRedBalls; i++) {
    const pos = getRandomPosition(existPositions);
    redBalls.push(createVector(pos.x, pos.y));
  }

  // Keep color balls in their original positions
  initializeColorBalls();
}

// Generate a random valid position
function getRandomPosition(existPositions) {
  const xMargin = (width - tableLength) / 2 + ballDiameter / 2;
  const yMargin = (height - tableWidth) / 2 + ballDiameter / 2;

  while (true) {
    const x = random(xMargin, width - xMargin);
    const y = random(yMargin, height - yMargin);

    // Ensure positions don't overlap
    let valid = true;
    for (let pos of existPositions) {
      if (dist(x, y, pos.x, pos.y) < ballDiameter) {
        valid = false;
        break;
      }
    }

    if (valid) {
      existPositions.add({ x, y });
      return { x, y };
    }
  }
}

// Drawing Functions

// Table Drawing
function drawTable() {
  // Draw table border
  fill(109, 58, 15);
  rect(
    (width - tableLength - tableAdjustment) / 2, 
    (height - tableWidth - tableAdjustment) / 2, 
    tableLength + tableAdjustment, 
    tableWidth + tableAdjustment, 
    15
  );

  // Draw table surface
  fill(34, 139, 34);
  rect(
    (width - tableLength) / 2, 
    (height - tableWidth) / 2, 
    tableLength, 
    tableWidth
  );

  // Draw table inner shadow
  noFill();
  stroke(65);
  strokeWeight(4);
  rect(
    (width - tableLength) / 2, 
    (height - tableWidth) / 2, 
    tableLength, 
    tableWidth
  );
}

// Pocket Drawing
function drawPockets() {
  fill(0);
  noStroke();
  for (let pocket of pockets) {
    ellipse(pocket.x, pocket.y, pocketDiameter);
  }
}

// White Ball drawing
function drawWhiteBall() {
  if (isWhiteBallVisible) {
    stroke(0);
    strokeWeight(1);
    fill(255);
    ellipse(whiteBall.x, whiteBall.y, ballDiameter);
  }
}

// Red Balls Drawing
function drawRedBalls() {
  for (let ball of redBalls) {
    stroke(0);
    strokeWeight(1);
    fill(255, 0, 0);
    ellipse(ball.x, ball.y, ballDiameter);
  }
}

// Color Balls Drawing
function drawColorBalls() {
  colorBalls.forEach(ball => {
    stroke(0);
    strokeWeight(1);
    fill(ball.color);
    ellipse(ball.x, ball.y, ballDiameter);
  });
}

// D Zone Drawing
function drawDZone() {
  const xMargin = (width - tableLength) / 1.2;
  const dZoneX = xMargin + dZoneRadius;
  const dZoneY = height / 2;

  noFill();
  strokeWeight(1);
  stroke(255);

  // Semi Circle part in DZone
  arc(
    dZoneX,
    dZoneY,
    dZoneRadius * 2,
    dZoneRadius * 2,
    -(PI + HALF_PI),
    -(TWO_PI + HALF_PI)
  );

  // The vertical line that pass across the table surface
  line(
    dZoneX,
    (height - tableWidth) / 2,
    dZoneX,
    (height + tableWidth) / 2
  );
}

// Cue Stick Drawing
function drawCue() {
  // Cue position is not fixed
  push();
  const baseOffset = 210;
  const cueOffset = baseOffset + cuePower * 250;
  const cueX = whiteBall.x + cos(cueAngle) * cueOffset;
  const cueY = whiteBall.y + sin(cueAngle) * cueOffset;

  // Move the origin to where the cue stick starts
  translate(cueX, cueY);
  // Rotate the cue stick according to the direction of the ball
  rotate(cueAngle);

  // Draw cue stick
  strokeWeight(4);
  stroke(49, 49, 49);
  line(0, 0, -fixedCueLength, 0);
  stroke(255, 243, 220);
  line(-fixedCueLength, 0, -fixedCueLength + 140, 0);

  pop();
}

// Built-in Functions

function mousePressed() {
  // Check if all balls stop moving
  const allBallsStationary = 
    redBallBodies.every(ball =>
      Math.abs(ball.velocity.x) < 0.01 && Math.abs(ball.velocity.y) < 0.01
    ) &&
    colorBallBodies.every(ball =>
      Math.abs(ball.velocity.x) < 0.01 && Math.abs(ball.velocity.y) < 0.01
    ) &&
    (!whiteBallBody || // Handle if the white ball is potted
      (Math.abs(whiteBallBody.velocity.x) < 0.01 && Math.abs(whiteBallBody.velocity.y) < 0.01));

  // Notice about balls are moving in console and prevent cue action
  if (!allBallsStationary) {
    console.log("Cannot cue, balls are moving! ");
    return;
  }

  // Ensure placing the white ball in DZone before confirming the position
  if (!gameStarted || !isWhiteBallVisible) {
    // Ensure D Zone
    const xMargin = (width - tableLength) / 1.2;
    const dZoneX = xMargin + dZoneRadius;
    const dZoneY = height / 2;

    // Check if the click is within the D Zone
    const checkDZone = dist(mouseX, mouseY, dZoneX, dZoneY);

    if (
      mouseX <= dZoneX &&
      checkDZone <= dZoneRadius &&
      mouseY >= dZoneY - dZoneRadius &&
      mouseY <= dZoneY + dZoneRadius
    ) {
      // Check for overlap with color balls
      const nearColorBalls = colorBalls.some(ball => {
        const distance = dist(mouseX, mouseY, ball.x, ball.y);
        return distance < ballDiameter;
      });

      // Warn the white ball colliding with color balls at DZone and prevent cue ball placement
      if (nearColorBalls) {
        alert("Cannot place the white ball too close to the color balls!");
        return;
      }

      // Place the white ball at the clicked position
      if (!whiteBallBody) {
        whiteBallBody = Bodies.circle(mouseX, mouseY, (ballDiameter / 2) + 1, {
          restitution: 0.9,
          friction: 0.025,
          frictionAir: 0.0027,
        });
        World.add(world, whiteBallBody);
      } else {
        Body.setPosition(whiteBallBody, { x: mouseX, y: mouseY });
      }
      // Flag the visibility so that white ball is drawn on the table surface
      isWhiteBallVisible = true;
      console.log("White ball placed");
    } else {
      console.log("Click outside the D Zone arc");
    }
    return;
  }

  // Ensure the cueing action only when user confirm the white ball placement and mouseclick (default: cue invisible)
  if (gameStarted && isWhiteBallVisible && allBallsStationary) {
    isCueVisible = true;
    const ballPos = whiteBallBody.position;
    // Calculate angle based on mouse position
    cueAngle = atan2(mouseY - ballPos.y, mouseX - ballPos.x);
    // Reset cue power
    cuePower = 0;
  }
}

function mouseDragged() {
  // If cueing is cancelled, skip this part
  if (!isCueVisible) 
    {
      return;
    }

  // Allow cueing action
  if (gameStarted && isWhiteBallVisible) {
    const ballPos = whiteBallBody.position;
    // Update angle based on mouse position
    cueAngle = atan2(mouseY - ballPos.y, mouseX - ballPos.x);
    // Update cue power
    cuePower = constrain(dist(mouseX, mouseY, ballPos.x, ballPos.y) / 150, 0, maxCuePower);
  }
}

function mouseReleased() {
  // If cueing is cancelled, skip this part
  if (!isCueVisible) 
    {
      return;
    }

  // Allow releasing the cue stick
  if (gameStarted && isWhiteBallVisible) {
    // Calculate how much force to apply and direction
    const forceMagnitude = cuePower * 0.004;
    const force = {
      x: -cos(cueAngle) * forceMagnitude,
      y: -sin(cueAngle) * forceMagnitude,
    };

    // Apply force to the white ball
    Body.applyForce(whiteBallBody, whiteBallBody.position, force);

    // Reset cue stick visibility and power
    cuePower = 0;
    // After this function cue stick will disappear
    isCueVisible = false;
  }
}

function keyPressed() {
  // Prevent changing the game mode after starting the game
  if (gameStarted && (key == '1' || key == '2' || key == '3')) {
    alert("Cannot change game mode: Game has already started.");
    return;
  }

  // Prevent changing the game mode before the white ball is placed to DZone
  if ((key == '1' || key == '2' || key == '3') && isWhiteBallVisible) {
    // Check if the white ball is inside the D Zone
    const xMargin = (width - tableLength) / 1.2;
    const dZoneX = xMargin + dZoneRadius;
    const dZoneY = height / 2;
    const distToDZone = dist(whiteBall.x, whiteBall.y, dZoneX, dZoneY);

    if (whiteBall.x <= dZoneX && distToDZone <= dZoneRadius) 
    {
      alert("Cannot change game mode: White ball is already placed.");
      return; // Prevent mode change
    }
  }

  // Mode 1
  if (key == '1') {
    console.log("Switching to mode 1.");
    gameMode = 1;
    resetGame();
  } 
  
  // Mode 2
  else if (key == '2') {
    console.log("Switching to mode 2");
    gameMode = 2;
    resetGame();
  } 
  
  // Mode 3
  else if (key == '3') {
    console.log("Switching to mode 3");
    gameMode = 3;
    resetGame();
  } 
  
  // Toggle aim assist
  else if (key == 'A' || key == 'a') {
    aimAssist = !aimAssist;
    console.log("Aim assist " + (aimAssist ? "enabled" : "disabled") + ".");
  } 
  
   // Cancel cueing
  else if (key == 'C' || key == 'c') {
    if (isCueVisible) {
      console.log("Cue aiming canceled.");
      isCueVisible = false;
      cuePower = 0;
    }
  } 
  
  // Toggle Obstacles
  else if (key == 'B' || key == 'b') {
    enableObstacle = !enableObstacle;
    console.log("Obstacles " + (enableObstacle ? "enabled" : "disabled") + ".");
  } 
  
  // Confirm the game start
  else if (!gameStarted && (key == 'S' || key == 's') && isWhiteBallVisible) {
    gameStarted = true;
    console.log("Game started!");
  } 
  
  // Prevent the game start without white ball
  else if ((key == 'S' || key == 's') && !isWhiteBallVisible) {
    alert("Cannot start game. Place the white ball in the D Zone first.");
  }
}

// Function to reset game state
function resetGame() {
  World.clear(world, false);

  // Clear ball arrays
  redBalls = [];
  redBallBodies = [];
  colorBalls = [];
  colorBallBodies = [];

  // Reinitialize pockets, cushions, and white ball
  initializePockets();
  initializeCushions();
  initializeWhiteBall();

  // Recreate the game
  if (gameMode == 1) {
    mode1();
  } else if (gameMode == 2) {
    mode2();
  } else if (gameMode == 3) {
    mode3();
  }
  createBodies();
}

// Initialization Functions

function initializePockets() {
  const xMargin = (width - tableLength) / 2;
  const yMargin = (height - tableWidth) / 2;

  pockets.push(createVector(xMargin + 3, yMargin + 3));
  pockets.push(createVector(width / 2, yMargin));
  pockets.push(createVector(width - xMargin - 3, yMargin + 3));
  pockets.push(createVector(xMargin + 3, height - yMargin - 3));
  pockets.push(createVector(width / 2, height - yMargin));
  pockets.push(createVector(width - xMargin - 3, height - yMargin - 3));
}

function initializeCushions() {
  const xMargin = (width - tableLength) / 2;
  const yMargin = (height - tableWidth) / 2;

  const cushionThickness = 10;
  const cushionAdjustment = 4;

  // Top cushion
  cushionBodies.push(Bodies.rectangle(width / 2, yMargin - cushionAdjustment, tableLength - 2 * cushionAdjustment, cushionThickness, {
    isStatic: true,
    friction: 0,
    restitution: 0.99
  }));

  // Bottom cushion
  cushionBodies.push(Bodies.rectangle(width / 2, height - yMargin + cushionAdjustment, tableLength - 2 * cushionAdjustment, cushionThickness, {
    isStatic: true,
    friction: 0,
    restitution: 0.99
  }));

  // Left cushion
  cushionBodies.push(Bodies.rectangle(xMargin - cushionAdjustment, height / 2, cushionThickness, tableWidth - 2 * cushionAdjustment, {
    isStatic: true,
    friction: 0,
    restitution: 0.99
  }));

  // Right cushion
  cushionBodies.push(Bodies.rectangle(width - xMargin + cushionAdjustment, height / 2, cushionThickness, tableWidth - 2 * cushionAdjustment, {
    isStatic: true,
    friction: 0,
    restitution: 0.99
  }));

  World.add(world, cushionBodies);
}

function initializeWhiteBall() {
  whiteBall = createVector((width - tableLength) / 1.3 + dZoneRadius, height / 2);
  whiteBallBody = Bodies.circle(whiteBall.x, whiteBall.y, (ballDiameter / 2) + 1, {
    restitution: 0.9,
    friction: 0.025,
    frictionAir: 0.0027
  });
  World.add(world, whiteBallBody);
}

function initializeRedBalls() {
  redBalls = [];
  const startX = width / 1.5;
  const startY = height / 2;

  const numColumns = 5;
  const spacing = ballDiameter + 2;

  for (let col = 0; col < numColumns; col++) {
    const numBallsInCol = col + 1;
    const xOffset = startX + col * spacing;

    for (let row = 0; row < numBallsInCol; row++) {
      const yOffset = startY + (row - (numBallsInCol - 1) / 2) * spacing;
      redBalls.push(createVector(xOffset, yOffset));
    }
  }
}

function initializeColorBalls() {
  const startX = width / 2;
  const startY = height / 2;
  const xMargin = (width - tableLength) / 2;

  const positions = [
    // Better use color name to identify with string
    { x: (width - tableLength) / 1.2 + dZoneRadius, y: (height / 2) - dZoneRadius, color: "green" },
    { x: (width - tableLength) / 1.2 + dZoneRadius, y: (height / 2) + dZoneRadius, color: "yellow" },
    { x: (width - tableLength) / 1.2 + dZoneRadius, y: height / 2, color: "brown" },
    { x: startX, y: startY, color: "blue" },
    { x: tableLength - ballDiameter - 1.5, y: height / 2, color: "pink" },
    { x: width - xMargin - 75, y: height / 2, color: "black" }
  ];

  positions.forEach(pos => {
    const colorBall = createVector(pos.x, pos.y);
    colorBall.color = pos.color;
    colorBalls.push(colorBall);
  });
}

function createBodies() {
  redBallBodies = redBalls.map(ball =>
    Bodies.circle(ball.x, ball.y, (ballDiameter / 2) + 1, {
      restitution: 0.9,
      friction: 0.025,
      frictionAir: 0.0027
    })
  );

  colorBallBodies = colorBalls.map(ball =>
    Bodies.circle(ball.x, ball.y, (ballDiameter / 2) + 1, {
      restitution: 0.9,
      friction: 0.025,
      frictionAir: 0.0027
    })
  );

  // Add all ball bodies to the physics world
  World.add(world, [...redBallBodies, ...colorBallBodies]);
}

function updateBallPositions() {
  // Update current position of white ball
  if (isWhiteBallVisible && whiteBallBody) {
    whiteBall.set(whiteBallBody.position.x, whiteBallBody.position.y);
  }

  // Update current position of red ball
  for (let i = 0; i < redBalls.length; i++) {
    if (redBallBodies[i]) {
      redBalls[i].set(redBallBodies[i].position.x, redBallBodies[i].position.y);
    }
  }

  // Update current position of color ball
  for (let i = 0; i < colorBalls.length; i++) {
    if (colorBallBodies[i]) {
      colorBalls[i].set(colorBallBodies[i].position.x, colorBallBodies[i].position.y);
    }
  }
}

function constrainWhiteBallPosition() {
  const xMargin = (width - tableLength) / 2;
  const yMargin = (height - tableWidth) / 2;

  // Ensure whiteBallBody exists before attempting to constrain its position
  if (whiteBallBody && !gameStarted) {
    whiteBallBody.position.x = constrain(
      whiteBallBody.position.x,
      xMargin + ballDiameter / 2,
      width - xMargin - ballDiameter / 2
    );
    whiteBallBody.position.y = constrain(
      whiteBallBody.position.y,
      yMargin + ballDiameter / 2,
      height - yMargin - ballDiameter / 2
    );
  }
}

function checkPottedBalls() {
  const handlePottedBall = (ballBody, ballArray, ballBodyArray, ballType) => {
    if (!ballBody || !ballBody.position) 
      {
        return false;
      }

    for (let pocket of pockets) {
      if (
        dist(ballBody.position.x, ballBody.position.y, pocket.x, pocket.y) <
        (pocketDiameter / 2) + 2
      ) {
        const index = ballBodyArray.indexOf(ballBody);

        if (ballType == "color") {
          // Get the original ball data
          const originalBall = colorBalls[index];
          console.log(originalBall.color + " ball is potted.");

          // Replace the color ball at its original position
          const originalPosition = getColorBallOriginalPosition(
            originalBall.color,
            index
          );
          if (originalPosition) {
            Body.setPosition(ballBody, {
              x: originalPosition.x,
              y: originalPosition.y,
            });
            // Prevent the ball from moving if it is replaced back to origin
            Body.setVelocity(ballBody, { x: 0, y: 0 });
          }

          // Check if the last potted ball was also a color ball
          if (lastPottedBallType == "color") {
            alert(
              "You cannot pot two consecutive color balls without potting a red ball in between!"
            );
          }
          // Update the last potted ball type
          lastPottedBallType = "color";
          return true;
        } else if (ballType == "Red") {
          console.log("Red ball [" + (index + 1) + "] is potted.");

          // Remove ball from the physics world and arrays
          World.remove(world, ballBody);
          ballArray.splice(index, 1);
          ballBodyArray.splice(index, 1);

          // Update the last potted ball type
          lastPottedBallType = "red";
        }
        return true;
      }
    }
    return false;
  };

  // Check red balls
  for (let i = redBalls.length - 1; i >= 0; i--) {
    if (handlePottedBall(redBallBodies[i], redBalls, redBallBodies, "Red")) {
      break;
    }
  }

  // Check color balls
  for (let i = colorBalls.length - 1; i >= 0; i--) {
    if (handlePottedBall(colorBallBodies[i], colorBalls, colorBallBodies, "color")) {
      break;
    }
  }
}

// Helper function to get original position of a color ball
function getColorBallOriginalPosition(color, index) {
        // Default positions for color balls
        const positions = {
            green: { x: (width - tableLength) / 1.2 + dZoneRadius, y: (height / 2) - dZoneRadius },
            yellow: { x: (width - tableLength) / 1.2 + dZoneRadius, y: (height / 2) + dZoneRadius },
            brown: { x: (width - tableLength) / 1.2 + dZoneRadius, y: height / 2 },
            blue: { x: width / 2, y: height / 2 },
            pink: { x: tableLength - ballDiameter - 1.5, y: height / 2 },
            black: { x: width - (width - tableLength) / 2 - 75, y: height / 2 },
        };
        return positions[color];
}

function checkWhiteBallPotted() {
  for (let pocket of pockets) {
    if (dist(whiteBall.x, whiteBall.y, pocket.x, pocket.y) < (pocketDiameter / 2) + 2) {
      console.log("White ball potted! You need to place it inside the D Zone again.");

      // Remove the white ball from the physics world
      World.remove(world, whiteBallBody);

      // Make the white ball invisible and allow replacement
      isWhiteBallVisible = false;
      gameStarted = false;

      // Reset white ball vector for user placement
      whiteBall = createVector(0, 0);
      whiteBallBody = null;

      // Provide a message for user action (optional)
        alert("Place the white ball in the D Zone again to continue");
      break;
    }
  }
}

function drawAimAssist() {
  if (!isWhiteBallVisible || !aimAssist) 
    {
      return;
    }

  const start = whiteBallBody.position;
  let end = null;

  // Save current drawing state
  push();

  // Calculate the assist line
  const direction = createVector(-cos(cueAngle), -sin(cueAngle));
  let distance = 0;

  // Check the boundaries beyond the canva
  while (distance < width + height) {
    const hitPoint = {
      x: start.x + direction.x * distance,
      y: start.y + direction.y * distance,
    };

    // Check collision with balls
    if (
      redBalls.some(ball => dist(hitPoint.x, hitPoint.y, ball.x, ball.y) < ballDiameter / 2) ||
      colorBalls.some(ball => dist(hitPoint.x, hitPoint.y, ball.x, ball.y) < ballDiameter / 2)
    ) {
      end = hitPoint;
      break;
    }

    // Check collision with pockets
    if (pockets.some(pocket => dist(hitPoint.x, hitPoint.y, pocket.x, pocket.y) < pocketDiameter / 2)) {
      end = hitPoint;
      break;
    }

    // Check collision with table boundaries
    if (
      hitPoint.x < (width - tableLength) / 2 ||
      hitPoint.x > width - (width - tableLength) / 2 ||
      hitPoint.y < (height - tableWidth) / 2 ||
      hitPoint.y > height - (height - tableWidth) / 2
    ) {
      end = hitPoint;
      break;
    }

    distance += 5;
  }

  // Draw the line till end is deteced
  if (end) {
    stroke(255);
    strokeWeight(1);
    line(start.x, start.y, end.x, end.y);
  }

  pop();
}

// Function to draw game instructions
function drawInstructions() {
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);

  let x = 40;
  let y = 30;
  let lineHeight = 30;

  // Create instruction line by line
  text("Press 1, 2, 3 for game mode", x, y);
  text("Place the white ball in D zone", x, y + lineHeight);
  text("You cannot change the game mode once you place the white ball", x, y + 2 * lineHeight);
  text("Press 'S' to start the game", x, y + 3 * lineHeight);
  text("Press 'A' for aim assist", x, y + 4 * lineHeight);
  text("Press 'C' for cancelling the cue aim", x, y + 5 * lineHeight);
  text("Press 'B' to enable obstacles", x, y + 6 * lineHeight);
  text("Click the mouse for cue to appear and drag for cueing", x, y + 7 * lineHeight);
}

// Function to draw the cue power gauge
function drawCuePowerGauge() {
  const gaugeX = width - 300;
  const gaugeY = 50;
  const gaugeWidth = 200;
  const gaugeHeight = 20;

  // Box of the gauge
  noStroke();
  fill(100);
  rect(gaugeX, gaugeY, gaugeWidth, gaugeHeight, 5);

  // Filled gauge based on cuePower
  const fillWidth = cuePower / maxCuePower * gaugeWidth;
  fill(220, 20, 20);
  // Increase base on power
  rect(gaugeX, gaugeY, fillWidth, gaugeHeight, 5);

  // Draw the border for better visibility
  noFill();
  stroke(255);
  strokeWeight(2);
  rect(gaugeX, gaugeY, gaugeWidth, gaugeHeight, 5);

  // Add text to show the power level as a percentage
  noStroke();
  fill(255);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("Cue power:   " + Math.round((cuePower / maxCuePower) * 100) + "%", gaugeX + gaugeWidth / 2, gaugeY + gaugeHeight / 2);
}

// Function to check white ball collisions
function checkWhiteBallCollisions() {
  // Skip if white ball is not exist
  if (!whiteBallBody || !whiteBallBody.position) {
    return;
  }

  const whiteBallPos = whiteBallBody.position;

  // Check collision with red balls
  redBallBodies.forEach((redBallBody) => {
    if (redBallBody && redBallBody.position) {
      const redBallPos = redBallBody.position;

      if (isBallCollides(whiteBallPos, ballDiameter, redBallPos, ballDiameter + 8)) {
        console.log("cue-red");
      }
    }
  });

  // Check collision with color balls
  colorBallBodies.forEach((colorBallBody) => {
    if (colorBallBody && colorBallBody.position) {
      const colorBallPos = colorBallBody.position;

      if (isBallCollides(whiteBallPos, ballDiameter, colorBallPos, ballDiameter + 8)) {
        console.log("cue-colour");
      }
    }
  });

  // Check collision with cushions
  cushionBodies.forEach((cushionBody) => {
    if (cushionBody) {
      const collision = Matter.SAT.collides(whiteBallBody, cushionBody);
      if (collision && collision.collided) {
        console.log("cue-cushion");
      }
    }
  });
}

// Helper function to check for collision between two balls
function isBallCollides(posA, sizeA, posB, sizeB) {
  const distance = dist(posA.x, posA.y, posB.x, posB.y);
  const maxDistance = sizeA / 2 + sizeB / 2;
  return distance <= maxDistance;
}

function initializeObstacles() {
  const tableX = (width - tableLength) / 2;
  const tableY = (height - tableWidth) / 2;

  // Left obstacle near the center pockets
  obstacles.push({
    x: tableX + 300,
    y: tableY + tableWidth / 2,
    direction: 1,
  });

  // Right obstacle near the center pockets
  obstacles.push({
    x: tableX + 500,
    y: tableY + tableWidth / 2,
    // Different starting direction
    direction: -1,
  });
}

function drawObstacles() {
  // Clear obstacles
  if (!enableObstacle) 
    {
      return;
    }

  fill(185, 128, 60);
  noStroke();

  obstacles.forEach((obstacle) => {
      rect(
          obstacle.x - obstacleWidth / 2,
          obstacle.y - obstacleHeight / 2,
          obstacleWidth,
          obstacleHeight
      );
  });
}

// Update Obstacles position every frame
function updateObstacles() {
  const tableY = (height - tableWidth) / 2;

  obstacles.forEach((obstacle) => {
    obstacle.y += obstacle.direction * obstacleSpeed;

    // Change direction if obstacle reaches table boundaries
    if (obstacle.y - obstacleHeight / 2 < tableY || obstacle.y + obstacleHeight / 2 > tableY + tableWidth) {
      obstacle.direction *= -1;
    }
  });
}

function checkObstacleCollisions() {
  // Skip if obstacles are turned off
  if (!enableObstacle) {
    return;
  }

  obstacles.forEach((obstacle) => {
    // Function to check and push a ball if it collides with the obstacles
    const applyPushForce = (ballBody, ballType) => {
      if (
        ballBody &&
        ballBody.position.x + 8 > obstacle.x - obstacleWidth / 2 &&
        ballBody.position.x - 8 < obstacle.x + obstacleWidth / 2 &&
        ballBody.position.y + 14 > obstacle.y - obstacleHeight / 2 &&
        ballBody.position.y - 14 < obstacle.y + obstacleHeight / 2
      ) {
        console.log(ballType + " ball collided with obstacle!");

        // Apply a limited force to push the ball away
        const forceMultiplier = 0.00006;
        const force = {
          x: constrain((ballBody.position.x - obstacle.x) * forceMultiplier, -0.03, 0.03),
          y: constrain((ballBody.position.y - obstacle.y) * forceMultiplier, -0.03, 0.03),
        };

        // Apply the constrained force
        Body.applyForce(ballBody, ballBody.position, force);

        // Constrain ball position to table boundaries
        ballBody.position.x = constrain(
          ballBody.position.x,
          (width - tableLength) / 2 + ballDiameter / 2,
          width - (width - tableLength) / 2 - ballDiameter / 2
        );
        ballBody.position.y = constrain(
          ballBody.position.y,
          (height - tableWidth) / 2 + ballDiameter / 2,
          height - (height - tableWidth) / 2 - ballDiameter / 2
        );
      }
    };

    // Check and push the white ball
    applyPushForce(whiteBallBody, "White");

    // Check and push red balls
    redBallBodies.forEach((redBallBody, index) => {
      applyPushForce(redBallBody, "Red [" + (index + 1) + "]");
    });

    // Check and push color balls
    colorBallBodies.forEach((colorBallBody, index) => {
      applyPushForce(colorBallBody, "Color [" + (index + 1) + "]");
    });
  });
}

// Commentary

/* 

Cue Ball interaction: In my game, I made the ball placement to be done with mouse click and I had included D zone detection to ensure the white ball can only be placed inside the zone. 
I used mouse based only function to keep it simple, minimalist and it is also a user friendly interaction. Although I said it is mouse based function, the placement confirmation is done by pressing 's' key on keyboard.
I had included that so user can shift around the ball until he is satisfied and let the system know that he is ready to play by pressing 's' key after placing the cue ball.

Cue Stick interaction: For Cue Stick, it will only be drawn when the user mouse click just like placing the cue ball in D zone but the different is the cue ball placing interaction works only before the player press 's'.
After that, the mouse click function is change for drawing the cue stick around the cue ball. The mouse drag function determine how powerful the cue stick will hit the cue ball after drawing the cue follow up with mouse release function
which is a confirmation from the user that he want to apply this power to cue ball.

Extension 1: My first extension is aim assist. User will be able to toggle whether to enable or disable aim assist by pressing 'a' key. Sometimes, it is hard to cue the ball when the ball you want to pot is very far from the cue ball. 
So I added aim assist which show the direction and the magnitude that the cue ball will go until it hits another object. Another reason why I included this extension is I had a hard time to debug for potting related logic because 
the ball need to be potted and this help me easier to pot the balls to speed up the process.

Extension 2: Simple yet very useful function which is cancelling the cue. User can press 'c' key to cancel if he accidentally make cueing action. My initial power start at 1% if user dragged the mouse so there is no way to cancel the cueing by dragging
the pointer near to cue ball.

Extension 3: Last extension is enabling the obstacles by pressing 'b' key. Although I called them obstacles, they also look like barriers so I make the key press to be b. These are the moving objects which the user might wish none of the balls hit them
because they will mass up the velocity and direction of any balls that make contact with them. This is more like challenging level for the user so if the user is still unsatisfy with game mode 2 and 3, they can turn the obstacles on. I also reference this idea
from golf game and thought like what if I combine this disruption to another sport game.

I used a normal random function to generate x,y position and Set object to store the positions that is already generated by random function to avoid overlapping.

*/