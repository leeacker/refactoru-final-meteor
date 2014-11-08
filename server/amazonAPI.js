var OperationHelper = Meteor.npmRequire('apac').OperationHelper;
var util = Meteor.npmRequire('util');
var Future = Npm.require('fibers/future');

var opHelper = new OperationHelper({
    awsId:     'AKIAJSAGO3J4J6URKBGQ',
    awsSecret: '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',
    assocId:   ''
    // xml2jsOptions: an extra, optional, parameter for if you want to pass additional options for the xml2js module. (see https://github.com/Leonidas-from-XIV/node-xml2js#options)
});

// takes in search string and object target - enters image urls and ASIN to obj name
var createBookObj = function(query, callback){
	console.log('start createBookObj');
	var objectThings = {};

	opHelper.execute('ItemSearch', {
		  'SearchIndex': 'Books',
		  'Keywords': query,
		  'ItemPage': 1,
		  'ResponseGroup': 'Images, ItemAttributes, EditorialReview, Reviews, Subjects'
		}, Meteor.bindEnvironment(function(results) { 
				    // console.log(util.inspect(results.ItemSearchResponse.Items[0].Item[0], {depth: null}));
				    // var bookInfo = util.inspect(results.ItemSearchResponse.Items[0].Item, {depth: null});
				   
				    objectThings.imgL = results.ItemSearchResponse.Items[0].Item[0].LargeImage[0].URL[0];
				    console.log('imgLarge: ', objectThings.imgL);
				    objectThings.imgS = results.ItemSearchResponse.Items[0].Item[0].SmallImage[0].URL[0];
				    // console.log('imgSmall: ', objectThings.imgS);
				    objectThings.ASIN = results.ItemSearchResponse.Items[0].Item[0].ASIN[0];
				    // console.log('ASIN: ', objectThings.ASIN);
				    // 
				    objectThings.author = results.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Author[0];
						console.log('author', objectThings.author);
				    objectThings.title = results.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Title[0];
					objectThings.amazonLink = results.ItemSearchResponse.Items[0].Item[0].ItemLinks[0].ItemLink[0].URL[0];
					objectThings.description = results.ItemSearchResponse.Items[0].Item[0].EditorialReviews[0].EditorialReview[0].Content;
					objectThings.reviewURL = results.ItemSearchResponse.Items[0].Item[0].CustomerReviews[0].IFrameURL[0];
					objectThings.subjects = results.ItemSearchResponse.Items[0].Item[0].Subjects[0].Subject;
		
						Books.insert(objectThings);
					    callback(null, objectThings);

		}));	
};
var updateBookObj = function(id, query, callback){
	console.log('start updateBookObj');
	var book = Books.findOne({_id: id});

	opHelper.execute('ItemSearch', {
		  'SearchIndex': 'Books',
		  'Keywords': query,
		  'ItemPage': 1,
		  'ResponseGroup': 'Images, ItemAttributes, EditorialReview, Reviews, Subjects'
		}, Meteor.bindEnvironment(function(results) { 
				    
		    var imgL = results.ItemSearchResponse.Items[0].Item[0].LargeImage[0].URL[0];
		    var imgS = results.ItemSearchResponse.Items[0].Item[0].SmallImage[0].URL[0];
		    var ASIN = results.ItemSearchResponse.Items[0].Item[0].ASIN[0]; 
		    var author = results.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Author[0];
		    var title = results.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Title[0];
			var amazonLink = results.ItemSearchResponse.Items[0].Item[0].ItemLinks[0].ItemLink[0].URL[0];
			var description = results.ItemSearchResponse.Items[0].Item[0].EditorialReviews[0].EditorialReview[0].Content;
			var reviewURL = results.ItemSearchResponse.Items[0].Item[0].CustomerReviews[0].IFrameURL[0];
			var subjects = results.ItemSearchResponse.Items[0].Item[0].Subjects[0].Subject;

			Books.update({_id: id}, {$set: {"imgL": imgL, "imgS": imgS, "ASIN": ASIN, "author": author, "title": title, "amazonLink": amazonLink, "reviewURL": reviewURL, "description": description, "subjects": subjects}});
			callback(null, book);
		}));	
};
var suggestBook = function(id, callback){
	var fut = new Future();
	var baseBook = Books.findOne({"_id": id});
	console.log("base book:", baseBook);
	var subjects = baseBook.subjects;
	console.log("subjects: ", subjects);
	var powerSearch = _.shuffle(subjects).slice(0, 3);
	console.log('powersearch', powerSearch)
	
	(function(){
		console.log('IIFE');
			var powerSearchStr = 'subject: ';
			for(var i = 0; i < powerSearch.length; i++){
				powerSearchStr = powerSearchStr + powerSearch[i] + " or ";
				console.log(powerSearchStr);
				if(i === powerSearch.length-1){
					fut.return(powerSearchStr);
				}
			}
			
		}());

	// console.log('power search string: ', powerSearchStr);
	opHelper.execute('ItemSearch', {
		  'SearchIndex': 'Books',
		  'Power': fut.wait(),
		  'ResponseGroup': 'Images, ItemAttributes, EditorialReview, Reviews, Subjects'
		}, Meteor.bindEnvironment(function(results) { 
			console.log(results.ItemSearchResponse.Items[0].Item[0]);
			for(var i = 0; i < 10; i++){   
		    var imgL = results.ItemSearchResponse.Items[0].Item[i].LargeImage[0].URL[0];
		    var imgS = results.ItemSearchResponse.Items[0].Item[i].SmallImage[0].URL[0];
		    var ASIN = results.ItemSearchResponse.Items[0].Item[i].ASIN[0]; 
		    var author = results.ItemSearchResponse.Items[0].Item[i].ItemAttributes[0].Author[0];
		    var title = results.ItemSearchResponse.Items[0].Item[i].ItemAttributes[0].Title[0];
			var amazonLink = results.ItemSearchResponse.Items[0].Item[i].ItemLinks[0].ItemLink[0].URL[0];
			var description = results.ItemSearchResponse.Items[0].Item[i].EditorialReviews[0].EditorialReview[0].Content;
			var reviewURL = results.ItemSearchResponse.Items[0].Item[i].CustomerReviews[0].IFrameURL[0];
			var subjects = results.ItemSearchResponse.Items[0].Item[i].Subjects[0].Subject;

			Books.insert({"imgL": imgL, "imgS": imgS, "ASIN": ASIN, "author": author, "title": title, "amazonLink": amazonLink, "reviewURL": reviewURL, "description": description, "subjects": subjects});
			var newBook = Books.find({"ASIN": ASIN});
			Books.update({_id: id}, {$push: {"similar": newBook._id}});
			Books.update({_id: id}, {$pull: {"similar": null}});

		}

			callback(null, id);

		}));

};


