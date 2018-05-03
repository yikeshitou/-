var express=require('../public/node_modules/express');
var bodyParser =require('../public/node_modules/body-parser');
var mysql=require('../public/node_modules/mysql');
var app=express();
var path=require("path");
var crypto = require('crypto');
var urlencoded=bodyParser.urlencoded({extended:false});
var https=require("https");
var qs=require('querystring');
//改变运行目录
port=1339;
process.chdir('../');
process.chdir('../');

//连接数据库
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
});

//加载静态文件
var StuUri=path.join(process.cwd(),"前端","student");
var PubUri=path.join(process.cwd(),"前端","public");
app.use(express.static(StuUri));
app.use(express.static(PubUri));
//登陆
app.use("/login",urlencoded,function(req,res){
    //content 为验证验证码所需的数据
    var data={
        aid:2009549499,
        AppSecretKey:'0L8QeB6dMetICRsTMCJxk8A**',
        Ticket:req.body.ticket,
        Randstr:req.body.randstr,
        UserIP:req.connection.remoteAddress
    };
    var content=qs.stringify(data);

    var url='https://ssl.captcha.qq.com/ticket/verify?'+content;
    https.get(url,(resforver)=>{
        resforver.on('data',(d)=>{
            if(d.toString()[13]=='1')//验证码成功
            {
                console.log("验证成功");
            }
        });
    }).on("error",(e)=>{
        console.error(e.toString());
    });

});
app.use("/",function(req,res)
{
    res.sendFile(path.join(StuUri,"login.html"));
});
app.listen(1339);