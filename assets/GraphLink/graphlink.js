// Current state of the graph.
function Graph() {
  this.nodes = {}
  //NOTE: Consider removing this.
  this.edges = new Set();
  this.linkId = 0;
}


// Remove all links going out from \param node.
// This is used for updates.
Graph.prototype._removeNodeLinks = function(node_id) {
  var node = this.nodes[node_id];
  if (!node || !node.edges)
    return;
  var edges = this.edges;
  node.edges.forEach(function (edge) {
    edges.delete(edge);
  });
};


//FIXME: Cleanup
function GraphUpdate(msg) {
  this.msg = msg;
  this.updatedNodes = msg.updated_nodes;
  this.deletedNodes = msg.deleted_nodes;
  // Record the data from old nodes before applying the change.
  // This allow us to rollback the changes.
  this.oldNodes = [];
};

// Apply a update to the graph.
GraphUpdate.prototype.applyUpdate = function(graph) {
  // Sometimes nodes are deleted as a part of a update.
  // Keep the nodes for now, in case we want them back.
  var deletedNodes = {};

  this.deletedNodes.forEach(function (node) {
    if (node == "*") {
      deletedNodes = graph.nodes;
      graph.nodes = {};
      graph.edges = new Set();
    }
  });

  // There can be a edge to a node that doesn't exist yet.
  function getOrCreateNode(node_id) {
    var nodeObject = graph.nodes[node_id];
    if (nodeObject)
      return nodeObject;
    var deletedNode = deletedNodes[node_id];
    // Use the same object but reset the fields.
    // WebCola layout resets otherwise.
    if (deletedNode) {
      // If a deleted node is referenced it will be updated anyways.
      deletedNode["edges"] = [];
      graph.nodes[node_id] = deletedNode;
      return deletedNode;
    }
    nodeObject = graph.nodes[node_id] = {
      "height": 60, "width": 60, "node_id": node_id};
    return nodeObject;
  }

  this.updatedNodes.forEach(function (nodeUpdate) {
    var nodeObject = getOrCreateNode(nodeUpdate.node_id);
    // Edge update is optional.
    if (nodeUpdate.edges) {
      // Remove edges associated with this node.
      graph._removeNodeLinks(nodeUpdate.node_id);
      // Process edge data.
      var newEdgeList = [];
      nodeUpdate.edges.forEach(function(edge) {
        var edgeObject = getOrCreateNode(edge);
        newEdgeList.push({"id": String.toString(this.linkId++),
                         "source": nodeObject, "target": edgeObject});
      });

      nodeUpdate.edges = newEdgeList;
      nodeUpdate.edges.forEach(function(edge) {
        graph.edges.add(edge);
      });
    }
    // Apply the update to the node.
    Object.assign(nodeObject, nodeUpdate);

   //TODO: Record information for rollback.
  });
};

//TODO: Rollback
//Graph.prototype.revertUpdate = function(update) {

function State(svg) {
  this.graph = new Graph();
  // All graph updates
  this.states = [];
  this.currentState = -1;
  this.renderer = new Renderer(this.graph, svg);

  window.addEventListener("keydown", this.keydown.bind(this));
}

State.prototype.keydown = function(event) {
  console.log(event);
  if (event.keyCode == 39 && this.currentState != -1
      && this.currentState < this.states.length - 1) {
    console.log("next");
    this.currentState++;
    this.states[this.currentState].applyUpdate(this.graph);
    this._updateStateList();
    this.renderer.redraw();
  }
};

// Has to be called every time the state list changed.
State.prototype._updateStateList = function() {
  var currentState = this.currentState;
  console.log("Current state:" + currentState);
  var states = d3.select("#statelist-tab")
    .selectAll(".state")
    .data(this.states)

  states.enter()
    .append("div")
    .classed("state", true)
    .text(d => d.msg.state_name)
    .merge(states)
    .attr("style", function(d, i) {
      console.log(i);
      if (i == currentState)
        return "font-weight: bold";
      return "";
    });
};

State.prototype.addState = function(state) {
  this.states.push(state);
  if (this.states.length == 1) {
    this.currentState = 0;
    this.states[0].applyUpdate(this.graph);
    this.renderer.redraw();
  }
  this._updateStateList();
};

//FIXME:TMP vars
var linkDistance = 150;
var nodeRadius = 30;
var state = null;
var svg = null;

// We should probably seperate the layout and rendering.
function Renderer(graph, svg) {
  this.svg = svg;
  // Initialize WebCola.
  this.colaLayout = cola.d3adaptor(d3)
    .linkDistance(linkDistance)
   .avoidOverlaps(true);
  //this.colaLayout.start({centerGraph: false});

  // We want links to appear bellow nodes.
  // svg group object for drawing links between nodes.
  this.linkLayer = this.svg.append("g");
  // svg group object for drawing nodes.
  this.nodeLayer = this.svg.append("g");

  this.graph = graph;
 // this.redraw();
  this.colaLayout.on("tick", this.updatePositions.bind(this));

  this.nodeList = [];
};

