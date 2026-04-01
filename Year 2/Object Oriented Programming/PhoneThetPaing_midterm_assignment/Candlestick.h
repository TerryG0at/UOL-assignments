#pragma once
#include <vector>
#include <string>

class Candlestick {
public:
    std::string date;
    double open;
    double high;
    double low;
    double close;

    Candlestick(std::string date, double open, double high, double low, double close);
};

class CandlestickPlotter {
public:
    static void plot(const std::vector<Candlestick>& candlesticks, double minRange, double maxRange, int rangeType);
};