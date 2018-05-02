var express=require('../public/node_modules/express');
var app=express();
port=1339;
app.use("/",function(res,req)
{
    console.log("OK");
});
app.listen(1339);