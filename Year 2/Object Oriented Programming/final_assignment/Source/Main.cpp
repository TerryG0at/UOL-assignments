#include "../JuceLibraryCode/JuceHeader.h"
#include "MainComponent.h"

class OtoDecksApplication  : public JUCEApplication
{
public:
    // Default constructor
    OtoDecksApplication() {}

    // Returns the application name
    const String getApplicationName() override { return ProjectInfo::projectName; }

    // Returns the application version
    const String getApplicationVersion() override { return ProjectInfo::versionString; }

    // Determines whether multiple instances of the app are allowed
    bool moreThanOneInstanceAllowed() override { return true; }

    // This method is called when the application starts
    void initialise (const String& commandLine) override
    {
        // Initializes the main application window
        mainWindow.reset (new MainWindow (getApplicationName()));
    }

    // This method is called when the application shuts down
    void shutdown() override
    {
        // Ensures that the main window is properly deleted
        mainWindow = nullptr;
    }

    // Called when the user requests to quit the application
    void systemRequestedQuit() override
    {
        quit();  // Closes the application.
    }

    // Called when another instance start
    void anotherInstanceStarted (const String& commandLine) override
    {
    }

    // This class represents the main application window that contains an instance of MainComponent
    class MainWindow : public DocumentWindow
    {
    public:
        MainWindow (String name)  
            : DocumentWindow (name,
                              Desktop::getInstance().getDefaultLookAndFeel()
                                .findColour (ResizableWindow::backgroundColourId),
                              DocumentWindow::allButtons)
        {
            // Uses the native OS window title bar
            setUsingNativeTitleBar (true);

            // Sets the content of the window to be an instance of MainComponent
            setContentOwned (new MainComponent(), true);

            // Handles fullscreen/resizing settings based on platform
           #if JUCE_IOS || JUCE_ANDROID
            setFullScreen (true);
           #else
            setResizable (true, true);
            centreWithSize (getWidth(), getHeight());  // Centers the window
           #endif

            setVisible (true);  // Shows the window.
        }

        // Called when the user clicks the close button on the window
        void closeButtonPressed() override
        {
            // Requests the application to quit when the window is closed
            JUCEApplication::getInstance()->systemRequestedQuit();
        }

    private:
        JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (MainWindow)  // Prevents accidental copying
    };

private:
    std::unique_ptr<MainWindow> mainWindow;  // The main application window
};

// This macro generates the main function that launches the application
START_JUCE_APPLICATION (OtoDecksApplication)