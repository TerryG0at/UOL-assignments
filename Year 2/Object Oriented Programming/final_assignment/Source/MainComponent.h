#pragma once

#include <JuceHeader.h>
#include "DJAudioPlayer.h"
#include "DeckGUI.h"
#include "PlaylistComponent.h"

////////////////////////////////////// MAIN COMPONENT CLASS //////////////////////////////////////

// The `MainComponent` class serves as the central controller for the application
class MainComponent : public juce::AudioAppComponent,  // Handles audio processing
                      public juce::Button::Listener  // Allows listening to button click events
{
public:
    ////////////////////////////////////// CONSTRUCTOR and DESTRUCTOR //////////////////////////////////////
    MainComponent();  // Constructor: Initializes the UI and audio components
    ~MainComponent() override;

    ////////////////////////////////////// AUDIO HANDLING //////////////////////////////////////

    // Prepares audio playback by setting up buffers
    void prepareToPlay(int samplesPerBlockExpected, double sampleRate) override;

    // Processes audio and sends data to the speakers
    void getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill) override;

    // Releases audio resources when the component is no longer needed
    void releaseResources() override;

    ////////////////////////////////////// UI HANDLING //////////////////////////////////////

    // Handles custom drawing for the component
    void paint(juce::Graphics& g) override;

    // Resizes and positions all UI components
    void resized() override;

    // Handles button click events
    void buttonClicked(juce::Button* button) override;

    void updateCrossfade();

private:
    ////////////////////////////////////// AUDIO COMPONENTS //////////////////////////////////////

    juce::AudioFormatManager formatManager;  // Manages different audio file formats
    juce::AudioThumbnailCache thumbCache{ 100 };  // Caches waveforms for efficient display

    DJAudioPlayer player1{ formatManager };  // Left deck audio player
    DJAudioPlayer player2{ formatManager };  // Right deck audio player

    DeckGUI leftDeckGUI{ &player1, formatManager, thumbCache };  // Left deck UI
    DeckGUI rightDeckGUI{ &player2, formatManager, thumbCache };  // Right deck UI

    PlaylistComponent playlistComponent{ &leftDeckGUI, &rightDeckGUI };  // Playlist manager

    juce::MixerAudioSource mixerSource;  // Mixes audio from both decks for output

    juce::Slider crossfadeSlider;
    juce::Label crossfadeLabel; 

    ////////////////////////////////////// GLOBAL PLAY or STOP BUTTON //////////////////////////////////////

    juce::TextButton globalPlayPauseButton { "Play Both" };  // Controls both decks
    bool isGlobalPlaying = false;  // Tracks whether both decks are playing

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(MainComponent)  // Prevents accidental copying
};