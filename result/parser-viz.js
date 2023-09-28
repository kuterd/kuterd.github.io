

let BACKGROUND_COLOR = "#323147ff"
let NODE_RADIUS = 20;
let NODE_CHILD_DISTANCE = 15;

class Node {
    constructor (text) {
        this.children = [];

        // Current relative position (relative to parent).
        this.x = 0;
        this.y = 0;

        // Target relative position for interpolation.
        this.targetX = 0;
        this.targetY = 0;
        
        // Starting relative position.
        this.startX = 0;
        this.startY = 0;

        // Current absolute position, updated every draw call.
        this.absoluteX = 0;
        this.absoluteY = 0;
        
        // Text to display.
        this.text = text;
        
        // Total width of the subtree.
        this.subtreeWidth = 0;
    }

    draw(ctx, parentLocation) {
        let x = this.x + parentLocation[0];
        let y = this.y + parentLocation[1];
        
        this.absoluteX = x;
        this.absoluteY = y;

        ctx.lineWidth = 2.0;
        ctx.strokeStyle = "white";
        this.children.forEach(function (node) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + node.x, y + node.y);
            ctx.stroke();
        }.bind(this));


        ctx.fillStyle = "white";

        ctx.beginPath();
        ctx.arc(x, y, NODE_RADIUS + 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.beginPath();
        ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "20px sans";
        ctx.textBaseline='middle';

        // Scale down the text if needed.
        let m = ctx.measureText(this.text);
        let s = 1;
        ctx.save();
        if (m.width > NODE_RADIUS * 2) {
            s = (NODE_RADIUS * 2) / m.width;
            ctx.scale(s, s);
        }

        ctx.fillText(this.text, x / s, y / s);
        ctx.restore();
    }
    
    interpolate(n) {
        this.x = this.startX + (this.targetX - this.startX) * n;
        this.y = this.startY + (this.targetY - this.startY) * n;
    }

    interpolateSubtree(n) {
        this.interpolate(n);
        this.children.forEach(function (node, i) {
            node.interpolate(n);
            node.interpolateSubtree(n);
        });
    }

    skipAnimation() {
        this.interpolateSubtree(1);
    }

    collapseAnimation() {
        this.startX = this.x = 0;
        this.startY = this.y = 0;
        this.children.forEach(function (node, i) {
            node.collapseAnimation();
        });
    }

    // Calculate the relative positions of children.
    layout () {
        let width = 0, height = NODE_RADIUS * 2, x = 0;
        this.children.forEach(function (node, i) {
            if (node.children.length == 0) {
                // Handle leaf nodes.
                x = width + NODE_RADIUS;
                width += NODE_RADIUS * 2;
                height = Math.max(height, NODE_CHILD_DISTANCE + NODE_RADIUS * 2);
            } else {
                let l = node.layout();
                x = width + l[0] / 2;
                width += l[0];
                height = Math.max(height, l[1] + NODE_RADIUS * 2 + NODE_CHILD_DISTANCE);
            }

            if (i != 0) {
                width += NODE_CHILD_DISTANCE;
                x += NODE_CHILD_DISTANCE;
            }
            
            node.startX = node.x;
            node.startY = node.y;
            
            node.targetX = x;
            node.targetY = NODE_CHILD_DISTANCE + NODE_RADIUS * 2;
        }.bind(this));
        
        // Center the nodes around the middle.
        this.children.forEach(function (node) {
            node.targetX -= width / 2;
        });

        this.subtreeWidth = width;
        this.subtreeHeight = height;
        return [width, height];
    }

    drawSubtree(ctx, parentLocation) {
        this.draw(ctx, parentLocation);
        // Calculate the absolute position.
        let x = this.x + parentLocation[0];
        let y = this.y + parentLocation[1];

        this.children.forEach(function (node) {
            node.drawSubtree(ctx, [x, y]);
        }.bind(this));
    }
};


class Reader {
    constructor (text) {
        this.original_text = text;
        this.text = text;
        this.offset = 0;
    }

    skipRegex(regex) {
        let i = 0;
        while (i < this.text.length) {
            if (!regex.test(this.text[i]))
                break;
            i++;
        }
        let result = this.text.substring(0, i);
        this.offset += i;
        this.text = this.text.substring(i);
        return result;
    }

