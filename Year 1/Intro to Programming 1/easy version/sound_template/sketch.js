/*

- Copy your game project code into this file
- for the p5.Sound library look here https://p5js.org/reference/#/libraries/p5.sound
- for finding cool sounds perhaps look here
https://freesound.org/
Final game project

*/

var goingToLeft;
var goingToRight;
var characterFall;
var characterPlummet;
var characterX;
var characterY;
var yPositionOfFloor;
var balls;
var bigCanyons;
var characterWidth;
var xPositionOfTree;
var yPositionOfTree;
var object_Cloud;
var object_Mountain;
var xPositionOfCam;
var gameScore;
var flagpole;
var lives;
var gameOver;
var cloudFly; 
var jumpSound;
var winSound;
var dieSound;
var collectSound;
var restartSound;
var winSoundPlayed;
var loseSoundPlayed;

function preload()
{
    soundFormats('mp3','wav');
    
    //load your sounds here
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.2);
    
    winSound = loadSound('assets/win.wav');
    winSound.setVolume(0.2);
    
    dieSound = loadSound('assets/die.mp3');
    dieSound.setVolume(0.1);
    
    collectSound = loadSound('assets/collect.wav');
    collectSound.setVolume(0.1);
    
    restartSound = loadSound('assets/restart.wav');
    restartSound.setVolume(0.5);
    
    loseSound = loadSound('assets/fall.wav');
    loseSound.setVolume(0.3);
}

function setup()
{
	createCanvas(1024, 576);
    yPositionOfFloor = (height * 3/4);
    lives = 3;
    gameOver = false;
    
    //to start the game
    startGame();
}

