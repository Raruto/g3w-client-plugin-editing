const inherit = g3wsdk.core.utils.inherit;
const base =  g3wsdk.core.utils.base;
const GUI = g3wsdk.gui.GUI;
const TableComponent = require('../../../table/vue/table');
const EditingTask = require('./editingtask');
const WorkflowsStack = g3wsdk.core.workflow.WorkflowsStack;

function OpenTableTask(options={}) {
  this._formIdPrefix = 'form_';
  base(this, options);
}

inherit(OpenTableTask, EditingTask);

const proto = OpenTableTask.prototype;

proto.run = function(inputs, context) {
  const d = $.Deferred();
  const originalLayer = inputs.layer;
  const layerName = originalLayer.getName();
  const headers = originalLayer.getEditingFields();
  this._isContentChild = WorkflowsStack.getLength() > 1;
  const foreignKeys = this._isContentChild ? context.excludeFields :  [];
  const exclude = this._isContentChild && context.exclude;
  const capabilities = originalLayer.getEditingCapabilities();
  const editingLayer = originalLayer.getEditingLayer();
  let features = editingLayer.readEditingFeatures();
  if (exclude && features.length) {
    const {values} = exclude;
    foreignKeys.forEach((foreignKey, index)=> {
      features = features.filter(feature => feature.get(foreignKey) != values[index]);
    })
  }
  const content = new TableComponent({
    title: `${layerName}`,
    features,
    promise: d,
    push: this._isContentChild,
    headers,
    context,
    inputs,
    capabilities,
    fatherValues: context.fatherValues,
    foreignKeys
  });
  GUI.showContent({
    content,
    push: this._isContentChild,
    showgoback: false,
    perc: 100,
    closable: false
  });
  this.disableSidebar(true);
  return d.promise();
};

proto._generateFormId = function(layerName) {
  return `${this._formIdPrefix}${layerName}`;
};

proto.stop = function() {
  this.disableSidebar(false);
  this._isContentChild ? GUI.popContent() : GUI.closeContent();
};

module.exports = OpenTableTask;

