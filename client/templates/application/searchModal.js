Template.searchModal.events({
	"submit #searchForm": function(e){
		console.log('book search initiated');
		
		e.preventDefault();
		var func = Session.get("searchOrAdd");
		var query = $('#findBookQuery').val();
		$('#findBookQuery').val('');
		console.log(query);
		Session.set("bookQuery", query);
		if(func === "search"){
			$('#searchModalBtn').trigger('click');
			Router.go('book.show', {book: query});
		} else if(func === "add"){
			var thisUser = Meteor.user();
			var thisID = thisUser._id;
			console.log(thisID);
			console.log('clicked to add a book');
			$('#searchModalBtn').trigger('click');
			Meteor.call('addBook', query, thisID);
		}
	}
});

Template.searchModalBtn.events({
	"click #searchModalBtn": function(){
		Session.set("searchOrAdd", "search");
		console.log('search or add: ', Session.get("searchOrAdd"));
	}
});