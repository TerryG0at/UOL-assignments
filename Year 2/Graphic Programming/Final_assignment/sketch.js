///////////////////////////////////////////////////////////  GLOBAL VARIABLES ///////////////////////////////////////////////////////////

// Webcam variables
let video;
let videoWidth = 160;
let videoHeight = 120;

// Image buffers for different filters
let snapshot;
let grayscaleImage;
let redChannelImage;
let greenChannelImage;
let blueChannelImage;

// Thresholding sliders
let thresholdSliderRed;
let thresholdSliderGreen;
let thresholdSliderBlue;
let thresholdSliderYCbCr;
let thresholdSliderHSV;

// Thresholded RGB channel images
let thresholdedRed;
let thresholdedGreen;
let thresholdedBlue;

// YCbCr and HSV images
let yCbCrImage;
let hsvImage;

// Thresholded YCbCr and HSV images
let thresholdedYCbCr;
let thresholdedHSV;

// Face detection variables
let faceapi;
let detections = [];
let modelLoaded = false;

// Filter control variables
let filterMode = "none";

// UI positioning and spacing
let offsetX = 150;
let offsetY = 0;
let spacingX;
let spacingY;

// Control flags
let snapshotTaken = false;
let showFaceRectangle = true;

// Error positioning due to mirroring
let errorX = 80;
let errorY = 55;

// BodyPix variables (for background removal)
let bodypix;
let segmentation;
let showBackgroundRemoval = false;
let backgroundImage; // New variable for background image

///////////////////////////////////////////////////////////  SETUP FUNCTION ///////////////////////////////////////////////////////////

// Initializes canvas, webcam, image buffers, sliders, and models
function setup() {
    createCanvas(1600, 1600);
    pixelDensity(1);

    // Capture webcam video
    video = createCapture(VIDEO);
    video.size(videoWidth, videoHeight);
    video.hide();

    // Initialize image buffers
    initializeImages();

    // Set spacing for image grid layout
    spacingX = videoWidth + 90;
    spacingY = videoHeight + 70;

    // Create sliders for threshold control
    setupSliders();

    // Initialize ml5 FaceAPI for face detection
    faceapi = ml5.faceApi(video, { withLandmarks: true, withDescriptors: false }, modelReady);

    // Initialize BodyPix for background removal
    bodypix = ml5.bodyPix(video, modelReady);
}

function preload() {
    backgroundImage = loadImage('image/1.jpg', () => {
        console.log('Background image loaded successfully.');
    }, () => {
        console.error('Error loading background image.');
    });
}

///////////////////////////////////////////////////////////  MODEL READY FUNCTION ///////////////////////////////////////////////////////////

// Triggered when models (FaceAPI & BodyPix) finish loading
function modelReady() {
    console.log("BodyPix model loaded!");
    detectBody(); // Start BodyPix detection for background removal
    console.log("FaceAPI model loaded!");
    modelLoaded = true; // Flag to indicate models are fully loaded
    detectFaces(); // Start face detection
}

///////////////////////////////////////////////////////////  FACE DETECTION FUNCTION ///////////////////////////////////////////////////////////

// Continuously detects faces after the model is loaded
function detectFaces() {
    if (!modelLoaded) return;

    faceapi.detect((err, results) => {
        if (err) {
            console.error(err); // Log error if detection fails
            return;
        }

        if (results.length > 0) {
            detections = results; // Store detected face data
        }

        requestAnimationFrame(detectFaces); // Continuously detects faces
    });
}

///////////////////////////////////////////////////////////  DRAW FUNCTION ///////////////////////////////////////////////////////////

// Continuously renders the canvas and updates visual outputs
function draw() {
    clear();
    background(220);

    // Dynamic Background Removal Feature
    if (segmentation) {
        let img = createImage(videoWidth, videoHeight);
        img.loadPixels();

        let videoPixels = video.get();
        videoPixels.loadPixels();

        let mask = segmentation.raw;

        // Iterate through pixels for background removal
        for (let i = 0; i < videoPixels.pixels.length; i += 4) {
            const isPerson = mask[i / 4] === 255;

            if (isPerson) {
                img.pixels[i] = videoPixels.pixels[i]; // R
                img.pixels[i + 1] = videoPixels.pixels[i + 1]; // G
                img.pixels[i + 2] = videoPixels.pixels[i + 2]; // B
                img.pixels[i + 3] = 255; // Full opacity
            } else {
                img.pixels[i] = 255; // White R
                img.pixels[i + 1] = 255; // White G
                img.pixels[i + 2] = 255; // White B
                img.pixels[i + 3] = 255; // Full opacity
            }
        }

        img.updatePixels();
    }

    // Process snapshot filters only when a snapshot is taken
    if (snapshotTaken) {
        processSnapshot();
    }

    // Draw all processed images on the canvas
    drawImages();
    drawInstructions();
}

