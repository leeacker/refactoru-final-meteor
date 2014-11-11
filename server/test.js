var OperationHelper = Meteor.npmRequire('apac').OperationHelper;
var util = Meteor.npmRequire('util');
var AlchemyAPI = Meteor.npmRequire('alchemy-api');
var alchemy = new AlchemyAPI('');
var Future = Npm.require('fibers/future');


var opHelper = new OperationHelper({
    awsId:     '',
    awsSecret: '',
    assocId:   ''
    // xml2jsOptions: an extra, optional, parameter for if you want to pass additional options for the xml2js module. (see https://github.com/Leonidas-from-XIV/node-xml2js#options)
});



// alchemy.keywords('http://shelflife.meteor.com/books/harry potter and the prisoner of azkaban', {}, function(err, response) {
//   if (err) throw err;

//   // See http://www.alchemyapi.com/api/keyword/htmlc.html for format of returned object
//   var keywords = response.keywords;
//   console.log(keywords);
//   // Do something with data
// });
// alchemy.concepts('http://shelflife.meteor.com/books/harry potter and the prisoner of azkaban', {}, function(err, response) {
//   if (err) throw err;

//   // See http://www.alchemyapi.com/api/concept/htmlc.html for format of returned object
//   var concepts = response.concepts;
//   console.log(concepts);
//   // Do something with data
// });





opHelper.execute('ItemSearch', {
  'SearchIndex': 'Books',
  'Keywords': 'into the wild',
  'ResponseGroup': 'ItemAttributes, Reviews, Subjects'
}, function(results) { // you can add a second parameter here to examine the raw xml response
    // console.log(util.inspect(results.ItemSearchResponse, {depth: null}));
    // console.log(util.inspect(results.ItemSearchResponse.Items[0].Item[0].EditorialReviews[0].EditorialReview[0].Content, {depth: null}));
    var fut = new Future();
    fut.return(results.ItemSearchResponse.Items[0].Item[0].CustomerReviews[0].IFrameURL[0]);
    alchemy.sentiment(fut.wait(), {}, function(err, response) {
	  if (err) throw err;

	  // See http://www.alchemyapi.com/api/concept/htmlc.html for format of returned object
	  var concepts = response.docSentiment;
	  console.log(concepts);
	  // Do something with data
	});
});

// opHelper.execute('SimilarityLookup', {
//   'SearchIndex': 'Books',
//   'ItemId': '0545162076',
//   'ResponseGroup': 'Images'
// }, function(results) { // you can add a second parameter here to examine the raw xml response
//     console.log(util.inspect(results, {depth: null}));
// });
 // opHelper.execute('ItemSearch', {
	// 				  'SearchIndex': 'Books',
	// 				  'Keywords': 'the pelican brief',
	// 				  'ResponseGroup': 'ItemAttributes, EditorialReview'
	// 				}, Meteor.bindEnvironment(function(results){ 
	// 					console.log(results);
	// 					// var objectThings = {};
	// 					// objectThings.author = results.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Author[0];
	// 					// console.log('author', objectThings.author);
	// 					// objectThings.title = results.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Title[0];
	// 					// objectThings.amazonLink = results.ItemSearchResponse.Items[0].Item[0].ItemLinks[0].ItemLink[0].URL[0];
	// 					// objectThings.description = results.ItemSearchResponse.Items[0].Item[0].EditorialReviews[0].EditorialReview[0].Content;
		
	// 				    console.log(util.inspect(results.ItemSearchResponse.Items[0], {depth: null}));
		
	// 				    // console.log('object things: ', objectThings);
	// 				    // Books.insert(objectThings);
	// 				    // callback(null, objectThings);
					    
	// 				}));