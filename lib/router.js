

Router.configure({
 layoutTemplate: 'layout'
});

Router.route('/', function(){
	if(!Meteor.user()){
		this.render('home');
	} else {
		var user = Meteor.user();
		console.log(user);
		Router.go('profile.show', {id : user._id});
	}
}, {name: 'home'});

Router.plugin('dataNotFound', {notFoundTemplate: 'notFound'});

Router.route('/books/:book', function(){
	var route = this;
	var query = this.params.book;
	console.log(query);
	
	console.log('session get pre-meteor call: ', Session.get("currentASIN"));

	Meteor.call('getBook', query, function(error, result){
			  if (error) {
			    console.log('OHHH NOOOO');
			   
			  } else {
			    console.log(result);
			    Session.set("currentASIN", result.ASIN);
			   
			  }
			});
	
	this.render('bookProfile');
}, {
	name: 'book.show'
});

Router.route('/mybooks/:id', function(){
	var route = this;
	
	this.render('myBooks');
}, {
	name: 'mybooks.show'
});

Router.route('/profile/:id', function(){
	if(!Meteor.user()){
		Router.go('home');
	} else {
		this.render('userProfile');
	}
}, {
	name: 'profile.show'
});

Router.route('/discover/:book', function(){
	var route = this;
	var query = this.params.book;
	console.log(query);
	Session.set('currentASIN', query);
	console.log('session get pre-meteor call: ', Session.get("currentASIN"));

	Meteor.call('suggestBooks', query, function(error, result){

			  if (error) {
			    console.log('OHHH NOOOO');
			   
			  } else {
			    console.log("result of suggest books", result);
			    // var book = Books.find({"ASIN": result});
			    // Session.set("currentID", book._id);
			    // console.log("post discover search ASIN: ", Books.find({"ASIN": ASIN}).fetch());
			  }
			});
	
	this.render('discover');
}, {
	name: 'book.discover'
});

Router.route('/lazy/:id', function(){
	var id = this.params.id;
	this.render('lazy');
});