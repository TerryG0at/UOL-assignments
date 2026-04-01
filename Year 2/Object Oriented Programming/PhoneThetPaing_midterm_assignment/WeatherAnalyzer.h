#pragma once
#include "Candlestick.h"
#include "CSVReader.h"
#include <vector>
#include <string>

class WeatherAnalyzer {
public:
    static std::vector<Candlestick> computeCandlestickData(const std::vector<WeatherRow>& data, const std::string& country);
    static std::vector<Candlestick> computeMonthlyCandlestickData(const std::vector<WeatherRow>& data, const std::string& country, int year);
    static std::vector<Candlestick> computeDailyCandlestickData(const std::vector<WeatherRow>& data, const std::string& country, int year, int month);
    static double predictYearlyWeather(const std::vector<Candlestick>& candlesticks);

private:
    // Helper function to calculate high, low, and mean values
    static void computeStatistics(const std::vector<double>& values, double& high, double& low, double& mean);
};