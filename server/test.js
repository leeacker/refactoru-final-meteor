// var OperationHelper = Meteor.npmRequire('apac').OperationHelper;
// var util = Meteor.npmRequire('util');

// var opHelper = new OperationHelper({
//     awsId:     'AKIAJSAGO3J4J6URKBGQ',
//     awsSecret: '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',
//     assocId:   ''
//     // xml2jsOptions: an extra, optional, parameter for if you want to pass additional options for the xml2js module. (see https://github.com/Leonidas-from-XIV/node-xml2js#options)
// });

// opHelper.execute('ItemSearch', {
//   'SearchIndex': 'Books',
//   'Keywords': 'harry potter',
//   'ResponseGroup': 'RelatedItems',
//   'RelationshipType': 'AuthorityTitle'
// }, function(results) { // you can add a second parameter here to examine the raw xml response
//     console.log(util.inspect(results.ItemSearchResponse.Items[0], {depth: null}));
// });

// opHelper.execute('SimilarityLookup', {
//   'SearchIndex': 'Books',
//   'ItemId': '0545162076',
//   'ResponseGroup': 'Images'
// }, function(results) { // you can add a second parameter here to examine the raw xml response
//     console.log(util.inspect(results, {depth: null}));
// });