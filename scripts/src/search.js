
var iqsElasticAdmin = angular.module('iqsElasticAdmin', ['elasticsearch']);

iqsElasticAdmin.service('client', function (esFactory) {
	  return esFactory({
	    host: 'igtestvm1.cloudapp.net:9200'
	  });
	});

function adminCtrl($scope, client) {
	var selectedIndex, 
		selectedItemTypeName, 
		selectedItemId,
		documentCount;

	var editor = ace.edit("editor");
	editor.setTheme("ace/theme/twilight");
	editor.getSession().setMode("ace/mode/json");

	getIndicies();

  	$scope.selectedItem = "Indicies";
	  
  	$scope.OnItemClick = function(event, name) {
  		console.log(name);
	    $scope.selectedItem = event;
	    
	};

	function getIndicies (){
		//Indicies scope Variable
		$scope.indicies = [];
		//Query to return indicies
		client.cat.indices({
			local: false
			}, function (err, response){
				if(typeof(response) === "string"){
					var res = response.match(/(yellow|red|green) [a-z\.]*/g);
					for(var i = 0; i < res.length; i ++){
					var item = res[i].split(" ");
					$scope.indicies.push({name:item[1], status:item[0]});
				}
			}
		});
	}

	//Get a document By Id
	function getDocumentById (indexName, docId){
		console.log(indexName);
		console.log(docId);
		client.get({
		  index: indexName,
		  id: docId
		}).then(function (resp) {
			console.log(resp);
			if(resp.hits.total === 0){
				$scope.hits = [
					{
						"_id": "No Document Found with id: " + $scope.inputId,
						"_type": "N/A"
					}
				]
			} else {
				$scope.result = resp;
				$scope.hits = resp.hits.hits;
				console.log(resp);	
			}
		}, function (err) {
			console.log(err);
		})
	}

	//Get the content of the Ace code editor
	function getEditorContent (){

	}

	//Set the content of the Ace code editor
	function setEditorContent (jsonDocument){
		var session = editor.getSession();
	  	var view = session.setValue(JSON.stringify(jsonDocument, null, 2));
	}

	function deleteIndexEntry(indexName, typeName, itemId){
		client.delete({
			index: indexName,
			type: typeName,
			id: itemId
		}).then(function (resp) {
			console.log(resp);
		}, function(err) {

		})
	};

	//Get items in an index
	function getIndexEntries(indexName) {
		var hits;
		selectedIndex = indexName;
		client.search({
		  index: indexName
		}).then(function (resp) {
			$scope.result = resp;
			$scope.hits = resp.hits.hits;
			console.log(resp);
		}, function (err) {

		})
	};

	//Get all items within an index
	$scope.fetchIndexItems = function (index) {
		getIndexEntries(index.name);
	};

	//View the content of a document
	$scope.selectItem = function (hit){
		selectedItemTypeName = hit._type;
		selectedItemId = hit._id;
		setEditorContent(hit._source);
	};

	$scope.getById = function (docId) {
		console.log("the button has nbeen clicked")
		$(".dropdown-menu li a").click(function(){
		  	var selectedIndex = $(this).text();
		  	console.log(selectedIndex);
		  	 getDocumentById(docId, selectedIndex);
		});
		
	};

	//Delete an item from an index
	$scope.deleteItem = function(hit){
		alert("You are about to delete a document, are you sure you want to do this?");
		alert("Are you really sure, please check");
		deleteIndexEntry(hit._index, hit._type, hit._id);

		getIndicies();

  		getIndexEntries(hit._index);
	}

	$scope.submitContent = function() {
		var session = editor.getSession();
	  	var value = session.getValue();
	  	var deserializedJson = angular.fromJson(value);
	  	client.index({
	  		index: selectedIndex,
	  		type: selectedItemTypeName,
	  		id: selectedItemId,
	  		body: deserializedJson
	  	}, function (err, response) {
	  		if(err === "undifined"){

	  			alert("There was an error saving the document: \r"+ err.message);
	  		}
	  		console.log(response);

	  		alert("Response from server: \rindex: " + response._index + "\rtype: " + response._type + "\rid: " + response._id + "\rversion: " + response._version);

			getIndicies();

	  		getIndexEntries(selectedIndex);
	  	});
	};
};