    skipWhitespace() {
        return this.skipRegex(/^[\n\t\r ]$/);
    }

    readInt() {
        return this.skipRegex(/^\d+$/);
    }
    
    char () {
        return this.text[0];
    }

    skipChar () {
        this.offset++;
        this.text = this.text.substring(1);
    }

    eof () {
        return this.text.length == 0;
    }
};


MAX_EXPRESSION_LEVEL = 3
OP_LEVELS = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2
};

let ANIMATION_DURATION = 500;

let canvas = null;
let ctx = null;
let roots = [];
let active_intervals = new Set();
let animation_running = false;

function animateTransition(root, time) {
    return new Promise(function (resolve) {
        root.layout();

        let i = 0, steps = 10;
        let intervalTime = time / (steps + 1);
        let interval = setInterval(function () {
            if (i == steps + 1)
                resolve();
            if (i >= steps + 1) {
                clearInterval(interval);
                active_intervals.delete(interval);
                return;
            }
            root.interpolateSubtree(i / steps);
            i++;
        }, intervalTime);
        active_intervals.add(interval);
    });
}

let CENTER_X = 250;
let CENTER_Y = 150;

async function parseExpression(reader, isLeft = false, currentLevel = 1) {
    reader.skipWhitespace();
    if (currentLevel == MAX_EXPRESSION_LEVEL) {
        if (reader.char() == '(') {
            reader.skipChar();
            let value = await parseExpression(reader, false);
            reader.skipChar();
            return value;
        }
        return new Node(reader.readInt());
    }

    let left = await parseExpression(reader, isLeft, currentLevel + 1);
    let leftFirst = true;
    while (!reader.eof()) {
        reader.skipWhitespace();
        let op = reader.char();

        if (OP_LEVELS[op] != currentLevel)
            break;
        reader.skipChar();
        let new_node = new Node(op);

        new_node.children = [left];
        let leftX = left.x;
        left.x = 0;
        left.y = 0;
        if (!isLeft) {
            if (roots.length == 0) {
                new_node.targetX = new_node.startX = new_node.x = CENTER_X;
                new_node.targetY = new_node.startY = new_node.y = CENTER_Y;
                roots = [new_node]; // inserting the first root. 
            } else {
                new_node.startY = new_node.y = new_node.targetY = CENTER_Y;
                if (roots.length > 1) {
                    let prev = roots[roots.length - 2];
                    // Compute subtree width.
                    left.layout()
                    new_node.layout();
                    // Ensure that roots do not collide by animating the new tree out of the way.
                    if (roots[roots.length - 1] == null) {
                        new_node.startX = new_node.x = new_node.startX =
                                    prev.x + prev.subtreeWidth / 2 + left.subtreeWidth;
                    } else {
                        new_node.startX = new_node.x = leftX;
                    }
                    new_node.targetX = prev.x + prev.subtreeWidth / 2 + new_node.subtreeWidth;
                     
                } else {
                    new_node.startX = new_node.targetX = new_node.x = CENTER_X;
                }
                roots[roots.length - 1] = new_node;
            }
            await animateTransition(new_node, ANIMATION_DURATION);
            // Reset root node interpolation.
            new_node.startX = new_node.x;
            new_node.startY = new_node.y;
        }
        
        roots.push(null);
        let right = await parseExpression(reader, false, currentLevel + 1);
        roots.pop();
    
        new_node.children = [left, right];

        if (right.children.length != 0) {
            right.startX = right.x = right.absoluteX - new_node.absoluteX;
            right.startY = right.y = right.absoluteY - new_node.absoluteY;
        } else {
            right.x = 0;
            right.y = 0;
        }
        leftFirst = false;
        left = new_node;

        let oldWidth = new_node.subtreeWidth;

       if (!isLeft && roots[roots.length - 1]) {
            if (roots.length > 1 && roots[roots.length - 1] == new_node) {
                new_node.layout();
                new_node.targetX += (new_node.subtreeWidth - oldWidth) / 2;
            }
            await animateTransition(roots[roots.length - 1], ANIMATION_DURATION);
       }
    }

    return left;
}

function later(delay) {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay);
    });
}