Renderer.prototype.updatePositions = function() {
  //FIXME: +300 is to ensure that nodes don't appear outside of the screen. 
  this.linkSelection
    .attr("x1", d => d.source.x + 300)
    .attr("y1", d => d.source.y + 300)
    .attr("x2", d => d.target.x + 300)
    .attr("y2", d => d.target.y + 300)

  this.nodeSelection
    .attr("transform", d => "translate(" + (d.x + 300) + "," + (d.y + 300) + ")")
};

Renderer.prototype.nodeClick = function(node) {
  d3.select("#node-info-tab-button").dispatch("click");
  d3.select("#nodeinfo-tab").text(JSON.stringify(node.custom));
};

// Update/create nodes.
// Has to be called when new nodes are added.
Renderer.prototype.redraw = function () {
  // Workaround for a bug in WebCola
  // if the .nodes array is not the exact same, bad things happen.
  // https://github.com/tgdwyer/WebCola/issues/319
  this.nodeList.splice(0, this.nodeList.length);
  this.nodeList.push.apply(this.nodeList, Object.values(this.graph.nodes));

  var edgeList = Array.from(this.graph.edges);

  this.colaLayout
    .nodes(this.nodeList)
    .links(edgeList)
    .avoidOverlaps(true)
  this.colaLayout.start(0, 0, 0, 0, true, false);

  this.nodeSelection = this.nodeLayer
    .selectAll(".node")
    .data(this.nodeList)
  this.nodeSelection.exit().remove();

  var newNodes = this.nodeSelection
    .enter()
    .append("g")
    .attr("class", "node")
    .on("click", this.nodeClick.bind(this))
    .call(this.colaLayout.drag) // Allow nodes to be dragged.
  var nodeCircle = newNodes
    .append("circle") // Create <circle> objects.
    .attr("r", nodeRadius)
    .attr("id", function(d) { return d.node_id})

  this.nodeSelection = this.nodeSelection.merge(newNodes)
  this.nodeSelection.selectAll("circle")
    .style("fill", function(d) { return d.custom.color || "#000000"})

  newNodes
    .append("text")
    .style("text-anchor", "middle")
    .style("fill", "white")
    .style("stroke", "black")
    .style("stroke-width", "0.5")
    .text(d => d.label)

  this.linkSelection = this.linkLayer.selectAll(".link")
    .data(edgeList);
  this.linkSelection.exit().remove();

  var newEdges = this.linkSelection.enter()
    .append("line")
    .attr("class","link")
    .style("stroke", "gray")
    .style("stroke-width", "3")

  this.linkSelection = this.linkSelection.merge(newEdges);

};

function resize() {
// 250px for left pane
  svg
    .attr("width", window.innerWidth - 250)
    .attr("height", window.innerHeight);
  console.log("resize");
}

function main() {
  svg = d3.select("svg")
  // var renderer = new Renderer();
  // Responsive size.
  resize();
  document.addEventListener("resize", resize);

  var zoom = d3.zoom()
    .scaleExtent([0.1, 1000])
    .on("zoom",  function () {
      svg.attr("transform", d3.event.transform);
    });
  svg = svg.call(zoom).append("g");

  // Initial transformation.
  // NOTE: Maybe calculate a bounding box of the graph
  // and set the zoom accordingly ?
  //zoom.translateBy(svg, 300, 300);
}


function handleMessage(msg) {
  console.log(msg);
  switch(msg.message_type) {
  case "info":
    // Make use of the graph state
    state = new State(svg);
    break;
  case "graph_update":
    state.addState(new GraphUpdate(msg));
    break;
  }
}

function handleFile(file) {
  var text = file.text().then(function(text) {
    var data = JSON.parse(text);
    data.forEach(handleMessage);
  });
}

function initTabs() {
  var tabs = d3.selectAll(".tab");

  tabs.on("click", function(event) {
    tabs.classed("active", false);
    d3.select(this)
      .classed("active", true);
    d3.selectAll(".tab-window").style("display", "none");
    d3.select(d3.select(this).attr("data-tab")).style("display", "block");
  });
  d3.select(".tab.default").dispatch("click");
}


document.addEventListener("DOMContentLoaded", function () {
  initTabs();

  console.log("loaded");
  var fileInput = document.getElementById("file-input");
  fileInput.addEventListener("change", function(ev) {
    if (ev.target.files.length > 0)
      handleFile(event.target.files[0]);
  });
  main();
});

