
// browser-sync start --server -f -w


// p5.disableFriendlyErrors = true; // Improves performance?

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

var origin;
var active = false;
var activationThreshold = 50;

var frameCounter = 0;
var fps;

function preload(){
    bgImg = loadImage('img/bg-light-s.jpg');
    bgOverlay = loadImage('img/bg-dark-s.jpg');

    // originalAppImg = loadImage("img/app-icon-blau.png");
    // originalIconActive = loadImage('img/icons/icon-active-rect.png');
    originalIconActive = loadImage('img/icons/icon-active-rect.png');

    iconPhone12 = loadImage('img/icons/icon-phone-12.png');
    iconCloudNi = loadImage('img/icons/icon-cloud-ni.png');
    iconLaptop = loadImage('img/icons/icon-laptop.png');
    iconMac = loadImage('img/icons/icon-mac.png');
    iconPrinterHp = loadImage('img/icons/icon-printer-hp.png');
    iconTvUni = loadImage('img/icons/icon-tv-uni.png');

}

function setup() {

    // setup p5
    canvasWidth = 980;
    canvasHeight = 1871;

    colorMode(HSL);


    // canvasWidth = window.innerWidth;
    // canvasHeight = window.innerHeight;
    canvas = createCanvas(canvasWidth, canvasHeight);
    pixelDensity(1);



    //Create Background

    // background(bgImg);


    stroke(0,0);
    origin = createVector(118,1634);

    // setup matter.js
    engine.gravity.scale = 0;
    // engine.gravity.scale = 0.0001;
    Runner.run(runner, engine);

    //Create bounding walls around the canvas.
    wallLeft =   new Rectangle(-50,canvasHeight/2,100,canvasHeight);
    wallRight =  new Rectangle(canvasWidth+50,canvasHeight/2,100,canvasHeight);
    wallTop =    new Rectangle(canvasWidth/2,-50,canvasWidth,100);
    wallBottom = new Rectangle(canvasWidth/2, canvasHeight+50, canvasWidth, 100);
    walls = [];
    walls.push(wallLeft, wallRight, wallTop, wallBottom);
    //Show walls
    for (var i = 0; i < walls.length; i++) {
      walls[i].show();
    }





    // Setup passive (device) bubbles

    pbData = [
        {x:118, y:730, icon: icon=iconPhone12},
        {x:430, y:810, icon: icon=iconLaptop},
        {x:660, y:1020, icon: icon=iconMac},
        {x:810, y:1290, icon: icon=iconCloudNi},
        // {x:865, y:1634, icon: icon=iconPrinterHp},
        {x:865, y:1634, icon: icon=iconTvUni},

    ]
    // var pbRadius = 84;
    var pbRadius = 94;

    passiveBubbles = [];
    for (let i = 0; i < pbData.length; i++) {
        pb = new PassiveBubble(pbData[i].x, pbData[i].y, pbRadius, pbData[i].icon);
        passiveBubbles.push(pb);
    }

    // activeBubble = new ActiveBubble(origin.x, origin.y, 84);
    activeBubble = new ActiveBubble(origin.x, origin.y, 79);


}


function draw() {

    activeBubble.update();
    var a = map(activeBubble.originDist, activationThreshold, 150, 0, 1, true);

    //Background
    imageMode(CORNER);
    background(bgImg);
    tint(100, a);
    image(bgOverlay, 0,0);
    noTint();

    // filter(BLUR,1);

    // helper shapes
    // fill(10, 100, 50, 0.4);
    // ellipse(118, 1634, 1500, 1800);

    activeBubble.snapToOrigin();


    //Set activation state of the passiveBubbles
    // if (activeBubble.originDist > activationThreshold && !active) {
    //     active = true;
    // }else if (activeBubble.originDist <= activationThreshold && active) {
    //     active = false;
    // }

    //Initialize passiveBubble functions
    for (let i = 0; i < passiveBubbles.length; i++) {

        passiveBubbles[i].move();

    }

    for (var i = 0; i < passiveBubbles.length; i++) {
        if (passiveBubbles[i].active) {
            activeBubble.moveActive(); //Only apply attraction force when active.
            break;
        }
    }

    //Set layer order according to state.
    for (let i = 0; i < passiveBubbles.length; i++) {

        if (!passiveBubbles[i].active) {
            passiveBubbles[i].show();
        }
    }

    activeBubble.show();

    for (let i = 0; i < passiveBubbles.length; i++) {

        if (passiveBubbles[i].active) {
            passiveBubbles[i].show();
        }
    }



    // frameCounter++;
    // // Draw FPS (rounded to 2 decimal places) at the bottom left of the screen
    // if (frameCounter == 1) {
    //
    //     fps = frameRate();
    //     frameCounter++;
    //
    // }else if (frameCounter > 15) {
    //     frameCounter = 0;
    // }
    // fill(255);
    // stroke(0,0);
    // textSize(20);
    // text("FPS: " + fps.toFixed(2), 10, 25);


}


