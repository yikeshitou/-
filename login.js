var express = require("express");
var path = require('path')
var port = process.env.PORT || 80;
var app = express();
var mysql=require('mysql');
var bodyParser =require('body-parser');
var http = require('http');
var captchapng = require('./captchapng/lib/captchapng') ;
const ejs = require('ejs');//加载ejs模块

var connection=mysql.createConnection({
    host:'localhost',
    port:3306,
    database:'school',
    user:'root',
    password:'root',
});
/*与数据库服务器建立连接*/
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

//注册模板文件的后缀名为html，默认为ejs
//app.engine('html', ejs.__express);
//设置模板文件存放的目录，默认是与app.js同级下views文件夹
//path.join()用于路径拼接，可以根据当前的操作系统的类型正确选用文件路径拼接字符，linux是/,window是\
//app.set('view engine', path.join(__dirname, '/login'));

app.use(express.static(path.join(__dirname, '/login')))
app.get("/",function(req,res){
    /*登陆页面的路由*/
    var p = new captchapng(80,30,parseInt(Math.random()*9000+1000)); // width,height,numeric captcha
    p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
    p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)
    var img = p.getBase64();
    console.log(img); 
    
    //res.render('test.html');

    res.sendFile( __dirname + "/login/" + "index.html" );

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

http.createServer(function (request, response) {
    if(request.url == '/captcha.png') {
        var p = new captchapng(80,30,parseInt(Math.random()*9000+1000)); // width,height,numeric captcha
        p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
        p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)

        var img = p.getBase64();
        var imgbase64 = new Buffer(img,'base64');
        response.writeHead(200, {
            'Content-Type': 'image/png'
        });
        response.end(imgbase64);
    } else response.end('');
}).listen(8181);
//console.log('Web server started.\n http:\\\\127.0.0.1:8181\\captcha.png');
