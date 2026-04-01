/* =========================================================================================

   This is an auto-generated file: Any edits you make may be overwritten!

*/

#pragma once

namespace BinaryData
{
    extern const char*   backwardButton_png;
    const int            backwardButton_pngSize = 20991;

    extern const char*   forwardButton_png;
    const int            forwardButton_pngSize = 20837;

    extern const char*   loopButton1_png;
    const int            loopButton1_pngSize = 14769;

    extern const char*   loopButton2_png;
    const int            loopButton2_pngSize = 17717;

    extern const char*   playButton_png;
    const int            playButton_pngSize = 31149;

    extern const char*   stopButton_png;
    const int            stopButton_pngSize = 28318;

    // Number of elements in the namedResourceList and originalFileNames arrays.
    const int namedResourceListSize = 6;

    // Points to the start of a list of resource names.
    extern const char* namedResourceList[];

    // Points to the start of a list of resource filenames.
    extern const char* originalFilenames[];

    // If you provide the name of one of the binary resource variables above, this function will
    // return the corresponding data and its size (or a null pointer if the name isn't found).
    const char* getNamedResource (const char* resourceNameUTF8, int& dataSizeInBytes);

    // If you provide the name of one of the binary resource variables above, this function will
    // return the corresponding original, non-mangled filename (or a null pointer if the name isn't found).
    const char* getNamedResourceOriginalFilename (const char* resourceNameUTF8);
}
