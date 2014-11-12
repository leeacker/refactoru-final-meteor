Template.bookProfile.helpers({
	books: function(){
		var ASIN = Session.get('currentASIN');
		var thisBook = Books.find({"ASIN": ASIN});
		console.log('this book: ', thisBook);

		return thisBook;
	
	},
	bookItemTitle: function(id){
		var thisBook = Books.findOne({"_id": id});
		return thisBook;
	},
	inCollection: function(id){
		var userID = Meteor.user()._id;
		var user = Meteor.users.findOne({"_id": userID});
		console.log('inCollection user: ', user);
		if(user.profile.books.indexOf(id) === -1){
			return true;
		} else {
			return false;
		}
	}

});
Template.bookProfile.events({
	"click #addToLibraryBtn": function(){
		var userID = Meteor.user()._id;
		Meteor.users.update({"_id": userID}, {$push: {"profile.books": this._id}});
		Router.go('profile.show', {id: userID});
	}
});

Template.myBooks.helpers({
	books: function(){
		var user = Meteor.user();
		var books = user.profile.books;

		
		return books;
	
	},
	bookItemTitle: function(id){
		var thisBook = Books.findOne({"_id": id});
		return thisBook;
	},
	inCollection: function(id){
		var userID = Meteor.user()._id;
		var user = Meteor.users.findOne({"_id": userID});
		console.log('inCollection user: ', user);
		if(user.profile.books.indexOf(id) === -1){
			return true;
		} else {
			return false;
		}
	}
});
Template.myBooks.events({
	"click .image-link": function(){
		Router.go('book.show', {book: this.title});
	},
	"click #addToLibraryBtn": function(){
		var userID = Meteor.user()._id;
		Meteor.users.update({"_id": userID}, {$push : {"profile.similar": this._id}});
		Router.go('profile.show', {id: userID});
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
		var thisBook = Books.findOne({"_id": id});
		return thisBook;
	},

	books: function(){

		var thisID = Session.get('currentASIN');

		var books = Books.findOne({"ASIN": thisID});
		console.log('this ID: ', thisID);
		console.log('books: ', books);
		return Books.findOne({"ASIN": thisID});
	
	}
});

Template.carouselItem.events({
	"click .image-link": function(){
		Session.set("currentASIN", this.ASIN);
		Router.go('book.show', {book: this.title});
	}
});

Template.carouselItemActive.helpers({
	baseBook: function(){
		var thisID = Session.get('currentASIN');
		return Books.findOne({"ASIN": thisID});
	}
});