///////////////////////////////////////////////////////////  SNAPSHOT FUNCTION ///////////////////////////////////////////////////////////

// Captures a snapshot of the video without freezing the live feed
function takeSnapshot() {
    snapshot = createGraphics(video.width, video.height);
    snapshot.image(video, 0, 0, video.width, video.height);
    snapshotTaken = true;
}

///////////////////////////////////////////////////////////  KEYBOARD CONTROLS ///////////////////////////////////////////////////////////

// Handles key press actions for snapshot and filter toggling
function keyPressed() {
    if (key === 's' || key === 'S') {
        takeSnapshot(); // Take a snapshot
    }

    // Filter mode control via keys
    if (key === '1') {
        filterMode = 'grayscale';
    } else if (key === '2') {
        filterMode = 'blur';
    } else if (key === '3') {
        filterMode = 'color';
    } else if (key === '4') {
        filterMode = 'pixelate'; 
    } else if (key === '0') {
        filterMode = 'none'; 
    } else if (key === 'd' || key === 'D') {
        showFaceRectangle = !showFaceRectangle; // Toggle face detection box
    } else if (key === 'b' || key === 'B') {
        showBackgroundRemoval = !showBackgroundRemoval; // Toggle background removal
    }
}

///////////////////////////////////////////////////////////  SNAPSHOT PROCESSING ///////////////////////////////////////////////////////////

// Processes filters on the captured snapshot
function processSnapshot() {
    greyscaleFilter(snapshot);
    extractColorChannels(snapshot);
    applyThresholding();
    convertToYCbCr(snapshot);
    convertToHSV(snapshot);
    applyColorThresholding();
}

///////////////////////////////////////////////////////////  IMAGE DRAWING FUNCTIONS ///////////////////////////////////////////////////////////

// Draws processed images on the canvas
function drawImages() {
    let row1Y = offsetY; // First row position
    let row2Y = row1Y + spacingY; // Second row position
    let row3Y = row2Y + spacingY; // Third row position
    let row4Y = row3Y + spacingY; // Fourth row position
    let row5Y = row4Y + spacingY; // Fifth row position

    textSize(20); // Text size for image labels
    fill(0, 100, 0); // Green text color for labels

    // === FIRST ROW: Snapshot & Grayscale ===
    text("Webcam Image", offsetX - errorX, row1Y - 10 + errorY);
    drawMirroredImage(snapshot, offsetX, row1Y);

    text("Grayscale + Brightness 20%", offsetX + spacingX - errorX, row1Y - 10 + errorY);
    drawMirroredImage(grayscaleImage, offsetX + spacingX, row1Y);

    // === SECOND ROW: Red, Green, Blue Channels ===
    text("Red Channel", offsetX - errorX, row2Y - 10 + errorY);
    drawMirroredImage(redChannelImage, offsetX, row2Y);

    text("Green Channel", offsetX + spacingX - errorX, row2Y - 10 + errorY);
    drawMirroredImage(greenChannelImage, offsetX + spacingX, row2Y);

    text("Blue Channel", offsetX + spacingX * 2 - errorX, row2Y - 10 + errorY);
    drawMirroredImage(blueChannelImage, offsetX + spacingX * 2, row2Y);

    // === THIRD ROW: Thresholded R, G, B ===
    text("Threshold Image (R)", offsetX - errorX, row3Y - 10 + errorY);
    drawMirroredImage(thresholdedRed, offsetX, row3Y);

    text("Threshold Image (G)", offsetX + spacingX - errorX, row3Y - 10 + errorY);
    drawMirroredImage(thresholdedGreen, offsetX + spacingX, row3Y);

    text("Threshold Image (B)", offsetX + spacingX * 2 - errorX, row3Y - 10 + errorY);
    drawMirroredImage(thresholdedBlue, offsetX + spacingX * 2, row3Y);

    // === FOURTH ROW: YCbCr & HSV ===
    text("Webcam Image (Repeat)", offsetX - errorX, row4Y - 10 + errorY);
    drawMirroredImage(snapshot, offsetX, row4Y);

    text("Colour Space (YCbCr)", offsetX + spacingX - errorX, row4Y - 10 + errorY);
    drawMirroredImage(yCbCrImage, offsetX + spacingX, row4Y);

    text("Colour Space (HSV)", offsetX + spacingX * 2 - errorX, row4Y - 10 + errorY);
    drawMirroredImage(hsvImage, offsetX + spacingX * 2, row4Y);

    text("Live Video", offsetX - errorX, row5Y - 10 + errorY);

    if (showBackgroundRemoval && segmentation) {
        const processedImage = applyBackgroundRemoval(video, segmentation); // Apply background removal
        drawMirroredImage(processedImage, offsetX, row5Y); // Display processed image
    } else {
        drawMirroredImage(video, offsetX, row5Y); // Display original video
    }

    drawFaceDetections(offsetX, row5Y); // Draw detected face boxes

    text("Threshold Image (YCbCr)", offsetX + spacingX - errorX, row5Y - 10 + errorY);
    drawMirroredImage(thresholdedYCbCr, offsetX + spacingX, row5Y);

    text("Threshold Image (HSV)", offsetX + spacingX * 2 - errorX, row5Y - 10 + errorY);
    drawMirroredImage(thresholdedHSV, offsetX + spacingX * 2, row5Y);
}

