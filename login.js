var express = require("express");
var path = require('path')
var port = process.env.PORT || 80;
var app = express();

app.use(express.static(path.join(__dirname, '/login')))

app.get("/",function(req,res){
    res.sendFile( __dirname + "/" + "index.html" );
}).listen(port,function(){
    console.log("server start at:" + port);
});