function draw()
{
	///////////DRAWING CODE//////////

    //for making blue sky
	background(100,155,255); 

    //camera position
    xPositionOfCam = characterX-width/2;
    
    //for showing how many lives the character still has
    for(var i = 0; i<3; i++)
        {
            fill(255);
            noStroke();
            textSize(25);
            text("Life count: "+lives,200,20);
        }
    
    push();
    translate(-xPositionOfCam,0);
    
    //code for drawing each cloud in an array
    drawClouds();
    
    //code for drawing each mountain in an array
    drawMountains();
    
    //function to make the flag goes to top of the pole
    renderFlagpole();
    
    //function to reduce the lives of the character and restart when the character fall into canyon
    checkPlayerDie();
       
    pop();
    
    //leave the ground outside so the ground will be infinitely drawn while the character is moving
    //code for green ground
    noStroke();
	fill(0,155,0);
	rect(0, yPositionOfFloor, width, height - yPositionOfFloor); 
    
    push();
    translate(-xPositionOfCam,0);
    
    //code for drawing each tree in an array
    drawTrees();
    
    //code for drawing multiple balls and making it disappear when collected
    for(var i=0 ; i < balls.length ; i++)
        {
            //to make the ball appear until the ball in specific position is collected and to avoid duplicate score for same position
            if(!balls[i].isFound)
                {
                    drawBall(balls[i]);
                    checkBall(balls[i]);
                }
            
        };

	//code for drawing canyons and making the character fall into when reach to the canyon
    for(var i=0 ; i < bigCanyons.length ; i++)
        {
            drawBigCanyon(bigCanyons[i]);
            checkBigCanyon(bigCanyons[i]);
        };
    
	//the game character
	if(goingToLeft && characterFall)
	{
    //head
    stroke(0);
    strokeWeight(2);
    noFill();
    ellipse(characterX,characterY - 65,15,15);
    
    //body
    fill(0);
    rect(characterX - 2.5,characterY - 54,4,26);
    
    //left arm
    fill(0);
    rect(characterX-14,characterY-64,2,14);
    
    //right arm
    fill(0);
    rect(characterX+12,characterY-50,2,14);

    //leg
    fill(0);
    rect(characterX-16,characterY-24,30,2)
    }
    
	else if(goingToRight && characterFall)
	{
    //head
    stroke(0);
    strokeWeight(2);
    noFill();
    ellipse(characterX,characterY - 65,15,15);
    
    //body
    fill(0);
    rect(characterX - 2.5,characterY - 54,4,26);
    
    //left arm
    fill(0);
    rect(characterX-14,characterY-50,2,14);
    
    //right arm
    fill(0);
    rect(characterX+12,characterY-64,2,14);

    //leg
    fill(0);
    rect(characterX-16,characterY-24,30,2)
    }
    
	else if(goingToLeft)
	{
    //head
    stroke(0);
    strokeWeight(2);
    noFill();
    ellipse(characterX,characterY - 65,15,15);
    
    //body
    fill(0);
    rect(characterX - 2.5,characterY - 54,4,26);
    
    //left arm
    fill(0);
    rect(characterX-14,characterY-64,2,14);
    
    //right arm
    fill(0);
    rect(characterX+12,characterY-50,2,14);
    
    //left leg
    fill(0);
    rect(characterX-8,characterY-30,2,14);
    
    //right leg
    fill(0);
    rect(characterX+2,characterY-24,14,2);
	}
    
	else if(goingToRight)
	{
    //head
    stroke(0);
    strokeWeight(2);
    noFill();
    ellipse(characterX,characterY - 65,15,15);
    
    //body
    fill(0);
    rect(characterX - 2.5,characterY - 54,4,26);
    
    //left arm
    fill(0);
    rect(characterX-14,characterY-50,2,14);
    
    //right arm
    fill(0);
    rect(characterX+12,characterY-64,2,14);
    
    //left leg
    fill(0);
    rect(characterX-16,characterY-24,14,2);
    
    //right leg
    fill(0);
    rect(characterX+6,characterY-30,2,14);
        
	}
    
    
	else if(characterFall || characterPlummet)
	{
    //head
    stroke(0);
    strokeWeight(2);
    noFill();
    ellipse(characterX,characterY - 65,15,15);
    
    //body
    fill(0);
    rect(characterX - 2.5,characterY - 54,4,26);
    
    //left arm
    fill(0);
    rect(characterX-14,characterY-64,2,14);
    
    //right arm
    fill(0);
    rect(characterX+12,characterY-64,2,14);

    //leg
    fill(0);
    rect(characterX-16,characterY-24,30,2)
	}
    
    
	else
	{
    //head
    stroke(0);
    strokeWeight(2);
    noFill();
    ellipse(characterX,characterY - 65,15,15);
    
    //body
    fill(0);
    rect(characterX - 2.5,characterY - 54,4,26);
    
    //left arm
    fill(0);
    rect(characterX-14,characterY-50,2,14);
    
    //right arm
    fill(0);
    rect(characterX+12,characterY-50,2,14);
    
    //left leg
    fill(0);
    rect(characterX-8,characterY-24,2,14);
    
    //right leg
    fill(0);
    rect(characterX+6,characterY-24,2,14);
	}
    
    pop();
    
    //the text code for showing how many balls the character has collected
    fill(255);
    noStroke();
    textSize(25);
    text("Score: "+gameScore,20,20);
    
    //the text code for showing the game is over after the character fall into the canyon for 3 times and can play again after pressing spacebar
    if(lives<1)
        {
        fill(255);
        noStroke();
        textSize(60);
        text("Game over. Press space to continue. ",20,250);
        //to play the sound only for once when all lives are gone
        if(loseSoundPlayed == false)
           {
           loseSound.play();
            loseSoundPlayed = true;
           }
        return;
        }
    
    //the text code for showing the player that he/she has completed and can play again after pressing spacebar
    if(flagpole.isReached == true && gameScore == 5)
        {
        fill(255);
        noStroke();
        textSize(50);
        text("Level complete. Press space to continue. ",20,250);
        //to play the sound only for once when the player win the game
        if(winSoundPlayed == false)
           {
           winSound.play();
            winSoundPlayed = true;
           }
        return;
        }
    
    // falling to bigCanyon code
    if(characterPlummet){
        characterY += 12;
        dieSound.play();
        return;
    }
    
    // moving left code
    else if(goingToLeft == true && characterFall == false){
        characterX -= 5;
    }
    
    //moving right code
    else if(goingToRight == true && characterFall == false){
        characterX += 5;
    }
    
    //moving left, jump and fall code
    else if(goingToLeft == true && characterFall == true && characterY < yPositionOfFloor+8){
        characterY += 2;
        characterX -= 5;
    }
    
    //moving right, jump and fall code
    else if(goingToRight == true && characterFall == true && characterY < yPositionOfFloor+8){
        characterY += 2;
        characterX += 5;
    }
    
    //normal fall code
    else if(characterFall == true && characterY < yPositionOfFloor+8){
        characterY += 2;
        characterFall = true;
    }
    
    //stand code
    else{
        characterFall = false;
        characterPlummet = false;
    }
    
    //the code for checking whether the character has reach to flagpole or not
    if(flagpole.isReached == false)
        {
            checkFlagpole();
        }
}

