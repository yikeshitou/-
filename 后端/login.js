var express = require("express");
var path = require('path')
var port = process.env.PORT || 1337;//这里使用1337端口
var app = express();
var mysql=require('mysql');
var bodyParser =require('body-parser');
var captchapng = require('./captchapng/lib/captchapng');
var crypto = require('crypto');

/*与数据库服务器建立连接*/
var connection=mysql.createConnection({
    host:'localhost',
    port:3306,
    database:'t&s',
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

var url=path.join("D:","Git","-","-","前端");//刘哲宁电脑本地调试所需，其他电脑本地调试可选择性注释
app.use(express.static( '前端'));//保证本地调试，浏览器可以正常加载css
//var url=path.join("C:","工程2.0","前端");
//var url=path.join("F:","软件工程实验","工程2.0","前端");
//app.use(express.static(url));
app.get("/",function(req,res){
    /*登陆页面的路由*/
    res.sendFile( path.join(url,"index.html") );
});
app.get("/teacher",function(req,res){
    /*教师登陆端的路由*/
    /*需检查session*/
    res.sendFile(path.join(url,"teacher.html"));
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
var hash=crypto.createHash('sha256');
app.post("/login",urlencoded,function(req,res){
    if(req.body.logpass.lenth<6||req.body.logpass.lenth>16)
    {
        /*密码位数不对则不反应*/
    }
    else
    {
        console.log(typeof(req.body.logpass));
        hash.update(req.body.logpass,"utf8");
        connection.query("SELECT * from teacher_pass where uid=? and pwd=?",[req.body.logname,hash.digest("hex")],function(err,result)
    {
        if(err)
        {
            console.log("查询失败："+err);
        }
        else{
            res.sendFile(path.join(url,"teacher.html"));
            connection.end();
        }
    })
    }
});
app.listen(port,function(){
    console.log("server start at:" + port);
});

