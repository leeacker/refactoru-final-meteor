// require node module for amazon product API
var OperationHelper = Meteor.npmRequire('apac').OperationHelper;
var util = Meteor.npmRequire('util');
var Future = Npm.require('fibers/future');
// require npm module for stringifying an object (for google api requests)
var querystring = Npm.require('querystring');

// store access information for amazon API
var opHelper = new OperationHelper({
  
    // xml2jsOptions: an extra, optional, parameter for if you want to pass additional options for the xml2js module. (see https://github.com/Leonidas-from-XIV/node-xml2js#options)
});



//////////////////////
// Helper Functions //
//////////////////////


// takes in search string and object target - enters image urls and ASIN to obj name
var createBookObj = function(query, callback){
	console.log('start createBookObj');
	// create object in which to store search results
	var objectThings = {};

	// run amazon query using given search term - return only first page of results
	opHelper.execute('ItemSearch', {
		  'SearchIndex': 'Books',
		  'Keywords': query,
		  'ItemPage': 1,
		  'ResponseGroup': 'Images, ItemAttributes, EditorialReview, Reviews, Subjects'
		}, Meteor.bindEnvironment(function(results) { 
				   console.log('Begin Amazon Book Search for ', query);
				   // collect basic info from amazon search results
				    objectThings.imgL = results.ItemSearchResponse.Items[0].Item[0].LargeImage[0].URL[0];
				    objectThings.imgM = results.ItemSearchResponse.Items[0].Item[0].MediumImage[0].URL[0];
				    objectThings.imgS = results.ItemSearchResponse.Items[0].Item[0].SmallImage[0].URL[0];
				    objectThings.ASIN = results.ItemSearchResponse.Items[0].Item[0].ASIN[0];
				    objectThings.author = results.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Author[0];
				    objectThings.title = results.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Title[0];
					objectThings.amazonLink = results.ItemSearchResponse.Items[0].Item[0].ItemLinks[0].ItemLink[0].URL[0];
					objectThings.description = results.ItemSearchResponse.Items[0].Item[0].EditorialReviews[0].EditorialReview[0].Content;
					objectThings.reviewURL = results.ItemSearchResponse.Items[0].Item[0].CustomerReviews[0].IFrameURL[0];
					objectThings.subjects = results.ItemSearchResponse.Items[0].Item[0].Subjects[0].Subject;
					objectThings.similar = [];
					// insert the new book into the database
					googleAPI.bookSearch(objectThings.title, function(err, results){
						if(err) console.log('google book search error:' , err);
						objectThings.googleInfo = results;
						Books.insert(objectThings);
						suggestBook(objectThings.ASIN);

						console.log('google book search results: ', results);
						// googleAPI.updateExistingBook(ASIN, results);
					});
					

					
					// return null error and the book object that is being created
					callback(null, objectThings);

		}));


};
// check if book is already in the db
var isBook = function(ASIN, callback){
	console.log('checking if ASIN: '+ ASIN + ' is already in the database');
	if(!(Books.findOne({ "ASIN": ASIN })) === true){
		callback(null, false);
	} else {
		callback(null, true);
	}
};
// take in book id and title and update a book that is already in the DB. 
var updateBookObj = function(id, query, callback){
	console.log('Updating DB entry for :', id);
	var book = Books.findOne({_id: id});
	// run amazon search on a given query
	opHelper.execute('ItemSearch', {
		  'SearchIndex': 'Books',
		  'Keywords': query,
		  'ItemPage': 1,
		  'ResponseGroup': 'Images, ItemAttributes, EditorialReview, Reviews, Subjects'
		}, Meteor.bindEnvironment(function(results) { 
			console.log("Running update on: ", query);	    
		    var imgL = results.ItemSearchResponse.Items[0].Item[0].LargeImage[0].URL[0];
		    var imgM = results.ItemSearchResponse.Items[0].Item[0].MediumImage[0].URL[0];
		    var imgS = results.ItemSearchResponse.Items[0].Item[0].SmallImage[0].URL[0];
		    var ASIN = results.ItemSearchResponse.Items[0].Item[0].ASIN[0]; 
		    var author = results.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Author[0];
		    var title = results.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Title[0];
			var amazonLink = results.ItemSearchResponse.Items[0].Item[0].ItemLinks[0].ItemLink[0].URL[0];
			var description = results.ItemSearchResponse.Items[0].Item[0].EditorialReviews[0].EditorialReview[0].Content;
			var reviewURL = results.ItemSearchResponse.Items[0].Item[0].CustomerReviews[0].IFrameURL[0];
			var subjects = results.ItemSearchResponse.Items[0].Item[0].Subjects[0].Subject;
			// update the fields in the given book
			Books.update({"_id": id}, {$set: {"imgL": imgL, "imgS": imgS, "imgM": imgM, "ASIN": ASIN, "author": author, "title": title, "amazonLink": amazonLink, "reviewURL": reviewURL, "description": description, "subjects": subjects}});
			// send back null error and book object
			callback(null, book);
		}));	
};
// take in a given item from amazon search results and populate the given books "similar" array
var populateSimilarBooks = function(baseBook, item){
	    var imgL = item.LargeImage[0].URL[0];
	    var imgM = item.MediumImage[0].URL[0];
	    var imgS = item.SmallImage[0].URL[0];
	    var ASIN = item.ASIN[0]; 
	    var author = item.ItemAttributes[0].Author[0];
	    var title = item.ItemAttributes[0].Title[0];
		var amazonLink = item.ItemLinks[0].ItemLink[0].URL[0];
		var description = item.EditorialReviews[0].EditorialReview[0].Content;
		var reviewURL = item.CustomerReviews[0].IFrameURL[0];
		var subjects = item.Subjects[0].Subject;

		// check if the book suggestion is already in the database
		isBook(ASIN, function(err, results){
			console.log('Checking whether ' + title + ' is already in the database (populating similar books...)');
			if(!results){
				// if the book is not in the database, insert it. 
				console.log(title +' is not in the database - adding now...');
				Books.insert({"imgL": imgL, "imgS": imgS, "ASIN": ASIN, "imgM": imgM, "author": author, "title": title, "amazonLink": amazonLink, "reviewURL": reviewURL, "description": description, "subjects": subjects, "similar": []}, function(err, records){
					if(err){
						console.log("isBook err: ", err);
					} else {
						// after new book is created, insert the id into the basebooks "similar array"
						var newBook = Books.find({"ASIN": ASIN});
						insertSimilar(baseBook, ASIN);
						// suggestBook(ASIN);

					// googleAPI.bookSearch(title, function(err, results){
					// 	if(err) console.log('google book search error:' , err);
					// 	console.log('google book search results: ', results);
					// 	googleAPI.updateExistingBook(ASIN, results);
					// });
					}
				});
			
			} else {
				// insert the id into the basebooks "similar array"
				console.log(title +' is already in the database - moving on...');
				var newBook = Books.findOne({"ASIN": ASIN});
				insertSimilar(baseBook, ASIN);
					
			}
		});
};
// insert a similar books ID into the base books "similar" collection
var insertSimilar = function(baseBookASIN, similarBookASIN){
	// find given books within the database
	var baseBook = Books.findOne({"ASIN": baseBookASIN});
	var similarBook = Books.findOne({"ASIN": similarBookASIN});
	console.log('Inserting '+ similarBook.title + " into  " + baseBook.title + '\'s similar collection...');
	// if the similar book does not already exist in the basebooks collection, add it
	if((baseBook.similar.indexOf(similarBook._id) === -1) && baseBook._id !== similarBook._id){
		Books.update({"ASIN": baseBook.ASIN}, {$push: {"similar": similarBook._id}});
	}

};

