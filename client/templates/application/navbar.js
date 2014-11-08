Template.navbar.helpers({
	id: function(){
		var thisUser = Meteor.user();
		var thisID = thisUser._id;
		return thisID;
	},
	currentASIN: function(){
		return Session.get("currentASIN");
	}
});