var express = require("express");
var path = require('path')
var port = process.env.PORT || 1337;//这里使用1337端口
var app = express();
var mysql=require('mysql');
var bodyParser =require('body-parser');
var captchapng = require('./captchapng/lib/captchapng') ;

/*与数据库服务器建立连接*/
var connection=mysql.createConnection({
    host:'localhost',
    port:3306,
    database:'school',
    user:'root',
    password:'root',
});

connection.connect(function(err)
{
    if(err)
    {
        console.log("与服务器建立连接失败");
    }
    else
    {
        console.log("与服务器建立连接成功"); 
    }
})


var url=path.join("C:","工程2.0","前端");
app.get("/",function(req,res){
    /*登陆页面的路由*/
    res.sendFile( path.join(url+"index.html") );
});
app.get("/teacher",function(req,res){
    /*教师登陆端的路由*/
    /*需检查session*/
    res.sendfile(path.join(url,"teacher.html"));
});
app.get("/captcha.png",function(req,response){
        var p = new captchapng(80,30,parseInt(Math.random()*9000+1000)); // width,height,numeric captcha
        p.color(255, 0, 255, 0);  // First color: background (red, green, blue, alpha)
        p.color(190, 80, 80, 255); // Second color: paint (red, green, blue, alpha)
        var img = p.getBase64();
        var imgbase64 = new Buffer(img,'base64');
        response.writeHead(200, {
            'Content-Type': 'image/png'
        });
        response.end(imgbase64);
});

var urlencoded=bodyParser.urlencoded({extended:false});//form数据的请求体类型是 x-www-form-urlencoded 这里选择用urlencoded 格式来解析post 请求
app.post("/login",urlencoded,function(req,res){
    res.sendFile( __dirname + "/login/" + "login.html" );
    console.log("a post received" + port);
    console.log(req.body.logname);
    console.log(req.body.logpass);
    connection.query("SELECT * from student_pass where user_id=?",req.body.logname,function(err,result)
    {
         /*node.js 使用回调函数的形式处理mysql 的查询结果*/
        if(err)
            console.log("查询数据失败");
        else{
            console.log("查询成功");
            console.log(result);
            connection.end();
        }
    })
});
app.listen(port,function(){
    console.log("server start at:" + port);
});

