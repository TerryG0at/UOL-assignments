function NutrientsTimeSeries() {
    this.name = 'Nutrients: 1974-2016';
    this.id = 'nutrients-timeseries';
    // Title of the graph
    this.title = 'Nutrients: 1974-2016.';
    // Row
    this.xAxisLabel = 'year';
    // Column
    this.yAxisLabel = 'percentages';

    // Colors for each line
    this.colors = [
        color(30, 110, 180),
        color(250, 120, 10),
        color(40, 160, 40),
        color(210, 30, 40),
        color(140, 100, 180),
        color(140, 80, 70),
        color(220, 110, 190),
        color(120, 120, 120),
        color(180, 180, 30),
        color(20, 190, 200)
    ];

    var marginSize = 35;

    // Drawing the graph structure
    this.layout = {
        marginSize: marginSize,
        leftMargin: marginSize * 2,
        rightMargin: width - marginSize,
        topMargin: marginSize,
        bottomMargin: height - marginSize * 2,
        pad: 5,
        plotWidth: function () {
            return this.rightMargin - this.leftMargin;
        },
        plotHeight: function () {
            return this.bottomMargin - this.topMargin;
        },
        grid: true,
        // year divider
        numXTickLabels: 10,
        // percentage divider
        numYTickLabels: 8,
        //both can be used to change the amount you want on the graph
    };

    this.loaded = false;
    // to store the value of hover line
    this.hoveredIndex = null;
    
    this.preload = function () {
        var self = this;
        this.data = loadTable('./data/food/nutrients74-16.csv', 'csv', 'header', function (table) {
            self.loaded = true;
        });
    };

    this.setup = function () {
        textSize(16);

        // get the start and end year from csv
        this.startYear = Number(this.data.columns[1]);
        this.endYear = Number(this.data.columns[this.data.columns.length - 1]);

        var tableContainer = select('#nutrition-table-container');
        tableContainer.html('');

        var table = createElement('table');
        tableContainer.child(table);

        // for creating nutrient table
        var headerRow = createElement('tr');
        var nameHeader = createElement('th', 'Nutrient');
        var colorHeader = createElement('th', '');
        // getting/filling nutrient name and color
        headerRow.child(nameHeader);
        headerRow.child(colorHeader);
        table.child(headerRow);

        // loop until all nutrients are called or run out
        for (var i = 0; i < this.data.getRowCount(); i++) {
            var row = createElement('tr');
            var nutrientName = createElement('td', this.data.getString(i, 0));
            var colorBox = createElement('td');
            colorBox.style('background-color', this.colors[i % this.colors.length]);
            colorBox.style('width', '20px');
            colorBox.style('height', '20px');
            row.child(nutrientName);
            row.child(colorBox);
            table.child(row);
        }

        // setting the minimum and maximum value for percentage display
        // can change the value for future use when there are new nutrient or new value
        this.minPercentage = 80;
        this.maxPercentage = 400;
    };

    this.destroy = function () {
        var tableContainer = select('#nutrition-table-container');
        tableContainer.html('');
    };

    this.draw = function () {
        if (!this.loaded) return;

        background(255);

        drawTitle.call(this);
        // drawing the grid lines
        drawYAxisTickLabels(this.minPercentage, this.maxPercentage, this.layout, mapNutrientsToHeight.bind(this), 0);
        drawAxis(this.layout);
        drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);

        // get the year duration and divide with the value that we set above to determine how
        // frequent the years will be show
        var numYears = this.endYear - this.startYear;
        var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);

        for (var i = 0; i < this.data.getRowCount(); i++) {
            if (this.hoveredIndex === null || this.hoveredIndex === i) {
                this.drawLine(i, numYears, xLabelSkip);
            }
        }
    };

    // function for drawing the nutrient lines
    this.drawLine = function (i, numYears, xLabelSkip) {
        var row = this.data.getRow(i);
        var previous = null;

        for (var j = 1; j < numYears; j++) {
            var current = {
                'year': this.startYear + j - 1,
                'percentage': row.getNum(j)
            };

            if (previous != null) {
                var startX = mapYearToWidth.call(this, previous.year);
                var startY = mapNutrientsToHeight.call(this, previous.percentage);
                var endX = mapYearToWidth.call(this, current.year);
                var endY = mapNutrientsToHeight.call(this, current.percentage);

                stroke(this.colors[i % this.colors.length]);
                strokeWeight(2);
                // continuous line
                line(startX, startY, endX, endY);

                // hover function
                if (this.isMouseNearLine(startX, startY, endX, endY)) {
                    this.hoveredIndex = i;
                    this.displayHoverLabel(row.getString(0), mouseX, mouseY);
                }

                // similar to xLabelSkip
                if (j % xLabelSkip === 0) {
                    drawXAxisTickLabel(previous.year, this.layout, mapYearToWidth.bind(this));
                }
            }

            previous = current;
        }
    };

    this.isMouseNearLine = function (x1, y1, x2, y2) {
        var d1 = dist(mouseX, mouseY, x1, y1);
        var d2 = dist(mouseX, mouseY, x2, y2);
        var lineLen = dist(x1, y1, x2, y2);
        // adding buffer to increase detection area
        var buffer = 5;

        return d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer;
    };

    this.displayHoverLabel = function (nutrient, x, y) {
        fill(0);
        noStroke();
        textSize(12);
        textAlign(LEFT);
        text(nutrient, x + 10, y - 10);
    };

    this.mouseMoved = function () {
        // to change to deafault value when mouse is moved
        this.hoveredIndex = null;
    };
}