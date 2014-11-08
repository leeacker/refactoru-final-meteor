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

		var name = thisUser.profile.name || 'Book Worm'
		var user = Meteor.users.findOne({_id: thisID});
		Meteor.users.update({_id: thisID}, {$set: {'profile.name': name}});
		console.log(user);
		
		return Meteor.user();
	},
	image: function(){
		if(!Meteor.user()){
			return;
		}
		

		var thisUser = Meteor.user();
		console.log(thisUser);
		var thisID = thisUser._id;
		console.log(thisID);
		

		if(!(thisUser.profile.img)){
		var thisEmail = thisUser.emails[0].address;
			console.log(thisEmail);
			Meteor.call('getIMG', thisEmail, thisID);
			return  thisUser.profile.img || 'images/defaultAvatar.jpg';
		} else if(thisUser.profile.img){
			return thisUser.profile.img;
		}
	},
	bookItemTitle: function(id){
		var thisBook = Books.findOne({_id: id});
		return thisBook;
	}
		
});