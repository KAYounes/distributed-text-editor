var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dataSchema = Schema({
    _name: [String],
    index: Number,
    range: Number
});

module.exports = mongoose.model('Cursors', dataSchema,'Cursors');