class Rectangle{
    constructor(x,y,w,h){
        // console.log(x);
        this.w = w;
        this.h = h;
        this.body = Bodies.rectangle(x,y,this.w,this.h);
        this.pos = this.body.position;

        Matter.Body.setStatic(this.body, true);

        Composite.add(engine.world, this.body);

    }
    show(){
        fill(255, 0, 0);
        rectMode(CENTER);
        rect(this.pos.x,this.pos.y,this.w,this.h);
    }
}

class Bubble{

    originDist;

    constructor(x,y,r) {

        this.r = r;

        //create Matter.js body
        this.body = Bodies.circle(x, y, r);

        // this.body.frictionAir = 1;

        Composite.add(engine.world, this.body);

        this.posVector = this.body.position;


    }

    update(){
        this.originDist = dist(origin.x, origin.y, this.posVector.x, this.posVector.y);
    }

    contains(px,py){
        let d = dist(px, py, this.posVector.x, this.posVector.y);

        if(d < this.r){
          return true;
        }else{
          return false;
        }
    }



    show(){
        // fill(this.bgC);
        // stroke(this.strokeC);
        // strokeWeight(this.strokeW);
        // noStroke();
        fill(0,0);


        ellipse(this.posVector.x, this.posVector.y, this.r*2);
    }
}

class ActiveBubble extends Bubble{

    cornerRadius;

    constructor(x,y,r){
        super(x,y,r);

        // console.log(this.body.mass);
        // Body.setMass(this.body, 8);
        this.body.frictionAir = 0.07;
        this.body.restitution = 0.5;  //Elasticity

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

            if (bubblesDist < this.r*0.2 && !mouseIsPressed) {
            // if (bubblesDist <= 2) {
                // console.log(passiveBubbles[i].body.id);
                return passiveBubbles[i].body.id;

            }else if (bubblesDist < this.r*0.2) {
                //Reduziert "zappeln" wenn activeBubble nahe an pB gehalten wird.
                Body.applyForce(activeBubble.body, activeBubble.body.position, Matter.Vector.mult(activeBubble.body.force, -1));

                Body.applyForce(passiveBubbles[i].body, passiveBubbles[i].body.position, Matter.Vector.mult(passiveBubbles[i].body.force, -1));
            }
        }
        return -1;
    }

    moveActive(){
        //Bewegung activeBubble -> passiveBubble
        for (var i = 0; i < passiveBubbles.length; i++) {

            //deklaration doppelt sich mit isSnapped().
            // console.log(passiveBubbles[i].posVector);
            let bubblesDist = dist(passiveBubbles[i].posVector.x, passiveBubbles[i].posVector.y, this.posVector.x, this.posVector.y);

            var pull = Matter.Vector.sub(passiveBubbles[i].posVector, this.posVector);
            // Funktion für Anziehungskraft
            var pullFactor = map(bubblesDist, 0, this.r*4, 0.05, 0, true);

            pull = Matter.Vector.normalise(pull);
            pull = Matter.Vector.mult(pull, pullFactor);

            Body.applyForce(this.body, this.body.position, pull);
        }
    }


    snapToOrigin(){

        // Create Force vector
        var pull = Matter.Vector.sub(origin, this.posVector);
        // Funktion für Anziehungskraft
        var pullFactor = map(this.originDist, 0, this.r*3, 0.1, 0, true);

        pull = Matter.Vector.normalise(pull);
        pull = Matter.Vector.mult(pull, pullFactor);

        Body.applyForce(this.body, this.body.position, pull);

        //Snap activeBubble to origin and counter activeBubble's force.
        if (this.originDist < this.r*0.5) {
            Body.setPosition(this.body, origin, false);
            Body.applyForce(this.body, this.body.position, Matter.Vector.mult(this.body.force, -1));

        }
    }



    show(){
        super.show();

        // this.originDist = dist(this.posVector.x, this.posVector.y, origin.x, origin.y);
        this.cornerRadius = map(this.originDist, 0, 350, 34, 100, true);

        this.appIconMask = createGraphics(this.r*2, this.r*2);
        this.appIconMask.stroke(0,0);
        this.appIconMask.fill(255, 255);
        this.appIconMask.rectMode(CENTER);

        this.appIconMask.rect(this.r, this.r, this.r*2, this.r*2, this.cornerRadius);


        // if (this.originDist > activationThreshold) {
        //     this.circleMask.rect(this.r, this.r, this.r*2, this.r*2, 150);
        // }else{
        //
        // }
        // console.log(this.appImg);
        // console.log(this.originalAppImg);
        // console.log(this.appImg);

        // this.appImg = originalAppImg.get();
        this.appImg = originalIconActive.get();
        this.appImg.mask(this.appIconMask);
        this.appIconMask.remove();



        imageMode(CENTER);
        image(this.appImg, this.posVector.x, this.posVector.y);


    }

}

