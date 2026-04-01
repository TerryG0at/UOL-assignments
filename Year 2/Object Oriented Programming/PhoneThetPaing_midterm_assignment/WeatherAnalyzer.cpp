#include "WeatherAnalyzer.h"
#include <limits>
#include <numeric>
#include <algorithm>
#include <iostream>
#include <iomanip>


/////////////////////////////////////////////////////////////////////////////////////////////       Start       /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Computation Function
void WeatherAnalyzer::computeStatistics(const std::vector<double>& values, double& high, double& low, double& mean) {
    if (!values.empty()) {
        high = *std::max_element(values.begin(), values.end());
        low = *std::min_element(values.begin(), values.end());
        mean = std::accumulate(values.begin(), values.end(), 0.0) / values.size();
    } else {
        high = low = mean = 0.0;
    }
}

// Computes yearly candlestick data
std::vector<Candlestick> WeatherAnalyzer::computeCandlestickData(
    const std::vector<WeatherRow>& data, const std::string& country) {
    std::vector<Candlestick> candlesticks;
    std::map<int, std::vector<double>> yearlyData;

    // Group temperatures by year
    for (const auto& entry : data) {
        try {
            int year = std::stoi(entry.timestamp.substr(0, 4));
            if (entry.values.find(country) != entry.values.end()) {
                yearlyData[year].push_back(entry.values.at(country));
            }
        } catch (const std::exception& e) {
            std::cerr << "Error processing with timestamp: " << entry.timestamp << std::endl;
        }
    }

    double previousClose = 0.0;
    for (int year = 1980; year <= 2019; ++year) {
        double open = previousClose, high = 0.0, low = 0.0, close = 0.0;

        if (yearlyData.count(year)) {
            computeStatistics(yearlyData[year], high, low, close);
        }

        candlesticks.emplace_back(std::to_string(year), open, high, low, close);
        previousClose = close;
    }

    return candlesticks;
}

/////////////////////////////////////////////////////////////////////////////////////////////       END       /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Computes monthly candlestick data
std::vector<Candlestick> WeatherAnalyzer::computeMonthlyCandlestickData(
    const std::vector<WeatherRow>& data,
    const std::string& country,
    int year) {
    std::vector<Candlestick> candlesticks;
    std::map<int, std::vector<double>> monthlyData;

    // Group data by month
    for (const auto& entry : data) {
        int entryYear = std::stoi(entry.timestamp.substr(0, 4));
        int entryMonth = std::stoi(entry.timestamp.substr(5, 2));
        if (entryYear == year && entry.values.find(country) != entry.values.end()) {
            monthlyData[entryMonth].push_back(entry.values.at(country));
        }
    }

    double previousClose = 0.0;

    for (int month = 1; month <= 12; ++month) {
        double open = 0.0;
        double close = 0.0;
        double high = std::numeric_limits<double>::lowest();
        double low = std::numeric_limits<double>::max();

        if (monthlyData.find(month) != monthlyData.end()) {
            const auto& temperatures = monthlyData[month];

            // Compute close (current month's mean)
            close = std::accumulate(temperatures.begin(), temperatures.end(), 0.0) / temperatures.size();

            // Compute high and low
            high = *std::max_element(temperatures.begin(), temperatures.end());
            low = *std::min_element(temperatures.begin(), temperatures.end());
        }

        // Set the open value
        if (month == 1) {
            if (year == 1980) {
                // Since there is no data for 1979, 1980 Jan open value is set to close value + 0.4
                open = close + 0.4;
            } else {
                // For other years, use December mean of the previous year
                std::string prevDecember = std::to_string(year - 1) + "-12";
                std::vector<double> prevYearTemps;
                for (const auto& entry : data) {
                    if (entry.timestamp.substr(0, 7) == prevDecember &&
                        entry.values.find(country) != entry.values.end()) {
                        prevYearTemps.push_back(entry.values.at(country));
                    }
                }
                if (!prevYearTemps.empty()) {
                    open = std::accumulate(prevYearTemps.begin(), prevYearTemps.end(), 0.0) / prevYearTemps.size();
                } else {
                    open = close + 0.4;
                }
            }
        } else {
            // For other months, use the previous month's close
            open = previousClose;
        }

        // Add the candlestick for the month
        candlesticks.emplace_back(
            std::to_string(year) + "-" + (month < 10 ? "0" : "") + std::to_string(month),
            open, high, low, close);

        // Update previousClose for the next month
        previousClose = close;
    }

    return candlesticks;
}

// Computes daily candlestick data
std::vector<Candlestick> WeatherAnalyzer::computeDailyCandlestickData(
    const std::vector<WeatherRow>& data, const std::string& country, int year, int month) {
    std::vector<Candlestick> dailyData;
    std::map<int, std::vector<double>> dailyTemperatures;

    // Some months dont' have 31 days
    auto daysInMonth = [](int year, int month) {
        // Calculate leap year
        if (month == 2) {
            return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0) ? 29 : 28;
        }
        return (month == 4 || month == 6 || month == 9 || month == 11) ? 30 : 31;
    };

    int maxDays = daysInMonth(year, month);
    for (const auto& row : data) {
        try {
            int rowYear = std::stoi(row.timestamp.substr(0, 4));
            int rowMonth = std::stoi(row.timestamp.substr(5, 2));
            int rowDay = std::stoi(row.timestamp.substr(8, 2));

            if (rowYear == year && rowMonth == month && row.values.find(country) != row.values.end()) {
                dailyTemperatures[rowDay].push_back(row.values.at(country));
            }
        } catch (const std::exception& e) {
            std::cerr << "Error processing with timestamp: " << row.timestamp << std::endl;
        }
    }

    double previousClose = 0.0;
    for (int day = 1; day <= maxDays; ++day) {
        double open = previousClose, high = 0.0, low = 0.0, close = 0.0;

        if (dailyTemperatures.count(day)) {
            computeStatistics(dailyTemperatures[day], high, low, close);
        }

        dailyData.emplace_back(
            std::to_string(year) + "-" + (month < 10 ? "0" : "") + std::to_string(month) + "-" +
            (day < 10 ? "0" : "") + std::to_string(day),
            open, high, low, close);
        previousClose = close;
    }

    return dailyData;
}


/////////////////////////////////////////////////////////////////////////////////////////////       Start       /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


double WeatherAnalyzer::predictYearlyWeather(const std::vector<Candlestick>& candlesticks) {
    if (candlesticks.empty()) {
        throw std::runtime_error("No data available for prediction.");
        // Alternatively, you could return a default value, e.g.:
        // return 0.0;
    }

    std::vector<double> weights = {2, 5, 8, 11, 14, 17, 20, 23}; // Adjust weight percentages
    size_t weightCount = weights.size();
    double weightedSum = 0.0, weightTotal = 0.0;

    for (size_t i = 0; i < candlesticks.size() && i < weightCount; ++i) {
        double weight = weights[weightCount - i - 1]; // Most recent year gets highest weight
        weightedSum += candlesticks[candlesticks.size() - i - 1].close * weight;
        weightTotal += weight;
    }

    return weightedSum / weightTotal; // Return predicted close value
}


/////////////////////////////////////////////////////////////////////////////////////////////       END       /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////