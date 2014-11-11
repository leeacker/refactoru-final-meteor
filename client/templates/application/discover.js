Template.discover.helpers({
	baseBook: function(){
		var thisASIN = Session.get('currentASIN');
		return Books.findOne({"ASIN": thisASIN});
	}
});