class PassiveBubble extends Bubble{

    activeBubbleDist;



    constructor(x,y,r,icon){
        super(origin.x,origin.y,r);
        this.icon = icon;

        this.active = false;
        this.loadingCounter = 0;

        Matter.Body.setStatic(this.body, true);

        this.targetPos = Matter.Vector.create(x,y);


    //Set Matter.js parameters
        // this.body.frictionAir = 0.3;
        this.body.frictionAir = 0.1;
        this.body.collisionFilter.mask = 0;

        // console.log(this.body.mass);
        // Body.setMass(this.body, 5);

        // Matter.Body.setStatic(this.body, true);

    }

    // activate(state){
    //
    //     // this.pbConstraintLength = dist(origin.x, origin.y, this.constraintPos.x, this.constraintPos.y);
    //     // this.originalConstraintLength = this.pbConstraintLength;
    //     if (state == true) {
    //
    //         // Composite.remove(engine.world, this.constraint);
    //         // var allConstraints = Composite.allConstraints(engine.world);
    //         // for (var i = 0; i < allConstraints.length; i++) {
    //         //     if (allConstraints[i].bodyA == this.body){
    //         //         Composite.remove(engine.world, allConstraints[i]);
    //         //     }
    //         // }
    //         if (this.constraint){
    //             Composite.remove(engine.world, this.constraint);
    //         }
    //
    //
    //         // this.body.position = this.targetPos;
    //         Matter.Body.setStatic(this.body, false);
    //         // Matter.Body.setPosition(this.body, this.targetPos);
    //         // Matter.Body.setVelocity(this.body, 0.01);
    //         // console.log(this.posVector);
    //         // console.log(this.body.position);
    //
    //
    //         // Add constraint to pb targetPos.
    //         var options = {
    //             bodyA: this.body,
    //             pointB: this.targetPos,
    //             length: 0,
    //             stiffness: 0.02,
    //             damping: 0.1
    //         };
    //         this.constraint = Constraint.create(options);
    //         this.constraintIdActive = this.constraint.id;
    //
    //         Composite.add(engine.world, this.constraint);
    //         // console.log(this.constraint);#
    //
    //
    //         // console.log("activate");
    //
    //     }else if (state == false) {
    //
    //         // this.posVector = origin;
    //         // console.log(this.constraint);
    //         if (this.constraint){
    //             Composite.remove(engine.world, this.constraint);
    //         }
    //
    //         var options = {
    //             bodyA: this.body,
    //             pointB: origin,
    //             length: 0,
    //             stiffness: 0.02,
    //             damping: 0.5
    //         };
    //         this.constraint = Constraint.create(options);
    //
    //         Composite.add(engine.world, this.constraint);
    //
    //         // Matter.Body.setPosition(this.body, origin);
    //         // Matter.Body.setStatic(this.body, true);
    //
    //         // //
    //         // Composite.remove(engine.world, this.constraint);
    //         // console.log("deactivate");
    //     }
    //     // console.log(Composite.allConstraints(engine.world));
    //
    // }

