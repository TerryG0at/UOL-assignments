function Bubble(_name) {
    this.size = 20;
    this.target_size = 20;
    this.pos = createVector(0, 0);
    this.direction = createVector(0, 0);
    this.name = _name;
    this.maxAmt = 0;
    this.color = color(random(0, 255), random(0, 255), random(0, 255));
    this.data = [];

    this.draw = function() {
        push();
        noStroke();
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.size);
        pop();
    }

    this.drawLabel = function() {
        push();
        textAlign(CENTER);
        textSize(12);
        let labelWidth = textWidth(this.name) + 10; // Add padding
        let labelHeight = 20; // Fixed height for the label

        // Draw background box
        fill(255); // White color for the box
        noStroke();
        rectMode(CENTER);
        rect(this.pos.x, this.pos.y, labelWidth, labelHeight);

        // Draw text
        fill(0); // Black color for the text
        text(this.name, this.pos.x, this.pos.y + 5);
        pop();
    }

    this.update = function(_bubbles) {
        this.direction.set(0, 0);

        for (var i = 0; i < _bubbles.length; i++) {
            if (_bubbles[i].name != this.name) {
                var v = p5.Vector.sub(this.pos, _bubbles[i].pos);
                var d = v.mag();

                if (d < this.size / 2 + _bubbles[i].size / 2) {
                    if (d > 0) {
                        this.direction.add(v)
                    } else {
                        this.direction.add(p5.Vector.random2D());
                    }
                }
            }
        }

        this.direction.normalize();
        this.direction.mult(2);
        this.pos.add(this.direction);

        if (this.size < this.target_size) {
            this.size += 1;
        } else if (this.size > this.target_size) {
            this.size -= 1;
        }
    }

    this.setData = function(i) {
        this.target_size = map(this.data[i], 0, this.maxAmt, 20, 250);
    }

    this.setMaxAmt = function(_maxAmt) {
        this.maxAmt = _maxAmt;
    }

    this.hover = function(mx, my) {
        var d = dist(mx, my, this.pos.x, this.pos.y);
        return d < this.size / 2;
    }
}