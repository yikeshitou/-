var express = require("express");
var path = require('path')
var port = process.env.PORT || 1337;//这里使用1337端口
var app = express();
var mysql=require('mysql');
var bodyParser =require('body-parser');
//var captchapng = require('./captchapng/lib/captchapng');
var BMP24_1 = require("gd-bmp").BMP24;
var crypto = require('crypto');
var cookieParser=require('cookie-parser');
var session=require('express-session');
var domin=require('domain');
var urlencoded=bodyParser.urlencoded({extended:false});//form数据的请求体类型是 x-www-form-urlencoded 这里选择用urlencoded 格式来解析post 请求
/*与数据库服务器建立连接*/
var randomstring=""+crypto.randomBytes(256);
var connection=mysql.createConnection({
    host:'localhost',
    port:3306,
    database:'t&s',
    user:'root',
    password:'root',
});

// 仿PHP的rand函数
function rand(min, max) {
    return Math.random() * (max - min + 1) + min | 0; // 特殊的技巧，|0可以强制转换为整数
}
//生成随机验证码
//str是本次生成验证码要使用的字符串
function makeCapcha(str) {
    var img = new BMP24_1(120, 44);
    for(var i=0; i<img.w; i++)
        for(var j=0; j<img.h; j++)
            img.drawPoint(i,j,0xffffff);
    img.drawRect(0, 0, img.w-1, img.h-1, 0xffffff);//画框
    img.drawCircle(rand(0, 100), rand(0, 40), rand(10 , 40), rand(0, 0xffffff)); // 画圆
    img.fillRect(rand(0, 100), rand(0, 40), rand(10, 35), rand(10, 35), rand(0, 0xffffff));
    img.drawLine(rand(0, 100), rand(0, 40), rand(0, 100), rand(0, 40), rand(0, 0xffffff));//画线
    //画曲线
    var w=img.w/2;
    var h=img.h;
    var color = rand(0, 0xffffff);
    var y1=rand(-5,5); //Y轴位置调整
    var w2=rand(10,15); //数值越小频率越高
    var h3=rand(4,6); //数值越小幅度越大
    var bl = rand(1,5);
    for(var i=-w; i<w; i+=0.1) {
        var y = Math.floor(h/h3*Math.sin(i/w2)+h/2+y1);
        var x = Math.floor(i+w);
        for(var j=0; j<bl; j++){
            img.drawPoint(x, y+j, color);//画点
        }
    }
    var fonts = [BMP24_1.font8x16, BMP24_1.font12x24, BMP24_1.font16x32];
    var x = 15, y=8;
    for(var i=0; i<str.length; i++){
        var f = fonts[Math.random() * fonts.length |0];
        y = 8 + rand(-10, 10);
        img.drawChar(str[i], x, y, f, rand(0, 0xffffff));
        x += f.w + rand(2, 8);
    }
    //return img;
    return img.getFileData();
}

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
app.use(express.static(url));
app.use(cookieParser(randomstring));
app.get("/",function(req,res){
    /*登陆页面的路由*/
    res.sendFile( path.join(url,"index.html") );
});

app.get("/teacher",function(req,res){
    /*教师登陆端的路由*/
    /*需检查session*/
    var d=domin.create();
    d.once('error',function(err)
    {
        res.send("<a href='https://www.hitwh.xyz'>请登陆后访问<a>"); 
        console.log("未识别的登陆");
        });
    d.run(
        function()
        {
            console.log(req.signedCookies);
            if(req.signedCookies["islogin"]==1)
            {
                res.sendFile(path.join(url,"pages","teacher.html"));                
            }
            else{
                res.send("<a href='https://www.hitwh.xyz'>请登陆<a>");        
            }
        }
    ) 
    
});

app.get('/student',function(req,res){
    /*学生端的路由*/
    var d=domin.create();
    d.once('error',function(err)
    {
        res.send("<a href='https://www.hitwh.xyz'>请登陆后访问<a>"); 
        console.log("未识别的登陆");
        });
    d.run(
        function()
        {
            console.log(req.signedCookies);
            if(req.signedCookies["islogin"]==1)
            {
                res.sendFile(path.join(url,"pages","student.html"));                
            }
            else{
                res.send("<a href='https://www.hitwh.xyz'>请登陆<a>");        
            }
        }
    ) 
})

app.get("/captcha",function(req,res){
        var p = "ABCDEFGHKMNPQRSTUVWXYZ3456789";
        var str = '';
        for(var i=0; i<5; i++){
            str += p.charAt(Math.random() * p.length |0);
        }
        console.time('makeCapcha');
        var img = makeCapcha(str);
        console.log(img);
        console.timeEnd('makeCapcha');
        res.setHeader('Content-Type', 'image/bmp');
        res.end(img);
        /*var p = new captchapng(80,30,parseInt(Math.random()*9000+1000)); // width,height,numeric captcha
        p.color(255, 0, 255, 0);  // First color: background (red, green, blue, alpha)
        p.color(190, 80, 80, 255); // Second color: paint (red, green, blue, alpha)
        var img = p.getBase64();
        var imgbase64 = new Buffer(img,'base64');
        response.writeHead(200, {
            'Content-Type': 'image/png'
        });
        response.end(imgbase64);*/
});

app.use(session({
    secret: ""+crypto.randomBytes(128),

    cookie:{
        maxAge:60*1000*10
    }
}));
app.post("/login",urlencoded,function(req,res){

    if(req.body.logpass.lenth<6||req.body.logpass.lenth>16)
    {
        /*密码位数不对则不反应*/
    }
    else
    {
        var hash=crypto.createHash('sha256');
        console.log(typeof(req.body.logpass));
        hash.update(req.body.logpass,"utf8");
        var hexhash=hash.digest("hex");
        console.log(hexhash);
        connection.query("SELECT * from teacher_pass where uid=? and pwd=?",[req.body.logname,hexhash],function(err,result)
    {
        if(err)
        {
            console.log("查询失败："+err);
        }
        else{
            console.log(result);
            if(result!=""){
                res.cookie("islogin",1,{
                    maxAge:1000*60*60,
                    signed:true
                })
                res.cookie("username",logname,{
                    maxAge:1000*60*60,
                    signed:true
                })
                res.sendFile(path.join(url,"pages","student.html"));
            }
            else{
                res.cookie("islogin",0,{
                    maxAge:1000*60*60,
                    signed:true
                })
                res.send("<a href='https://www.hitwh.xyz'>密码错误，点击返回<a>");
            }
        }
        connection.commit();
    })
    }
});
app.listen(port,function(){
    console.log("server start at:" + port);
});