///////////////////////////////////////////////////////////  APP INSTRUCTIONS ///////////////////////////////////////////////////////////

// Draws app instructions in the empty space on the right side of the canvas
function drawInstructions() {
    let instructionsX = width - 600; // Position instructions on the right
    let instructionsY = 300; // Starting Y position

    // Draw background box
    let boxWidth = 450; // Width of the background box
    let boxHeight = 500; // Height of the background box (adjust if needed)
    fill(240); // Light grey background for the box
    stroke(0); // Black border
    strokeWeight(2); // Border thickness
    rect(instructionsX - 20, instructionsY - 40, boxWidth, boxHeight, 15); // Rounded corners

    // Instruction Title
    textSize(40);
    noStroke(); // Remove text outline
    fill(0); // Black text
    text("App Instructions", instructionsX, instructionsY);

    // Instruction Details
    textSize(20); // Smaller text for details
    let instructions = [
        'Press "s" to take snapshot',
        'Press "d" to toggle face detection rectangle',
        'Press "b" to apply background',
        'Press "1" to apply greyscale face filter',
        'Press "2" to apply blur face filter',
        'Press "3" to apply colour converted face filter',
        'Press "4" to apply pixelated face filter',
        'Press "0" to clear face filter'
    ];

    let spacing = 50; // Space between instructions
    instructions.forEach((instruction, index) => {
        text(instruction, instructionsX, instructionsY + 70 + index * spacing);
    });
}

// Draws mirrored images (flipped horizontally)
function drawMirroredImage(img, x, y) {
    push();
    translate(x + videoWidth / 2, y + videoHeight / 2); // Centered translation for mirroring
    scale(-1, 1); // Horizontal flip
    image(img, 0, 0, videoWidth, videoHeight); // Draw the image
    pop();
}

///////////////////////////////////////////////////////////  FACE DETECTION DRAWING ///////////////////////////////////////////////////////////

// Draws detected faces with filters and outlines
function drawFaceDetections(x, y) {
    push();
    translate(x + videoWidth / 2, y + videoHeight / 2); // Centered translation for mirroring
    scale(-1, 1); // Horizontal flip

    if (detections.length > 0) {
        detections.forEach(detection => {
            let { x: fx, y: fy, width: fw, height: fh } = detection.alignedRect._box; // Face box details

            if (filterMode === "none") {
                let originalFace = createGraphics(fw, fh);
                originalFace.copy(video, fx, fy, fw, fh, 0, 0, fw, fh); 
                image(originalFace, fx, fy, fw, fh);

                if (showFaceRectangle) {
                    noFill();
                    stroke(255);
                    strokeWeight(2);
                    rect(fx, fy, fw, fh);
                }
            } else {
                let faceBuffer = createGraphics(fw, fh);
                faceBuffer.copy(video, fx, fy, fw, fh, 0, 0, fw, fh);

                // Apply filters based on selected mode
                if (filterMode === 'grayscale') faceBuffer = applyGrayscaleFilter(faceBuffer);
                else if (filterMode === 'blur') faceBuffer = applyBlurFilter(faceBuffer);
                else if (filterMode === 'color') faceBuffer = applyColorConversion(faceBuffer);
                else if (filterMode === 'pixelate') {
                    greyPixelateFaceFilter(faceBuffer, 0, 0, fw, fh);
                }

                image(faceBuffer, fx, fy, fw, fh);

                if (showFaceRectangle) {
                    noFill();
                    stroke(255);
                    strokeWeight(2);
                    rect(fx, fy, fw, fh);
                }
            }
        });
    }

    pop();
}

