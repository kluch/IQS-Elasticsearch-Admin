var editor = ace.edit("editor");
editor.setTheme("ace/theme/twilight");
editor.getSession().setMode("ace/mode/javascript");

var iqsElasticAdmin = angular.module('iqsElasticAdmin', ['elasticsearch']);

iqsElasticAdmin.service('client', function (esFactory) {
	  return esFactory({
	    host: 'igtestvm1.cloudapp.net:9200'
	  });
	});

function getSchemasCtrl($scope, client) {
	$scope.fetch = function () {
			client.search({
		  index: 'schemas',
		  type: 'schema',
		}).then(function (resp) {
		  $scope.hits = resp.hits.hits;
		  console.log($scope.hits);
		  $scope.selectItem = function(a) {
		  	console.log(a);
		  	editor.setValue(a);
		  };
		}, function (err) {
		  console.trace(err.message);
		});
	};
};