//the function for starting the game
function startGame()
{
	characterX = width/2;
	characterY = yPositionOfFloor+8;
    goingToLeft = false;
    goingToRight = false;
    characterFall = false;
    characterPlummet = false;
    characterWidth = 40;
    
    balls = [{positionX: 130, positionY: yPositionOfFloor-16, size: 30, isFound: false},
            {positionX: 600, positionY: yPositionOfFloor-16, size: 30, isFound: false},
            {positionX: 800, positionY: yPositionOfFloor-16, size: 30, isFound: false},
            {positionX: 1150, positionY: yPositionOfFloor-16, size: 30, isFound: false},
            {positionX: 1500, positionY: yPositionOfFloor-16, size: 30, isFound: false}];
    
    bigCanyons = [{positionX: 200, width: 70},
                 {positionX: 1000, width: 70},
                 {positionX: 1300, width: 70}];
    
    xPositionOfTree = [140,430,780,850,1200];
    yPositionOfTree = height/2-20;
    
    object_Cloud = {positionX: [30,300,650,1180,1350], 
                    //this code is for adjusting height of the cloud
                    positionY: [100,150,130,70,120], 
                    size:50, 
                    //this code is for changing the overall size
                    size_adjust:[0.7,0.5,0.7,0.9,0.4],
                    //create an empty array instead of assigning fixed values to already declared clouds so it will become more advance and this will automatically assign based on number of clouds that we have declared
                    cloudSpeed: [],

                    cloudFly: function() {
                    for (var i = 0; i < this.positionX.length; i++) 
                        {
                        //to make sure the speed is assigned only once to each clouds and the other i put because the speed is too slow between -1 and 1
                        if (this.cloudSpeed[i] == undefined || this.cloudSpeed[i] > -1 && this.cloudSpeed[i] < 1) 
                            {
                            this.cloudSpeed[i] = random(-3, 3);
                            }
                        }
                    }

                    };
    
    object_Mountain = {positionX: [550,700,1800], 
                       //this code is for adjusting the height of mountain
                       positionY: [500,462,432], 
                       //this code is for adjusting the width of mountain
                       size_adjust: [0.7,0.9,0.6]};
    
    xPositionOfCam=0;
    
    gameScore = 0;
    flagpole = {isReached: false, x_pos: 1600};
    
    winSoundPlayed = false;
    loseSoundPlayed = false;
}

function keyPressed()
{
    //conditional statement to make the character unable to move when it is game over or the character reach the pole + collected every balls
    if (!(gameOver || flagpole.isReached ))
    //I used propositional logic of "¬" for this
    {
        //to go left
        if(key == "a"){
           goingToLeft = true;
           goingToRight = false;
           }

        //to go right
        else if(key == "d"){
            goingToLeft = false;
            goingToRight = true;
        }

        //jump + prevent double jump + not to glitch
        else if(key == "w" && characterFall == false && characterPlummet == false){
            characterFall = true;
            characterY -= 100;
            jumpSound.play();
        }
    }
    //conditional statement for checking player to restart only if the lives are gone or reach the flag
    else if(gameOver || (flagpole.isReached && gameScore == 5))
        {
            //when game over or touch the flag, player can play the game again by pressing spacebar
            if(keyCode == 32)
                {
                    lives = 3;
                    gameOver= false;
                    restartSound.play();
                    startGame();
                }
        }
}

function keyReleased()
{
    //to stop moving left
    if(key == "a"){
    goingToLeft = false;
    }

    //to stop moving right
    else if(key == "d"){
    goingToRight = false;
    }
}