    move(){

        //Calc distance to activeBubble
        this.activeBubbleDist = dist(activeBubble.posVector.x, activeBubble.posVector.y, this.posVector.x, this.posVector.y);

        //Check for snapping
        var snappedBubbleId = activeBubble.isSnapped();

        //Set state depending on activeBubbleDist
        if (activeBubble.originDist > activationThreshold && !this.active) {
            this.active = true;
        }
        else if (activeBubble.originDist <= activationThreshold && this.active) {
            this.active = false;
        }

        //Set state depending on snapping
        if (snappedBubbleId >= 0 && this.body.id != snappedBubbleId) {
            this.active = false;
        }else if (snappedBubbleId == -1) {
            this.loadingCounter = 0;
        }

        // if (active == true) {
        if (this.active == true) {

        //+++ Handle pB position through contraint +++
            if (this.constraint){
                Composite.remove(engine.world, this.constraint);
            }

            Matter.Body.setStatic(this.body, false);

            // Add constraint to pb targetPos.
            var options = {
                bodyA: this.body,
                pointB: this.targetPos,
                length: 0,
                stiffness: 0.02,
                damping: 0.1
            };
            this.constraint = Constraint.create(options);
            this.constraintIdActive = this.constraint.id;

            Composite.add(engine.world, this.constraint);


        //+++ Attraction passiveBubble --> activeBubble +++
            // Vektor zwischen Bubbles
            var attraction = Matter.Vector.sub(activeBubble.posVector, this.posVector);
            // Funktion für Anziehungskraft
            // var attrFactor = map(this.activeBubbleDist, activeBubble.r*1, activeBubble.r*4, 0.08, 0, true);
            var attrFactor = map(this.activeBubbleDist, activeBubble.r*1, activeBubble.r*5, 0.4, 0, true);

            // Attraction umrechnen und anwenden.
            // console.log(bubblesDist, factor);
            attraction = Matter.Vector.normalise(attraction);
            attraction = Matter.Vector.mult(attraction, attrFactor);

            Body.applyForce(this.body, this.body.position, attraction);

        //+++ Snapping +++
            //Nur eine Bubble zur zeit wird gesnappt.
            if (snappedBubbleId >= 0) {

                if (this.body.id == snappedBubbleId) {

                    //Snap passiveBubble to activeBubble and counter both bubble's forces.
                    // Body.setPosition(this.body, activeBubble.posVector, false);
                    // Body.setPosition(activeBubble.body, this.body.position, false);
                    Body.setPosition(activeBubble.body, this.body.position, false);

                    Body.applyForce(activeBubble.body, activeBubble.body.position, Matter.Vector.mult(activeBubble.body.force, -1));


                    //+++ Loading animation +++
                        let counterMin = 25;
                        let delay = 25;
                        let loadingMax = 80;
                        let counterMax = loadingMax + 15;
                        if (this.loadingCounter < counterMax && this.loadingCounter > delay) {

                            let j = map(this.loadingCounter, delay, loadingMax, -HALF_PI, TWO_PI-HALF_PI, true);

                            // stroke(210, 98, 65, 100);
                            stroke(210, 100, 62, 100);
                            // stroke(0, 100, 62, 100);
                            // stroke(100, 100);
                            let weight = 6;

                            let offset = map(this.loadingCounter, loadingMax, counterMax, 0, -weight-12, true);


                            strokeWeight(weight);
                            arc(this.posVector.x, this.posVector.y, this.r*2 + weight + offset, this.r*2 + weight + offset, -HALF_PI, j);
                            stroke(0,0);
                        }else if (this.loadingCounter == counterMax) {
                            // snappedBubbleId = -1;
                            // this.active = false;
                            Body.setPosition(activeBubble.body, origin, false);
                        }

                        if (this.loadingCounter < counterMax) {
                            this.loadingCounter++;
                        }
                        // else{
                        //     this.loadingCounter = 99;
                        //
                        // }


                }
                // else{
                //     this.active = false;
                // }

                Body.applyForce(this.body, this.body.position, Matter.Vector.mult(this.body.force, -1));

            }

        }else if (this.active == false) {
        // }else if (active == false) {

            //+++ Handle pB position through contraint +++
            if (this.constraint){
                Composite.remove(engine.world, this.constraint);
            }

            var options = {
                bodyA: this.body,
                pointB: origin,
                length: 0,
                stiffness: 0.02,
                damping: 0.3
            };
            this.constraint = Constraint.create(options);

            Composite.add(engine.world, this.constraint);

        }

    }

    showOrigin(){
        //for debugging
        ellipse(this.constraintPos.x, this.constraintPos.y, this.r*2);
    }

    show(){
        super.show();



        this.originDist = dist(this.posVector.x, this.posVector.y, origin.x, origin.y);
        // console.log(this.originDist);

        var a = map(this.originDist, activationThreshold*1.5, 500, 0, 1, true);
        // console.log(a);


        imageMode(CENTER);
        // image(this.icon, this.posVector.x, this.posVector.y,  this.r*2, this.r*2);
        tint(100, a);
        image(this.icon, this.posVector.x, this.posVector.y,  this.r*2, this.r*2);
        noTint();

    }
}