var addToUserCollection = function(id, userID, callback){
	// find the current user in the data base
	var user = Meteor.users.findOne({"_id": userID});
	console.log("Adding a book to " + user.profile.name + "'s collection");
	if(user.profile.books){
		// if the books array already exists in the user profile, check to see if the book is already in the user collection
		if(user.profile.books.indexOf(id) === -1){
			// if it is not, add it
			Meteor.users.update({"_id": user._id}, {$push: {"profile.books": id}},  {safe: true, upsert: true}, function(err, model){
				console.log("error: ", err);
			});
		} else {
			console.log('that book is already in this collection');
		}
		
	} else {
		// if it is not, create the collection and add the new books id
		Meteor.users.update({"_id": user._id}, {$set: {"profile.books": []}});
		Meteor.users.update({"_id": user._id}, {$push: {"profile.books": id}}, {safe: true, upsert: true}, function(err, model){
		console.log("error: ", err);
		});
	}
};

// take in book ID, find similar books and store them in an array within the provided books "similar" array
var suggestBook = function(ASIN, callback){
	 // return the book to base suggestions on. 
	var baseBook = Books.findOne({"ASIN": ASIN});
	// console.log("base book:", baseBook);
	// access list of subjects within book object
	var subjects = baseBook.subjects;
	console.log("subjects: ", subjects);
	// create a new array using three random subjects from base book
	var powerSearch = _.sample(subjects, 3);
 	var powerSearchStr = "subject: " + powerSearch.join(' or ');

 	console.log('Beginning Amazon power search with: ', powerSearchStr);
	opHelper.execute('ItemSearch', {
		  'SearchIndex': 'Books',
		  'Power': powerSearchStr,
		  'ResponseGroup': 'Images, ItemAttributes, EditorialReview, Reviews, Subjects'
		}, Meteor.bindEnvironment(function(results) { 

		// for top twenty hits from API, populate the given books similar array.
		var resultsLength = +(results.ItemSearchResponse.Items[0].TotalResults[0]);
		console.log("results length", resultsLength);
		var loopLength = 20;
		// if results are less than given length, set length to number of results
		if(resultsLength < 20){
			loopLength = resultsLength;
		}
		console.log("Relaying " + loopLength + " books similar to " + baseBook.title);
		// loop through results within the populate similar books function
			for(var i = 0; i < loopLength; i++){ 
				console.log("i:"+ i + 'results' +results.ItemSearchResponse.Items[0].Item[i]);  
			    populateSimilarBooks(baseBook.ASIN, results.ItemSearchResponse.Items[0].Item[i]);
			}
		}));
};

