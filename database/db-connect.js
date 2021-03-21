let mongoose = require('mongoose');
// let ObjectId = require('mongodb').ObjectID;
// let bcrypt = require('bcryptjs');

mongoose.Promise = global.Promise;
let mongoDB = 'mongodb://localhost:27017/chat';

mongoose.Promise = global.Promise;
try {
    connection = mongoose.connect(mongoDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        checkServerIdentity: false,
    });
    console.log('connection to mongodb worked!');

// db.dropDatabase();

} catch (e) {
    console.log('error in db connection: ' + e.message);
}
module.exports= mongoose;