///////////////////////////////////////////////////////////  FILTER FUNCTIONS ///////////////////////////////////////////////////////////

// Converts extracted face to grayscale
function applyGrayscaleFilter(img) {
    let grayFace = createGraphics(img.width, img.height); // Create graphics buffer
    grayFace.image(img, 0, 0); // Copy original image

    grayFace.loadPixels();
    for (let i = 0; i < grayFace.pixels.length; i += 4) {
        let avg = (grayFace.pixels[i] + grayFace.pixels[i + 1] + grayFace.pixels[i + 2]) / 3; // Calculate grayscale average
        grayFace.pixels[i] = grayFace.pixels[i + 1] = grayFace.pixels[i + 2] = avg; // Assign average to RGB
    }
    grayFace.updatePixels(); // Commit pixel changes

    return grayFace;
}

// Applies blur effect (optimized for face extraction)
function applyBlurFilter(img) {
    let blurredFace = createGraphics(img.width, img.height); // Create graphics buffer
    blurredFace.image(img, 0, 0); // Copy original image
    blurredFace.filter(BLUR, 2); // Apply blur effect
    return blurredFace;
}

// Converts extracted face to YCbCr or HSV
function applyColorConversion(img) {
    let convertedFace = createImage(img.width, img.height); // Create new image buffer
    img.loadPixels();
    convertedFace.loadPixels();

    for (let i = 0; i < img.pixels.length; i += 4) {
        let r = img.pixels[i];
        let g = img.pixels[i + 1];
        let b = img.pixels[i + 2];

        // Convert to YCbCr color space
        let Y = 0.299 * r + 0.587 * g + 0.114 * b;
        let Cb = 128 + (-0.168736 * r - 0.331264 * g + 0.5 * b);
        let Cr = 128 + (0.5 * r - 0.418688 * g - 0.081312 * b);

        // Assign calculated values
        convertedFace.pixels[i] = constrain(Y, 0, 255);
        convertedFace.pixels[i + 1] = constrain(Cb, 0, 255);
        convertedFace.pixels[i + 2] = constrain(Cr, 0, 255);
        convertedFace.pixels[i + 3] = 255; // Full opacity
    }

    convertedFace.updatePixels(); // Commit pixel changes
    return convertedFace;
}

// Pixelation effect — draws blocks INTO the faceBuffer graphics object
function greyPixelateFaceFilter(snapImage, x, y, faceWidth, faceHeight) {
    snapImage.loadPixels();
 
    let numBlocksX = 5;
    let numBlocksY = 5;
 
    let pixelationLevelX = faceWidth / numBlocksX;
    let pixelationLevelY = faceHeight / numBlocksY;
 
    let minBrightnessThreshold = 30;
    let brightnessBoost = 2.0;
 
    for (let j = 0; j < numBlocksY; j++) {
        for (let i = 0; i < numBlocksX; i++) {
            let sumGray = 0, count = 0;
 
            for (let dy = 0; dy < pixelationLevelY; dy++) {
                for (let dx = 0; dx < pixelationLevelX; dx++) {
                    let px = x + i * pixelationLevelX + dx;
                    let py = y + j * pixelationLevelY + dy;
 
                    if (px < x + faceWidth && py < y + faceHeight) {
                        let col = snapImage.get(px, py);
                        let r = red(col);
                        let g = green(col);
                        let b = blue(col);
                        let gray = 0.3 * r + 0.59 * g + 0.11 * b;
 
                        if (gray > minBrightnessThreshold) {
                            sumGray += gray;
                            count++;
                        }
                    }
                }
            }
 
            if (count === 0) continue;
 
            let avgGray = constrain((sumGray / count) * brightnessBoost, 0, 255);
 
            let drawX = x + i * pixelationLevelX;
            let drawY = y + j * pixelationLevelY;
 
            // FIX: Draw into snapImage (faceBuffer), not onto the main canvas
            snapImage.noStroke();
            snapImage.fill(avgGray);
            snapImage.rect(drawX, drawY, pixelationLevelX, pixelationLevelY);
        }
    }
}


