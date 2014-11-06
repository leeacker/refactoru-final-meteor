var OperationHelper = Meteor.npmRequire('apac').OperationHelper;
var util = Meteor.npmRequire('util');

var opHelper = new OperationHelper({
    awsId:     'AKIAJSAGO3J4J6URKBGQ',
    awsSecret: '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',
    assocId:   ''
    // xml2jsOptions: an extra, optional, parameter for if you want to pass additional options for the xml2js module. (see https://github.com/Leonidas-from-XIV/node-xml2js#options)
});

// takes in search string and object target - enters image urls and ASIN to obj name
var createBookObj = function(query, callback){

	var objectThings = {};

	opHelper.execute('ItemSearch', {
		  'SearchIndex': 'Books',
		  'Keywords': query,
		  'ResponseGroup': 'Images'
		}, Meteor.bindEnvironment(function(results) { 
				    // console.log(util.inspect(results.ItemSearchResponse.Items[0].Item[0], {depth: null}));
				    // var bookInfo = util.inspect(results.ItemSearchResponse.Items[0].Item, {depth: null});
				   
				    objectThings.imgL = results.ItemSearchResponse.Items[0].Item[0].LargeImage[0].URL[0];
				    console.log('imgLarge: ', objectThings.imgL);
				    objectThings.imgS = results.ItemSearchResponse.Items[0].Item[0].SmallImage[0].URL[0];
				    console.log('imgSmall: ', objectThings.imgS);
				    objectThings.ASIN = results.ItemSearchResponse.Items[0].Item[0].ASIN[0];
				    console.log('ASIN: ', objectThings.ASIN);
		
		
				    opHelper.execute('ItemSearch', {
					  'SearchIndex': 'Books',
					  'Keywords': query,
					  'ResponseGroup': 'ItemAttributes'
					}, Meteor.bindEnvironment(function(results) { // you can add a second parameter here to examine the raw xml response
						objectThings.author = results.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Author[0];
						objectThings.title = results.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Title[0];
						objectThings.amazonLink = results.ItemSearchResponse.Items[0].Item[0].ItemLinks[0].ItemLink[0].URL[0];
		
					    console.log(util.inspect(results.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Author[0], {depth: null}));
		
					    console.log('object things: ', objectThings);
					    Books.insert(objectThings);
					    callback(null, objectThings);
					    
					}));
		}));	
};


var checkASIN = function(query, callback){
	console.log(arguments);
	opHelper.execute('ItemSearch', {
		  'SearchIndex': 'Books',
		  'Keywords': query,
		  'ResponseGroup': 'Images'
		}, function(results) { 
				    var thisASIN = results.ItemSearchResponse.Items[0].Item[0].ASIN[0];
				    console.log('ASIN: ', thisASIN);
				    callback(thisASIN);
			});
};



Meteor.methods({
	getBook: function(title, callback){

		checkASIN(title, Meteor.bindEnvironment(function(ASIN){
			console.log(ASIN);
			console.log(!(Books.findOne({"ASIN": ASIN})));
			if(!!(Books.findOne({ "ASIN": ASIN })) === false){
				// check(title, String);
				console.log('words: ',arguments);
				var query = title.toLowerCase();
				var objectThings = createBookObj(query, function(err, results){
				console.log('getBook objthings', results);
				Router.go('/books/profile/'+results.title);
				// callback(null, ASIN);
				});
			} else {
				console.log('that already exists!');
				var result = Books.findOne({ "ASIN": ASIN }, function(err, result){
					// callback(null, result);
					Router.go('/books/profile/'+results.title, {where: 'client'}); 
				});

				
			}
		}));
		
	}
});

