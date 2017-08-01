/* ============================ */
/*         STARTING STUFF       */
/* ============================ */

// packages
var bodyParser = require("body-parser"),        // This allows us to parse information from forms
methodOverride = require("method-override"),    // This allows us to override methods so we can make PUT/DELETE requests
expressSanitizer = require("express-sanitizer"),
mongoose = require("mongoose"),                 // This allows us to access our MongoDB database to retrieve info
express = require("express");                   // This is the Node.JS framework which makes everything easier :)

// app config
var app = express();
mongoose.connect("mongodb://localhost/blogapp"); // Make sure it's using the DB
app.set("view engine", "ejs");                   // This is so we don't have to specify .ejs when we render pages
app.use(express.static("public"));               // Automatically check out our public folder when we are on static pages
app.use(bodyParser.urlencoded({extended: true}));// Just need to put this everytime, really...
app.use(expressSanitizer());
app.use(methodOverride("_method"));              // Allow app to override methods

/* ============================ */
/*         DATABASE STUFF       */
/* ============================ */

// mongoose/model config
var blogSchema = new mongoose.Schema({           // This sets up the general scheme for the items in the database
   title: String,
   image: String,
   body: String,
   created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);   // This is so we can reference it every time, just use Blog.whatever...


/* ============================ */
/*          ROUTING STUFF       */
/* ============================ */

// root page
app.get("/", function(req, res){
    res.redirect("/blogs");                      // Just redirect it to /blogs, automatically a GET request
})

// index route
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){          // Access the Database and run the callback function if anything shows up
        if(err){
            console.log("Error...");
        } else {                                 // If there is items, render the index.EJS page
            res.render("index.ejs", {blogsData: blogs}); 
        }
    });
});

// new route
app.get("/blogs/new", function(req, res){        // Make a GET request to access the new.ejs page
   res.render("new"); 
});

// create new route
app.post("/blogs", function(req, res){
    // Make a POST request to /blogs
    // Create blog... we put blog title,image,body into blog[title]
    // So retrieving it would be req.body.blog instead of 3 sep. lines
    req.body.blog.body = req.sanitize(req.body.blog.body); // Disables people adding malicious scripts into body
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){                                // Create a new post, if there's an error redisplay new
            res.render("new");
        } else {                                // else, make a get request to /blogs again
            res.redirect("/blogs");
        }
    });
});

// show route (if you click read more on front page, it'll redirect you to specific pages)
app.get("/blogs/:id", function(req, res){
    // Access the Database and find item by ID from this page
    // Retrieve that ID information and run the callback function
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else { // if not, show the new blog
            res.render("show", {blog: foundBlog});
        }
    });
});

// edit route (editing your blog post)
app.get("/blogs/:id/edit", function(req, res){
    // Get parameters of the specific ID (from mongoDB)
    Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("edit", {blog: foundBlog});
       }
    });
});

// update route
app.put("/blogs/:id", function(req, res){
    // Find the ID in the database and update the item in the Database
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// delete route
app.delete("/blogs/:id", function(req, res){
    // destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
    // redirect somewhere
});

// Listen to see if server is running properly
app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Server is running."); 
});