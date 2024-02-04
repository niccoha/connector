
// browser-sync start --server -f -w

// TODO:
// Bubble springt beim Drag mit dem Mittelpunkt zum Cursor.
// Wenn Touch/Mouse sich zu schnell bewegen, verliert Bubble touchMoved.

// let  bgImg;

// function preload() {
//   bgImg = loadImage("bg-small.png");
// }

function setup() {

    canvasWidth = 900;
    canvasHeight = 1400;
    createCanvas(canvasWidth, canvasHeight);
    // background(0);
    background(47, 158, 245);


    // bgImg.resize(canvasWidth, 0);
    // bgImg.filter(BLUR, 4);
    // background(bgImg, 0, 0);
    // image(bgImg, 0, 0);

    pb = new PassiveBubble(floor(random(80,700)), floor(random(80,100)), 30);
    // pb.setOrigin();

    passiveBubbles = [];
    passiveBubbles.push(pb);

    activeBubble = new ActiveBubble(410, 500, 40);
    // bubble = new Bubble(0,0, 80);

    activeTouchId = "";
    isMouseDrag = false;


}
function touchMoved(){

    // console.log(isMouseDrag);

    if (touches.length) {
        for (var i = 0; i < touches.length; i++) {

            if (touches[i].id == activeTouchId){

                activeBubble.follow(touches[i].x, touches[i].y);

                // activeBubble.move(touches[i].x, touches[i].y);

                // logText = ("bubble dragged. ID: " + touches[i].id);
                // text(logText, 20, 50);
                // textSize(20);
            }
        }
    }
    // else if(!touches.length && isMouseDrag) {
    //     activeBubble.followTouch(mouseX, mouseY);
    // }




    // logText = ("touchMoved");
    // text(logText, 20, 20);
    // textSize(20);

    //Check every active touch for touch on bubble and then call move with those coordinates.
    // for (var i = 0; i < touches.length; i++) {
    //
    //     if (activeBubble.contains(touches[i].x, touches[i].y)){
    //
    //         let inputPos = createVector(touches[i].x,touches[i].y);
    //         activeBubble.follow(inputPos);
    //
    //         // activeBubble.move(touches[i].x, touches[i].y);
    //
    //         // logText = ("bubble dragged. ID: " + touches[i].id);
    //         // text(logText, 20, 50);
    //         // textSize(20);
    //         return;
    //     }
    // }
}

function touchStarted(){

    isMouseDrag = false;

    if(touches.length){

        for (var i = 0; i < touches.length; i++) {

            if (activeBubble.contains(touches[i].x, touches[i].y)){

                activeTouchId = touches[i].id;
                activeBubble.getOffset(touches[i].x, touches[i].y);

                return;
            }
        }
    }
}

function mouseDragged(){
    if (isMouseDrag) {
        activeBubble.follow(mouseX, mouseY);
    }

}
function mousePressed(){
    if (activeBubble.contains(mouseX, mouseY)) {
        isMouseDrag = true;
        activeBubble.getOffset(mouseX, mouseY);
    }
}
function mouseReleased(){
    isMouseDrag = false;
}


function draw() {
    background(47, 158, 245);

    activeBubble.show(255,255,255);

    for (let i = 0; i < passiveBubbles.length; i++) {
        if(passiveBubbles[i].nearActive()){
            passiveBubbles[i].move();
        }
        passiveBubbles[i].show(50,255,100);
    }
}

class Bubble{

    // posVector = createVector(this.x, this.y);
    // posVector;

    constructor(x,y,r) {
        this.posVector = createVector(x, y);
        this.r = r;
    }

    // posVector(){
    //     let posV = createVector(this.x, this.y);
    //
    //     return posV;
    // }

    contains(px,py){
        let d = dist(px, py, this.posVector.x, this.posVector.y);
        // let d = dist(px, py, this.x, this.y);
        if(d < this.r){
            return true;
        }else{
            return false;
        }
    }

    // followOld(inputPos){
    //     // let mousePos = createVector(mouseX, mouseY);
    //
    //     let offset = p5.Vector.sub(inputPos, this.posVector);
    //     // let offset = p5.Vector.sub(this.posVector, inputPos);
    //
    //     // stroke(100);
    //     // line(this.posVector.x, this.posVector.y, offset.x, offset.y);
    //
    //     console.log("Offset:" + offset.x + " " + offset.y);
    //     console.log("Pos:" + this.posVector.x + " " + this.posVector.y);
    //
    //
    //     // this.posVector.add(p5.Vector.sub(inputPos, this.posVector).add(offset));
    //
    //
    //
    //     this.posVector.add(p5.Vector.sub(inputPos, this.posVector));
    //
    //
    //     //Define canvas-bounds as contraints for Bubble position.
    //     if (this.posVector.x > canvasWidth) {
    //         this.posVector.x = canvasWidth;
    //     }else if (this.posVector.x <= 0) {
    //         this.posVector.x = 0;
    //     }
    //
    //     if (this.posVector.y > canvasHeight) {
    //         this.posVector.y = canvasHeight;
    //     }else if (this.posVector.y <= 0) {
    //         this.posVector.y = 0;
    //     }
    //     // mousePos.sub(this.posVector);
    //     // var v = p5.Vector.sub(mousePos, this.posVector);
    //
    // }



    show(r,g,b){
        fill(r,g,b);
        // strokeWeight(4);
        // ellipse(this.x, this.y, this.r*2);
        ellipse(this.posVector.x, this.posVector.y, this.r*2);
        // ellipse(this.x, this.y, this.r*2);
    }

}

class ActiveBubble extends Bubble{

    offset = createVector(0,0);

    follow(x,y){

        let inputPos = createVector(x,y);

        this.posVector.add(p5.Vector.sub(inputPos, this.posVector).sub(this.offset));

        //Contrain Bubble position to canvas.
        this.posVector.x = constrain(this.posVector.x, 0, canvasWidth);

        this.posVector.y = constrain(this.posVector.y, 0, canvasHeight);

    }

    getOffset(x,y){
        let inputPos = createVector(x,y);
        this.offset = p5.Vector.sub(inputPos, this.posVector);
    }
}

class PassiveBubble extends Bubble{

    // originVector;
    //
    constructor(x,y,r){
        super(x,y,r);
        // this.originVector = createVector(x,y);
        this.vel = createVector();
    }

    nearActive(){

        let bubblesDist = dist(activeBubble.posVector.x, activeBubble.posVector.y, this.posVector.x, this.posVector.y);

        // let originDist = dist(this.posVector.x, this.posVector.y, this.originVector.x, this.originVector.y);

        // console.log(d);
        if(bubblesDist < activeBubble.r*4){
            return true;
        }
    }
    move(){

        //Beschleunigung zur activeBubble
        this.acc = p5.Vector.sub(activeBubble.posVector, this.posVector);
        // this.acc.setMag(5);
        this.acc.limit(4);

        this.vel.add(this.acc);
        this.vel.limit(2);

        this.posVector.add(this.acc);
        // this.posVector.add(p5.Vector.sub(activeBubble.posVector, this.posVector).limit(1));
    }
}
