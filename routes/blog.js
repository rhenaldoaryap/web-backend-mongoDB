const express = require("express");
const mongoDb = require("mongodb");

const db = require("../data/database");

// ObjectId will be a class we can instantiate for looking an ID with mongoDB built-in
const ObjectId = mongoDb.ObjectId;

const router = express.Router();

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/new-post", async function (req, res) {
  const authors = await db.getDb().collection("authors").find().toArray();
  res.render("create-post", { authors: authors });
});

// Start create Post
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
// End of create Post

// Read Post
router.get("/posts", async function (req, res) {
  const posts = await db
    .getDb()
    .collection("posts")
    // correct syntax when add the "projection" to only fetch selected fields from database
    .find({})
    .project({ title: 1, summary: 1, "author.name": 1 })
    // .find({}, { title: 1, summary: 1, "author.name": 1 })
    .toArray();
  res.render("posts-list", { posts: posts });
});

// Read specific post with ID identifier
router.get("/posts/:id", async function (req, res, next) {
  // changing to let to be able to delete the unexpected ID search by user
  let postId = req.params.id;
  // const postId = req.params.id;
  // { summary: 0 } simply exclude summary document when we fetch all of the documents in collection

  // manually handling error the unexpectate ID
  try {
    postId = new ObjectId(postId);
  } catch (error) {
    // There are two ways to handling the unexpected ID
    // 1. We can simply return the 404 status and render the 404 template
    return res.status(404).render("404");
    // 2. We using the next function middleware that provided by ExpressJS with adding the next function at the parameter and then return it and add the error parameter init.
    // return next(error);
  }
  const post = await db
    .getDb()
    .collection("posts")
    .findOne({ _id: new ObjectId(postId) }, { summary: 0 });

  if (!post) {
    return res.status(404).render("404");
  }

  post.humanReadableDate = post.date.toLocaleDateString("en-US", {
    day: "numeric",
    weekday: "long",
    month: "long",
    year: "numeric",
  });
  post.date = post.date.toISOString();

  res.render("post-detail", { post: post, comments: null });
});
// End of read specific post
// End of read post

// Edit Post
router.get("/posts/:id/edit", async function (req, res) {
  const postId = req.params.id;
  const post = await db
    .getDb()
    .collection("posts")
    .findOne({ _id: new ObjectId(postId) }, { title: 1, summary: 1, body: 1 });

  if (!post) {
    return res.status(404).render("404");
  }

  res.render("update-post", { post: post });
});

router.post("/posts/:id/edit", async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const result = await db
    .getDb()
    .collection("posts")
    .updateOne(
      { _id: postId },
      {
        $set: {
          title: req.body.title,
          summary: req.body.summary,
          body: req.body.content,
        },
      }
    );

  res.redirect("/posts");
});
// End of edit post

// Delete Post
router.post("/posts/:id/delete", async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const result = await db
    .getDb()
    .collection("posts")
    .deleteOne({ _id: postId });
  res.redirect("/posts");
});
// End of delete post

// Start comment section
router.get("/posts/:id/comments", async function (req, res) {
  const postId = new ObjectId(req.params.id);
  // we can comment the post collection because we not load the entire page anymore, instead we just need to send back that specific data that was requested, that specifid data is at line 154.
  // const post = await db.getDb().collection("posts").findOne({
  //   _id: postId,
  // });
  const comments = await db
    .getDb()
    .collection("comments")
    .find({
      postId: postId,
    })
    .toArray();

  // return res.render("post-detail", { post: post, comments: comments });
  // configuring to get raw data for comments, which means we encode data as JSON to send it back as a response
  res.json(comments);
});

router.post("/posts/:id/comments", async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const newComment = {
    postId: postId,
    title: req.body.title,
    text: req.body.text,
  };
  await db.getDb().collection("comments").insertOne(newComment);
  res.redirect("/posts/" + req.params.id);
});
// End of comment section

module.exports = router;
