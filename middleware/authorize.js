const conn=require('../DB/connection');
const util = require ("util");

const authorized =async (req,res,next)=>{
    const query =util.promisify(conn.query).bind(conn);
    const {token} = req.headers;  //curly bracket used to extract only token from header
    const user = await query("select * from users where token = ?",[token]);
    if (user[0]){
        next();
    }
    else {
        res.status(403).json({
            msg:"you are not authorized to access this route",
        });
    }
};

module.exports=authorized;
