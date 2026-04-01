#include "WaveformDisplay.h"

// Constructor: Initializes the waveform display and sets up the audio thumbnail
WaveformDisplay::WaveformDisplay(juce::AudioFormatManager& formatManagerToUse,
                                 juce::AudioThumbnailCache& cacheToUse)
    : audioThumb(1000, formatManagerToUse, cacheToUse),
      fileLoaded(false), position(0)
{
    audioThumb.addChangeListener(this); // Updates the display when the waveform changes
}

WaveformDisplay::~WaveformDisplay()
{
}

// Draws the waveform and playhead position
void WaveformDisplay::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colours::black); // Background color

    if (fileLoaded)
    {
        g.setColour(juce::Colours::yellow); // Waveform color

        // Draws the waveform across the full component area
        audioThumb.drawChannel(g, getLocalBounds(), 0.0, audioThumb.getTotalLength(), 0, 1.0f);

        // Draws a vertical playhead indicator
        g.setColour(juce::Colours::red);
        int playheadX = position * getWidth(); // Convert relative position to pixels
        g.drawLine(playheadX, 0, playheadX, getHeight(), 2.0f);
    }
    else
    {
        g.setColour(juce::Colours::white);
        g.setFont(20.0f);
        g.drawText("No File Loaded", getLocalBounds(), juce::Justification::centred);
    }
}

// Called when the component is resized
void WaveformDisplay::resized()
{
}

// Loads an audio file into the waveform display
void WaveformDisplay::loadURL(juce::URL audioURL)
{
    audioThumb.clear(); // Clear any previous waveform
    fileLoaded = audioThumb.setSource(new juce::URLInputSource(audioURL)); // Load the new file

    if (fileLoaded)
    {
        repaint(); // Refresh the display
    }
}

// Updates the waveform position relative to the track length
void WaveformDisplay::setPositionRelative(double pos)
{
    if (pos >= 0 && pos <= 1.0)
    {
        position = pos; // Store the new position
        repaint(); // Redraw the playhead
    }
}

// Callback function triggered when the waveform changes
void WaveformDisplay::changeListenerCallback(juce::ChangeBroadcaster* source)
{
    if (source == &audioThumb)
    {
        repaint(); // Redraw the waveform
    }
}