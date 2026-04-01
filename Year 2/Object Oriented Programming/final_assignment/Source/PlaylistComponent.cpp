#include "PlaylistComponent.h"

////////////////////////////////////// CONSTRUCTOR //////////////////////////////////////

PlaylistComponent::PlaylistComponent(DeckGUI* _leftDeck, DeckGUI* _rightDeck)
    : leftDeck(_leftDeck), rightDeck(_rightDeck)
{
    // Initialization of table container
    addAndMakeVisible(tableContainer);
    tableContainer.setModel(this); // Assign this class as the data model for the table
    tableContainer.setColour(juce::ListBox::outlineColourId, juce::Colours::darkgrey); // Set table border color
    tableContainer.setOutlineThickness(2); // Define table border thickness

    // Enable columns to dynamically resize to fit the table width
    tableContainer.getHeader().setStretchToFitActive(true);
    tableContainer.getHeader().addColumn("Songs", 1, 200);  // Track name column
    tableContainer.getHeader().addColumn("Duration", 2, 100); // Track duration column

    // Set default sorting to track name
    tableContainer.getHeader().setSortColumnId(1, true);
    
    removeTrackButton.setButtonText("Remove Track");

    // Initialize and add control buttons
    addAndMakeVisible(loadLeftButton);
    addAndMakeVisible(loadRightButton);
    addAndMakeVisible(addTrackButton);
    addAndMakeVisible(removeTrackButton);
    addAndMakeVisible(searchBar);

    // Add event listeners to the buttons
    loadLeftButton.addListener(this);
    loadRightButton.addListener(this);
    addTrackButton.addListener(this);
    removeTrackButton.addListener(this);
    searchBar.addListener(this);

    searchBar.setTextToShowWhenEmpty("Find some audio ...", juce::Colours::lightsalmon); // Placeholder text

    // Register basic audio file formats
    formatManager.registerBasicFormats();
}

PlaylistComponent::~PlaylistComponent()
{
}

////////////////////////////////////// PAINT & RESIZE FUNCTIONS //////////////////////////////////////

// Sets the background color of the component
void PlaylistComponent::paint(juce::Graphics& g)
{
    juce::ColourGradient bgGradient = juce::ColourGradient::vertical(juce::Colours::skyblue, 0, juce::Colours::darkslategrey, getHeight());
    g.setGradientFill(bgGradient);
    g.fillAll();
}

// Defines the layout of search box, buttons, and table
void PlaylistComponent::resized()
{
    auto totalArea = getLocalBounds();

    // Search Bar placement
    searchBar.setBounds(totalArea.removeFromTop(40).reduced(5));

    // Button area for 4 buttons
    auto buttonArea = totalArea.removeFromBottom(40);
    int buttonWidth = buttonArea.getWidth() / 4; // Divide by 4 for 4 buttons

    loadLeftButton.setBounds(buttonArea.removeFromLeft(buttonWidth).reduced(5));
    loadRightButton.setBounds(buttonArea.removeFromLeft(buttonWidth).reduced(5));
    addTrackButton.setBounds(buttonArea.removeFromLeft(buttonWidth).reduced(5));
    removeTrackButton.setBounds(buttonArea.reduced(5));

    loadLeftButton.setColour(juce::TextButton::buttonColourId, juce::Colours::sandybrown);
    loadRightButton.setColour(juce::TextButton::buttonColourId, juce::Colours::deepskyblue);
    addTrackButton.setColour(juce::TextButton::buttonColourId, juce::Colours::green);
    removeTrackButton.setColour(juce::TextButton::buttonColourId, juce::Colours::orangered);

    // Declare table area
    int heightOfTable = totalArea.getHeight();
    tableContainer.setBounds(totalArea.removeFromTop(heightOfTable).reduced(5));

    // Dynamically adjust column widths based on available space
    auto totalWidth = tableContainer.getWidth();
    tableContainer.getHeader().setColumnWidth(1, totalWidth * 0.8);
    tableContainer.getHeader().setColumnWidth(2, totalWidth * 0.2);

}

////////////////////////////////////// TABLE CONTAINER FUNCTIONS //////////////////////////////////////

