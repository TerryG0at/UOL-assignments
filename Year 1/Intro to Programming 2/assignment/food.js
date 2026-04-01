function Food() {
    // Name for the visualisation to appear in the menu bar.
    this.name = 'Food';

    // Each visualisation must have a unique ID with no special characters.
    this.id = 'food';

    // Property to represent whether data has been loaded.
    this.loaded = false;

    var bubbles = [];
    var maxAmt;
    var years = [];
    var yearDropdown;

    // Preload the data. This function is called automatically by the gallery when a visualisation is added.
    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/food/foodData.csv', 'csv', 'header',
            // Callback function to set the value this.loaded to true.
            function(table) {
                self.loaded = true;
            }
        );
    }

    // This is called automatically when the user clicks on the menu button
    this.setup = function() {
        console.log("in set up");
        this.data_setup();
    }

    // This is called automatically when the user clicks on another menu button
    this.destroy = function() {
        console.log("in destroy");
        // Clear away the years dropdown
        if (yearDropdown) {
            yearDropdown.remove();
        }
    }

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        background(255);
        translate(width / 4 + 100, height / 2); // Adjust this translation to move bubbles closer to the table
        for (var i = 0; i < bubbles.length; i++) {
            bubbles[i].update(bubbles);
            bubbles[i].draw();
        }
        for (var i = 0; i < bubbles.length; i++) {
            if (bubbles[i].hover(mouseX - width / 4 - 100, mouseY - height / 2)) {
                bubbles[i].drawLabel();
            }
        }
    }

    this.data_setup = function() {
        bubbles = [];
        maxAmt = 0; // Initialize maxAmt to 0
        years = [];

        var rows = this.data.getRows();
        var numColumns = this.data.getColumnCount();

        // Create dropdown for each year
        yearDropdown = createSelect();
        yearDropdown.position(width / 4 + 10, height + 10); // Adjust position to be below the table
        yearDropdown.style('width', '150px'); // Set width of the dropdown
        yearDropdown.option('Select a year');
        for (var i = 5; i < numColumns; i++) {
            var y = this.data.columns[i];
            years.push(y);
            yearDropdown.option(y);
        }

        yearDropdown.changed(function() {
            var selectedYear = yearDropdown.value();
            if (selectedYear !== 'Select a year') {
                changeYear(selectedYear, years, bubbles);
            }
        });

        // Create bubble for each food type
        // Each bubble consists of data value from 1974 to 2016
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].get(0) != "") {
                // Set the food name
                var b = new Bubble(rows[i].get(0));

                // Start from column index 5
                for (var j = 5; j < numColumns; j++) {
                    // Get the value for each year
                    if (rows[i].get(j) != "") {
                        var n = rows[i].getNum(j);
                        if (n > maxAmt) {
                            maxAmt = n; // Keep a tally of the highest value
                        }
                        b.data.push(n); // Push data in
                    } else {
                        // For empty value
                        b.data.push(0);
                    }
                }
                bubbles.push(b);
            }
        }

        for (var i = 0; i < bubbles.length; i++) {
            bubbles[i].setMaxAmt(maxAmt);
            bubbles[i].setData(0); // Set to the first data
        }
    }

    function changeYear(year, _years, _bubbles) {
        var y = _years.indexOf(year);
        // Set the selected year for all the bubbles
        for (var i = 0; i < _bubbles.length; i++) {
            _bubbles[i].setData(y);
        }
    }
}