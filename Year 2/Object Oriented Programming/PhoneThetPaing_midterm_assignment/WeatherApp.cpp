#include "WeatherApp.h"
#include <iostream>
#include <iomanip>
#include <set>
#include <cmath>

// Displays candlestick data
void WeatherApp::displayCandlesticks(const std::vector<Candlestick>& candlesticks, int rangeType) const {
    std::cout << std::setw(10) << "Date" << std::setw(10) << "Open"
              << std::setw(10) << "High" << std::setw(10) << "Low"
              << std::setw(10) << "Close" << std::endl;

    // Task 1
    for (const auto& candle : candlesticks) {
        std::cout << std::setw(10) << candle.date
                  << std::setw(10) << std::fixed << std::setprecision(2) << candle.open
                  << std::setw(10) << static_cast<int>(std::round(candle.high))
                  << std::setw(10) << static_cast<int>(std::round(candle.low))
                  << std::setw(10) << std::fixed << std::setprecision(2) << candle.close
                  << std::endl;
    }

    if (candlesticks.empty()) {
        std::cerr << "No candlestick data found for the selected range." << std::endl;
    } else {
        // Task 2 with fixed range graph
        std::cout << " " << std::endl;
        std::cout << "Candlestick Plot:" << std::endl;
        CandlestickPlotter::plot(candlesticks, -12.0, 30.0, rangeType);
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////       Start       /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Choose Country
// Task 3, filter by country
bool WeatherApp::selectCountry(const std::vector<WeatherRow>& data) {
    std::set<std::string> countrySet;
    for (const auto& header : data[0].values) {
        // Get the country code
        countrySet.insert(header.first);
    }

    while (true) { // Loop until valid input is received
        std::cout << "Available Country Code for weather data: ";
        for (const auto& country : countrySet) {
            std::cout << country << " ";
        }
        std::cout << std::endl;

        std::string country;
        std::cout << "Enter the country code (or type 'exit' to quit, 'b' to go back): ";
        std::cin >> country;

        if (country == "exit") {
            std::cout << "Program exit. Thank you for using!" << std::endl;
            exit(0);
        } else if (country == "b") {
            return false;
        }

        if (countrySet.find(country) != countrySet.end()) {
            selectedCountry = country;
            return true;
        }

        std::cerr << "Invalid country code. Please try again or type 'exit' to quit, 'b' to go back." << std::endl;
    }
}

// Yearly Data
void WeatherApp::filterByYear(const std::vector<WeatherRow>& data) {
    auto candlesticks = WeatherAnalyzer::computeCandlestickData(data, selectedCountry);

    CSVReader::adjustFirstOpenValue(candlesticks, 1);

    // Display historical candlesticks
    displayCandlesticks(candlesticks, 1);
}

// Monthly Data
void WeatherApp::filterByMonth(const std::vector<WeatherRow>& data) {
    std::string input;
    int year;

    while (true) {
        std::cout << "Enter year (1980-2019) or type 'exit' to quit: ";
        std::cin >> input;

        if (input == "exit") {
            std::cout << "Program exit, thank you for using!" << std::endl;
            exit(0);
        }

        try {
            year = std::stoi(input);
            if (year >= 1980 && year <= 2019) {
                break;
            } else {
                std::cerr << "Invalid year. Please enter a year between 1980 and 2019." << std::endl;
            }
        } catch (const std::invalid_argument&) {
            std::cerr << "Invalid input. Please enter a valid year or type 'exit' to quit." << std::endl;
        }
    }

    auto monthlyCandlesticks = WeatherAnalyzer::computeMonthlyCandlestickData(data, selectedCountry, year);

    if (monthlyCandlesticks.empty()) {
        std::cerr << "No data found for the given year and country." << std::endl;
        return;
    }

    CSVReader::adjustFirstOpenValue(monthlyCandlesticks, 2);
    displayCandlesticks(monthlyCandlesticks, 2);
}

// Daily Data
void WeatherApp::filterByDay(const std::vector<WeatherRow>& data) {
    std::string input;
    int year, month;

    while (true) {
        std::cout << "Enter year (1980-2019) or type 'exit' to quit: ";
        std::cin >> input;

        if (input == "exit") {
            std::cout << "Program exit, thank you for using!" << std::endl;
            exit(0);
        }

        try {
            year = std::stoi(input);
            if (year >= 1980 && year <= 2019) {
                break;
            } else {
                std::cerr << "Invalid year. Please enter a year between 1980 and 2019." << std::endl;
            }
        } catch (const std::invalid_argument&) {
            std::cerr << "Invalid input. Please enter a valid year or type 'exit' to quit." << std::endl;
        }
    }

    while (true) {
        std::cout << "Enter month (1-12) or type 'exit' to quit: ";
        std::cin >> input;

        if (input == "exit") {
            std::cout << "Program exit, thank you for using!" << std::endl;
            exit(0);
        }

        try {
            month = std::stoi(input);
            if (month >= 1 && month <= 12) {
                break;
            } else {
                std::cerr << "Invalid month. Please enter a number between 1 and 12." << std::endl;
            }
        } catch (const std::invalid_argument&) {
            std::cerr << "Invalid input. Please enter a valid month or type 'exit' to quit." << std::endl;
        }
    }

    auto dailyCandlesticks = WeatherAnalyzer::computeDailyCandlestickData(data, selectedCountry, year, month);

    if (dailyCandlesticks.empty()) {
        std::cerr << "No data found for the given date and country." << std::endl;
        return;
    }

    CSVReader::adjustFirstOpenValue(dailyCandlesticks, 3);
    displayCandlesticks(dailyCandlesticks, 3);
}

// Check country in dataset first row
bool WeatherApp::isValidCountry(const std::string& country, const std::vector<WeatherRow>& data) const {
    std::set<std::string> countrySet;
    if (!data.empty()) {
        for (const auto& header : data[0].values) {
            countrySet.insert(header.first);
        }
    }
    return countrySet.find(country) != countrySet.end();
}

// Main run
void WeatherApp::run() {
    try {
        std::cout << "\nWelcome to TT Weather App!" << std::endl;
        auto data = CSVReader::readWeatherCSV("weather.csv");

        while (true) {
            std::string mode;
            std::cout << "Select mode:\n"
                      << "1. Display Data\n"
                      << "2. Predict Yearly Data\n"
                      << "Enter choice (1 or 2, or 'exit' to quit): ";
            std::cin >> mode;

            if (mode == "exit") {
                std::cout << "Program exit, thank you for using!" << std::endl;
                exit(0);
            } else if (mode == "1") {
                handleDataDisplay(data);
            } else if (mode == "2") {
                // Task 4
                handlePrediction(data);
            } else {
                std::cerr << "Invalid choice. Please enter 1, 2, or 'exit'." << std::endl;
            }
        }
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }
}

// Handles data display
void WeatherApp::handleDataDisplay(const std::vector<WeatherRow>& data) {
    while (true) {
        if (!selectCountry(data)) {
            return;
        }

        // Directly display the menu
        runMenu(data);
    }
}

// Handles prediction
void WeatherApp::handlePrediction(const std::vector<WeatherRow>& data) {
    while (true) {
        if (!selectCountry(data)) {
            return;
        }

        auto candlesticks = WeatherAnalyzer::computeCandlestickData(data, selectedCountry);

        if (candlesticks.empty()) {
            std::cerr << "No data found for the selected country." << std::endl;
        } else {
            double prediction = WeatherAnalyzer::predictYearlyWeather(candlesticks);
            std::cout << "\nPrediction for upcoming year:" << std::endl;
            // Above 0 is hot other value is cold
            std::cout << "Overall Weather: " << (prediction > 0 ? "Hot" : "Cold") << std::endl;
            std::cout << "Predicted Close Value: " << std::fixed << std::setprecision(2) << prediction << std::endl;
        }

        std::string input;
        std::cout << "Type anything to continue or else enter ('b' to go back to main menu or 'exit' to quit): ";
        std::cin >> input;

        if (input == "b") {
            return;
        }
        
        if (input == "exit") {
            std::cout << "Program exit, thank you for using!" << std::endl;
            exit(0);
        }
    }
}

// Runs the menu
void WeatherApp::runMenu(const std::vector<WeatherRow>& data) {
    while (true) {
        std::string input;
        // Task 3, filter by date range
        std::cout << std::endl << "Select date range type:" << std::endl
                  << "1. Yearly" << std::endl
                  << "2. Monthly" << std::endl
                  << "3. Daily" << std::endl
                  << "4. Back to Country Selection" << std::endl;

        while (true) {
            std::cout << "Enter choice (from 1 to 4 or type 'exit' to quit): ";
            std::cin >> input;

            if (input == "exit") {
                std::cout << "Program exit, thank you for using!" << std::endl;
                exit(0); // Terminate the program
            }

            int choice;
            try {
                choice = std::stoi(input);
                if (choice >= 1 && choice <= 4) {
                    break;
                } else {
                    std::cerr << "Invalid choice. " << std::endl;
                }
            } catch (const std::invalid_argument&) {
                std::cerr << "Invalid input. " << std::endl;
            }
        }

        int choice = std::stoi(input);
        switch (choice) {
            case 1:
                filterByYear(data);
                break;
            case 2:
                filterByMonth(data);
                break;
            case 3:
                filterByDay(data);
                break;
            case 4:
                std::cout << " " << std::endl;
                std::cout << "Back to country selection" << std::endl;
                return;
        }
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////       END       /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////