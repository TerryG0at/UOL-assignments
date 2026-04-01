#include "DJAudioPlayer.h"

// Constructor: Initializes the audio player and references the format manager for file loading
DJAudioPlayer::DJAudioPlayer(juce::AudioFormatManager& _formatManager) 
: formatManager(_formatManager)
{
}

// Cleans up resources
DJAudioPlayer::~DJAudioPlayer()
{
}

// Prepares the audio player for playback by setting the expected buffer size and sample rate
void DJAudioPlayer::prepareToPlay(int samplesPerBlockExpected, double sampleRate)
{
    audioTransportSource.prepareToPlay(samplesPerBlockExpected, sampleRate);
    resampleSource.prepareToPlay(samplesPerBlockExpected, sampleRate);
    updateEQFilters();
}

// Loads an audio file from a given URL
void DJAudioPlayer::loadURL(juce::URL audioURL)
{
    // Create an audio file reader
    auto* audioReader = formatManager.createReaderFor(audioURL.createInputStream(false));

    // Ensure the file is valid
    if (audioReader != nullptr)
    {       
    // Create a reader source to provide audio data for the transport source
    std::unique_ptr<juce::AudioFormatReaderSource> audioReaderSource (new juce::AudioFormatReaderSource(audioReader, true));

    // Assign the new audio source and update the sample rate
    audioTransportSource.setSource(audioReaderSource.get(), 0, nullptr, audioReader->sampleRate);

    // Transfer ownership to manage the lifecycle of the reader source
    activeReaderSource.reset(audioReaderSource.release());
    }
}

// Retrieves and processes the next block of audio data
void DJAudioPlayer::getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill)
{
    // Process the next block of audio data through the resample source
    resampleSource.getNextAudioBlock(bufferToFill);

    // Combine EQ adjustments using pointer arithmetic for improved efficiency
    for (int channel = 0; channel < bufferToFill.buffer->getNumChannels(); ++channel)
    {
        float* channelData = bufferToFill.buffer->getWritePointer(channel, bufferToFill.startSample);
        float gainFactor = juce::Decibels::decibelsToGain(bassGain) *
                           juce::Decibels::decibelsToGain(midsGain) *
                           juce::Decibels::decibelsToGain(trebleGain);

        // Apply EQ gain in one loop for performance improvement
        std::transform(channelData, channelData + bufferToFill.numSamples,
                       channelData, [gainFactor](float audioSample)
                       {
                           return juce::jlimit(-1.0f, 1.0f, audioSample * gainFactor);
                       });
    }

    // Looping logic for continuous playback
    if (isLoop && audioTransportSource.getCurrentPosition() >= audioTransportSource.getLengthInSeconds())
    {
        audioTransportSource.setPosition(0.0);
        audioTransportSource.start();
    }
}

// Releases resources when playback is stopped or the player is destroyed
void DJAudioPlayer::releaseResources()
{
    audioTransportSource.releaseResources();
    resampleSource.releaseResources();
}

// Sets the playback volume from 0 till 1
void DJAudioPlayer::setGain(double gain)
{
    if (gain < 0 || gain > 1.0)
    {
        std::cout << "DJAudioPlayer::setGain gain should be between 0 and 1" << std::endl;
    }
    else 
    {
        audioTransportSource.setGain(gain);
    }
}

// Sets the playback speed from 0.1 till 3
void DJAudioPlayer::setSpeed(double ratio)
{
    if (ratio >= 0.1 && ratio <= 3.0)
    {
        resampleSource.setResamplingRatio(ratio);
    }
}

// Moves the playback position to a specific time
void DJAudioPlayer::setPosition(double posInSecs)
{
    audioTransportSource.setPosition(posInSecs);
}

// Moves the playback position relative to the track length
void DJAudioPlayer::setPositionRelative(double pos)
{
    if (pos < 0 || pos > 1.0)
    {
        std::cout << "DJAudioPlayer::setPositionRelative pos should be between 0 and 1" << std::endl;
    }
    else 
    {
        double posInSecs = audioTransportSource.getLengthInSeconds() * pos;
        setPosition(posInSecs);
    }
}

// Starts playback from the current position
void DJAudioPlayer::start()
{
    audioTransportSource.start();
}

// Stops playback
void DJAudioPlayer::stop()
{
    audioTransportSource.stop();
}

// Returns the current playback position relative to the track length
double DJAudioPlayer::getPositionRelative()
{
    return audioTransportSource.getCurrentPosition() / audioTransportSource.getLengthInSeconds();
}

// Returns the total length of the loaded track in seconds
double DJAudioPlayer::getLengthInSeconds()
{
    // Use conditional (ternary) operator for concise logic
    return (audioTransportSource.hasStreamFinished() || audioTransportSource.getLengthInSeconds() <= 0) ? 0.0 : audioTransportSource.getLengthInSeconds();
}

// Enables or disables looping
void DJAudioPlayer::setLooping(bool loop)
{
    isLoop = loop;
}

// Sets the gain for a specific EQ band
void DJAudioPlayer::setEQGain(int band, float gainDB)
{
    float* eqBands[] = { &bassGain, &midsGain, &trebleGain };

    if (band >= 0 && band < 3)
    {
        *eqBands[band] = gainDB;
        updateEQFilters();
    }
}

// Updates the EQ filters based on the current gain settings
void DJAudioPlayer::updateEQFilters()
{
    // Define frequency ranges for EQ bands
    double bassFreq = 50.0;
    double midsFreq = 1000.0;
    double trebleFreq = 8000.0;

    // Apply the EQ filter settings
    lowEQ.setCoefficients(juce::IIRCoefficients::makeLowShelf(44100.0f, static_cast<float>(bassFreq), 0.7f, juce::Decibels::decibelsToGain(static_cast<float>(bassGain))));
    midEQ.setCoefficients(juce::IIRCoefficients::makePeakFilter(44100.0f, static_cast<float>(midsFreq), 0.7f, juce::Decibels::decibelsToGain(static_cast<float>(midsGain))));
    highEQ.setCoefficients(juce::IIRCoefficients::makeHighShelf(44100.0f, static_cast<float>(trebleFreq), 0.7f, juce::Decibels::decibelsToGain(static_cast<float>(trebleGain))));
}