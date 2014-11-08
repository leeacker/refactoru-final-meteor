// Meteor.publish('oneBook', function(query){

// 	Meteor.call('getBook', query, Meteor.bindEnvironment(function(error, result){
// 		  if (error) {
// 		    console.log('OHHH NOOOO');
// 		  } else {
// 		    console.log(result);

// 		    var book = Books.findOne({ASIN: result});
// 		    console.log(book);
// 		  }
// 		}));

// });