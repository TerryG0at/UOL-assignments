function Food() {
    // Name for the visualisation to appear in the menu bar.
    this.name = 'Food';
    this.id = 'food';
    this.loaded = false;

    // number of bubbles depend on number of data
    var bubbles = [];
    var maxAmt;
    var years = [];
    var yearDropdown;

    // Preload the data. This function is called automatically by the gallery when a visualisation is added.
    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/food/foodData.csv', 'csv', 'header',
            function(table) {
                self.loaded = true;
            }
        );
    }

    this.setup = function() {
        console.log("in set up");
        this.data_setup();
    }

    this.destroy = function() {
        console.log("in destroy");
        // clear the years dropdown
        if (yearDropdown) {
            yearDropdown.remove();
        }
    }

    this.draw = function() {
        if (!this.loaded) {
            // used for debugging
            console.log('Data not yet loaded');
            return;
        }

        // drawing individual bubble each time
        background(255);
        translate(width / 4 + 100, height / 2);
        for (var i = 0; i < bubbles.length; i++) {
            bubbles[i].update(bubbles);
            bubbles[i].draw();
        }
        // checking which bubble the mouse is pointed
        for (var i = 0; i < bubbles.length; i++) {
            if (bubbles[i].hover(mouseX - width / 4 - 100, mouseY - height / 2)) {
                bubbles[i].drawLabel();
            }
        }
    }

    this.data_setup = function() {
        bubbles = [];
        maxAmt = 0;
        years = [];

        var rows = this.data.getRows();
        var numColumns = this.data.getColumnCount();

        // create dropdown box for each year
        yearDropdown = createSelect();
        yearDropdown.position(width / 4 + 10, height + 10);
        yearDropdown.style('width', '150px');
        yearDropdown.option('Select a year');
        for (var i = 5; i < numColumns; i++) {
            var y = this.data.columns[i];
            years.push(y);
            yearDropdown.option(y);
        }

        // when user change to another year, that will trigger to change the bubbles
        yearDropdown.changed(function() {
            var selectedYear = yearDropdown.value();
            if (selectedYear !== 'Select a year') {
                changeYear(selectedYear, years, bubbles);
            }
        });

        // create bubble for each food type
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].get(0) != "") {
                // Set the food name
                var b = new Bubble(rows[i].get(0));

                for (var j = 5; j < numColumns; j++) {
                    // get the value for each year
                    if (rows[i].get(j) != "") {
                        var n = rows[i].getNum(j);
                        if (n > maxAmt) {
                            maxAmt = n;
                        }
                        b.data.push(n);
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
            bubbles[i].setData(0);
        }
    }

    // function for changing year
    function changeYear(year, _years, _bubbles) {
        var y = _years.indexOf(year);
        for (var i = 0; i < _bubbles.length; i++) {
            _bubbles[i].setData(y);
        }
    }
}