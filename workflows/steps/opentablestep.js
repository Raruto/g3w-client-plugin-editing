const inherit = g3wsdk.core.utils.inherit;
const base =  g3wsdk.core.utils.base;
const t = g3wsdk.core.i18n.tPlugin;
const Step = g3wsdk.core.workflow.Step;
const OpenTableTask = require('./tasks/opentabletask');

//creato uno step per apriore il form
const OpenTableStep = function(options={}) {
  options.task = new OpenTableTask();
  options.help = "editing.steps.help.edit_table";
  base(this, options)
};

inherit(OpenTableStep, Step);

module.exports = OpenTableStep;
