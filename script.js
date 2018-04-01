CanvasRenderingContext2D.prototype.drawLine = drawLine;
CanvasRenderingContext2D.prototype.drawCircle = drawCircle;
CanvasRenderingContext2D.prototype.animateLine = animateLine;

var canvasWidth;
var transformedCanvasWidth;
var canvasHeight;

var addresses;
var diskSize;
var headStartPosition;
var selectedAlgorithm;

var oneMoveHeight;
var currentlyAnimating;

var graphDrawingSpeed;


window.onload = function () {

    graphDrawingSpeed= 50;

    var ctx = setupCanvas();



    document.getElementById("drawButton").addEventListener("click", function() {
        if(currentlyAnimating)
            return;

        getInput();
        // Save because of transformed coordinates
        ctx.save()
        // reset the transformation
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        ctx.restore()

        ctx.strokeStyle="#000000";
        ctx.fillStyle = "#000000";
        drawTopAxis(ctx);
        drawMemoryAddresses(ctx, addresses, headStartPosition);

        var result = applyAlgorithm(addresses, selectedAlgorithm);
        displayDistance(result.distance);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#2068A8';
        visualizeMemoryAccess(ctx, result.addresses);
    });

};

function setupCanvas() {
    var canvas = document.getElementById("myCanvas");

    canvas.style.width='100%';
    canvas.style.height='80%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    var ctx = canvas.getContext("2d");
    ctx.translate(10,0);
    canvasWidth = canvas.width;
    // The end of canvas shoul be in side the screen :)
    transformedCanvasWidth =canvasWidth - 30;
    canvasHeight = canvas.height;

    return ctx;
}

function getInput() {
        var addressInput = document.getElementById("addressInput").value;
        addresses = addressInput.split(',');

        for(var i = 0; i<addresses.length; i++) {
            addresses[i] = parseInt(addresses[i]);
        }

        diskSize = parseInt(document.getElementById("diskSizeInput").value);

        headStartPosition = document.getElementById("headStartPositionInput").value;

        var algorithmSelectInput = document.getElementById("algorithmSelectInput");
        selectedAlgorithm = algorithmSelectInput.options[algorithmSelectInput.selectedIndex].value;

        oneMoveHeight = Math.min(100, (canvasHeight - 350) / addresses.length);
}

function displayDistance(distance) {
    document.getElementById("distanceResult").innerText = distance;
}

function applyAlgorithm(addresses, algorithm) {
    switch(algorithm) {
        case("FCFS"):
            return FCFS(addresses);
            break;
        case("SSTF"):
            return SSTF(addresses);
            break;
        case("SCAN"):
            return SCAN(addresses);
            break;
        case("CSCAN"):
            return CSCAN(addresses);
            break;
        case("CLOOK"):
            return CLOOK(addresses);
            break;
    }
}


///////////////////////// Scheduling algorithms ////////////////////////////////

function FCFS(addresses) {
    var movedDistance = 0;
    var currentPosition = headStartPosition;
    addresses.forEach(function(element) {
        movedDistance += Math.abs(currentPosition - element);
        currentPosition = element;
    });
    return {
        addresses: addresses,
        distance: movedDistance
    };
}

function SSTF(addresses) {
    function findClosest(addresses, currentAddress) {
        var closest = Math.abs(currentAddress - addresses[0]);
        var closestIndex = 0;

        for (var i = 1; i < addresses.length; i++) {
            var distance = Math.abs(currentAddress - addresses[i]);
            if (distance < closest) {
                closest = distance;
                closestIndex = i;
            }
        }
        return closestIndex;
    }

    var result = [];
    var movedDistance = 0;
    var position = headStartPosition;

    while(addresses.length > 0) {
        var index = findClosest(addresses, position);
        var nextAddress = addresses.splice(index, 1);
        result.push(nextAddress);
        movedDistance += Math.abs(position - nextAddress);
        position = nextAddress;
    }

    return {
        addresses: result,
        distance: movedDistance
    };}

function SCAN(addresses) {
    addresses.push(0);
    addresses.sort(function(a,b) {
        return a - b;
    });

    var startIndex = 0;
    while(addresses[startIndex] < headStartPosition) {
        startIndex++;
    }
    startIndex--;

    var position = headStartPosition;
    var index = startIndex;

    var result = [];
    var movedDistance = 0;

    while(index >= 0) {
        result.push(addresses[index]);
        movedDistance += Math.abs(position - addresses[index]);
        position = addresses[index];
        index--;
    }

    index = startIndex+1;

    while(index < addresses.length) {
        result.push(addresses[index]);
        movedDistance += Math.abs(position - addresses[index]);
        position = addresses[index];
        index++;
    }

    return {
        addresses: result,
        distance: movedDistance
    };
}

