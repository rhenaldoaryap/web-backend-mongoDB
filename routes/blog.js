const express = require("express");
const mongoDb = require("mongodb");

const db = require("../data/database");

// ObjectId will be a class we can instantiate for looking an ID with mongoDB built-in
const ObjectId = mongoDb.ObjectId;

const router = express.Router();

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/posts", function (req, res) {
  res.render("posts-list");
});

router.get("/new-post", async function (req, res) {
  const authors = await db.getDb().collection("authors").find().toArray();
  res.render("create-post", { authors: authors });
});

// Start create
router.post("/posts", async function (req, res) {
  const authorId = new ObjectId(req.body.author);

  // get specific author
  const author = await db
    .getDb()
    .collection("authors")
    .findOne({ _id: authorId });

  // Fetching data from form
  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      id: authorId,
      name: author.name,
      email: author.email,
    },
  };

  const result = await db.getDb().collection("posts").insertOne(newPost);
  console.log(result);
  res.redirect("/posts");
});
// End of create

module.exports = router;
