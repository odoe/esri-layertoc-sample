define([
  'dojo/_base/declare',
  'dojo/Deferred',
  'dojo/on',
  'dojo/topic',
  'dojo/query',
  'dojo/dom',
  'dojo/dom-attr',
  'put-selector',
  'dojo/dom-class',
  'dojo/Evented',
  'esri/lang',

  './layerservice',

  'dojox/lang/functional/curry',

  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./templates/layertoc.tpl.html'
], function(
  declare, Deferred, on, topic,
  query, dom, domAttr, put, domClass,
  Evented, esriLang,
  getLayers, curry,
  _WidgetBase, _TemplatedMixin,
  template
) {

  var labelName = curry(function(a, b) {
    if (b.label && b.label.length > 1) {
      return b.label;
    } else if (a.layerName && a.layerName.length) {
      return a.layerName;
    } else {
      return 'Layer Item';
    }
  });
  var sub = esriLang.substitute;
  var layertitle = '<span class="pull-right">${title}</span>';

  return declare([_WidgetBase, _TemplatedMixin, Evented], {
    templateString: template,

    postCreate: function() {
      var node = dom.byId('map_root');
      put(node, this.domNode);

      var map = this.get('map');
      var layerIds = this.get('layerIds');
      this.tocLayers = map.layerIds.map(function(x) {
        if (layerIds.indexOf(x) > -1) {
          return map.getLayer(x);
        } else {
          return false;
        }
      }).filter(function(a) { return a; });

      this.tocLayers.map(function(x) {
        var visible = x.visible ? 'glyphicon-ok' : 'glyphicon-ban-circle';
        var panel = put(this.tocInfo, 'div.panel.panel-default');
        var pheading = put(panel, 'div.panel-heading');
        var ptitle = put(pheading, 'h4.panel-title');
        put(
          ptitle,
          'span.glyphicon.' + visible +
            '.layer-item[data-layer-id=' + x.id + ']'
        );
        var node =
          put(ptitle,
              'span',
              { innerHTML: sub(x, layertitle) }
             );
        this._getDetails(x, node, panel);
      }.bind(this));

      var layerHandle = on(this.tocInfo, '.layer-item:click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        domClass.toggle(e.target, 'glyphicon-ok glyphicon-ban-circle');
        var id = domAttr.get(e.target, 'data-layer-id');
        var lyr = map.getLayer(id);
        lyr.setVisibility(!lyr.visible);
      });

      var itemHandle = on(this.tocInfo, '.sublayer-item:click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        domClass.toggle(e.target, 'glyphicon-ok glyphicon-ban-circle');
        var id = domAttr.get(e.target, 'data-layer-id');
        var subid = parseInt(domAttr.get(e.target, 'data-sublayer-id'));
        var lyr = map.getLayer(id);
        var lyrs = lyr.visibleLayers;
        var visibleLayers = [];
        if (lyrs.indexOf(subid) > -1) {
          visibleLayers = lyrs.filter(function(x) {
            return x !== subid;
          });
        } else {
          visibleLayers = lyrs.concat([subid]);
        }
        lyr.setVisibleLayers(visibleLayers);
      });

      this.own(layerHandle, itemHandle);

    },

    _getDetails: function(layer, node, panel) {
      if (!layer.url) { return; }
      var pbody = put(panel, 'div.panel-body');
      this._getLegend(layer, pbody);
    },

    _getLegend: function(layer, pbody) {
      var url = layer.url + '/legend';
      var id = layer.id;
      getLayers(url).then(function(layers) {
        var tbl = put(pbody, 'table.table');
        layers.map(function(a) {
          var lbl = labelName(a);
          var layerId;
          var hasLayerId = false;
          if (a.hasOwnProperty('layerId')) {
            hasLayerId = true;
            layerId = a.layerId;
          }
          a.legend.map(function(b) {
            var tr = put(tbl, 'tr');
            if (hasLayerId) {
              hasLayerId = false;
              var lyrCheck = put(
                'span.glyphicon.glyphicon-ok' +
                '.sublayer-item[data-layer-id=' + id + ']' +
                '.[data-sublayer-id=' + layerId + ']'
              );
              put(tr, 'td', lyrCheck);
            } else {
              put(tr, 'td');
            }
            var td1 = put(tr, 'td.layer-image');
            put(tr, 'td', {
              innerHTML: lbl(b)
            });
            put(td1, 'img', {
              src: 'data:image/png;base64,' + b.imageData
            });
          });
        });
      }, function(err) { console.debug('error in request', err); });
    }

  });

});

