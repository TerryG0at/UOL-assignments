// Global variable to store the gallery object. The gallery object is
// a container for all the visualisations.
var gallery;

function setup() {
  // Create a canvas to fill the content div from index.html.
  var c = createCanvas(1280, 720);
  c.parent('app');

  // Create a new gallery object.
  gallery = new Gallery();

  // Add the visualisation objects here.
  gallery.addVisual(new TechDiversityRace());
  gallery.addVisual(new TechDiversityGender());
  gallery.addVisual(new PayGapByJob2017());
  gallery.addVisual(new PayGapTimeSeries());
  gallery.addVisual(new ClimateChange());
  gallery.addVisual(new NutrientsTimeSeries());
  gallery.addVisual(new Food());
  gallery.addVisual(new AverageSalaryByJob()); // Add this line
}

function draw() {
    background(255);
    if (gallery.selectedVisual != null) {
        console.log('Drawing:', gallery.selectedVisual.name);

        // Ensure the draw() function is only called if necessary
        if (gallery.selectedVisual.loaded) {
            gallery.selectedVisual.draw();
        }
    }
}

function mouseMoved() {
    if (gallery.selectedVisual && gallery.selectedVisual.mouseMoved) {
        gallery.selectedVisual.mouseMoved();
    }
}