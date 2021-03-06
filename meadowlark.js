var express = require("express");
var http      = require("http");
var app 	   = express();
// set up handlebars view engine
var handlebars = require("express3-handlebars").create({defaultLayout:"main",
					helpers:{
						section: function(name, options){
							if (!this._sections) this._sections = {};
							this._sections[name] = options.fn(this);
							console.log("name:" + name + " options.fn(this) :" + options.fn(this));
							return null;
						}
					}
				});
var fortune = require("./lib/fortune.js");
var bodyParser = require("body-parser");
var formidable = require("formidable");
var jqupload = require("jquery-file-upload-middleware"); 

app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");
app.set("port", 3000);

app.use(express.static(__dirname + "/public"));
app.use(bodyParser());


app.use('/upload', function( req, res, next){ 
	var now = Date.now(); 
	jqupload.fileHandler({ 
		uploadDir: function(){ 
			return __dirname + '/public/uploads/' + now; 
		}, 
		uploadUrl: function(){ 
			return '/uploads/' + now; 
		}, 
		imageVersions: {
			thumbnail: {
				width: 100,
				height: 100
			}
		}
	})( req, res, next); 
});

////ROUTES BEGIN//////////
app.get("/headers", function(req, resp){
	resp.set("Content-Type", "text/plain");
	var s = "";
	for (var name in req.headers) {
		s += name + ":" + req.headers[name] + "\n";
	}
	resp.send(s);
});

app.get("/test", function(req, resp){
	resp.render("test");
});

app.get("/juploads", function(req, resp){
	resp.render("juploads");
});

app.get("/enter", function(req, resp){
	console.log("Enter");
	resp.render("enter");
});

app.get("/fileupload", function(req, resp){
	resp.render("fileupload");
});

app.get("/thankyou", function(req, resp){
	console.log("thankyou");
	resp.render("thankyou");
});

app.get("/", function(req, resp){
	resp.render("home");
});

app.get("/about", function(req, resp){
	resp.render("about", {fortune: fortune.getFortune()});
});

////ROUTES END//////////

app.post("/processfile", function(req, resp){
	var form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.parse(req, function(err, fields, files){
		if (err) return resp.redirect(302, "/404");
		console.log("recieved fields:");
		console.log(fields);
		console.log("recieved files");
		console.log(files);
		resp.redirect(302, "/thankyou");
	});
});


app.post("/process", function(req, resp){
	console.log("Test (from querystring): " + req.query.test);
	console.log("Hush (from hidden form field): " + req.body.hush);
	console.log("Test (from visible form field): " + req.body.name);
	//resp.redirect(302, "thankyou");
	if(req.xhr || req.accepts('json,html')==='json'){
	        // if there were an error, we would send { error: 'error description' }
	        resp.send({ success: true });
	    } else {
	        // if there were an error, we would redirect to an error page
	        resp.redirect(302, '/thankyou');
	    }
});


app.use(function(req, resp, next){
//	resp.type("text/plain");
	resp.status(404);
//	resp.send("404 - Not Found");
	resp.render("404");
});
app.listen(app.get("port"));