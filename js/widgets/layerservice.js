define([
  'dojo/Deferred',
  'esri/request'
], function(
  Deferred,
  esriRequest
) {

  'use strict';

  var getLayers = function getLayers(url) {
    var def = new Deferred();
    esriRequest({
      url: url,
      content: { f: 'json' },
      handleAs: 'json'
    }).then(function(response) {
      def.resolve(response.layers);
    }, function(err) {
      def.reject(err);
    });
    return def.promise;
  };

  return getLayers;

});

