var Layer = g3wsdk.core.layer.Layer;
var Geometry = g3wsdk.core.geometry.Geometry;

var Tool = require('./tool');
var ToolBox = require('./toolbox');

var GUI = g3wsdk.gui.GUI;

var AddFeatureWorkflow = require('../workflows/addfeatureworkflow');
var ModifyGeometryWorkflow = require('../workflows/modifygeometryworkflow');
var ModifyGeometryVertexWorkflow = require('../workflows/modifygeometryvertexworkflow');
var MoveGeometryWorkflow = require('../workflows/movegeometryworkflow');
var DeleteFeatureWorkflow = require('../workflows/deletefeatureworkflow');
var EditFeatureAttributesWorkflow = require('../workflows/editfeatureattributesworkflow');

// classe costruttrice di ToolBoxes
function EditorToolBoxesFactory() {
  this._mapService = GUI.getComponent('map').getService();
  // metodo adibito alla costruzione dell'Editor Control
  // e dei tasks associati
  this.build = function(editor) {
    // estraggo il layer dell'editor
    var layer = editor.getLayer();
    // estraggo il tipo di layer
    var layerType = layer.getType();
    var layerId = layer.getId();
    var olLayer = this._mapService.getLayerById(layerId);
    // array contenete tutti i tasks dell'editor control
    var tools = [];
    var color;
    switch (layerType) {
      // caso layer vettoriale
      case Layer.LayerTypes.VECTOR:
        var geometryType = layer.getGeometryType();
        switch (geometryType) {
          case Geometry.GeometryTypes.POINT:
          case Geometry.GeometryTypes.MULTIPOINT:
            tools = [
              new Tool({
                id: 'point_addfeature',
                name: "Inserisci feature",
                icon: "addPoint.png",
                layer: olLayer,
                op: AddFeatureWorkflow
              }),
              new Tool({
                id: 'point_movefeature',
                name: "Sposta feature",
                icon: "movePoint.png",
                layer: olLayer,
                op: MoveGeometryWorkflow
              }),
              new Tool({
                id: 'point_deletefeature',
                name: "Elimina feature",
                icon: "deletePoint.png",
                layer: olLayer,
                op: DeleteFeatureWorkflow
              }),
              new Tool({
                id: 'point_editattributes',
                name: "Modifica attributi",
                icon: "editAttributes.png",
                layer: olLayer,
                op: EditFeatureAttributesWorkflow
              })
            ];
            break;
          case Geometry.GeometryTypes.LINESTRING:
          case Geometry.GeometryTypes.MULTILINESTRING:
            tools = [
              new Tool({
                id: 'line_addfeature',
                name: "Inserisci feature",
                icon: "addLine.png",
                layer: olLayer,
                op: AddFeatureWorkflow
              }),
              new Tool({
                id: 'line_movevertex',
                name: "Modifica vertice",
                icon: "moveVertex.png",
                layer: olLayer,
                op: ModifyGeometryVertexWorkflow
              }),
              new Tool({
                id: 'line_deletefeature',
                name: "Elimina feature",
                icon: "deleteLine.png",
                layer: olLayer,
                op: DeleteFeatureWorkflow
              }),
              new Tool({
                id: 'line_editattributes',
                name: "Modifica attributi",
                icon: "editAttributes.png",
                layer: olLayer,
                op: EditFeatureAttributesWorkflow
              })
            ];
            break;
          case Geometry.GeometryTypes.POLYGON:
          case Geometry.GeometryTypes.MULTIPOLYGON:
            tools = [
              new Tool({
                id: 'polygon_addfeature',
                name: "Inserisci feature",
                icon: "AddPolygon.png",
                layer: olLayer,
                op: AddFeatureWorkflow
              }),
              new Tool({
                id: 'polygon_movefeature',
                name: "Muovi feature",
                icon: "MovePolygon.png",
                layer: olLayer,
                op: MoveGeometryWorkflow
              }),
              new Tool({
                id: 'polygon_movevertex',
                name: "Modifica vertice",
                icon: "moveVertex.png",
                layer: olLayer,
                op: ModifyGeometryVertexWorkflow
              }),
              new Tool({
                id: 'polygon_deletefeature',
                name: "Elimina feature",
                icon: "deleteLine.png",
                layer: olLayer,
                op: DeleteFeatureWorkflow
              }),
              new Tool({
                id: 'polygon_editattributes',
                name: "Modifica attributi",
                icon: "editAttributes.png",
                layer: olLayer,
                op: EditFeatureAttributesWorkflow
              })
            ];
            break;
        }
        break;
      // caso layer tabellare
      case Layer.LayerTypes.TABLE:
        color = 'blue';
        tools = [];
        break;
      default:
        tools = [];
        break;
    }

    return new ToolBox({
      id: layer.getId(),
      editor: editor,
      tools: tools,
      title: "Edit " + layer.getName()
    })
  };
}

module.exports = new EditorToolBoxesFactory;