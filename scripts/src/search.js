
var iqsElasticAdmin = angular.module('iqsElasticAdmin', ['elasticsearch']);

iqsElasticAdmin.service('client', function (esFactory) {
	  return esFactory({
	    host: 'igtestvm1.cloudapp.net:9200'
	  });
	});

function adminCtrl($scope, client) {

	var editor = ace.edit("editor");
	editor.setTheme("ace/theme/twilight");
	editor.getSession().setMode("ace/mode/json");

/*	function getIndexEntries(index, type) {
		client.search({
		  index: 'schemas',
		  type: 'schema',
		}).then(function (resp) {
			return resp.hits.hits;
		}, function (err) {

		}
	};*/

	/*$scope.getIndicies = function () {
		client.cat.indicies({
			local: false,
		}, function (err, response){
			console.log(response);
		});
	};*/

	$scope.fetch = function () {
		client.search({
		  index: 'schemas',
		  type: 'schema',
		}).then(function (resp) {
		  $scope.hits = resp.hits.hits;
		  $scope.selectItem = function(schema) {
		  	var session = editor.getSession();
		  	var view = session.setValue(JSON.stringify(schema, null, 2));
		  };
		}, function (err) {
		  console.trace(err.message);
		});
	};

	$scope.submitContent = function() {
		var session = editor.getSession();
	  	var value = session.getValue();
	  	var deserializedJson = angular.fromJson(value);
	  	var documentId = deserializedJson.id;
	  	console.log(documentId);

	  	client.index({
	  		index: 'schemas',
	  		type: 'schema',
	  		id: documentId,
	  		body: deserializedJson
	  	}, function (err, response) {
	  		if(err == undifined){
	  			alert("There was an error saving the document: \r"+ err.message);
	  		}
	  		alert("Response from server: \rindex: " + response._index + "\rtype: " + response._type + "\rid: " + response._id + "\rversion: " + response._version);
	  	});
	};
};

