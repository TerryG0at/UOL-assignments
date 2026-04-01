function AverageSalaryByJob() {
    this.name = 'Average Salary by Job Classification';
    this.id = 'average-salary-by-job';
    this.loaded = false;
    this.labels = [];
    this.data = [];
    this.maxValue = 250000;
    // radius of the radar chart
    this.radius = min(width, height) / 2.0 * 0.8;

    // Preload the data
    this.preload = function() {
        var self = this;
        this.dataTable = loadTable(
            './data/salary/Average_Salary_by_Job_Classification.csv', 'csv', 'header',
            function(table) {
                self.loaded = true;
                console.log('Data loaded successfully');
            },
            function(error) {
                console.error('Error loading CSV:', error);
            }
        );
    };

    this.setup = function() {
        if (this.loaded) {
            this.parseData();
        } else {
            console.log('Data not yet loaded');
        }
    };

    this.destroy = function() {
        clear();

        // remove the canvas from the DOM
        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
        }

        this.labels = [];
        this.data = [];
    };

    this.parseData = function() {
        for (let r = 0; r < this.dataTable.getRowCount(); r++) {
            let row = this.dataTable.getRow(r);
            let jobClassification = row.getString('Position Title');
            let averageSalaryString = row.getString('Average of Base Salary').replace('$', '').replace(',', '');
            let averageSalary = parseFloat(averageSalaryString);
            this.labels.push(jobClassification);
            this.data.push(averageSalary);
        }
        console.log('Data parsed successfully');
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        background(255);
        this.drawRadarChart();
        // to show the job name
        this.hoverLabel();
    };

    this.drawRadarChart = function() {
        let numPoints = this.labels.length;
        let radius = this.radius;
        let centerX = width / 2;
        let centerY = height / 2;
        // two pi is the full angle for circle and dividing with point to 
        let angleStep = TWO_PI / numPoints;

        stroke(0);
        fill(200, 200, 255,255);

        // to draw the dots
        beginShape();
        for (let i = 0; i < numPoints; i++) {
            let value = this.data[i];
            // radius * 0.4 for preventing the less salaries job to appear too close to the inner part of the circle
            let normalizedValue = map(value, 0, this.maxValue, radius * 0.4, radius);
            let angle = i * angleStep;
            // to get the points inside the circle
            let x = centerX + cos(angle) * normalizedValue;
            let y = centerY + sin(angle) * normalizedValue;

            vertex(x, y);
            // draw a dot for each vertex with transparency so the less paid job won't get overlapped
            fill(54, 162, 235, 150);
            noStroke();
            ellipse(x, y, 6, 6);  // Slightly larger circles for better spacing
        }
        endShape(CLOSE);

        // Draw axis lines
        stroke(150);
        for (let i = 0; i < numPoints; i++) {
            let angle = i * angleStep;
            let x = centerX + cos(angle) * radius;
            let y = centerY + sin(angle) * radius;
            line(centerX, centerY, x, y);
        }

        // Draw concentric circles for grid and salary labels
        noFill();
        for (let i = 0; i < 5; i++) {
            let circleRadius = radius * (i + 1) / 5;
            ellipse(centerX, centerY, circleRadius * 2);
        }
    };

    // show job name and rounded salary on hover
    this.hoverLabel = function() {
        let numPoints = this.labels.length;
        let radius = this.radius;
        let centerX = width / 2;
        let centerY = height / 2;
        let angleStep = TWO_PI / numPoints;

        let closestJob = null;
        let minDist = Infinity;

        for (let i = 0; i < numPoints; i++) {
            let value = this.data[i];
            let normalizedValue = map(value, 0, this.maxValue, radius * 0.4, radius);  // Adjusted normalization

            let angle = i * angleStep;
            let x = centerX + cos(angle) * normalizedValue;
            let y = centerY + sin(angle) * normalizedValue;

            let distToMouse = dist(mouseX, mouseY, x, y);

            // find the closest job to the mouse
            if (distToMouse < minDist && distToMouse < 15) {
                minDist = distToMouse;
                closestJob = { name: this.labels[i], salary: value, x, y };
            }
        }

        if (closestJob) {
            fill(0);
            textSize(14);
            textAlign(CENTER, CENTER);
            // round the salary to the nearest thousand and display in k
            let roundedSalary = Math.round(closestJob.salary / 1000) + 'k';
            let labelText = `${closestJob.name}: $${roundedSalary}`;
            // show the job title and rounded salary near the hover point
            text(labelText, closestJob.x, closestJob.y - 10);  
        }
    };
}