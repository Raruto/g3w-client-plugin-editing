var inherit = g3wsdk.core.utils.inherit;
var base =  g3wsdk.core.utils.base;
//prendo il plugin service di core
var PluginService = g3wsdk.core.plugin.PluginService;
var CatalogLayersStoresRegistry = g3wsdk.core.catalog.CatalogLayersStoresRegistry;
var MapLayersStoreRegistry = g3wsdk.core.map.MapLayersStoreRegistry;
var LayersStore = g3wsdk.core.layer.LayersStore;
var Session = g3wsdk.core.editing.Session;
var ProjectsRegistry = g3wsdk.core.project.ProjectsRegistry;
var SessionsManager = g3wsdk.core.editing.SessionsManager;
var ToolBoxesFactory = require('./toolboxes/toolboxesfactory');

function EditingService() {

  var self = this;
  base(this);
  this._baseUrl = null;
  // proprietà che contiene i layer vettoriali
  this._sessions = {};
  // proprietà che contiene i controlli per l'editing
  this._toolboxes = [];
  // oggetto che contiene il legame tra layers (relazionei / dipendenze)
  this._dependencies = {};
  // layersStore del plugin editing
  this._layersstore = new LayersStore({
    id: 'editing'
  });
  this._editableLayers = {};
  // prendo tutti i layers del progetto corrente che si trovano
  // all'interno dei Layerstore del catalog registry con caratteristica editabili.
  // Mi verranno estratti tutti i layer editabili anche quelli presenti nell'albero del catalogo
  // come per esempio il caso di layers relazionati
  this.layers = CatalogLayersStoresRegistry.getLayers({
    EDITABLE: true
  });
  this.init = function(config) {
    var currentProject = ProjectsRegistry.getCurrentProject();
    console.log(currentProject.getType());
    //vado ad aggiungere il layersstore alla maplayerssotreregistry
    MapLayersStoreRegistry.addLayersStore(this._layersstore);
    // vado a settare l'url di editing aggiungendo l'id del
    // progetto essendo editing api generale
    //config.baseurl = config.baseurl + this.project.getId() + '/';
    this.config = config;
    var editableLayer;
    var editor;
    var layerDependencies;
    var layerId;
    // base layer url per l'eeditng
    this._baseUrl = config.baseurl;
    //ciclo su ogni layer editiabile
    var editingUrl;
    _.forEach(this.layers, function(layer) {
      layerId = layer.getId();
      //vado a vedere se il layer ha altri layer dipendenti per l'editing
      layerDependencies = layer.getRelations();
      // vado a chiamare la funzione che mi permette di
      // estrarre la versione vettoriale del layer di partenza
      editableLayer = layer.getLayerForEditing();
      /*
      * composizione url editing api
      * la chimata /api/vector/<tipo di richiesta: data/editing/config>/<project_type>/<project_id>/<layer_id>
      * esempio /api/vector/config/qdjango/10/punti273849503023
      *
      */
      editingUrl = self._baseUrl + 'editing/'+ currentProject.getType() + '/' + currentProject.getId() + '/' + layerId + '/';
      // vado a settare il dataUrl
      editableLayer.setDataUrl(self._baseUrl);
      // vado ad aggiungere ai layer editabili
      self._editableLayers[layerId] = editableLayer;
      //aggiungo il layer al layersstore
      self._layersstore.addLayer(editableLayer);
      // aggiungo all'array dei vectorlayers se per caso mi servisse
      self._sessions[layer.getId()] = null;
      // estraggo l'editor
      editor = editableLayer.getEditor();
      // qui
      // vado ad aggiungere un nuovo toolbox passandogli l'editor (e quindi il layer associato)
      self.addToolBox(editor);
    });
    //FAKE
    //CREO UN FAKE DI DIPENDENZA TRA I DUE LAYER (l'id del layer è quello del toolbox)
    this._dependencies['comuni20170629104534275'] = ['ferrovia_firenze20170724115017180'];
  };
}

inherit(EditingService, PluginService);

var proto = EditingService.prototype;

//funzione che server per aggiungere un editor
proto.addToolBox = function(editor) {
  // la toolboxes costruirà il toolboxex adatto per quel layer
  // assegnadogli le icone dei bottonii etc ..
  var toolbox = ToolBoxesFactory.build(editor);
  this._toolboxes.push(toolbox);
  // vado ad aggiungere la sessione
  this._sessions[toolbox.getId()] = toolbox.getSession();
};

proto.getToolBoxes = function() {
  return this._toolboxes;
};

proto.getVectorLayers = function() {
  return this._vectorLayers;
};

proto._cancelOrSave = function(){
  return resolve();
};

proto._stopEditing = function(){

};

proto.stop = function() {
  // vado a chiamare lo stop di ogni toolbox
  _.forEach(this._toolboxes, function(toolbox) {
      toolbox.stop();
  });
  this._stopEditing();
};

proto.saveDependencies = function(layer, uniqueId) {
  //console.log(layer, uniqueId);
  var layerId = layer.get('id');
  var dependencies = this.getDependencies(layerId);
  _.forEach(dependencies, function(dep) {
    //TODO
  })
};

proto.applyChangesDependencies = function(id, changes) {
  var self = this;
  var dependencies = this.getDependencies(id);
  var session;
  _.forEach(dependencies, function(dependecy) {
    session = self._sessions[dependecy].applyChanges(changes[dependecy], true);
  })
};

// fa lo start di tutte le dipendenze del layer legato alla toolbox che si è avviato
proto.startEditingDependencies = function(id, options) {
  //console.log(id);
  var self = this;
  var d = $.Deferred();
  //magari le options lo posso usare per passare il tipo di filtro da passare
  // allo start della sessione
  options = options || options;
  // vado a recuperare le dependencies di quel paricolare layer/toolbox
  var dependencies = this.getDependencies(id);
  // se ci sono
  if (dependencies) {
    /*
    * qui andrò a verificare se stata istanziata la sessione altrimenti vienne creata
    * se la sessione è attiva altrimenti viene attivata
    * */
    //cerco prima tra i toolbox se presente
    var session;
    // cliclo sulle dipendenze create
    _.forEach(dependencies, function(dependency) {
      session = self._sessions[dependency];
      //verifico che ci sia la sessione
      if (session)
        if (!session.isStarted()) {
          // faccio partire la sessione
          session.start(options);
        } else {
          // altrimenti recupero le features secondo quell'opzione
          session.getFeatures(options);
        }
      else {
        // altrimenti per quel layer la devo instanziare
        var layer = self._layersstore.getLayerById(dependency);
        var editor = layer.getEditor();
        session = new Session({
          editor: editor
        });
        self._sessions[dependency] = session;
        session.start();
      }
    })
  }
  return d.promise();
};

proto.getDependencies = function(id) {
  //TODO qui passo le sessioni dei layer dipendenti
  //console.log(this._dependencies[id]);
 return this._dependencies[id];
};


module.exports = new EditingService;