// Returns the number of rows in the table
int PlaylistComponent::getNumRows()
{
    return filterTracks.size() > 0 ? filterTracks.size() : trackList.size();
}

// Paints the background of each row in the table
void PlaylistComponent::paintRowBackground(juce::Graphics& g, int rowNumber, int width, int height, bool rowIsSelected)
{
    g.fillAll(rowIsSelected ? juce::Colours::lightskyblue : (rowNumber % 2 == 0 ? juce::Colours::midnightblue : juce::Colours::navy));
}

// Paints the individual cells in the table
void PlaylistComponent::paintCell(juce::Graphics& g, int rowNum, int columnId, int width, int height, bool rowIsSelected)
{
    // Set background color for selected and non-selected rows
    g.fillAll(rowIsSelected ? juce::Colours::turquoise : juce::Colours::silver);

    // Select appropriate track list (filtered or full)
    const auto& tracks = !filterTracks.empty() ? filterTracks : trackList;

    // Choose appropriate text based on column ID
    juce::String cellText;
    if (columnId == 1) cellText = tracks[rowNum].jFile.getFileName();
    else if (columnId == 2) cellText = juce::String::formatted("%d:%02d", int(tracks[rowNum].period) / 60, int(tracks[rowNum].period) % 60);

    // Draw text in the cell
    g.setColour(juce::Colours::black);
    g.drawText(cellText, 2, 0, width - 4, height, juce::Justification::centredLeft, true);
}

////////////////////////////////////// TRACK REMOVAL FUNCTION //////////////////////////////////////

// Removes a track from the playlist
void PlaylistComponent::removeTrack(int rowNum)
{
    if (rowNum < 0) return;

    if (filterTracks.size() > 0) // If filtered search is active
    {
        if (rowNum < filterTracks.size())
        {
            // search and remove the track
            auto searchTrack = std::find(trackList.begin(), trackList.end(), filterTracks[rowNum]);
            if (searchTrack != trackList.end())
            {
                trackList.erase(searchTrack);
            }
            filterTracks.erase(filterTracks.begin() + rowNum);
        }
    }
    else
    {
        if (rowNum < trackList.size())
        {
            trackList.erase(trackList.begin() + rowNum);
        }
    }

    tableContainer.updateContent(); // Refresh table UI
    searchTracks(searchBar.getText()); // Update search results if applicable
}

////////////////////////////////////// BUTTON CLICK HANDLING //////////////////////////////////////

// Handles button clicks for track loading and file selection
void PlaylistComponent::buttonClicked(juce::Button* clickButton)
{
    // Map buttons to corresponding actions
    enum ButtonAction { LOAD_LEFT, LOAD_RIGHT, ADD_TRACK, REMOVE_TRACK, UNKNOWN };

    ButtonAction action = 
        (clickButton == &loadLeftButton)  ? LOAD_LEFT :
        (clickButton == &loadRightButton) ? LOAD_RIGHT :
        (clickButton == &addTrackButton)  ? ADD_TRACK :
        (clickButton == &removeTrackButton) ? REMOVE_TRACK :
                                             UNKNOWN;

    switch (action)
    {
        case LOAD_LEFT:
            loadToPlayer(leftDeck, tableContainer.getSelectedRow());
            break;

        case LOAD_RIGHT:
            loadToPlayer(rightDeck, tableContainer.getSelectedRow());
            break;

        case ADD_TRACK:
        {
            auto fileOptions = juce::FileBrowserComponent::openMode | 
                               juce::FileBrowserComponent::canSelectMultipleItems;

            fileChooser = std::make_unique<juce::FileChooser>(
                "Select audio files", juce::File(), "*.mp3;*.wav");

            fileChooser->launchAsync(fileOptions, [this](const juce::FileChooser& fChoose)
            {
                for (const auto& selectedFile : fChoose.getResults())
                {
                    if (selectedFile.existsAsFile())
                    {
                        trackList.push_back({ selectedFile, getTrackDuration(selectedFile) });
                    }
                }
                sortTracks();
                tableContainer.updateContent();
            });
        }
        break;

        case REMOVE_TRACK:
        {
            int selectedRow = tableContainer.getSelectedRow();
            if (selectedRow >= 0)
            {
                removeTrack(selectedRow);
            }
            else
            {
            }
        }
        break;

        default:
            break;
    }
}

