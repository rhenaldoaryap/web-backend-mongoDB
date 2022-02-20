// Connecting to MongoDB
const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

let database;

async function connect() {
  const client = await MongoClient.connect("mongodb://localhost:27017");
  // connecting to specific database
  database = client.db("blog");
}

function getDb() {
  if (!database) {
    throw { message: "Database connection not established!" };
  }
  return database;
}
// End of connecting to MongoDB

module.exports = {
  connectToDatabase: connect,
  getDb: getDb,
};
