let G = 6.674;

let width = 450;
let height = 450;

function v_length(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

function v_normalize(v) {
   let l = v_length(v);

   return [v[0] / l, v[1] / l];
}

class Enviroment {
    constructor() {
        this.points = []
    }

    update(step_size) {
        // Step 1: Update speed. 
        for (let i = 0; i < this.points.length; i++) {
            let p_i = this.points[i];
            for (let j = i + 1; j < this.points.length; j++) {
                let p_j = this.points[j];
                let dx = p_i.x - p_j.x;
                let dy = p_i.y - p_j.y;
                let l2 = dx * dx + dy * dy;
                let dist = p_i.radius + p_j.radius;
                l2 = Math.max(l2, dist * dist);

                // Calculate force magnitude.
                let f = (p_i.mass + p_j.mass) / l2 * G;
                
                // Integrate force for p_j 
                let d_j = v_normalize([dx, dy]); 
                p_j.vx += d_j[0] * f / p_j.mass; 
                p_j.vy += d_j[1] * f / p_j.mass;

                // Integrate force for p_j 
                let d_i = v_normalize([p_j.x  - p_i.x, p_j.y  - p_i.y]); 
                p_i.vx += d_i[0] * f / p_i.mass; 
                p_i.vy += d_i[1] * f / p_i.mass;
            }
        }

        // Step 2: Update positions.
        for (var i = 0; i < this.points.length; i++) {
            let point = this.points[i];
            point.update_position(step_size);
        }
    }

    draw (ctx) {
        for (var i = 0; i < this.points.length; i++) {
            this.points[i].draw_trail(ctx);
        }

        for (var i = 0; i < this.points.length; i++) {
            this.points[i].draw(ctx);
        }
    }
};

class Point {
    constructor(x, y, vx, vy, mass, color="white", isFixed=false, radius=4) {
        this.color = color
        this.mass = mass
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.t = 0;
        this.history = []
        this.isFixed = isFixed;
        this.radius = radius;
    }
    
    update_position(step_size) {
        this.t += 1;

        if (this.isFixed)
            return;

        this.x += this.vx * step_size;
        this.y += this.vy * step_size;

        this.history.push([this.x, this.y]);


        if (this.history.length > 100) {
           this.history.splice(0, 1); 
        }
    }
    
    draw_trail (ctx) {
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        if (this.history.length != 0)
            ctx.moveTo(this.history[this.history.length - 1][0], this.history[this.history.length - 1][1]);
       
        for (let i = this.history.length - 1; i > 0; i--)
            ctx.lineTo(this.history[i][0], this.history[i][1]);

        ctx.stroke();
        ctx.closePath();
    }

    draw (ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    draw_future_trajectory(ctx, env) {
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        
        let x = this.x;
        let y = this.y;
        let vy = this.vy;
        let vx = this.vx;

        ctx.moveTo(x, y);
       
        for (let i = 0; i < 200; i++) {

            for (let j = 0; j < env.points.length; j++) {
                let p_j = env.points[j];
                let dx = x - p_j.x;
                let dy = y - p_j.y;
                let l2 = dx * dx + dy * dy;
                let dist = this.radius + p_j.radius;
                l2 = Math.max(l2, dist * dist);
                // Calculate force magnitude.
                let f = (this.mass + p_j.mass) / l2 * G;
                // Integrate force for p_j 
                let d_i = v_normalize([p_j.x  - x, p_j.y  - y]); 
                vx += d_i[0] * f / this.mass; 
                vy += d_i[1] * f / this.mass;
            }

            x += vx * 0.5;
            y += vy * 0.5;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.closePath();
    }

};


function random_color() {
    let r = Math.floor(Math.random() * 100 + 80);
    let g = Math.floor(Math.random() * 100 + 80);
    let b = Math.floor(Math.random() * 100 + 80);

    return "rgb(" + r + "," + g + "," + b + ")"
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("[Orbit] Initializing");
    let canvas = document.getElementById("canvas");
    canvas.width = width;
    canvas.height = height;
    
    let ctx = canvas.getContext("2d"); 
    let env = new Enviroment();
    
    let newPoint = null;
    let startOffset = null;
    
    canvas.addEventListener("mousedown", function (e) {
        let canvasOffsets = canvas.getBoundingClientRect();
        let x = e.clientX - canvasOffsets.left;
        let y = e.clientY - canvasOffsets.top;
        startOffset = [x, y];

        newPoint = new Point(x, y, 0, 0, 600, random_color());
    });

    canvas.addEventListener("mousemove", function (e) {
        if (newPoint == null)
            return;

        let canvasOffsets = canvas.getBoundingClientRect();
        let x = e.clientX - canvasOffsets.left;
        let y = e.clientY - canvasOffsets.top;

        let dx = startOffset[0] - x; 
        let dy = startOffset[1] - y;

        newPoint.vx = dx / 10;
        newPoint.vy = dy / 10;
    });

    canvas.addEventListener("mouseup", function(e) {
        if (newPoint == null)
            return;
        env.points.push(newPoint);
        newPoint = null;
    });

    function insert_arc(x, y, r, s, e, c) {
        let eg = e - s;
        let d = eg / c;
        for (let i = 0; i < c + 1; i++) {
            env.points.push(new Point(
                x - Math.cos(Math.PI / 180 * (i * d + s)) * r,
                y - Math.sin(Math.PI / 180 * (i * d + e)) * r,
                0,
                0,
                100,
                "white",
                isFixed = true,
                radius = 3,
            ));
        }
    }
    window.load_orbiting = function () {
        env.points = []
        env.points.push(
            new Point(
                width / 2,
                height / 2,
                0,
                0,
                10000,
                "white",
                isFixed = true
            )
        );
        env.points.push(
            new Point(
                width / 2 - 100,
                height / 2,
                0,
                3.5,
                100,
                random_color(),
            )
        );
        env.points.push(
            new Point(
                width / 2 + 100,
                height / 2,
                0,
                -3.5,
                100,
                random_color(),
            )
        );
        env.points.push(
            new Point(
                width / 2,
                height / 2 + 100,
                1.5,
                0,
                200,
                random_color(),
            )
        );
        env.points.push(
            new Point(
                width / 2,
                height / 2 - 100,
                -1.5,
                0,
                200,
                random_color(),
            )
        );


    };
    window.load_k_scene = function () {
        env.points = []
        for (let i = 0; i < 9; i++) {
            env.points.push(
                new Point(
                    width / 2 - 75,
                    height / 2 + 50 * i - 50 * 8 / 2,
                    0,
                    0,
                    100,
                    "white",
                    isFixed = true
                )
            );
        }

        for (let i = 1; i <= 6; i++) {
            env.points.push(
                new Point(
                    width / 2 + 30 * i - 75,
                    height / 2 - 30 * i,
                    Math.random() * 4, Math.random() * 4,
                    100,
                    "white",
                    isFixed = true
                )
           );
        }

        for (let i = 1; i <= 6; i++) {
            env.points.push(
                    new Point(
                            width / 2 + 30 * i - 75,
                            height / 2 + 30 * i, 0, 0, 100, "white", isFixed = true));
        }

        for (let i = 0; i < 5; i++) {
            env.points.push(
                new Point(
                    Math.random() * (width - 200) + 100,
                    Math.random() * (height - 200) + 100,
                    Math.random() * 3 - 1.5, Math.random() * 3 - 1.5,
                    500 + Math.random() * 100,
                    random_color()
                )
            );
        }
    };

    window.load_smile = function load_smile() {
        env.points = []
        let r = 70;
        let c = 9;
        let d = 180 / c;
        insert_arc(width / 2, height / 2, 100, 0, 180, 15);
        insert_arc(width / 2 - 40, height / 2 - 80, 20, 0, 360, 8);
        insert_arc(width / 2 + 40, height / 2 - 80, 20, 0, 360, 8);

        for (let i = 0; i < 5; i++) {
            env.points.push(
                new Point(
                    Math.random() * (width - 300) + 300 / 2,
                    Math.random() * (height - 300) + 300 / 2,
                    Math.random() * 4 - 2, Math.random() * 4 - 2,
                    1000 + Math.random() * 100,
                    random_color(),
                    false, 
                    3
                )
            );
        }
    };

    //load_k_scene();
    load_smile();
    setInterval(function () {
        ctx.fillStyle = "#121212";
        ctx.fillRect(0, 0, width, height);
        env.update(0.5);
        env.draw(ctx);
        
        if (newPoint) {
            newPoint.draw_future_trajectory(ctx, env);
            newPoint.draw(ctx);
        }

    }, 1000 / 120);

});
