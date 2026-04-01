#include "DeckGUI.h"

// Constructor: Initializes all UI components and configures them
DeckGUI::DeckGUI(DJAudioPlayer* _player,
    juce::AudioFormatManager& formatManagerToUse,
    juce::AudioThumbnailCache& cacheToUse)
    : deckPlayer(_player),
    waveformDisplay(formatManagerToUse, cacheToUse)
{
    // Add buttons, sliders, and labels to the UI.
    addAndMakeVisible(playButton);
    addAndMakeVisible(backwardButton);
    addAndMakeVisible(forwardButton);
    addAndMakeVisible(repeatButton);
    addAndMakeVisible(volumeSlider);
    addAndMakeVisible(speedSlider);
    addAndMakeVisible(timelineSlider);
    addAndMakeVisible(waveformDisplay);
    addAndMakeVisible(bassSlider);
    addAndMakeVisible(midsSlider);
    addAndMakeVisible(trebleSlider);
    addAndMakeVisible(volumeLabel);
    addAndMakeVisible(speedLabel);
    addAndMakeVisible(timelineLabel);
    addAndMakeVisible(trackLabel);

    // Add listeners to buttons and sliders
    playButton.addListener(this);
    backwardButton.addListener(this);
    forwardButton.addListener(this);
    repeatButton.addListener(this);
    volumeSlider.addListener(this);
    speedSlider.addListener(this);
    timelineSlider.addListener(this);
    bassSlider.addListener(this);
    midsSlider.addListener(this);
    trebleSlider.addListener(this);

    // Configure track name label
    trackLabel.setFont(juce::Font(16.0f, juce::Font::bold)); // Set bold text
    trackLabel.setJustificationType(juce::Justification::centred); // Center-align text
    trackLabel.setColour(juce::Label::textColourId, juce::Colours::white); // White text
    trackLabel.setText("No Track Loaded", juce::dontSendNotification); // Default text

    ////////////////////////////////////// SLIDER CONFIGURATIONS //////////////////////////////////////

    // Configure Volume Slider
    volumeSlider.setRange(0.0, 100.0); // Range from 0 to 100
    volumeSlider.setValue(50.0); // Default volume
    volumeSlider.setNumDecimalPlacesToDisplay(0); // No decimals
    volumeSlider.setDoubleClickReturnValue(true, 50.0); // Reset to 50 when double-clicked
    volumeLabel.setText("Volume", juce::dontSendNotification); // Label text

    // Configure Position Slider
    timelineSlider.setRange(0.0, 1.0); // Relative position
    timelineSlider.setSliderStyle(juce::Slider::LinearHorizontal); // Horizontal slider
    timelineSlider.setDoubleClickReturnValue(true, 0.0); // Reset to start on double-click

    // Configure EQ Sliders (Bass, Mid, Treble)
    bassSlider.setRange(-15.0, 15.0, 0.1);
    bassSlider.setTextValueSuffix(" dB"); // Display "dB" next to values
    bassSlider.setDoubleClickReturnValue(true, 0.0); // Reset to 0 dB on double-click

    midsSlider.setRange(-15.0, 15.0, 0.1);
    midsSlider.setTextValueSuffix(" dB");
    midsSlider.setDoubleClickReturnValue(true, 0.0);

    trebleSlider.setRange(-15.0, 15.0, 0.1);
    trebleSlider.setTextValueSuffix(" dB");
    trebleSlider.setDoubleClickReturnValue(true, 0.0);

    // Configure Speed Slider
    speedSlider.setRange(0.1, 3.0); // Speed range
    speedSlider.setValue(1.0); // Default speed
    speedSlider.setTextValueSuffix("x"); // Show "x" after values
    speedSlider.setTextBoxIsEditable(true); // Allow text entry
    speedSlider.setNumDecimalPlacesToDisplay(2); // Display up to 2 decimals
    speedSlider.setDoubleClickReturnValue(true, 1.0); // Reset to 1.0x on double-click
    speedLabel.setText("Speed", juce::dontSendNotification); // Label for speed

    ////////////////////////////////////// STYLE SETTINGS //////////////////////////////////////

    // Set sliders to Rotary style for volume and speed
    volumeSlider.setSliderStyle(juce::Slider::Rotary);
    speedSlider.setSliderStyle(juce::Slider::Rotary);

    // EQ Labels Configuration
    std::array<juce::Label*, 3> eqLabels = { &bassLabel, &midsLabel, &trebleLabel };
    std::array<juce::String, 3> labelTexts = { "Bass", "Mids", "Treble" };

    // Configure and add labels using a loop
    for (size_t i = 0; i < eqLabels.size(); ++i)
    {
        eqLabels[i]->setText(labelTexts[i], juce::dontSendNotification);
        eqLabels[i]->setJustificationType(juce::Justification::centred);
        addAndMakeVisible(*eqLabels[i]);
    }

    // Optional: Style for text box positions
    volumeSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 60, 25);
    speedSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 60, 25);

    timelineSlider.setTextBoxStyle(juce::Slider::TextBoxRight, false, 0, 0);

    ////////////////////////////////////// BUTTON IMAGE CONFIGURATION //////////////////////////////////////

    // Function to load and assign button images
    auto loadButtonImage = [](const void* imageData, int imageSize) -> juce::Image
    {
        juce::MemoryInputStream imageStream(imageData, static_cast<size_t>(imageSize), false);
        return juce::ImageFileFormat::loadFrom(imageStream);
    };

    // Load the button images from binary data
    playButtonImage = loadButtonImage(BinaryData::playButton_png, BinaryData::playButton_pngSize);
    stopButtonImage = loadButtonImage(BinaryData::stopButton_png, BinaryData::stopButton_pngSize);
    backwardButtonImage = loadButtonImage(BinaryData::backwardButton_png, BinaryData::backwardButton_pngSize);
    forwardButtonImage = loadButtonImage(BinaryData::forwardButton_png, BinaryData::forwardButton_pngSize);
    loopImage1 = loadButtonImage(BinaryData::loopButton1_png, BinaryData::loopButton1_pngSize);
    loopImage2 = loadButtonImage(BinaryData::loopButton2_png, BinaryData::loopButton2_pngSize);

    // Utility function to configure button images
    auto configureButtonImages = [](juce::ImageButton& button, const juce::Image& image)
    {
        button.setImages(true, true, true, image, 1.0f, {}, image, 1.0f, {}, image, 1.0f, {});
    };

    // Set the images on the ImageButtons
    configureButtonImages(playButton, playButtonImage);
    configureButtonImages(backwardButton, backwardButtonImage);
    configureButtonImages(forwardButton, forwardButtonImage);
    configureButtonImages(repeatButton, loopImage1);

    ////////////////////////////////////// COLOR CONFIGURATION //////////////////////////////////////

    // Set the colour of the sliders
    volumeSlider.setColour(juce::Slider::thumbColourId, juce::Colours::white);
    speedSlider.setColour(juce::Slider::thumbColourId, juce::Colours::white);

    bassSlider.setColour(juce::Slider::trackColourId, juce::Colours::green);
    bassSlider.setColour(juce::Slider::thumbColourId, juce::Colours::lime);

    midsSlider.setColour(juce::Slider::trackColourId, juce::Colours::blue);
    midsSlider.setColour(juce::Slider::thumbColourId, juce::Colours::skyblue);

    trebleSlider.setColour(juce::Slider::trackColourId, juce::Colours::purple);
    trebleSlider.setColour(juce::Slider::thumbColourId, juce::Colours::violet);

    // Start timer to update the UI
    startTimer(100);
}

