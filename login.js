var express = require("express");
var path = require('path')
var port = process.env.PORT || 80;
var app = express();
var mysql=require('mysql');
var bodyParser =require('body-parser')
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

app.use(express.static(path.join(__dirname, '/login')))
app.get("/",function(req,res){
    /*登陆页面的路由*/
    res.sendFile( __dirname + "/" + "index.html" );
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
    if(err)console.log("查询数据失败");
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
