
// browser-sync start --server -f -w

/* TODO:
    Grenzen der World definieren.
        Composite.bounds?
        Bounds mit Dimensionen des Canvas?

    Anziehungskräfte (map functions) non-linear aufbauen?
        (Wirken forces bereits non-linear?)
        -- https://p5js.org/examples/math-linear-interpolation.html
        -- https://p5js.org/examples/math-sine.html

    Wie morph/merge effekt zeichnen?
        http://paperjs.org/examples/meta-balls/


    Andere Form für Icons?
        paper.js svgs? -- https://www.youtube.com/watch?v=2JKEkcjF1aA
        https://p5js.org/examples/simulate-soft-body.html
        https://p5js.org/examples/motion-morph.html
        https://www.gorillasun.de/blog/working-with-svgs-in-p5js/

    Wie Canvas resetten und trotzdem Hintergrundbild zeigen?
        Nur mit p5.Image möglich?
*/


// module aliases
var Engine = Matter.Engine,
    Runner = Matter.Runner,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Constraint = Matter.Constraint,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint;

var engine = Engine.create();
var runner = Runner.create();

var canvas;
var mouseConstraint;

function setup() {

    // setup p5
    // canvasWidth = 900;
    // canvasHeight = 1400;
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas = createCanvas(canvasWidth, canvasHeight);
    background(47, 158, 245);

    // setup matter.js
    engine.gravity.scale = 0;
    Runner.run(runner, engine);


    // box1 = new Rectangle(-500,0,505,canvasHeight);

    pb1 = new PassiveBubble(floor(random(50, width-50)), floor(random(50, width*0.4)), 40);
    pb2 = new PassiveBubble(floor(random(50, width-50)), floor(random(50, width*0.4)), 40);
    pb3 = new PassiveBubble(floor(random(50, width-50)), floor(random(50, width*0.4)), 40);
    // pb.setOrigin();

    passiveBubbles = [];
    passiveBubbles.push(pb1, pb2, pb3);

    activeBubble = new ActiveBubble(width/2, height*0.75, 50);


}


function draw() {
    background(47, 158, 245);

    activeBubble.moveActive();
    activeBubble.show(255,255,255);
    // box1.show();

    for (let i = 0; i < passiveBubbles.length; i++) {
        // if(passiveBubbles[i].nearActive()){

            passiveBubbles[i].move();

        // }
        passiveBubbles[i].show(255,255,255);
        // passiveBubbles[i].showOrigin(50,255,100);
    }
    // passiveBubbles[0].show(255,200,200);
    // passiveBubbles[1].show(200,255,200);
    // passiveBubbles[2].show(200,200,255);

}

// class Rectangle{
//     constructor(x,y,w,h){
//         console.log(x);
//         this.w = w;
//         this.h = h;
//         this.body = Bodies.rectangle(x,y,w,h);
//         this.pos = this.body.position;
//
//
//         Matter.Body.setStatic(this.body, true);
//         Composite.add(engine.world, this.body);
//
//
//     }
//     show(){
//         fill(0);
//         rect(this.pos.x,this.pos.y,this.w,this.h);
//     }
// }

class Bubble{

    constructor(x,y,r) {

        this.r = r;

        //create Matter.js body
        this.body = Bodies.circle(x, y, r);
        this.body.frictionAir = 0.3;

        Composite.add(engine.world, this.body);

        this.posVector = this.body.position;

    }

    contains(px,py){
        let d = dist(px, py, this.posVector.x, this.posVector.y);

        if(d < this.r){
            return true;
        }else{
            return false;
        }
    }

    show(r,g,b){
        fill(r,g,b);
        noStroke();

        ellipse(this.posVector.x, this.posVector.y, this.r*2);
    }
}

class ActiveBubble extends Bubble{

    offset = createVector(0,0);
    // snappedTo;

    constructor(x,y,r){
        super(x,y,r);
        // Matter.Body.setStatic(this.body, true);

        // console.log(this.body.mass);
        // Body.setMass(this.body, 8);
        this.body.frictionAir = 0.08;

    //Add mouseConstraint
        this.body.collisionFilter.category = 0b10;

        var canvasMouse = Mouse.create(canvas.elt);
        canvasMouse.pixelRatio = pixelDensity();
        var options = {
            mouse: canvasMouse,
            collisionFilter: {mask: 0b10},
            constraint: {
                stiffness: 1
            }
        };

        mouseConstraint = MouseConstraint.create(engine, options);
        Composite.add(engine.world, mouseConstraint);
    }