// Stops the timer when the component is destroyed
DeckGUI::~DeckGUI()
{
    stopTimer();
}

// Fills the background color of the deck
void DeckGUI::paint(juce::Graphics& graphics)
{
    // Set the background color to the default theme color
    graphics.fillAll(getLookAndFeel().findColour(juce::ResizableWindow::backgroundColourId));
}

// Defines the positions of UI components when window size changes
void DeckGUI::resized()
{
    // Get the full area of the component
    auto area = getLocalBounds();

    // Position the track label at the top of the deck
    trackLabel.setBounds(area.removeFromTop(30));

    ////////////////////////////////////// BUTTONS //////////////////////////////////////

    int buttonSize = 55;  // Set size of the button
    int spacing = 15;      // Have spacing between each button

    // Calculate total width for all the playback buttons
    int totalButtonWidth = 4 * buttonSize + 3 * spacing;

    // Calculate starting position for centering buttons
    int totalSpacing = 3 * spacing;  // Total space occupied by gaps
    int totalButtonArea = 4 * buttonSize + totalSpacing;  // Total width needed for buttons
    int startX = (area.getWidth() - totalButtonArea) / 2;  // Center buttons horizontally
    int startY = area.removeFromTop(buttonSize).getY() + 10;

    // Utility function to set button bounds
    auto setButtonPosition = [&](juce::ImageButton& button, int index)
    {
        button.setBounds(startX + index * (buttonSize + spacing), startY, buttonSize, buttonSize);
    };

    // Position each button
    setButtonPosition(playButton, 0);
    setButtonPosition(backwardButton, 1);
    setButtonPosition(forwardButton, 2);
    setButtonPosition(repeatButton, 3);

    ////////////////////////////////////// Timeline SLIDER //////////////////////////////////////

    timelineSlider.setBounds(area.removeFromTop(60).reduced(5));

    ////////////////////////////////////// WAVEFORM DISPLAY //////////////////////////////////////

    // Allocate space for the waveform display below the timeline
    waveformDisplay.setBounds(area.removeFromTop(80).reduced(5));

    // Add extra spacing below waveform display to improve layout
    area.removeFromTop(30);

    ////////////////////////////////////// VOLUME and SPEED CONTROLS //////////////////////////////////////

    // Allocate space for volume and speed sliders
    auto controlArea = area.removeFromTop(180);
    int volumeSliderWidth = controlArea.getWidth() / 2;

    volumeSlider.setBounds(controlArea.removeFromLeft(volumeSliderWidth).reduced(5));
    speedSlider.setBounds(controlArea.reduced(5));

    ////////////////////////////////////// LABELS FOR VOLUME and SPEED //////////////////////////////////////

    int controlLabelWidth = 50;
    int controlLabelHeight = 16;
    
    // Position volume label on top of the volume slider
    volumeLabel.setBounds(
        volumeSlider.getBounds().getCentreX() - controlLabelWidth / 2,   // Center aligned horizontally
        volumeSlider.getY() - controlLabelHeight - 5,  // Positioned above with a 5px gap
        controlLabelWidth, controlLabelHeight
    );
    
    // Position speed label on top of the speed slider
    speedLabel.setBounds(
        speedSlider.getBounds().getCentreX() - controlLabelWidth / 2,   // Center aligned horizontally
        speedSlider.getY() - controlLabelHeight - 5,  // Positioned above with a 5px gap
        controlLabelWidth, controlLabelHeight
    );    

    // Add spacing between speed control and EQ section
    area.removeFromTop(20);

    ////////////////////////////////////// EQ CONTROLS (Bass, Mids, Treble) //////////////////////////////////////

    // Define fixed height and calculate width for each EQ slider
    const int EQHeight = 200;
    auto eqArea = area.removeFromTop(EQHeight);
    const std::array<juce::Slider*, 3> eqSliders = { &bassSlider, &midsSlider, &trebleSlider };

    // Calculate width for each EQ slider
    int eqWidth = eqArea.getWidth() / eqSliders.size();

    // Lambda function to set slider properties
    auto configureEQSlider = [&](juce::Slider* slider)
    {
        slider->setBounds(eqArea.removeFromLeft(eqWidth).reduced(spacing));
        slider->setSliderStyle(juce::Slider::LinearVertical);
        slider->setTextBoxStyle(juce::Slider::TextBoxBelow, false, slider->getWidth(), 20);
    };

    // Configure each EQ slider
    for (auto* slider : eqSliders)
    {
        configureEQSlider(slider);
    }

    ////////////////////////////////////// EQ LABELS //////////////////////////////////////

    // Position labels above each EQ slider
    bassLabel.setBounds(bassSlider.getX(), bassSlider.getY() - 20, bassSlider.getWidth(), 20);
    midsLabel.setBounds(midsSlider.getX(), midsSlider.getY() - 20, midsSlider.getWidth(), 20);
    trebleLabel.setBounds(trebleSlider.getX(), trebleSlider.getY() - 20, trebleSlider.getWidth(), 20);

    ////////////////////////////////////// TIME LABEL (Current Position Display) //////////////////////////////////////

    timelineLabel.setBounds(timelineSlider.getX(), timelineSlider.getBottom() - 10, timelineSlider.getWidth(), 20);
}

