#pragma once

#include <JuceHeader.h>

// WaveformDisplay class visualizes the waveform of an audio track and updates its playhead position
class WaveformDisplay : public juce::Component, public juce::ChangeListener
{
public:
    // Constructor: Initializes the waveform display with a format manager and thumbnail cache
    WaveformDisplay(juce::AudioFormatManager& formatManagerToUse,
                    juce::AudioThumbnailCache& cacheToUse);

    ~WaveformDisplay() override;

    // Repaints the waveform display when needed
    void paint(juce::Graphics&) override;

    // Updates the component's layout when resized
    void resized() override;

    // Loads an audio file into the waveform display
    void loadURL(juce::URL audioURL);

    // Updates the waveform position relative to the track length
    void setPositionRelative(double pos);

    // Responds to changes in the waveform thumbnail
    void changeListenerCallback(juce::ChangeBroadcaster* source) override;

private:
    juce::AudioThumbnail audioThumb;
    bool fileLoaded;
    double position;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(WaveformDisplay)
};