#pragma once
#include <vector>
#include <string>
#include <map>
#include "Candlestick.h"

// Define the WeatherRow structure
struct WeatherRow {
    std::string timestamp;
    std::map<std::string, double> values;
};

class CSVReader {
public:
    CSVReader();
    static std::vector<WeatherRow> readWeatherCSV(const std::string& csvFilename);
    static std::vector<std::string> tokenise(const std::string& csvLine, char separator);
    static void adjustFirstOpenValue(std::vector<Candlestick>& candlesticks, int rangeType);
};