// Handles button clicks for play, stop, backward, forward, and loop functions
void DeckGUI::buttonClicked(juce::Button* button)
{
    ////////////////////////////////////// PLAY or STOP BUTTON //////////////////////////////////////
    if (button == &playButton)
    {
        if (!isPlaying)
        {
            deckPlayer->start();
            
            // Change button image to stop when playing
            playButton.setImages(false, true, true, stopButtonImage, 1.0f, {}, stopButtonImage, 1.0f, {}, stopButtonImage, 1.0f, {});
            
            isPlaying = true; // Update state
        }
        else
        {
            deckPlayer->stop();

            // Change button image back to play when stopped
            playButton.setImages(false, true, true, playButtonImage, 1.0f, {}, playButtonImage, 1.0f, {}, playButtonImage, 1.0f, {});

            isPlaying = false; // Update state
        }
    }
    ////////////////////////////////////// BACKWARD BUTTON //////////////////////////////////////
    else if (button == &backwardButton)
    {
        // Move playback position 5 seconds backward but ensure it does not go below 0
        double newPos = juce::jlimit(0.0, deckPlayer->getLengthInSeconds(),
                      deckPlayer->getPositionRelative() * deckPlayer->getLengthInSeconds() - 5.0);

        // Set the new playback position
        deckPlayer->setPositionRelative(newPos / deckPlayer->getLengthInSeconds());
    }
    ////////////////////////////////////// FORWARD BUTTON //////////////////////////////////////
    else if (button == &forwardButton)
    {
        // Move playback position 5 seconds forward but ensure it does not exceed track length
        double newPos = juce::jlimit(0.0, deckPlayer->getLengthInSeconds(),
        deckPlayer->getPositionRelative() * deckPlayer->getLengthInSeconds() + 5.0);

        // Set the new playback position
        deckPlayer->setPositionRelative(newPos / deckPlayer->getLengthInSeconds());
    }
    ////////////////////////////////////// REPEAT BUTTON //////////////////////////////////////
    else if (button == &repeatButton)
    {
        // Toggle loop state directly using XOR logic (clean and efficient toggle)
        isLoop ^= true;  

        // Apply the updated loop state to the player
        deckPlayer->setLooping(isLoop);

        // Set button image using a ternary operator
        repeatButton.setImages(false, true, true, 
                            isLoop ? loopImage2 : loopImage1, 
                            1.0f, {}, 
                            isLoop ? loopImage2 : loopImage1, 
                            1.0f, {}, 
                            isLoop ? loopImage2 : loopImage1, 
                            1.0f, {});
    }   
}

