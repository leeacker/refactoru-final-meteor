Template.lazy.helpers({
	bookItemTitle: function(id){
		// var thisBook = Books.findOne({"_id": id});
		// console.log("lazy id sent: ", id);
		// console.log('book item title in lazy.js: ', thisBook);
		return Books.findOne({"_id": id});
	},
	books: function(){
		var user = Meteor.user();
		console.log('lazy user: ', user);
		// var suggestionNum = 10;
		// if(user.profile.books.length < 10){
		// 	suggestionNum = user.profile.books.length;
		// }
		// return _.sample(user.profile.books, suggestionNum);
		return user.profile.books;
	}
});

Template.lazyCarousel.helpers({
	bookItemTitle: function(id){
		// var thisBook = Books.findOne({"_id": id});
		// console.log("lazy id sent: ", id);
		// console.log('book item title in lazy.js: ', thisBook);
		return Books.findOne({"_id": id});
	}
});

Template.lazyCarouselItem.events({
	"click .item": function(){
		console.log('hello');
		Router.go('book.show', {book: this.title});
	}
});