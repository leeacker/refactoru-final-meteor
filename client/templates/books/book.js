Template.bookProfile.helpers({
	books: function(){

		var ASIN = Session.get('currentASIN');
		var books = Books.find({ASIN: ASIN});

		return books;
	
	}
});

Template.bookTag.events({
	"click .remove-booktag-btn": function(e){
		console.log(Meteor.user());
		var user = Meteor.user();
		var userID = user._id;
		console.log('user id', userID);
		console.log('this: ', this);
		var bookID = this._id;
		
		Meteor.users.update({"_id": user._id}, {$pull: {"profile.books": bookID}});
	}
});

Template.carouselWrapper.helpers({
	bookItemTitle: function(id){
		var thisBook = Books.findOne({_id: id});
		return thisBook;
	}
});

Template.carouselWrapper.helpers({
	books: function(){

		var ASIN = Session.get('currentASIN');
		var books = Books.find({ASIN: ASIN});

		return books.similar;
	
	}
});