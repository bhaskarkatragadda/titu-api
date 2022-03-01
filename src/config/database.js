const mongoose = require('mongoose');
const {  constants } = require('../utility/constants');

const dbConnection = async () => {
  try {
    const conct = await mongoose.connect(constants.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB Connected: ${conct.connection.host}`);
  } catch (err) {
    console.log(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = dbConnection;