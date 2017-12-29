let inherit = g3wsdk.core.utils.inherit;
let base =  g3wsdk.core.utils.base;
let GUI = g3wsdk.gui.GUI;
let EditingTask = require('./editingtask');

// oggetto che contiene tutte le timpologie di dialog, confirm etc ...
let Dialogs = {
  delete: {
    fnc: function(inputs) {
      let d = $.Deferred();
      GUI.dialog.confirm("Vuoi eliminare l'elemento selezionato?", function(result) {
        if (result)
          d.resolve(inputs);
        else
          d.reject(inputs);
      });
      return d.promise();
    }
  },
  commit: {
    fnc: function(inputs) {
      let d = $.Deferred();
      GUI.dialog.dialog({
        message: inputs.message,
        title: "Vuoi salvare definitivamente le modifiche " + inputs.layer.getName() + "?",
        buttons: {
          SAVE: {
            label: "Salva",
            className: "btn-success",
            callback: function () {
              d.resolve(inputs);
            }
          },
          CANCEL: {
            label: "Annulla",
            className: "btn-primary",
            callback: function () {
              d.reject();
            }
          }
        }
      });
      return d.promise()
    }
  }
};

function ConfirmTask(options) {
  let type = options.type || "default";
  this._dialog = Dialogs[type];
  base(this, options);
}

inherit(ConfirmTask, EditingTask);

let proto = ConfirmTask.prototype;

// metodo eseguito all'avvio del tool
proto.run = function(inputs, context) {
  console.log('Confirm Feature Task run ....');
  return this._dialog.fnc(inputs);
};

// metodo eseguito alla disattivazione del tool
proto.stop = function(){
  return true;
};



module.exports = ConfirmTask;