// retrieve the ASIN for a given query
var checkASIN = function(query, callback){
	console.log('Retrieving the ASIN for ' + query);
	opHelper.execute('ItemSearch', {
		  'SearchIndex': 'Books',
		  'Keywords': query,
		  'ResponseGroup': 'Images'
		}, Meteor.bindEnvironment(function(results) { 
				var thisASIN = results.ItemSearchResponse.Items[0].Item[0].ASIN[0];
				// check to see if ASIN is already in the db and return results
			   isBook(results.ItemSearchResponse.Items[0].Item[0].ASIN[0], function(err, results){
			   	 	callback(thisASIN, results);
			   });
				   
		}));
};

////////////////////////////////////////////
// Methods for using the Google Books API //
////////////////////////////////////////////

var googleAPI = {
	bookSearch : function(query, callback){
		// make options optional (teehee)
		// if ( ! callback || typeof callback != "function") {
  //   	// Callback is the second parameter
  //       callback = options;
  //       // No options
  //       options = undefined;
  //   	}
    	// options defaults
		var options = {
			q: query,
			key: '',
			prettyPrint: false
		}
		// make a call to google books api for matching book info
		HTTP.get('https://www.googleapis.com/books/v1/volumes?' + querystring.stringify(options), function(err, results){
			if(err) console.log(err);
			// console.log(util.inspect(results.data.items[0].accessInfo, {depth: null}));
			// console.log(util.inspect(results.data.items[0].selfLink, {depth: null}));
			// console.log(util.inspect(results.data.items[0].accessInfo.webReaderLink, {depth: null}));

			var googleBook = {
				googleLink: results.data.items[0].volumeInfo.infoLink,
				googleAPILink: results.data.items[0].selfLink,
				embeddable:  results.data.items[0].accessInfo.embeddable,
				epub: {
					isAvailable: results.data.items[0].accessInfo.epub.isAvailable,
					link: results.data.items[0].accessInfo.epub.acsTokenLink || null
				},
				pdf: {
					isAvailable: results.data.items[0].accessInfo.pdf.isAvailable,
					link: results.data.items[0].accessInfo.pdf.acsTokenLink || null
				},
				webReaderLink: results.data.items[0].accessInfo.webReaderLink
			};
			console.log("google book: ", googleBook);
			
			callback(null, googleBook);
			console.log("http callback: ", callback);
			return googleBook;
		});
	}, 	//end bookSearch method
	updateExistingBook: function(ASIN, googleBookObj){
		console.log('start update existing book: ', ASIN + ' object: '+ googleBookObj.googleLink);
		// update given book with google attributes
		console.log("update this book: ", Books.findOne({'ASIN': ASIN}));
		GoogleBook.update({"ASIN": ASIN}, {$set:
			{"ASIN": ASIN, "googleLink": googleBookObj.googleLink,
						"googleAPILink": googleBookObj.googleAPILink,
						"embeddable":  googleBookObj.embeddable,
						"epub": googleBookObj.epub,
						"pdf": googleBookObj.pdf,
						"epub.isAvailable": googleBookObj.epub.isAvailable,
						"epub.link": googleBookObj.epub.link,
						"pdf.isAvailable": googleBookObj.pdf.isAvailable,
						"pdf.link": googleBookObj.pdf.link,
						"webReaderLink": googleBookObj.webReaderLink}
		}, {safe: true, upsert: true});
	} //end updateExistingBook method
} //end googleAPI object

