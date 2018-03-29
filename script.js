CanvasRenderingContext2D.prototype.drawLine = drawLine;
CanvasRenderingContext2D.prototype.drawCircle = drawCircle;
CanvasRenderingContext2D.prototype.animateLine = animateLine;

var canvasWidth;
var canvasHeight;

var addresses;
var diskSize;
var headStartPosition;
var selectedAlgorithm;

var oneMoveHeight;
var currentlyAnimating;

window.onload = function () { 
    var ctx = setupCanvas();
    
    document.getElementById("drawButton").addEventListener("click", function() {    
        if(currentlyAnimating)
            return;
        
        getInput();
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);     
        
        ctx.strokeStyle="#000000";
        drawTopAxis(ctx);
        drawMemoryAddresses(ctx, addresses, headStartPosition);
        
        var result = applyAlgorithm(addresses, selectedAlgorithm);
        displayDistance(result.distance);
        
        ctx.strokeStyle="#0000FF";
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
    canvasWidth = canvas.width;
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
    return canvasWidth * (memoryAddress / diskSize);
}
function visualizeMemoryAccess(ctx, addresses) {
    currentlyAnimating = true;
    var currentPosition = headStartPosition;
    var currentHeight = 100;
    
    ctx.drawCircle(getCanvasCoordinatesForAddress(currentPosition), currentHeight, 3);

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
  
    var moveDistance = Math.abs(start - end);
    var newHeight = currentHeight + oneMoveHeight;//moveDistance * headMoveSpeed;
    ctx.animateLine(start, currentHeight, end, newHeight, function() {
        ctx.drawCircle(end, newHeight, 3);
        _visualizeMemoryAccess(ctx, addresses, nextAddress, newHeight);
    });
}


