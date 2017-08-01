var bodyParser = require("body-parser"),
mongoose = require("mongoose"),
express = require("express"),
app = express();

// App Config
mongoose.connect("mongodb://localhost/blogapp");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

// Mongoose/MODEL Config
var blogSchema = new mongoose.Schema({
   title: String,
   image: String,
   body: String,
   created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// RESTful Routes

app.get("/", function(req, res){
    res.redirect("/blogs");
})

// Index Route
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log("Error...");
        } else {
            res.render("index.ejs", {blogsData: blogs}); 
        }
    });
});

// New Route
app.get("/blogs/new", function(req, res){
   res.render("new"); 
});

// Create Route
app.post("/blogs", function(req, res){
    // Create blog... we put blog title,image,body into blog[title]
    // So retrieving it would be req.body.blog instead of 3 sep. lines
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){ // Create a new post, if there's an error redisplay new
            res.render("new");
        } else { // else, make a get request to /blogs again
            res.redirect("/blogs");
        }
    });
});

// SHOW ROUTE (clicking the README, it'll display the specific ID post)
app.get("/blogs/:id", function(req, res){
   Blog.findById(req.params.id, function(err, foundBlog){
      if(err){ // if there's a error, redirect to blogs page
          res.redirect("/blogs");
      } else { // if not, show the new blog
          res.render("show", {blog: foundBlog});
      }
   });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
    res.render("edit");
});

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Server is running."); 
});