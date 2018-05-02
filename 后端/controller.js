var express=require("./public/node_modules/express");
var port=1337;
var app=express();
var path=require("path");
process.chdir('../');
var StaticUri=path.join(process.cwd(),"前端","public");
app.use(express.static(StaticUri));
app.use('/',function(req,res){
    var PageUri=path.join(StaticUri,"pages","index.html");
    res.sendFile(PageUri);
});
app.listen(port);