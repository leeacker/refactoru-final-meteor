// Meteor.users.allow({update: function(){return true;}});


Template.userProfile.events({
	'submit #editUserForm': function(e){
		
		e.preventDefault();
		console.log('click!');
		console.log(Meteor.user());
		var thisUser = Meteor.user();
		var thisID = thisUser._id;
		var name = $('#editName').val();
		var img = $('#editImg').val();
		console.log(thisID);
		$('#editProfModalBtn').trigger('click');
		
		Meteor.users.update({_id: thisID}, {$set: {'profile.name': name, 'profile.img': img}});
	
	},
	'click #books-i': function(e){
		console.log('click!');
		Session.set("searchOrAdd", "add");
		console.log('search or add: ', Session.get("searchOrAdd"));
	}
});


Template.userProfile.helpers({
	user: function(){
		if(!Meteor.user()){
			return;
		}

		var thisUser = Meteor.user();
		var thisID = thisUser._id;
		var user = Meteor.users.findOne({_id: thisID});
		var thisEmail = user.emails[0].address;

		if(user.profile){
			return user;
		} else {
			user.profile = {
				name: 'Book Worm',
				books: []
			};
			Meteor.call('getIMG', thisEmail, thisID);
			return user;
		}
	},
	// image: function(){
	// 	if(!Meteor.user()){
	// 		return;
	// 	}
	
	// 	var thisUserObj = Meteor.user();
	// 	console.log(thisUserObj);
	// 	var thisID = thisUserObj._id;
	// 	console.log(thisID);
	// 	var thisUser = Meteor.users.findOne({"_id": thisID});

	// 	console.log(thisUser);


	// },
	bookItemTitle: function(ID){
		var thisBook = Books.findOne({"_id": ID});
		return thisBook;
	},
	sort: function(list){
		return _.sortBy(list, "_id").reverse();
	}
		
});