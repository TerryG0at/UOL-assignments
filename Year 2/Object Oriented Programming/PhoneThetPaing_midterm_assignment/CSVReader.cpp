#include "CSVReader.h"
#include <iostream>
#include <fstream>
#include <stdexcept>


/////////////////////////////////////////////////////////////////////////////////////////////       Start       /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


CSVReader::CSVReader() {}

std::vector<WeatherRow> CSVReader::readWeatherCSV(const std::string& csvFilename) {
    std::vector<WeatherRow> data;
    std::ifstream csvFile(csvFilename);
    std::string line;

    if (!csvFile.is_open()) {
        throw std::runtime_error("Could not open file: " + csvFilename);
    }

    // Get Country Code
    std::vector<std::string> headers;
    if (std::getline(csvFile, line)) {
        headers = tokenise(line, ',');
        for (auto& header : headers) {
            if (header.size() > 12 && header.substr(header.size() - 12) == "_temperature") {
                header = header.substr(0, header.size() - 12);
            }
        }
    }

    while (std::getline(csvFile, line)) {
        auto tokens = tokenise(line, ',');
        if (tokens.size() != headers.size()) {
            std::cerr << "CSVReader::readWeatherCSV - Missing columns in line: " << line << std::endl;
            continue;
        }

        WeatherRow row;
        row.timestamp = tokens[0];
        try {
            for (size_t i = 1; i < tokens.size(); ++i) {
                row.values[headers[i]] = std::stod(tokens[i]);
            }
            data.push_back(row);
        } catch (const std::exception& e) {
            std::cerr << "CSVReader::readWeatherCSV - Failed to convert in line: " << line << std::endl;
        }
    }

    return data;
}

void CSVReader::adjustFirstOpenValue(std::vector<Candlestick>& candlesticks, int rangeType) {
    const std::string& firstDate = candlesticks[0].date; // Extract once for reuse

    switch (rangeType) {
        case 1: // Yearly
            if (firstDate.substr(0, 4) == "1980") {
                candlesticks[0].open = candlesticks[0].close + 0.4;
            }
            break;

        case 2: // Monthly
            if (firstDate.substr(0, 7) == "1980-01") {
                candlesticks[0].open = candlesticks[0].close + 0.4;
            }
            break;

        case 3: // Daily
            // Every first day
            if (firstDate.size() >= 10 && firstDate.substr(8, 2) == "01") {
                candlesticks[0].open = candlesticks[0].close + 0.4;
            } 
            break;
    }
}

std::vector<std::string> CSVReader::tokenise(const std::string& csvLine, char separator) {
    std::vector<std::string> tokens;
    size_t start = 0, end = 0;

    while ((end = csvLine.find(separator, start)) != std::string::npos) {
        tokens.push_back(csvLine.substr(start, end - start));
        start = end + 1;
    }

    tokens.push_back(csvLine.substr(start));
    return tokens;
}

/////////////////////////////////////////////////////////////////////////////////////////////       END       /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////