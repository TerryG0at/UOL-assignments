function NutrientsTimeSeries() {
    // Name for the visualisation to appear in the menu bar.
    this.name = 'Nutrients: 1974-2016';
    
    // Each visualisation must have a unique ID with no special characters.
    this.id = 'nutrients-timeseries';
    
    // Title to display above the plot.
    this.title = 'Nutrients: 1974-2016.';
    
    // Names for each axis.
    this.xAxisLabel = 'year';
    this.yAxisLabel = '%';

    // Fixed set of colors for the lines
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
    
    // Layout object to store all common plot layout parameters and methods.
    this.layout = {
        marginSize: marginSize,

        // Locations of margin positions
        leftMargin: marginSize * 2,
        rightMargin: width - marginSize,
        topMargin: marginSize,
        bottomMargin: height - marginSize * 2,
        pad: 5,

        plotWidth: function() {
            return this.rightMargin - this.leftMargin;
        },

        plotHeight: function() {
            return this.bottomMargin - this.topMargin;
        },

        // Boolean to enable/disable background grid.
        grid: true,

        // Sepearte the row and column of the graph
        numXTickLabels: 10,
        numYTickLabels: 8,
    };
    
    // Property to represent whether data has been loaded.
    this.loaded = false;
    
    this.preload = function() {
        console.log('Preloading data...');
        var self = this;
        this.data = loadTable(
            './data/food/nutrients74-16.csv', 'csv', 'header',
            function(table) {
                self.loaded = true;
                console.log('Data loaded successfully.');
            }
        );
    };
    
    this.setup = function() {
        console.log('Setting up the visualization...');
        textSize(16);

        // Set min and max years: assumes data is sorted by date.
        this.startYear = Number(this.data.columns[1]);
        this.endYear = Number(this.data.columns[this.data.columns.length - 1]);

        var tableContainer = select('#nutrition-table-container');
        tableContainer.html('');

        var table = createElement('table');
        tableContainer.child(table);

        // Creating a table that map the nutrient name and the color
        var headerRow = createElement('tr');
        var nameHeader = createElement('th', 'Nutrient');
        var colorHeader = createElement('th', '');
        headerRow.child(nameHeader);
        headerRow.child(colorHeader);
        table.child(headerRow);

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

        // Set the min and max percentage,
        // do a dynamic find min and max in the data source
        this.minPercentage = 80;
        this.maxPercentage = 400;
    };
    
    this.destroy = function() {
        // Clear the table container when this visualization is deselected
        var tableContainer = select('#nutrition-table-container');
        tableContainer.html('');
    };
    
    this.draw = function() {
        console.log('Drawing the visualization...');
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        // Draw the title above the plot.
        drawTitle.call(this);

        // Draw all y-axis labels.
        drawYAxisTickLabels(this.minPercentage,
            this.maxPercentage,
            this.layout,
            mapNutrientsToHeight.bind(this),
            0);

        // Draw x and y axis.
        drawAxis(this.layout);

        // Draw x and y axis labels.
        drawAxisLabels(this.xAxisLabel,
            this.yAxisLabel,
            this.layout);

        // Calculate the duration
        var numYears = this.endYear - this.startYear;

        // Determine how many x-axis labels to skip.
        var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);

        // Loop over all rows and draw a line from the previous value to the current.
        for (var i = 0; i < this.data.getRowCount(); i++) {
            var row = this.data.getRow(i);
            var previous = null;

            var title = row.getString(0);

            for (var j = 1; j < numYears; j++) {
                // Create an object to store data for the current year.
                var current = {
                    // Convert strings to numbers.
                    'year': this.startYear + j - 1,
                    'percentage': row.getNum(j)
                };

                if (previous != null) {
                    // Calculate start and end points for the line
                    var startX = mapYearToWidth.call(this, previous.year);
                    var startY = mapNutrientsToHeight.call(this, previous.percentage);
                    var endX = mapYearToWidth.call(this, current.year);
                    var endY = mapNutrientsToHeight.call(this, current.percentage);

                    // Draw line segment
                    stroke(this.colors[i % this.colors.length]);
                    line(startX, startY, endX, endY);

                    // Draw the tick label marking the start of the previous year.
                    if (j % xLabelSkip == 0) {
                        drawXAxisTickLabel(previous.year, this.layout, mapYearToWidth.bind(this));
                    }
                }

                // Assign current year to previous year so that it is available during the next iteration of this loop to give us the start position of the next line segment.
                previous = current;
            }
        }
    };
}