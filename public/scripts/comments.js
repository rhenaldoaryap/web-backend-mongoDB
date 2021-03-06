const loadCommentsBtnElement = document.getElementById("load-comments-btn");
const commentsSectionElement = document.getElementById("comments");
// getting access to form element
const commentsFormElement = document.querySelector("#comments-form form");
const commentTitleElement = document.getElementById("title");
const commentTextElement = document.getElementById("text");

// expected comments parameter we get from line 38 when we parse the comment to be JSON format.
// that holds all of commments
function createCommentsList(comments) {
  const commentListElement = document.createElement("ol");

  for (const comment of comments) {
    const commentElement = document.createElement("li");
    commentElement.innerHTML = `
            <article class="comment-item">
                <h2>${comment.title}</h2>
                <p>${comment.text}</p>
            </article>
        `;

    commentListElement.appendChild(commentElement);
  }

  return commentListElement;
}

async function fetchCommentsForPost() {
  // sending Ajax request
  // getting data attributes from post-detail.ejs, be mind at the data-postid, post-id is the identifier we choose here
  const postId = loadCommentsBtnElement.dataset.postid;
  // using fecth function takes a string as a parameter
  // the concrete value is the URL to which you wanna send GET request
  // fetch function by default sends a GET request, but we can configute it to send different kinds of requests as well.
  // "/..." creates an absolute path that is automatically appended to the currently active page domain (like localhost:3000) that will be localhost:3000/posts/scripts/comments for example
  // so, we wanna send a request to that path on the currently loaded domain, on the currently loaded website in the end
  // fetch("/posts/.../comments")
  const response = await fetch(`/posts/${postId}/comments`);
  // grabbing the actual response data with Ajax
  // after grabbing the actual response, we have to configure it first at our backend-code or it will not working
  // see the configure at the router (blog.js) at the GET route when we fetching the comments
  const responseData = await response.json();

  // check whether there is a comment or not
  if (responseData && responseData.length > 0) {
    // changing the DOM that visible's on the screen
    // get access to comments HTML element

    const commentsListElement = createCommentsList(responseData);
    // set empty string to remove all the content that's currently in it
    commentsSectionElement.innerHTML = "";
    // preparing comment list element
    commentsSectionElement.appendChild(commentsListElement);
  } else {
    commentsSectionElement.firstElementChild.textContent =
      "No comments here, let's create some!";
  }
}

// prevent load the entire page
async function saveComment(event) {
  event.preventDefault();
  // send HTTP request through JavaScript
  const postId = commentsFormElement.dataset.postid;

  // getting the value that entered by user
  const enteredTitle = commentTitleElement.value;
  const enteredText = commentTextElement.value;

  // the data will be send manually by our JavaScript code at line 70 in JSON format with Ajax
  const comment = { title: enteredTitle, text: enteredText };
  // matching the URL for POST method (see blog.js at line 167)
  // by default fetch send a GET request, to change it to POST request we have to configure it with second parameter inside of an object.
  const response = await fetch(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(comment),
    // telling the browser we carrying the JSON data from our own JavaScript
    headers: {
      "Content-Type": "application/json",
    },
  });

  // reloading the comment section
  fetchCommentsForPost();
}

loadCommentsBtnElement.addEventListener("click", fetchCommentsForPost);
commentsFormElement.addEventListener("submit", saveComment);