// Handles changes in slider values for volume, speed, position, and EQ
void DeckGUI::sliderValueChanged(juce::Slider* slider)
{
    ////////////////////////////////////// VOLUME SLIDER //////////////////////////////////////
    if (slider == &volumeSlider)
    {
        // Set the player gain based on slider value
        deckPlayer->setGain(slider->getValue() / 100.0);
    }
    ////////////////////////////////////// SPEED SLIDER //////////////////////////////////////
    else if (slider == &speedSlider)
    {
        // Round the speed value to 2 decimal places using std::round
        double speedValue = std::round(slider->getValue() * 100.0) / 100.0;
    
        if (slider->getValue() != speedValue) 
        {
            slider->setValue(speedValue, juce::dontSendNotification);
        }
        
        deckPlayer->setSpeed(speedValue);
    }    
    ////////////////////////////////////// Timeline SLIDER //////////////////////////////////////
    else if (slider == &timelineSlider)
    {
        if (dragSlider)
        {
            // Update track position relative to the song's length
            deckPlayer->setPositionRelative(slider->getValue());
            
            // Refresh the UI of position slider
            updatePositionSlider();
        }
    }
    ////////////////////////////////////// LOW EQ SLIDER (Bass) //////////////////////////////////////
    else if (slider == &bassSlider)
    {
        // Adjust bass EQ
        deckPlayer->setEQGain(0, slider->getValue());
    }
    ////////////////////////////////////// MID EQ SLIDER (Mids) //////////////////////////////////////
    else if (slider == &midsSlider)
    {
        // Adjust midrange EQ
        deckPlayer->setEQGain(1, slider->getValue());
    }
    ////////////////////////////////////// HIGH EQ SLIDER (Treble) //////////////////////////////////////
    else if (slider == &trebleSlider)
    {
        // Adjust treble EQ
        deckPlayer->setEQGain(2, slider->getValue());
    }
}

// Tracks when the position slider is actively being dragged
void DeckGUI::sliderDragStarted(juce::Slider* slider)
{
    if (slider == &timelineSlider) 
    {
        dragSlider = true; // Mark dragging state
    }
}