///////////////////////////////////////////////////////////  IMAGE INITIALIZATION ///////////////////////////////////////////////////////////

// Initializes image buffers for snapshots, filters, and color spaces
function initializeImages() {
    snapshot = createGraphics(videoWidth, videoHeight);
    grayscaleImage = createImage(videoWidth, videoHeight);
    redChannelImage = createImage(videoWidth, videoHeight);
    greenChannelImage = createImage(videoWidth, videoHeight);
    blueChannelImage = createImage(videoWidth, videoHeight);
    thresholdedRed = createImage(videoWidth, videoHeight);
    thresholdedGreen = createImage(videoWidth, videoHeight);
    thresholdedBlue = createImage(videoWidth, videoHeight);
    yCbCrImage = createImage(videoWidth, videoHeight);
    hsvImage = createImage(videoWidth, videoHeight);
    thresholdedYCbCr = createImage(videoWidth, videoHeight);
    thresholdedHSV = createImage(videoWidth, videoHeight);
}

///////////////////////////////////////////////////////////  SLIDER SETUP ///////////////////////////////////////////////////////////

// Creates sliders for controlling threshold values
function setupSliders() {
    thresholdSliderRed = createSlider(1, 255, 125); // Red channel slider
    thresholdSliderRed.position(offsetX / 2, offsetY + spacingY * 3);

    thresholdSliderGreen = createSlider(1, 255, 125); // Green channel slider
    thresholdSliderGreen.position(offsetX / 2 + spacingX, offsetY + spacingY * 3);

    thresholdSliderBlue = createSlider(1, 255, 125); // Blue channel slider
    thresholdSliderBlue.position(offsetX / 2 + spacingX * 2, offsetY + spacingY * 3);

    thresholdSliderYCbCr = createSlider(1, 255, 125); // YCbCr channel slider
    thresholdSliderYCbCr.position(offsetX / 2 + spacingX, offsetY + spacingY * 5);

    thresholdSliderHSV = createSlider(1, 255, 125); // HSV channel slider
    thresholdSliderHSV.position(offsetX / 2 + spacingX * 2, offsetY + spacingY * 5);
}

///////////////////////////////////////////////////////////  IMAGE DRAWING ///////////////////////////////////////////////////////////

// Draws mirrored images (flipped horizontally)
function drawMirroredImage(img, x, y) {
    push();
    translate(x + videoWidth / 2, y + videoHeight / 2); // Centered translation for mirroring
    scale(-1, 1); // Horizontal flip
    image(img, 0, 0, videoWidth, videoHeight); // Draw image
    pop();
}

///////////////////////////////////////////////////////////  FILTER & COLOR CONVERSION FUNCTIONS ///////////////////////////////////////////////////////////

// Converts the image to grayscale with +20% brightness
function greyscaleFilter(img) {
    img.loadPixels();
    grayscaleImage.loadPixels();

    for (let i = 0; i < img.pixels.length; i += 4) {
        let r = img.pixels[i]; // Red channel value
        let g = img.pixels[i + 1]; // Green channel value
        let b = img.pixels[i + 2]; // Blue channel value

        let gray = r * 0.299 + g * 0.587 + b * 0.114; // Grayscale formula
        gray = min(gray * 1.2, 255); // Increase brightness by 20% and cap at 255

        // Assign grayscale value to RGB channels
        grayscaleImage.pixels[i] = grayscaleImage.pixels[i + 1] = grayscaleImage.pixels[i + 2] = gray;

        grayscaleImage.pixels[i + 3] = 255; // Full opacity
    }
    grayscaleImage.updatePixels(); // Commit pixel changes
}