function drawClouds()
{
    //calling the function that i have declared in start game function
    object_Cloud.cloudFly();
    for(var i = 0; i < object_Cloud.positionX.length; i++) {
        //to make the clouds float in the air
        object_Cloud.positionX[i] += object_Cloud.cloudSpeed[i];

        //each clouds will appear from the opposite side if it goes out of the frame and this can also be adjust if we expand the size of the screen by adding more objects in the game
        if(object_Cloud.positionX[i] > width + 700) {
            object_Cloud.positionX[i] = -200;
        }
        else if(object_Cloud.positionX[i] < -200) {
            object_Cloud.positionX[i] = width + 700;
        }

        //draw cloud. For adjusting the size and starting position, you can change the number inside the start game function
        noStroke();
        fill(255);
        rect(object_Cloud.positionX[i] - 50 * object_Cloud.size_adjust[i],
            object_Cloud.positionY[i] - 10 * object_Cloud.size_adjust[i],
            (object_Cloud.size + 50) * object_Cloud.size_adjust[i],
            (object_Cloud.size - 15) * object_Cloud.size_adjust[i]);
        ellipse(object_Cloud.positionX[i], object_Cloud.positionY[i] - 20 * object_Cloud.size_adjust[i],
            (object_Cloud.size + 30) * object_Cloud.size_adjust[i],
            object_Cloud.size * object_Cloud.size_adjust[i]);
        ellipse(object_Cloud.positionX[i] - 50 * object_Cloud.size_adjust[i], object_Cloud.positionY[i],
            object_Cloud.size * object_Cloud.size_adjust[i],
            object_Cloud.size * object_Cloud.size_adjust[i]);
        ellipse(object_Cloud.positionX[i] + 50 * object_Cloud.size_adjust[i], object_Cloud.positionY[i],
            object_Cloud.size * object_Cloud.size_adjust[i],
            object_Cloud.size * object_Cloud.size_adjust[i]);
    }
}

function drawMountains()
{
    //code for drawing each mountain in an array
    for(var i=0 ; i < object_Mountain.positionX.length ; i++)
    {
    //mountain
    noStroke();
	fill(210,180,140);
    //base of the mountain
    triangle(object_Mountain.positionX[i]*object_Mountain.size_adjust[i],
             object_Mountain.positionY[i],
             (object_Mountain.positionX[i]+150)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-330),
             (object_Mountain.positionX[i]+300)*object_Mountain.size_adjust[i],
             object_Mountain.positionY[i]);
    triangle((object_Mountain.positionX[i]-100)*object_Mountain.size_adjust[i],
             object_Mountain.positionY[i],
             object_Mountain.positionX[i]*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-200),
             (object_Mountain.positionX[i]+100)*object_Mountain.size_adjust[i],
             object_Mountain.positionY[i]);
    
    //white parts of second big triangle
	fill(245,245,245);
    triangle((object_Mountain.positionX[i]+129)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-285),
             (object_Mountain.positionX[i]+150)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-330),
             (object_Mountain.positionX[i]+171)*object_Mountain.size_adjust[i],
             object_Mountain.positionY[i]-285);
    triangle((object_Mountain.positionX[i]+134)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-295),
             (object_Mountain.positionX[i]+150)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-270),
             (object_Mountain.positionX[i]+166)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-295));
    triangle((object_Mountain.positionX[i]+129)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-285),
             (object_Mountain.positionX[i]+135)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-270),
             (object_Mountain.positionX[i]+150)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-285));
    triangle((object_Mountain.positionX[i]+150)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-285),
             (object_Mountain.positionX[i]+166)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-270),
             (object_Mountain.positionX[i]+171)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-285));
    
    //white parts of first big triangle
    triangle((object_Mountain.positionX[i]-20)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-160),
             object_Mountain.positionX[i]*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-200),
             (object_Mountain.positionX[i]+20)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-160));
    triangle((object_Mountain.positionX[i]-20)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-160),
             (object_Mountain.positionX[i]-10)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-140),
             (object_Mountain.positionX[i]+10)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-160));
    triangle((object_Mountain.positionX[i]-10)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-160),
             (object_Mountain.positionX[i]+10)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-140),
             (object_Mountain.positionX[i]+20)*object_Mountain.size_adjust[i],
             (object_Mountain.positionY[i]-160));
        }
}

