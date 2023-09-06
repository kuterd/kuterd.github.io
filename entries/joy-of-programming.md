<style>
    button {
        color: black;
        background-color: #e0e0e0;
        border:1px solid black;
        border-radius: 5px;
        padding: 3px;
    }

    button:hover {
        background-color: #F0F0F0;
    }

    @media screen and (max-width: 500px) {
        .visualization-holder {
            width: 100% !important;
        }

        #canvas {
            width: 100%;
        }
    }


</style>

<script src="orbit.js"></script>
<div class="visualization-holder" style="margin: auto; display: block; width:500px;">
    <canvas id="canvas">Your browser sadly doesn't support canvas elements, sob sob</canvas>
    <p>
        <button onclick="load_k_scene()">Load 'K'</button>
        <button onclick="load_smile()">Load 'Smile'</button>
        <button onclick="load_orbiting()">Load 'Orbiting Planets'</button>
    </p>
    <p style="font-weight: bold">
        <span style="color:#a5a5a5; ">
        Very simple simulation of gravity that I made,
        </span>
        <span style="color: #7cf2f4; font-style: italic">
            Try clicking on the canvas and launching particles.
        </span>
    </p>
</div>

When I started programming it was just for my enjoyment, I would sometimes show stuff I made to my friends but I would make whatever I wanted. One of the things that I really enjoyed was making stuff with the HTML5 canvas. Over the years I made things ranging from a bouncing DVD logo to multi-player games. I realized that the more difficult a challenge was, it felt more rewarding at the end. This drove me to try get a deeper understanding of computers.

More than a decade has passed and as I transition to become a professional  I have to deal with home-works, Jira tickets, tasks, bugs etc and it can tiring sometimes.

But even after so many years whenever I create something I couldn't the day before, whenever I figure out something I couldn't understand before, it feels the same. I get the same joy from working on more complicated and theoretical projects such as compilers.

And there is still so many things to learn ... 

## How does the demo above work

The gravitational force between two objects is defined as:
$$F = G\frac{m_1m_2}{r^2}$$

Where \\(G\\) is the gravitational constant,\\(m_1\\) and \\(m_2\\) are the masses of the objects and \\(r\\) is the distance between the two objects.
The direction of the force for both objects is towards each other.

Essentially when we consider Newton's laws of motion what we get is a system of differential equations(The forces are dependent on the positions and the positions are dependent on the speed is which dependent on the forces). Such a system is not possible to solve analytically for \\(n\\) many objects.

I used Euler's method to get an approximate solution. There are better alternatives such as [Verlet-Integration](https://en.wikipedia.org/wiki/Verlet_integration) for this problem that give better approximations with the same step size, but since we are just having fun I didn't bother.

The code to calculate the net force on each object takes \\(O(n^2)\\) time however there are more efficient algorithms such as the [Barnes-Hut Approximation](https://en.wikipedia.org/wiki/Barnes%E2%80%93Hut_simulation) which partition the space and consider particles that are close to each other as a single particle. I didn't felt the need to implement such an algorithm since it runs fast enough on my computer :-) 
