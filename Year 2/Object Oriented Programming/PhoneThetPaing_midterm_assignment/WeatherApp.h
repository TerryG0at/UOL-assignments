#pragma once
#include "CSVReader.h"
#include "WeatherAnalyzer.h"
#include "Candlestick.h"
#include <vector>
#include <string>
#include <set>

class WeatherApp {
public:
    // Main run
    void run();

    // Opening the menu
    void runMenu(const std::vector<WeatherRow>& data);

    // Display functions
    void handleDataDisplay(const std::vector<WeatherRow>& data);
    void filterByYear(const std::vector<WeatherRow>& data);
    void filterByMonth(const std::vector<WeatherRow>& data);
    void filterByDay(const std::vector<WeatherRow>& data);
    void displayCandlesticks(const std::vector<Candlestick>& candlesticks, int rangeType) const;

    // Prediction functions
    void handlePrediction(const std::vector<WeatherRow>& data);

    // Country selection function
    bool selectCountry(const std::vector<WeatherRow>& data);

    // Validation function
    bool isValidCountry(const std::string& country, const std::vector<WeatherRow>& data) const;

private:
    std::vector<WeatherRow> weatherData;
    std::string selectedCountry;
};