// googleAPI.bookSearch('to kill a mockingbird', function(err, results){
// 	console.log("results: ", results);
// });

//////////////////////////
// Meteor Call methods  //
//////////////////////////

// methods for calls from the client
Meteor.methods({
	getBook: function(title, callback){
		var fut = new Future();
		// check ASIN returns the ASIN checked and a true or false value
		checkASIN(title, Meteor.bindEnvironment(function(ASIN, isBook){
			console.log('does book exist?', isBook);
			
			// if the book does not exist, run createBookObj
			if(!isBook){
				// check(title, String);
				console.log('words: ',arguments);
				var query = title.toLowerCase();
				createBookObj(query, function(err, result){
					var result = Books.findOne({ "ASIN": ASIN });
					console.log('get book results: ', result);
					// createBookObj returns the object used to create the book in the db

					// if(callback){
					// 	callback(fut.return(null, results));
					// }

					fut.return(results);
				});
				
			// if the book does exist, run update book obj
			} else {
				console.log('that already exists!');
				var result = Books.findOne({ "ASIN": ASIN });
				// update book obj returns the actual DB book item
				updateBookObj(result._id, title, function(err, result){
					// if(callback){
					// callback(fut.return(null, results));
					// }

					fut.return(result);
				});
				
			}

		}));
		
		return fut.wait();
	},
	// retrieve image from gravatar if it exists, if it does not, assign default image
	getIMG: function(email, id, callback){
		console.log('getting image for: ', email);
		var newImage = Gravatar.imageUrl(email, {
	    size: 250,
	    default: 'px'
		});
		if(newImage){
			Meteor.users.update({"_id": id}, {$set: {"profile.img": newImage}});
		} else {
			Meteor.users.update({"_id": id}, {$set: {"profile.img": '/images/defaultAvatar.jpg'}});
		}
	},
	addBook: function(title, id){
			var fut = new Future();
			// find current users db document
			var user = Meteor.users.findOne({"_id": id});
			var userID = user._id;
			console.log("add " + title + ' to ' + user.profile.name + "'s collection");
			console.log("add book id: ",id);

			checkASIN(title, Meteor.bindEnvironment(function(ASIN, isBook){
				console.log('start checkASIN callback ASIN: ', ASIN);
				console.log('does book exist?', isBook);
				
				// if the book does not exist, run createBookObj
				if(!isBook){
					createBookObj(title, function(err, results){
						var book = Books.findOne({"ASIN": ASIN});
						addToUserCollection(book._id, userID);
					});
					
				// if the book does exist, run update book obj
				} else {
					console.log('that already exists!');
					var book = Books.findOne({"ASIN": ASIN});
					addToUserCollection(book._id, userID);
				}


			}));
		},
	suggestBooks: function(title, callback){
		var fut = new Future();
		var fut2 = new Future();
		
		// checkASIN to see if book exists

		checkASIN(title, Meteor.bindEnvironment(function(ASIN, isBook){
			console.log('start checkASIN callback ASIN: ', ASIN);
			console.log('does book exist?', isBook);
			
			// if book exists, run suggest books
			if(isBook){
				
				suggestBook(ASIN);
				
			// if the book does not exist, create book and then run suggest book
			} else {
				createBookObj(ASIN, function(err, results){
					suggestBook(ASIN);
				});	
			}
			fut.return();
		}));

		return fut.wait();
	},
	addGoogleBook: function(ASIN, query, callback){
		googleAPI.bookSearch(query, function(err, results){

			if(err) console.log('google book search error:' , err);
			console.log('google book search results: ', results);
			googleAPI.updateExistingBook(ASIN, results);

			});
	}
});