var checkASIN = function(query, callback){
	console.log('checkASIN arguments: ', arguments);
	opHelper.execute('ItemSearch', {
		  'SearchIndex': 'Books',
		  'Keywords': query,
		  'ResponseGroup': 'Images'
		}, Meteor.bindEnvironment(function(results) { 
				    var thisASIN = results.ItemSearchResponse.Items[0].Item[0].ASIN[0];
				   
				    callback(thisASIN);
			}));
};



Meteor.methods({
	getBook: function(title, callback){
		var fut = new Future();
		checkASIN(title, Meteor.bindEnvironment(function(ASIN){
			console.log('start checkASIN callback ASIN: ', ASIN);
			
			

			if(!!(Books.findOne({ "ASIN": ASIN })) === false){
				check(title, String);
				console.log('words: ',arguments);
				var query = title.toLowerCase();
				var objectThings = createBookObj(query, function(err, results){
				var result = Books.findOne({ "ASIN": ASIN });
				if(callback){
					callback(fut.return(null, results));
				}
				fut.return(results);
				});
				

			} else {
				console.log('that already exists!');
				var result = Books.findOne({ "ASIN": ASIN });
				updateBookObj(result._id, title, function(err, results){
					if(callback){
					callback(fut.return(null, results));
					}
					fut.return(results);
				});
				
			}

		}));
		
		return fut.wait();
	},
	getIMG: function(email, id, callback){
		console.log('getting image');
		var newImage = Gravatar.imageUrl(email, {
	    size: 250,
	    default: 'px'
		});

		Meteor.users.update({"_id": id}, {$set: {"profile.img": newImage}});
	},
	addBook: function(title, id){
			console.log(title);
			console.log(id);
			var bookObj = Meteor.call('getBook', title);
			console.log('book obj in addbook: ', bookObj);
			var user = Meteor.users.findOne({_id: id});
			if(user.profile.books){
				if(user.profile.books.indexOf(bookObj._id) === -1){
					Meteor.users.update({"_id": user._id}, {$push: {"profile.books": bookObj._id}},  {safe: true, upsert: true}, function(err, model){
						console.log("error: ", err);
					});
				} else {
					console.log('that book is already in this collection');
				}
				
			} else {
				Meteor.users.update({"_id": user._id}, {$set: {"profile.books": []}});
				Meteor.users.update({"_id": user._id}, {$push: {"profile.books": bookObj._id}}, {safe: true, upsert: true}, function(err, model){
				console.log("error: ", err);
				});
			}
		},
	suggestBooks: function(title, callback){
		var fut = new Future();
		var fut2 = new Future();
		// suggestBook(id)

		Meteor.call('getBook', title, function(err, results){

			
			console.log('meteor call - getbook: ', results);
			fut2.return(results._id);                                                                                                                            
			suggestBook(fut2.wait(), function(err, results){
				
				fut.return(results);
			});
			
		});
		return fut.wait();
	}
});

