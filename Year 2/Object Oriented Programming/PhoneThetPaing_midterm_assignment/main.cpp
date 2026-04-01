#include "WeatherApp.h"

int main() {
    WeatherApp app;
    app.run();
    return 0;
}

// g++ -std=c++17 main.cpp WeatherApp.cpp WeatherAnalyzer.cpp Candlestick.cpp CSVReader.cpp