function CSCAN(addresses) {
    addresses.sort(function(a,b) {
        return a - b;
    });

    var startIndex = 0;
    while(addresses[startIndex] < headStartPosition) {
        startIndex++;
    }

    var position = headStartPosition;
    var index = startIndex;

    var result = [];
    var movedDistance = 0;

    while(index < addresses.length) {
        result.push(addresses[index]);
        movedDistance += Math.abs(position - addresses[index]);
        position = addresses[index];
        index++;
    }

    if(position != diskSize)
        result.push(diskSize);
    result.push(0);

    movedDistance += diskSize + (diskSize - addresses[addresses.length - 1]);

    position = 0;
    index = 0;

    while(index < startIndex) {
        result.push(addresses[index]);
        movedDistance += Math.abs(position - addresses[index]);
        position = addresses[index];
        index++;
    }

    return {
        addresses: result,
        distance: movedDistance
    };
}

function CLOOK(addresses) {
    addresses.sort(function(a,b) {
        return a - b;
    });

    var startIndex = 0;
    while(addresses[startIndex] < headStartPosition) {
        startIndex++;
    }

    var position = headStartPosition;
    var index = startIndex;

    var result = [];
    var movedDistance = 0;

    while(index < addresses.length) {
        result.push(addresses[index]);
        movedDistance += Math.abs(position - addresses[index]);
        position = addresses[index];
        index++;
    }

    index = 0;

    while(index < startIndex) {
        result.push(addresses[index]);
        movedDistance += Math.abs(position - addresses[index]);
        position = addresses[index];
        index++;
    }

    return {
        addresses: result,
        distance: movedDistance
    };
}

///////////////////////////////////////////////////////////////////////////////

///////////////////////// Drawing functions ///////////////////////////////////

function animateLine(x1, y1, x2, y2, midX, midY, onDoneCallback) {

    var ctx = this;
    var tX = (x2-midX),
        tY = (y2-midY),
        dist = Math.sqrt(tX*tX + tY*tY),
        velX = (tX/dist)*graphDrawingSpeed,
        velY = (tY/dist)*graphDrawingSpeed,
        //current line end point
        startingX = midX,
        startingY = midY;

        // new segement end point
        midX += velX;
        midY +=velY;
    // Control that the segment doesnt go further, than the end point
    if((x1 < x2 && x2 > midX) || (x1 > x2 && x2 < midX)) {
          // draw the segement
          this.drawLine(startingX,startingY, midX,midY);

        requestAnimationFrame(function() {
            ctx.animateLine(x1, y1, x2, y2,midX,midY, onDoneCallback);
        });
    }

    else if(onDoneCallback){
      //Finish the line
      this.drawLine(x1,y1,x2,y2);
        onDoneCallback();
    }

}

function drawLine(x1, y1, x2, y2) {
    this.beginPath();
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    this.stroke();
}

function drawCircle(x, y, r) {
    this.beginPath();
    this.arc(x,y,r,0,2*Math.PI);
    this.fillStyle = '#ff9900';
    this.fill();
    this.stroke();
}

function drawTopAxis(ctx) {
    ctx.drawLine(0, 20, transformedCanvasWidth, 20);

    ctx.drawLine(0, 0, 0, 40);
    ctx.fillText("0", 0, 50);

    ctx.drawLine(transformedCanvasWidth, 0, transformedCanvasWidth, 40);
    ctx.fillText(diskSize, transformedCanvasWidth, 50);
}

function drawMemoryAddresses(ctx, addresses, startAddress) {
    addresses.forEach(function(address) {
        var x = getCanvasCoordinatesForAddress(address);
        ctx.drawLine(x, 10, x, 30);
        ctx.fillText(address, x-10, 40);
    });

    var x = getCanvasCoordinatesForAddress(startAddress);
    ctx.drawLine(x, 10, x, 30);
    ctx.fillText(startAddress, x-10, 40);
}

///////////////////////////////////////////////////////////////

function getCanvasCoordinatesForAddress(memoryAddress) {
    return (transformedCanvasWidth) * (memoryAddress / diskSize);
}
function visualizeMemoryAccess(ctx, addresses) {
    currentlyAnimating = true;
    var currentPosition = headStartPosition;
    var currentHeight = 100;

    ctx.drawCircle(getCanvasCoordinatesForAddress(currentPosition), currentHeight, 5);

    _visualizeMemoryAccess(ctx, addresses, currentPosition, currentHeight);
}

function _visualizeMemoryAccess(ctx, addresses, currentPosition, currentHeight) {
    if(!addresses) {
        currentlyAnimating = false;
        return;
    }
    if(addresses.length === 0) {
        currentlyAnimating = false;
        return;
    }

    var nextAddress = addresses.shift();
    var start = getCanvasCoordinatesForAddress(currentPosition);
    var end = getCanvasCoordinatesForAddress(nextAddress);

    // Where to start the new line, so it is not inside the circle
    var circleOffset =  ( (end - start) >= 0 ? 5 :-5);
    var newHeight = currentHeight + oneMoveHeight;//moveDistance * headMoveSpeed;
    ctx.animateLine(start + circleOffset, currentHeight, end, newHeight,start +circleOffset,currentHeight, function() {
        ctx.drawCircle(end, newHeight, 5);
        _visualizeMemoryAccess(ctx, addresses, nextAddress, newHeight);
    });
}