document.addEventListener("DOMContentLoaded", async function () { 
    let canvas = document.getElementById("canvas");
    canvas.width = 500;
    canvas.height = 500;
    let ctx = canvas.getContext("2d");
    let reader = null;

    // Smooth zoom.
    let targetScale = 1;
    let prevScale = 1;
    let currentScale = 1;
    let counter = 0;

    let ZOOM_DURATION = 100;
    setInterval(function () {
        // Clear the screen
        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.fillRect(0, 0, 500, 500);

        if (!animation_running) { 
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.font = "15px sans";
            ctx.textBaseline = "middle";
            ctx.fillText("Click the \"Parse !\" button to replay the very cool animation !", 250, 100);
        } 


        if (reader != null) {
            ctx.textAlign = "left";
            ctx.font = "20px sans";
            ctx.fillStyle = "white";
            
            // Scale down the text if needed.
            let m = ctx.measureText(reader.original_text);
            ctx.save();
            let s = 1.0;
            if (m.width > canvas.width - 20) {
                s = (canvas.width - 20) / m.width;
                ctx.scale(s, s);
            }
            let scaledWidth = m.width * s; 

            ctx.fillText(reader.original_text, 250 - scaledWidth / 2, 50);

            ctx.fillStyle = "green";
            ctx.fillText(reader.original_text.substring(0, reader.offset), 250 - scaledWidth / 2, 50);
            ctx.restore();
        }
        
        // Calculate the size of the forest.
        let minX = Number.MAX_VALUE;
        let totalWidth = 0;
        let totalHeight = 0;
        for (let i = 0; i < roots.length; i++) {            
            if (roots[i] != null) {
                minX = Math.min(minX, roots[i].x - roots[i].subtreeWidth / 2);
                totalWidth = Math.max(totalWidth, roots[i].x + roots[i].subtreeWidth / 2);
                totalHeight = Math.max(totalHeight, roots[i].y + roots[i].subtreeHeight);
            }
        }


        console.log(minX, totalWidth);
        ctx.save();

        let totWidthProcessed = totalWidth - minX;
        let usableWidth = 500;
        let zoomNeeded = false;
        if (totWidthProcessed > usableWidth - CENTER_X) {
            zoomNeeded = true;
            targetScale = (usableWidth - CENTER_X) / totWidthProcessed;
        }

        if (totalHeight > (usableWidth - CENTER_Y)) {
            zoomNeeded = true;
            let newTargetScale = (usableWidth - CENTER_Y) / totalHeight;
            targetScale = Math.min(targetScale, newTargetScale);
        }

        if (!zoomNeeded) {
            if (targetScale != currentScale && counter == 0)
                counter = ZOOM_DURATION;
            prevScale = currentScale;
        } else if (targetScale != currentScale) {
            console.log(targetScale);
            if (counter == 0)
                counter = ZOOM_DURATION;
            prevScale = currentScale;
        }


        if (counter != 0) {
            currentScale = prevScale + (targetScale - prevScale) * (1.0 - counter / ZOOM_DURATION);
            counter -= 1;
        } else {
            prevScale = targetScale;
        }
        let zoomDelta = (usableWidth - usableWidth * currentScale) / 2;
        ctx.translate(zoomDelta, zoomDelta);
        console.log(currentScale);
        ctx.scale(currentScale, currentScale);

        for (let i = 0; i < roots.length; i++) {
            if (roots[i] == null)
                continue;
            let root = roots[i];
            ctx.strokeStyle = "white";
            //ctx.strokeRect(root.x - root.subtreeWidth / 2, root.y, root.subtreeWidth, root.subtreeHeight);
            root.drawSubtree(ctx, [0, 0]);
        }
        ctx.strokeStyle = "green";
        //ctx.strokeRect(minX, roots[0].y, totalWidth, totalHeight - roots[0].y);

        ctx.restore();
    }, 1000 / 30);

    let inputElement = document.getElementById("expression-input");

    async function replay_animation() {
        animation_running = true;
        // Clear all active animations.
        active_intervals.forEach(function (interval) {
            clearInterval(interval);
        });

        roots = [];
        reader = new Reader(inputElement.value);
        await parseExpression(reader, 0);
        animation_running = false;
        
    }
    replay_animation(); 
    document.getElementById("parse-expression").addEventListener("click", replay_animation);

});
