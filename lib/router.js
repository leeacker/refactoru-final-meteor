Router.configure({
 layoutTemplate: 'layout'
});

Router.route('/', {name: 'home'});

Router.plugin('dataNotFound', {notFoundTemplate: 'notFound'});

Router.route('/books/:book', function(){
	var query = this.params.book;
	console.log(query);

	Meteor.call('getBook', query);	
});
Router.route('/books/profile/:book', function(){
	var book = this.params.book;
	console.log('route book: ', book);
	this.render('bookProfile');
	// var bookObj = Books.findOne({title: book});
});