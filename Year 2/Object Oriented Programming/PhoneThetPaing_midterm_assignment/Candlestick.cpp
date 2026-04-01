#include "Candlestick.h"
#include <iostream>
#include <iomanip>
#include <cmath>
#include <algorithm>

// Constructor for Candlestick
Candlestick::Candlestick(std::string date, double open, double high, double low, double close)
    : date(date), open(open), high(high), low(low), close(close) {}

// Function to plot candlesticks
void CandlestickPlotter::plot(const std::vector<Candlestick>& candlesticks, double minRange, double maxRange, int rangeType) {
    if (candlesticks.empty()) {
        std::cerr << "No data available for plotting." << std::endl;
        return;
    }

    const int plotHeight = 30; // Number of rows for the vertical plot

    // Draw Graph based on these values
    double maxHigh = std::numeric_limits<double>::lowest();
    double minLow = std::numeric_limits<double>::max();
    double maxOpen = std::numeric_limits<double>::lowest();
    double minOpen = std::numeric_limits<double>::max();

    for (const auto& candle : candlesticks) {
        maxHigh = std::max(maxHigh, candle.high);
        minLow = std::min(minLow, candle.low);
        maxOpen = std::max(maxOpen, candle.open);
        minOpen = std::min(minOpen, candle.open);
    }

    // Add padding to high and low values for more accuracy
    double graphMax = maxHigh + 5;
    double graphMin = minLow - 5;

    // Generate axis labels
    std::vector<double> axisLabels;

    // Top values range
    for (double val = graphMax; val >= maxOpen; val -= 1.5) {
        axisLabels.push_back(val);
    }

    // Top values range
    for (double val = maxOpen; val > minOpen; val -= 0.2) {
        axisLabels.push_back(val);
    }

    // Bottom values range
    for (double val = minOpen - 0.1; val >= graphMin; val -= 1.5) {
        axisLabels.push_back(val);
    }

    // Generate the plot grid
    std::vector<std::string> plot(axisLabels.size(), std::string(candlesticks.size() * 6, ' '));

    for (size_t i = 0; i < candlesticks.size(); ++i) {
        const auto& candle = candlesticks[i];

        auto findPosition = [&](double value) {
            auto it = std::lower_bound(axisLabels.begin(), axisLabels.end(), value, std::greater<>());
            return std::distance(axisLabels.begin(), it);
        };

        int openPos = std::clamp(static_cast<int>(findPosition(candle.open)), 
                                0, static_cast<int>(axisLabels.size() - 1));
        int closePos = std::clamp(static_cast<int>(findPosition(candle.close)), 
                                0, static_cast<int>(axisLabels.size() - 1));
        int highPos = std::clamp(static_cast<int>(findPosition(candle.high)), 
                                0, static_cast<int>(axisLabels.size() - 1));
        int lowPos = std::clamp(static_cast<int>(findPosition(candle.low)), 
                                0, static_cast<int>(axisLabels.size() - 1));

        // Draw high and low (stalk)
        for (int j = highPos; j <= lowPos; ++j) {
            plot[j][i * 6 + 3] = '|';
        }

        // Draw open marks
        plot[openPos][i * 6 + 2] = '(';
        plot[openPos][i * 6 + 3] = 'o';
        plot[openPos][i * 6 + 4] = ')';

        // Draw close marks
        plot[closePos][i * 6 + 2] = '(';
        plot[closePos][i * 6 + 3] = 'c';
        plot[closePos][i * 6 + 4] = ')';
    }

    // Print the plot with vertical temperature axis
    for (size_t j = 0; j < axisLabels.size(); ++j) {
        double value = axisLabels[j];
        std::cout << std::setw(6) << std::fixed << std::setprecision(1) << value << " |";

        for (size_t k = 0; k < plot[j].size(); ++k) {
            std::cout << plot[j][k];
        }
        std::cout << std::endl;
    }

    // Print the horizontal axis
    std::cout << std::string(candlesticks.size() * 7, '_') << std::endl;
    std::cout << "       ";
    for (size_t i = 0; i < candlesticks.size(); ++i) {
        // Yearly
        if (rangeType == 1) {
            // more entries than other 2
            std::cout << std::setw(6) << candlesticks[i].date.substr(0, 4);
        } 
        // Monthly and daily
        else if (rangeType == 2 || rangeType == 3) {
            std::cout << std::setw(6) << (i + 1);
        }
    }
    std::cout << std::endl;
}