// Called when the user stops dragging the position slider
void DeckGUI::sliderDragEnded(juce::Slider* slider)
{
    if (slider == &timelineSlider)
    {
        dragSlider = false; // Dragging has ended
        
        // Set track position relative to total duration
        double newPosition = juce::jlimit(0.0, 1.0, slider->getValue());
        deckPlayer->setPositionRelative(newPosition);

        // Immediately update the slider to reflect the accurate position
        updatePositionSlider();
    }
}

// Updates the position slider and time display in sync with playback
void DeckGUI::updatePositionSlider()
{
    if (deckPlayer->getLengthInSeconds() > 0) // Ensure track is loaded
    {
        double pos = deckPlayer->getPositionRelative(); // Get playback position
        double posInSeconds = pos * deckPlayer->getLengthInSeconds(); // Convert to seconds

        // Update the time label display
        timelineLabel.setText(getTimeString(posInSeconds), juce::dontSendNotification);

        // Sync the position slider with the current playback position
        timelineSlider.setValue(pos, juce::dontSendNotification);
    }
    else
    {
        // If no track is loaded, reset display
        timelineLabel.setText("0:00", juce::dontSendNotification);
        timelineSlider.setValue(0.0, juce::dontSendNotification);
    }
}

////////////////////////////////////// DRAG and DROP FILE HANDLING //////////////////////////////////////

// Determines whether the component should accept dragged files
bool DeckGUI::isInterestedInFileDrag(const juce::StringArray& files)
{
    return true; // Accept all file types
}

// Handles file drop when a file is dragged into the component
void DeckGUI::filesDropped(const juce::StringArray& files, int x, int y)
{
    if (files.size() > 0) // Ensure at least one file is dropped
    {
        loadFile(juce::File{ files[0] }); // Load the first file
    }
}

////////////////////////////////////// TIMED UI UPDATES //////////////////////////////////////

// Timer function that updates the position slider in sync with playback
void DeckGUI::timerCallback()
{
    if (!dragSlider) // Prevents UI from jumping while dragging
    {
        updatePositionSlider();
    }

    // Sync waveform display position with playback progress
    waveformDisplay.setPositionRelative(deckPlayer->getPositionRelative());
}

////////////////////////////////////// TIME FORMATTING HELPER FUNCTION //////////////////////////////////////

// Converts time (seconds) into a formatted string
juce::String DeckGUI::getTimeString(double time)
{
    int totalTimeInSeconds = static_cast<int>(time);

    // Calculate specific time
    int min = totalTimeInSeconds / 60;
    int sec = totalTimeInSeconds - (min * 60);

    // Format time with conditional formatting for leading zeros
    juce::String minStr = (min < 10) ? "0" + juce::String(min) : juce::String(min);
    juce::String secStr = (sec < 10) ? "0" + juce::String(sec) : juce::String(sec);

    return minStr + ":" + secStr; // Combine minutes and seconds as a formatted string
}

////////////////////////////////////// FILE LOADING FUNCTION //////////////////////////////////////

// Loads an audio file into the player and waveform display
void DeckGUI::loadFile(const juce::File& file)
{
    deckPlayer->loadURL(juce::URL{ file }); // Load file into the player
    waveformDisplay.loadURL(juce::URL{ file }); // Display waveform

    // Extract the filename (without extension) and update the track label
    setCurrentTrack(file.getFileNameWithoutExtension());
}

////////////////////////////////////// PLAY BUTTON STATE UPDATE //////////////////////////////////////

// Updates the play button appearance based on playback state
void DeckGUI::setPlayButtonState(bool shouldPlay)
{
    // Update playback state
    isPlaying = shouldPlay;

    // Use a ternary operator to simplify the image assignment
    auto& buttonImage = shouldPlay ? stopButtonImage : playButtonImage;

    // Set the button image using a single image assignment
    playButton.setImages(false, true, true, buttonImage, 1.0f, {}, buttonImage, 1.0f, {}, buttonImage, 1.0f, {});
}

////////////////////////////////////// TRACK DISPLAY UPDATE //////////////////////////////////////

// Updates the track label with the current song name
void DeckGUI::setCurrentTrack(const juce::String& trackName)
{
    trackLabel.setText(trackName, juce::dontSendNotification); // Update track name label
}