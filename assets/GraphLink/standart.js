// Settings.
var StandartDrawingSettings = {
  linkDistance: 40,
  nodeRadius: 10
};

function Standart(drawingSettings) {
  // DOM selection.
  this.nodeSelection = null;
  this.linkSelection = null;
  this.drawingSettings = drawingSettings;
  this.nodes = [];
  this.links = [];
}
