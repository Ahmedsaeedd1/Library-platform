const conn=require('../DB/connection');
const util = require ("util");
const express=require("express");

const admin =async (req,res,next)=>{
    const query =util.promisify(conn.query).bind(conn);
    const {token} = req.headers;        //we got tokens from header
    const admin = await query("select * from users where token = ?",[token]);
    if (admin[0]&&admin[0].type=="1"){
        next();
    }
    else {
        res.status(403).json({
            msg:"you are not authorized to access this route",
        });
    }
};

module.exports=admin;