function drawTrees()
{
    //code for drawing each tree in an array
    for(var i=0 ; i < xPositionOfTree.length ; i++)
        {
            //tree
        noStroke();
        fill(139,69,19);
        rect(xPositionOfTree[i],yPositionOfTree,50,164);

        fill(0,100,0);
        triangle(xPositionOfTree[i]-30,yPositionOfTree+30,
                 xPositionOfTree[i]+25,yPositionOfTree-60,
                 xPositionOfTree[i]+80,yPositionOfTree+30);
        triangle(xPositionOfTree[i]-30,yPositionOfTree+60,
                 xPositionOfTree[i]+25,yPositionOfTree-60,
                 xPositionOfTree[i]+80,yPositionOfTree+60);
        triangle(xPositionOfTree[i]-30,yPositionOfTree+90,
                 xPositionOfTree[i]+25,yPositionOfTree-60,
                 xPositionOfTree[i]+80,yPositionOfTree+90);
        }
}

function drawBall(t_ball)
{
    //code for drawing the ball
    stroke(0);
    fill(255);
    ellipse(t_ball.positionX,t_ball.positionY,
            t_ball.size,t_ball.size);
    
    stroke(0);
    fill(255,0,255);
    ellipse(t_ball.positionX,t_ball.positionY,
            t_ball.size-10,t_ball.size);
    
    stroke(0);
    fill(255);
    ellipse(t_ball.positionX,t_ball.positionY,
            t_ball.size-20,t_ball.size);
    
    stroke(0);
    fill(255,255,0);
    ellipse(t_ball.positionX,t_ball.positionY,
            t_ball.size-30,t_ball.size);
}

function drawBigCanyon(t_bigCanyon)
{
    //code for drawing the bigCanyon
    noStroke();
    fill(205,133,63);
    rect(t_bigCanyon.positionX,430,10,145);
    rect(t_bigCanyon.positionX+8+t_bigCanyon.width,430,10,145);
    
    fill(80);
    rect(t_bigCanyon.positionX+8,430,t_bigCanyon.width,145);
}

function checkBall(t_ball)
{   
    //to collect the ball when the character reach and increase the score
    if(dist(characterX, characterY, t_ball.positionX, t_ball.positionY+16)<20){
        t_ball.isFound = true;
        gameScore += 1;
        collectSound.play();
    }
}

function checkBigCanyon(t_bigCanyon)
{
    //to fall into the bigCanyon when the character is in the range
    if(characterY == yPositionOfFloor+8 
       && 
       characterX - characterWidth/2 > t_bigCanyon.positionX
       && 
       characterX + characterWidth/2 < t_bigCanyon.positionX+t_bigCanyon.width+18)
        {
            characterPlummet = true;
        }
}

function renderFlagpole()
{
    push();
    //to draw the flag on top of the pole when the character reach to pole and the flag on the ground if the character hasn't reached yet
    strokeWeight(5);
    stroke(100);
    line(flagpole.x_pos, yPositionOfFloor, flagpole.x_pos, yPositionOfFloor - 250)
    fill(255);
    noStroke();
    //when the character touch the flagpole, the flag will go from bottom to top and change to red color
    if(flagpole.isReached == true)
        {
          fill(255,0,0);
          rect(flagpole.x_pos+2.5, yPositionOfFloor - 250, 50, 50);  
        }
    //the original state of the flag where it will remain in the bottom of the pole with white color
    else
    {
        rect(flagpole.x_pos+2.5, yPositionOfFloor - 50, 50, 50);
    }
    
    pop();
}

function checkFlagpole()
{
    //to check if the character reach the pole
    var d = abs(characterX - flagpole.x_pos);
    
    //the conditional statement to check whether the character location pixel and the flag location pixel touch or not and only to let it wins when all the balls had been collected
    if(d < 15 && gameScore == 5)
        {
            flagpole.isReached = true;
        }
}

function checkPlayerDie()
{
    //if the character have at least one life, the game will be able to played
    if(lives > 0)
        {
                //initialization of the game and deducting lives if the character fall into canyon
                if(characterY == 680)
                    {
                        lives -= 1;
                        startGame();
                    }
        }
    else{
        //after losing all lives, the game will be over
        gameOver = true;
    }
}

//things to take notes - in some variables, they can be changed from fixed values to randomly assigned variable by using random function and this will be useful when there are a lot of objects to be drawn. For example cloud x poisition, y poisiton. mountain size etc..
//the clouds are flying from both of the direction (if lucky enough) instead of one direction. 
//everything in my code is adjustable to expand more. It is just that I just stopped at somewhat basic but still enjoyable and playable version. I have tried my best so that every interaction make sense.