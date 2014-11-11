Books = new Mongo.Collection('books');

currentBook = new Mongo.Collection('currentBook');

var Schemas = {};

Schemas.Book = new SimpleSchema({
    title: {
        type: String,
        label: "Title",
        unique: true
    },
    author: {
        type: String,
        label: "Author"
    },
    description: {
        type: [String],
        label: "Brief summary",
        optional: true
    },
    similar: {
        type: [String],
        label: "Ids of Similar books",
        optional: true
    },
    ASIN: {
    	type: String,
    	label: "Book ASIN",
    	unique: true
    },
    imgL: {
    	type: String,
    	label: "Large Image",
    	optional: true
    },
    imgM: {
    	type: String,
    	label: "Medium Image",
    	optional: true
    },
    imgS: {
    	type: String,
    	label: "Small Image",
    	optional: true
    },
    subjects: {
    	type: [String],
    	label: "Book Subjects",
    	optional: true
    },
    amazonLink: {
    	type: String,
    	label: "Link to Amazon Page",
    	optional: true
    },
    reviewURL: {
    	type: String,
    	label: "review link for iframe",
    	optional: true
    }
});

Books.attachSchema(Schemas.Book);