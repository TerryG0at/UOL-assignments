#pragma once

#include <JuceHeader.h>
#include "DJAudioPlayer.h"
#include "WaveformDisplay.h"

// DeckGUI class manages UI components for controlling audio playback and effects
class DeckGUI : public juce::Component,
                public juce::Button::Listener,
                public juce::Slider::Listener,
                public juce::FileDragAndDropTarget,
                public juce::Timer
{
public:
    // Constructor: Initializes the deck with an audio player, format manager, and waveform display
    DeckGUI(DJAudioPlayer* deckPlayer,
            juce::AudioFormatManager& formatManagerToUse,
            juce::AudioThumbnailCache& cacheToUse);
    
    // Cleans up resources
    ~DeckGUI() override;

    // Paint function: Draws the background
    void paint(juce::Graphics&) override;

    // Resized function: Arranges components when window size changes
    void resized() override;

    // Handles button clicks
    void buttonClicked(juce::Button* button) override;

    // Handles slider movements
    void sliderValueChanged(juce::Slider* slider) override;
    void sliderDragStarted(juce::Slider* slider) override;
    void sliderDragEnded(juce::Slider* slider) override;

    // Allows drag-and-drop file loading
    bool isInterestedInFileDrag(const juce::StringArray& files) override;
    void filesDropped(const juce::StringArray& files, int x, int y) override;

    // Updates the position slider and waveform in sync with playback
    void timerCallback() override;

    // Converts time in seconds to a string
    juce::String getTimeString(double time);

    // Updates the position slider based on playback progress
    void updatePositionSlider();

    // Loads an audio file into the player and waveform display
    void loadFile(const juce::File& file);

    // Updates the play button appearance based on playback state
    void setPlayButtonState(bool isPlaying);

    // Updates the displayed track name when a new file is loaded
    void setCurrentTrack(const juce::String& trackName);

    void updateCrossfade();
private:
    DJAudioPlayer* deckPlayer; // Pointer to the audio player handling playback

    WaveformDisplay waveformDisplay; // Displays the track waveform
    
    bool isLoop = false;
    bool dragSlider = false;
    bool isPlaying = false;

    // Playback and navigation buttons
    juce::ImageButton playButton;
    juce::ImageButton stopButton;
    juce::ImageButton backwardButton;
    juce::ImageButton forwardButton;
    juce::ImageButton repeatButton;

    // Sliders for volume, speed, and position control
    juce::Slider volumeSlider;
    juce::Slider speedSlider;
    juce::Slider timelineSlider;
    juce::Slider crossfadeSlider;

    // Eq sliders for low, mid, and high frequencies
    juce::Slider bassSlider;
    juce::Slider midsSlider;
    juce::Slider trebleSlider;

    // Labels for volume, speed, EQ, and track time
    juce::Label volumeLabel;
    juce::Label speedLabel;
    juce::Label bassLabel;
    juce::Label midsLabel;
    juce::Label trebleLabel;
    juce::Label timelineLabel;
    juce::Label trackLabel;

    // Image assets for the buttons
    juce::Image playButtonImage;
    juce::Image stopButtonImage;
    juce::Image backwardButtonImage;
    juce::Image forwardButtonImage;
    juce::Image loopImage1;
    juce::Image loopImage2;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(DeckGUI)
};