////////////////////////////////////// SEARCH HANDLING //////////////////////////////////////

// Handles changes in the search box input
void PlaylistComponent::textEditorTextChanged(juce::TextEditor& editor)
{
    if (&editor == &searchBar)  // Ensure the change is from the search box
    {
        searchTracks(editor.getText());  // Filter tracks based on search input
    }
}

////////////////////////////////////// SORTING FUNCTIONALITY //////////////////////////////////////

// Handles sorting changes when a column header is clicked
void PlaylistComponent::sortOrderChanged(int newSortedColumnId, bool isAscends)
{
    if (newSortedColumnId != sortingColumnId) // If a new column is selected for sorting
    {
        sortingColumnId = newSortedColumnId;
        sortInAsc = isAscends;  // Set sort direction
    }
    else
    {
        sortInAsc = isAscends;  // Toggle sort direction if the same column is clicked again
    }

    sortTracks();  // Apply the new sorting order
}

////////////////////////////////////// TRACK MANAGEMENT FUNCTIONS //////////////////////////////////////

// Retrieves the duration of a track in seconds
double PlaylistComponent::getTrackDuration(const juce::File& audioFile)
{
    if (auto* audioFileReader = formatManager.createReaderFor(audioFile))
    {
        // Calculate duration using total samples and sample frequency
        double totalDuration = audioFileReader->lengthInSamples / audioFileReader->sampleRate;

        delete audioFileReader;
        return totalDuration;
    }

    return 0.0; // Return 0 if the duration couldn't be determined
}

// Loads a track into a selected deck
void PlaylistComponent::loadToPlayer(DeckGUI* mainDeckGUI, int rowNum)
{
    const auto& displayTracks = filterTracks.size() > 0 ? filterTracks : trackList; // Determine which track list to use

    if (rowNum >= 0 && rowNum < displayTracks.size()) // Ensure the selected row is valid
    {
        mainDeckGUI->loadFile(displayTracks[rowNum].jFile); // Load the selected track into the deck
    }
}

////////////////////////////////////// SEARCH FUNCTIONALITY //////////////////////////////////////

// Filters tracks based on the user's search input
void PlaylistComponent::searchTracks(const juce::String& searchTrack)
{
    filterTracks.clear();  // Clear any previous search results

    for (const auto& track : trackList)  // Iterate through all tracks
    {
        if (track.jFile.getFileNameWithoutExtension().containsIgnoreCase(searchTrack)) // Check if track matches search query
        {
            filterTracks.push_back(track); // Add matching track to filtered list
        }
    }

    tableContainer.updateContent();  // Refresh the table to display search results
}

////////////////////////////////////// SORT FUNCTIONALITY //////////////////////////////////////

// Sorts tracks based on the selected column
void PlaylistComponent::sortTracks()
{
    auto sortByName = [](const TrackInfo& track1, const TrackInfo& track2, bool ascending)
    {
        return ascending 
            ? track1.jFile.getFileNameWithoutExtension() < track2.jFile.getFileNameWithoutExtension()
            : track1.jFile.getFileNameWithoutExtension() > track2.jFile.getFileNameWithoutExtension();
    };

    auto sortByDuration = [](const TrackInfo& a, const TrackInfo& b, bool ascending)
    {
        return ascending ? a.period < b.period : a.period > b.period;
    };

    auto& targetList = !filterTracks.empty() ? filterTracks : trackList;

    if (sortingColumnId == 1)
        std::sort(targetList.begin(), targetList.end(), 
            [this, sortByName](const TrackInfo& a, const TrackInfo& b) { return sortByName(a, b, sortInAsc); });

    else if (sortingColumnId == 2)
        std::sort(targetList.begin(), targetList.end(), 
            [this, sortByDuration](const TrackInfo& a, const TrackInfo& b) { return sortByDuration(a, b, sortInAsc); });

    tableContainer.updateContent(); // Refresh table after sorting
}