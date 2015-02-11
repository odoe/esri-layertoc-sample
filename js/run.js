var pathRX = new RegExp(/\/[^\/]+$/);
var locationPath = location.pathname.replace(pathRX, '');

require({
  packages: [{
    name: 'widgets',
    location: locationPath + 'js/widgets'
  }]
});

require([
  'esri/config',
  'esri/map',
  'esri/layers/ArcGISDynamicMapServiceLayer',
  'widgets/layertoc',
  'dojo/domReady!'
], function(
  esriConfig,
  Map, ArcGISDynamicMapServiceLayer,
  LayerToc
) {

  esriConfig.defaults.io.proxyUrl = '/proxy/proxy.php';

  var url = 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer';

  var map = new Map('map', {
    center: [-118, 34.5],
    zoom: 8,
    basemap: 'topo'
  });

  var layer = new ArcGISDynamicMapServiceLayer(url, {
    id: 'census'
  });
  layer.title = 'Census';
  layer.setVisibleLayers([0,1,2,3]);

  map.on('layers-add-result', function() {
    var layerToc = new LayerToc({ map: map, layerIds: ['census'] });
  });

  map.addLayers([layer]);
});
