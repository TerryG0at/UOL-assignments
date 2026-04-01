#pragma once

#include <JuceHeader.h>
#include "DeckGUI.h"

// Handles playlist management, searching, sorting, and track loading
class PlaylistComponent : public juce::Component,
                          public juce::TableListBoxModel, // Provides track list table functionality
                          public juce::Button::Listener,  // Handles button interactions
                          public juce::TextEditor::Listener // Handles search box text updates
{
public:
    // Constructor: Initializes the playlist UI and connects it to two decks
    PlaylistComponent(DeckGUI* leftDeck, DeckGUI* rightDeck);
    
    ~PlaylistComponent() override;

    ////////////////////////////////////// UI FUNCTIONS //////////////////////////////////////

    // Handles component painting
    void paint(juce::Graphics&) override;

    // Handles layout resizing
    void resized() override;

    ////////////////////////////////////// TABLE LIST FUNCTIONS //////////////////////////////////////

    // Returns the number of rows in the playlist table
    int getNumRows() override;

    // Draws the background of each row
    void paintRowBackground(juce::Graphics&, int rowNumber, int width, int height, bool rowIsSelected) override;

    // Draws the content of each cell
    void paintCell(juce::Graphics&, int rowNumber, int columnId, int width, int height, bool rowIsSelected) override;

    ////////////////////////////////////// EVENT HANDLERS //////////////////////////////////////

    // Handles button clicks
    void buttonClicked(juce::Button* clickButton) override;

    // Handles text input changes in the search box
    void textEditorTextChanged(juce::TextEditor&) override;

    // Sorts playlist tracks when column headers are clicked
    void sortOrderChanged(int newSortColumnId, bool isAscends) override;

    // Removes a track from the playlist
    void removeTrack(int rowNumber);

private:
    ////////////////////////////////////// TRACK INFORMATION //////////////////////////////////////

    struct TrackInfo
    {
        juce::File jFile;
        double period;

        // Allows comparison of track info objects
        bool operator==(const TrackInfo& next) const
        {
            return jFile == next.jFile && period == next.period;
        }
    };

    std::vector<TrackInfo> trackList;
    std::vector<TrackInfo> filterTracks;

    ////////////////////////////////////// UI COMPONENTS //////////////////////////////////////

    juce::TableListBox tableContainer; // The table displaying tracks
    juce::TextButton loadLeftButton{ "Load to Left Deck" };  // Load selected track to left deck
    juce::TextButton loadRightButton{ "Load to Right Deck" }; // Load selected track to right deck
    juce::TextButton addTrackButton{ "Add Tracks" };  // Open file chooser to add new tracks
    juce::TextButton removeTrackButton{ "Remove Track" }; // Remove selected track from the list
    juce::TextEditor searchBar;  // Search bar for filtering tracks

    DeckGUI* leftDeck;  // Pointer to the left deck
    DeckGUI* rightDeck; // Pointer to the right deck

    std::unique_ptr<juce::FileChooser> fileChooser; // File chooser for adding tracks

    juce::AudioFormatManager formatManager; // Manages audio file loading

    ////////////////////////////////////// TRACK SORTING and SEARCHING //////////////////////////////////////

    int sortingColumnId = 0;   // Current column used for sorting
    bool sortInAsc = true; // Sorting direction

    // Retrieves the duration of a track
    double getTrackDuration(const juce::File& file);

    // Loads a track into a selected deck
    void loadToPlayer(DeckGUI* mainDeckGUI, int rowNumber);

    // Filters tracks based on search input
    void searchTracks(const juce::String& searchTrack);

    // Sorts the track list based on column selection
    void sortTracks();

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(PlaylistComponent)
};