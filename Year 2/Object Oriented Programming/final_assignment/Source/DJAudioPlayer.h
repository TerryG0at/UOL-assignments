#pragma once

#include <JuceHeader.h>

// DJAudioPlayer class manages audio playback, looping, and audio processing
class DJAudioPlayer : public juce::AudioSource
{
public:
    // Constructor: Takes an AudioFormatManager to handle file loading
    DJAudioPlayer(juce::AudioFormatManager& formatManager);
    
    ~DJAudioPlayer() override;

    // Loads an audio file from a given URL and prepares it for playback
    void loadURL(juce::URL audioURL);

    // Prepares the audio player to play a specific number of samples at a given sample rate
    void prepareToPlay(int samplesPerBlockExpected, double sampleRate) override;
    
    // Processes the next block of audio data and applies EQ filters
    void getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill) override;

    // Releases resources used by the audio player
    void releaseResources() override;

    // Sets the volume
    void setGain(double gain);

    // Sets the playback speed
    void setSpeed(double ratio);

    // Sets the playback position in seconds.
    void setPosition(double posInSecs);

    // Sets the playback position relative to the track length (0.0 = start of song timeline, 1.0 = end of song timeline)
    void setPositionRelative(double pos);

    // Starts audio playback from the current position
    void start();

    // Stops audio playback immediately
    void stop();

    // Enables or disables looping. When enabled, the track will restart when it reach to the end
    void setLooping(bool loop);

    // Returns the current playback position as a relative value
    double getPositionRelative();

    // Returns the total length of the loaded track in seconds
    double getLengthInSeconds();

    // Sets the gain for each EQ band (low, mid, high frequencies)
    void setEQGain(int band, float gainDB);

private:
    juce::AudioFormatManager& formatManager; // Handles loading audio file formats
    
    juce::AudioTransportSource audioTransportSource; // Manages audio playback state
    std::unique_ptr<juce::AudioFormatReaderSource> audioReaderSource; // Reads audio file data
    std::unique_ptr<juce::AudioFormatReaderSource> activeReaderSource;
    juce::ResamplingAudioSource resampleSource{ &audioTransportSource, false, 2 }; // Handles speed adjustments

    // Update the EQ filter settings
    void updateEQFilters();

    // EQ filters for bass, mid, and treble adjustments
    juce::IIRFilter lowEQ, midEQ, highEQ;

    // Gain values for the EQ bands
    float bassGain = 0.00f;
    float midsGain = 0.00f;
    float trebleGain = 0.00f;

    bool isLoop = false; // Toggling looping for playback

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(DJAudioPlayer)
};