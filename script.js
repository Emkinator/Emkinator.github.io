CanvasRenderingContext2D.prototype.drawLine = drawLine;
CanvasRenderingContext2D.prototype.drawCircle = drawCircle;
CanvasRenderingContext2D.prototype.animateLine = animateLine;

var canvasWidth;
var canvasHeight;

var diskSize;
var oneMoveHeight;
var headStartPosition;

window.onload = function () {
    var canvas = document.getElementById("myCanvas");
    
    canvas.style.width='100%';
    canvas.style.height='80%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    var ctx = canvas.getContext("2d");
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    var drawButton = document.getElementById("drawButton");
    drawButton.addEventListener("click", function() {    
        var addressInput = document.getElementById("addressInput").value;
        var addresses = addressInput.split(',');
		        
        diskSize = document.getElementById("diskSizeInput").value;
        
        headStartPosition = document.getElementById("headStartPositionInput").value;
		
        var algorithmSelectInput = document.getElementById("algorithmSelectInput");
        var algorithm = algorithmSelectInput.options[algorithmSelectInput.selectedIndex].value;
        
        
        oneMoveHeight = Math.min(100, (canvasHeight - 120) / addresses.length);

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);       

        drawTopAxis(ctx);
        drawMemoryAddresses(ctx, addresses);

        visualizeMemoryAccess(ctx, applyAlgorithm(addresses, algorithm));
    });

};

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

function FCFS(addresses) {
    return addresses;
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
    var position = headStartPosition;
    
    while(addresses.length > 0) {
        var index = findClosest(addresses, position);
        var nextAddress = addresses.splice(index, 1);
        result.push(nextAddress);
        position = nextAddress;
    }

    return result;
}

function SCAN(addresses) {
    return addresses;
}

function CSCAN(addresses) {
    return addresses;
}

function CLOOK(addresses) {
    return addresses;
}

function animateLine(x1, y1, x2, y2, onDoneCallback, ratio) {
    ratio = ratio || 0;
    endX = x1 + ratio * (x2-x1);
    endY = y1 + ratio * (y2-y1);

    var ctx = this;
    this.drawLine(x1,y1, endX,endY);
    if(ratio < 1) {
        requestAnimationFrame(function() {
            ctx.animateLine(x1, y1, x2, y2, onDoneCallback, ratio + 0.025);
        });
    }   
    else if(onDoneCallback)
        onDoneCallback();
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
    this.stroke();
}

function drawTopAxis(ctx) {
    ctx.drawLine(0, 20, canvasWidth, 20);
    
    ctx.drawLine(0, 0, 0, 40);    
    ctx.fillText("0", 0, 50);

    ctx.drawLine(canvasWidth, 0, canvasWidth, 40);
    ctx.fillText(diskSize, canvasWidth-20, 50);
}

function drawMemoryAddresses(ctx, addresses) {
    addresses.forEach(function(address) {
        var x = getCanvasCoordinatesForAddress(address);
        ctx.drawLine(x, 10, x, 30);
        ctx.fillText(address, x-10, 40);
    });
}

function getCanvasCoordinatesForAddress(memoryAddress) {
    return canvasWidth * (memoryAddress / diskSize);
}

function visualizeMemoryAccess(ctx, addresses) {
    var currentPosition = headStartPosition;
    var currentHeight = 100;
    
    ctx.drawCircle(getCanvasCoordinatesForAddress(currentPosition), currentHeight, 3);

    _visualizeMemoryAccess(ctx, addresses, currentPosition, currentHeight);
}

function _visualizeMemoryAccess(ctx, addresses, currentPosition, currentHeight) {
    if(!addresses)
        return;
    if(addresses.length === 0)
        return;
    
    var nextAddress = addresses.shift();
    var start = getCanvasCoordinatesForAddress(currentPosition);
    var end = getCanvasCoordinatesForAddress(nextAddress);

    
    var moveDistance = Math.abs(start - end);
    var newHeight = currentHeight + oneMoveHeight;//moveDistance * headMoveSpeed;
    ctx.animateLine(start, currentHeight, end, newHeight, function() {
        ctx.drawCircle(end, newHeight, 3);
        _visualizeMemoryAccess(ctx, addresses, nextAddress, newHeight);
    });
}