// Extracts RGB color channels as separate images
function extractColorChannels(img) {
    img.loadPixels();
    redChannelImage.loadPixels();
    greenChannelImage.loadPixels();
    blueChannelImage.loadPixels();

    for (let i = 0; i < img.pixels.length; i += 4) {
        let r = img.pixels[i]; // Red channel value
        let g = img.pixels[i + 1]; // Green channel value
        let b = img.pixels[i + 2]; // Blue channel value

        // Isolating each channel
        redChannelImage.pixels[i] = r;
        redChannelImage.pixels[i + 1] = redChannelImage.pixels[i + 2] = 0;

        greenChannelImage.pixels[i + 1] = g;
        greenChannelImage.pixels[i] = greenChannelImage.pixels[i + 2] = 0;

        blueChannelImage.pixels[i + 2] = b;
        blueChannelImage.pixels[i] = blueChannelImage.pixels[i + 1] = 0;

        redChannelImage.pixels[i + 3] = greenChannelImage.pixels[i + 3] = blueChannelImage.pixels[i + 3] = 255;
    }

    redChannelImage.updatePixels(); // Commit pixel changes for each channel
    greenChannelImage.updatePixels();
    blueChannelImage.updatePixels();
}

// Applies thresholding for each RGB channel
function applyThresholding() {
    thresholdFilter(redChannelImage, thresholdedRed, thresholdSliderRed.value(), 0); // Red channel
    thresholdFilter(greenChannelImage, thresholdedGreen, thresholdSliderGreen.value(), 1); // Green channel
    thresholdFilter(blueChannelImage, thresholdedBlue, thresholdSliderBlue.value(), 2); // Blue channel
}

// Applies threshold filter to an image, keeping only selected RGB channel
function thresholdFilter(inputImg, outputImg, threshold, channel) {
    inputImg.loadPixels();
    outputImg.loadPixels();

    for (let x = 0; x < inputImg.width; x++) {
        for (let y = 0; y < inputImg.height; y++) {
            let index = (y * inputImg.width + x) * 4;

            let pixelValue = inputImg.pixels[index + channel]; // Get R, G, or B value

            if (pixelValue > threshold) {
                // Keep the original RGB channel, set others to 0
                outputImg.pixels[index] = (channel == 0) ? pixelValue : 0; // Red
                outputImg.pixels[index + 1] = (channel == 1) ? pixelValue : 0; // Green
                outputImg.pixels[index + 2] = (channel == 2) ? pixelValue : 0; // Blue
            } else {
                // Set all channels to black
                outputImg.pixels[index] = 0;
                outputImg.pixels[index + 1] = 0;
                outputImg.pixels[index + 2] = 0;
            }

            outputImg.pixels[index + 3] = 255; // Full opacity
        }
    }

    outputImg.updatePixels(); // Commit pixel changes
}

// Converts the image to YCbCr color space
function convertToYCbCr(img) {
    img.loadPixels();
    yCbCrImage.loadPixels();

    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            let index = (y * img.width + x) * 4;

            let r = img.pixels[index]; // Red channel value
            let g = img.pixels[index + 1]; // Green channel value
            let b = img.pixels[index + 2]; // Blue channel value

            // Compute YCbCr values
            let Y = 0.299 * r + 0.587 * g + 0.114 * b;
            let Cb = 128 + (-0.168736 * r - 0.331264 * g + 0.5 * b);
            let Cr = 128 + (0.5 * r - 0.418688 * g - 0.081312 * b);

            // Constrain values to 0-255 range
            Y = constrain(Y, 0, 255);
            Cb = constrain(Cb, 0, 255);
            Cr = constrain(Cr, 0, 255);

            // Store calculated values
            yCbCrImage.pixels[index] = Y;
            yCbCrImage.pixels[index + 1] = Cb;
            yCbCrImage.pixels[index + 2] = Cr;
            yCbCrImage.pixels[index + 3] = 255; // Full opacity
        }
    }

    yCbCrImage.updatePixels(); // Commit pixel changes
}

///////////////////////////////////////////////////////////  HSV CONVERSION & COLOR THRESHOLDING ///////////////////////////////////////////////////////////

