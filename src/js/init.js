var height
var width
var canvasCircle
var ctxCircle
var canvasLine
var ctxLine
var savedCanvas;
var savedCtx;
var paused = false;

var p = {
    drawCircle: true,
    speed: 0.0046,
    radius: 162,
    distanceFromCenter: 269,
    circleNb: 4,
    subSpeed: 0.0173,
    subRadius: 150,
    fade: 0,
    opacity: 0.1
};

var circleArray = []
var subCircleArray = []


var gui = new dat.GUI();
const parametersFolder = gui.addFolder("Parameters")
const subCircleFolder = gui.addFolder("Sub Circles")
const lineFolder = gui.addFolder("Lines")

parametersFolder.add(p, 'speed', 0, 0.02).name("Speed").onChange(function() {
    circleArray.forEach(circle => {
        circle.setSpeed(p.speed);
    });
    clearLine();
})

parametersFolder.add(p, 'distanceFromCenter', 0, 1000).name("distanceFromCenter").onChange(function() {
    circleArray.forEach(circle => {
        circle.setDistance(p.distanceFromCenter);
    });
    center.radius = p.distanceFromCenter;
    clearLine();
})
parametersFolder.add(p, 'circleNb', 1, 10, 1).name("Circle NB").onChange(function() {
    init()
})

parametersFolder.add(p, 'drawCircle').name("Draw the circle")
var obj = { add: function() { clearLine() } };
var pausedButton = { add: function() { paused = !paused } };



subCircleFolder.add(p, 'subSpeed', 0, 0.05).name("Speed").onChange(function() {
    subCircleArray.forEach(circle => {
        circle.setSpeed(p.subSpeed);
    });
    clearLine()
})
subCircleFolder.add(p, 'subRadius', 0, 500).name("Radius").onChange(function() {
    init()
    clearLine()
})

lineFolder.add(p, 'fade', 0, 0.1, 0.001).name("Fade")
lineFolder.add(p, 'opacity', 0, 0.1).name("Opacity")
lineFolder.add(pausedButton, 'add').name("Pause");
lineFolder.add(obj, 'add').name("Clear");


gui.__folders["Parameters"].open()
gui.__folders["Sub Circles"].open()
gui.__folders["Lines"].open()




var stats;
var center

$(document).ready(function() {
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.left = '0px';
    stats.domElement.style.zIndex = '2';
    document.body.appendChild(stats.domElement);

    init();
    animate();
});



function init() {
    canvasCircle = document.getElementById('canvasCircle')
    ctxCircle = canvasCircle.getContext('2d')

    canvasLine = document.getElementById('canvasLine')
    ctxLine = canvasLine.getContext('2d')


    savedCanvas = document.createElement("canvas")
    savedCtx = savedCanvas.getContext("2d");

    width = window.innerWidth
    height = window.innerHeight

    canvasCircle.width = width
    canvasCircle.height = height
    canvasLine.width = width
    canvasLine.height = height
    savedCanvas.width = width
    savedCanvas.height = height

    ctxCircle.translate(width / 2, height / 2)
    ctxLine.translate(width / 2, height / 2)

    circleArray = []
    subCircleArray = []
    center = new Circle(0, 0, 0)
    center.radius = p.distanceFromCenter;

    for (let index = 0; index < p.circleNb; index++) {
        var circle = new Circle(0, 0, index);
        var subCircle = new Circle(0, 0, index);

        circle.rad = index * ((Math.PI * 2) / p.circleNb);
        subCircle.rad = index * ((Math.PI * 2) / p.circleNb);

        circleArray.push(circle);
        subCircleArray.push(subCircle);
    }


    circleArray.forEach(circle => {
        circle.setRadius(p.subRadius);
        circle.setDistance(p.distanceFromCenter);
        circle.setSpeed(p.speed);

    });

    subCircleArray.forEach(circle => {
        circle.setSpeed(p.subSpeed);
        circle.setDistance(p.subRadius);
    });

    clearLine()
}

function clearLine() {
    ctxLine.clearRect(-width / 2, -height / 2, width, height)
}

function animate() {
    if (!paused) {
        ctxCircle.clearRect(-width / 2, -height / 2, width, height)
        if (p.drawCircle)
            center.draw({ x: 0, y: 0 })


        circleUpdate()
        drawLine()
    }
    requestAnimationFrame(animate)
    stats.update();
}

function drawLine() {
    ctxLine.globalCompositeOperation = 'source-over'
    ctxLine.fillStyle = `rgba(31,31,31, ${p.fade})`
    ctxLine.fillRect(-width / 2, -height / 2, width, height)

    ctxLine.globalCompositeOperation = 'lighter'


    ctxLine.beginPath()
    ctxLine.strokeStyle = `rgba(255,255, 255, ${p.opacity})`
    for (let index = 1; index < subCircleArray.length; index++) {
        ctxLine.moveTo(subCircleArray[index - 1].x, subCircleArray[index - 1].y)
        ctxLine.lineTo(subCircleArray[index].x, subCircleArray[index].y)
    }

    ctxLine.lineTo(subCircleArray[0].x, subCircleArray[0].y)

    ctxLine.stroke()
    ctxLine.closePath()

}


function circleUpdate() {
    circleArray.forEach(circle => {
        circle.update({ x: 0, y: 0 })
        if (p.drawCircle)
            circle.draw({ x: 0, y: 0 })
    });

    subCircleArray.forEach(circle => {
        circle.update(circleArray[circle.index]);
        if (p.drawCircle)
            circle.draw(circleArray[circle.index]);
    });
}



class Circle {
    constructor(_x, _y, _index) {
        this.x = _x
        this.y = _y
        this.index = _index

        this.color = "rgba(255,255,255,0.5)"
        this.rad = 0
        this.radius = 0
        this.speed = 0
        this.distance = 0
    }
    draw(target) {
        ctxCircle.save()
        ctxCircle.strokeStyle = this.color
        ctxCircle.beginPath()
        ctxCircle.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctxCircle.stroke()
        ctxCircle.closePath()

        ctxCircle.fillStyle = "rgba(255,255,255,0.3)"
        ctxCircle.beginPath()
        ctxCircle.arc(this.x, this.y, 10, 0, Math.PI * 2)
        ctxCircle.fill()
        ctxCircle.closePath()

        ctxCircle.beginPath()
        ctxCircle.arc(this.x, this.y, 15, 0, Math.PI * 2)
        ctxCircle.stroke()
        ctxCircle.closePath()

        ctxCircle.beginPath()
        ctxCircle.moveTo(this.x, this.y);
        ctxCircle.lineTo(target.x, target.y)
        ctxCircle.stroke()
        ctxCircle.closePath()
        ctxCircle.restore()
    }
    setRadius(_radius) {
        this.radius = _radius
    }
    setDistance(_distance) {
        this.distance = _distance
    }
    setSpeed(_speed) {
        this.speed = _speed;
    }
    update(target) {
        this.rad += this.speed

        this.x = target.x + Math.cos(this.rad) * this.distance
        this.y = target.y + Math.sin(this.rad) * this.distance
    }
}

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function downloadImage() {
    savedCtx.fillStyle = "#242424"
    savedCtx.fillRect(0, 0, width, height)
    savedCtx.drawImage(canvasLine, 0, 0);
    //Draw arms if case checked
    if ($("#downloadWithArms")[0].checked)
        savedCtx.drawImage(canvasCircle, 0, 0);

    var savedImg = savedCanvas.toDataURL("image/png");


    let link = document.createElement('a');
    link.href = window.location.href = savedImg;
    link.download = 'image.jpg';
    link.click();
    document.removeChild(link)
}