    isSnapped(){

        for (var i = 0; i < passiveBubbles.length; i++) {

            let bubblesDist = dist(passiveBubbles[i].posVector.x, passiveBubbles[i].posVector.y, this.posVector.x, this.posVector.y);

            if (bubblesDist < this.r*0.5) {
                // console.log(passiveBubbles[i].body.id);
                return passiveBubbles[i].body.id;

            }
        }
        return -1;
    }

    moveActive(){

        for (var i = 0; i < passiveBubbles.length; i++) {

            //deklaration doppelt sich mit isSnapped().
            let bubblesDist = dist(passiveBubbles[i].posVector.x, passiveBubbles[i].posVector.y, this.posVector.x, this.posVector.y);

            var pull = Matter.Vector.sub(passiveBubbles[i].posVector, this.posVector);
            // Funktion für Anziehungskraft
            var pullFactor = map(bubblesDist, 0, this.r*3, 0.05, 0, true);

            pull = Matter.Vector.normalise(pull);
            pull = Matter.Vector.mult(pull, pullFactor);

            Body.applyForce(this.body, this.body.position, pull);
        }
    }
}

class PassiveBubble extends Bubble{

    constructor(x,y,r){
        super(x,y,r);
        this.origin = Matter.Vector.create(x,y);

        this.body.collisionFilter.mask = 0;

        // console.log(this.body.mass);
        // Body.setMass(this.body, 5);

        // Matter.Body.setStatic(this.body, true);

        //Add constraint to its own origin.
        var options = {
            bodyA: this.body,
            pointB: this.origin,
            stiffness: 0.02,
            damping: 0.1
        };
        var constraint = Constraint.create(options);
        Composite.add(engine.world, constraint);

    }

    nearActive(){
        //Is the center of activeBubble near this passiveBubble?
        let bubblesDist = dist(activeBubble.posVector.x, activeBubble.posVector.y, this.posVector.x, this.posVector.y);

        if(bubblesDist < activeBubble.r*10){
            return true;
        }
    }
    move(){

        let bubblesDist = dist(activeBubble.posVector.x, activeBubble.posVector.y, this.posVector.x, this.posVector.y);

    // Attraction passiveBubble --> activeBubble
        // Vektor zwischen Bubbles
        var attraction = Matter.Vector.sub(activeBubble.posVector, this.posVector);
        // Funktion für Anziehungskraft
        var attrFactor = map(bubblesDist, activeBubble.r*1, activeBubble.r*4, 0.08, 0, true);

        // Attraction umrechnen und anwenden.
        // console.log(bubblesDist, factor);
        attraction = Matter.Vector.normalise(attraction);
        attraction = Matter.Vector.mult(attraction, attrFactor);

        Body.applyForce(this.body, this.body.position, attraction);

        /* Migriert nach ActiveBubble.moveActive()
            var pull = Matter.Vector.sub(snappedBubble.posVector, this.posVector);
            // Funktion für Anziehungskraft
            var pullFactor = map(bubblesDist, 0, activeBubble.r*3, 0.04, 0, true);

            pull = Matter.Vector.normalise(pull);
            pull = Matter.Vector.mult(pull, pullFactor);

            Body.applyForce(activeBubble.body, activeBubble.body.position, pull);
        */

        // Nur eine Bubble zur zeit wird gesnappt.
        var snappedBubbleId = activeBubble.isSnapped();
        var snappedBubble;

        if (snappedBubbleId >= 0) {

            if (this.body.id == snappedBubbleId) {

                //Snap passiveBubble to activeBubble and counter activeBubble's force.
                Body.setPosition(this.body, activeBubble.posVector, false);

                Body.applyForce(activeBubble.body, activeBubble.body.position, Matter.Vector.mult(activeBubble.body.force, -1));
            }
        }

        if(bubblesDist < activeBubble.r*0.8){
        //Ersetzt durch isSnapped() und if-clause oben.
            // factor = map(bubblesDist, 0, activeBubble.r, 0.05, 0.1, true);

            // Body.setPosition(this.body, activeBubble.posVector, false);
            // Body.applyForce(activeBubble.body, activeBubble.body.position, Matter.Vector.mult(activeBubble.body.force, -1));
        }


    }

    showOrigin(){
        //for debugging
        ellipse(this.origin.x, this.origin.y, this.r*2);
    }
}
