#include "MainComponent.h"

////////////////////////////////////// CONSTRUCTOR and DESTRUCTOR //////////////////////////////////////
// Constructor: Initializes UI elements and audio settings
MainComponent::MainComponent()
{
    // Add UI elements to the main window
    addAndMakeVisible(leftDeckGUI);
    addAndMakeVisible(rightDeckGUI);
    addAndMakeVisible(playlistComponent);
    addAndMakeVisible(globalPlayPauseButton); // Global play/pause button for both decks
    addAndMakeVisible(crossfadeSlider);
    addAndMakeVisible(crossfadeLabel);

    // Initialize crossfade slider
    crossfadeSlider.setRange(-1.0, 1.0, 0.01); 
    crossfadeSlider.setValue(0.0); // Default position at center
    crossfadeSlider.setDoubleClickReturnValue(true, 0.0);
    crossfadeSlider.onValueChange = [this] { updateCrossfade(); };
    crossfadeSlider.setColour(juce::Slider::thumbColourId, juce::Colours::white);

    crossfadeLabel.setText("Crossfade", juce::dontSendNotification);
    crossfadeLabel.setJustificationType(juce::Justification::centred);

    setSize(800, 600); // Set the default window size

    // Register basic audio formats
    formatManager.registerBasicFormats();

    // Add both audio players to the mixer source
    mixerSource.addInputSource(&player1, false);
    mixerSource.addInputSource(&player2, false);

    // Initialize audio with 2 output channels
    setAudioChannels(0, 2);

    // Allow MainComponent to respond to global button clicks
    globalPlayPauseButton.addListener(this);
}

MainComponent::~MainComponent()
{
    shutdownAudio(); // Releases audio resources
}

////////////////////////////////////// AUDIO PROCESSING //////////////////////////////////////

// Prepares the audio system before playback starts
void MainComponent::prepareToPlay(int samplesPerBlockExpected, double sampleRate)
{
    mixerSource.prepareToPlay(samplesPerBlockExpected, sampleRate);
}

// Processes audio data in real-time
void MainComponent::getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill)
{
    mixerSource.getNextAudioBlock(bufferToFill);
}

// Releases audio resources when playback stops
void MainComponent::releaseResources()
{
    mixerSource.releaseResources();
}

////////////////////////////////////// UI DRAWING & LAYOUT //////////////////////////////////////

// Sets the background color of the window
void MainComponent::paint(juce::Graphics& g)
{
    g.fillAll(getLookAndFeel().findColour(juce::ResizableWindow::backgroundColourId));
}

// Defines the positions of all UI components
void MainComponent::resized()
{
    auto area = getLocalBounds(); // Get the full window area

    // Split the top two third of the screen for the decks
    auto deckComponentsArea = area.removeFromTop(area.getHeight() * 2 / 3);

    // Split the deck area into left and right decks
    leftDeckGUI.setBounds(deckComponentsArea.removeFromLeft(deckComponentsArea.getWidth() / 2)); // Left deck
    rightDeckGUI.setBounds(deckComponentsArea); // Right deck

    // Assign remaining area to the playlist component
    playlistComponent.setBounds(area);

    // Center the global play/stop button near the top
    globalPlayPauseButton.setBounds((getWidth() / 2) - 50, 40, 100, 40);

    // Position the crossfade slider centrally with better spacing
    crossfadeSlider.setBounds((getWidth() / 2) - 150, 220, 300, 30); 
    crossfadeSlider.setTextBoxStyle(juce::Slider::NoTextBox, false, 0, 0);
    crossfadeLabel.setBounds(crossfadeSlider.getX(), crossfadeSlider.getBottom() + 5, crossfadeSlider.getWidth(), 20);
}

////////////////////////////////////// GLOBAL PLAY/STOP FUNCTIONALITY //////////////////////////////////////

// Handles button clicks including global play/stop control
void MainComponent::buttonClicked(juce::Button* button)
{
    if (button == &globalPlayPauseButton) // If the global play/stop button is clicked
    {
        if (!isGlobalPlaying) // If no music is playing
        {
            // Start both decks
            player1.start();
            player2.start();

            // Update individual deck buttons to "Stop"
            leftDeckGUI.setPlayButtonState(true);
            rightDeckGUI.setPlayButtonState(true);

            globalPlayPauseButton.setButtonText("Stop Both"); // Change button text
        }
        else // If music is currently playing
        {
            // Stop both decks
            player1.stop();
            player2.stop();

            // Update individual deck buttons to "Play"
            leftDeckGUI.setPlayButtonState(false);
            rightDeckGUI.setPlayButtonState(false);

            globalPlayPauseButton.setButtonText("Play Both"); // Change button text
        }

        isGlobalPlaying = !isGlobalPlaying; // Toggle play state
    }
}

void MainComponent::updateCrossfade()
{
    double sliderValue = crossfadeSlider.getValue();

    // Calculate deck volumes
    double volumeLeft = juce::jmap(sliderValue, -1.0, 1.0, 1.0, 0.0); // Left side fades out
    double volumeRight = juce::jmap(sliderValue, -1.0, 1.0, 0.0, 1.0); // Right side fades in

    // Ensure volumes stay in the correct range
    volumeLeft = juce::jlimit(0.0, 1.0, volumeLeft);
    volumeRight = juce::jlimit(0.0, 1.0, volumeRight);

    player1.setGain(volumeLeft);  // Adjust left deck volume
    player2.setGain(volumeRight); // Adjust right deck volume
}