// Converts the image to HSV color space
function convertToHSV(img) {
    img.loadPixels();
    hsvImage.loadPixels();

    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            let index = (y * img.width + x) * 4;

            let r = img.pixels[index] / 255.0; // Normalize R channel to 0-1
            let g = img.pixels[index + 1] / 255.0; // Normalize G channel to 0-1
            let b = img.pixels[index + 2] / 255.0; // Normalize B channel to 0-1

            // Get max and min of RGB
            let maxVal = max(r, g, b); // Maximum value
            let minVal = min(r, g, b); // Minimum value
            let delta = maxVal - minVal; // Difference for Hue calculation

            // Calculate Hue (H)
            let H = 0;
            if (delta === 0) {
                H = 0; // Grayscale
            } else if (maxVal === r) {
                H = (60 * ((g - b) / delta) + 360) % 360;
            } else if (maxVal === g) {
                H = (60 * ((b - r) / delta) + 120) % 360;
            } else {
                H = (60 * ((r - g) / delta) + 240) % 360;
            }

            // Calculate Saturation (S)
            let S = (maxVal === 0) ? 0 : (delta / maxVal);

            // Low-cut filter to reduce noise in low saturation
            if (S < 0.1) S = 0;

            // Calculate Value (V)
            let V = maxVal;

            // Scale to 0-255 range
            H = map(H, 0, 360, 0, 255);
            S = map(S, 0, 1, 0, 200); // Reduce max saturation to smooth noise
            V = map(V, 0, 1, 20, 255); // Avoid extreme darkness by raising min value

            // Store HSV values
            hsvImage.pixels[index] = constrain(H, 0, 255);
            hsvImage.pixels[index + 1] = constrain(S, 0, 255);
            hsvImage.pixels[index + 2] = constrain(V, 0, 255);
            hsvImage.pixels[index + 3] = 255; // Full opacity
        }
    }

    hsvImage.updatePixels(); // Commit pixel changes
}

// Applies thresholding for YCbCr and HSV color spaces
function applyColorThresholding() {
    thresholdImage(yCbCrImage, thresholdedYCbCr, thresholdSliderYCbCr.value());
    thresholdImage(hsvImage, thresholdedHSV, thresholdSliderHSV.value());
}

// Thresholds each color channel independently
function thresholdImage(inputImg, outputImg, threshold) {
    inputImg.loadPixels();
    outputImg.loadPixels();

    for (let x = 0; x < inputImg.width; x++) {
        for (let y = 0; y < inputImg.height; y++) {
            let index = (y * inputImg.width + x) * 4;

            let r = inputImg.pixels[index]; // Red channel
            let g = inputImg.pixels[index + 1]; // Green channel
            let b = inputImg.pixels[index + 2]; // Blue channel

            // Apply threshold independently to each channel
            outputImg.pixels[index] = r > threshold ? r : 0;
            outputImg.pixels[index + 1] = g > threshold ? g : 0;
            outputImg.pixels[index + 2] = b > threshold ? b : 0;

            outputImg.pixels[index + 3] = 255; // Full opacity
        }
    }

    outputImg.updatePixels(); // Commit pixel changes
}

///////////////////////////////////////////////////////////  BODY DETECTION & BACKGROUND REMOVAL ///////////////////////////////////////////////////////////

// Detects full-body using BodyPix for background removal
function detectBody() {
    bodypix.segment(video, {
        architecture: 'ResNet50', // Stronger model for full-body detection
        flipHorizontal: false,
        segmentationThreshold: 0.7, // Improves boundary sharpness
        maxDetections: 5, // Tracks multiple people
        outputStride: 32, // Optimized for body tracking
        internalResolution: 'high' // Better resolution for full-body capture
    }, (err, result) => {
        if (err) {
            console.error(err); // Log error if detection fails
            return;
        }

        segmentation = result; // Store segmentation result
        requestAnimationFrame(detectBody); // Continue detection loop
    });
}

function applyBackgroundRemoval(video, segmentation) {
    let img = createImage(video.width, video.height);
    img.loadPixels();

    let videoPixels = video.get();
    videoPixels.loadPixels();

    // Resize the background image to match video size
    let bgImgResized = createImage(video.width, video.height);
    bgImgResized.copy(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height, 0, 0, video.width, video.height);

    let bgPixels = bgImgResized.get();
    bgPixels.loadPixels();

    let mask = segmentation.raw;

    for (let i = 0; i < videoPixels.pixels.length; i += 4) {
        const isPerson = mask[i / 4] === 255;

        if (isPerson) {
            img.pixels[i] = videoPixels.pixels[i];
            img.pixels[i + 1] = videoPixels.pixels[i + 1];
            img.pixels[i + 2] = videoPixels.pixels[i + 2];
            img.pixels[i + 3] = 255;
        } else {
            img.pixels[i] = bgPixels.pixels[i];
            img.pixels[i + 1] = bgPixels.pixels[i + 1];
            img.pixels[i + 2] = bgPixels.pixels[i + 2];
            img.pixels[i + 3] = 255;
        }
    }

    img.updatePixels();
    return img;
}
