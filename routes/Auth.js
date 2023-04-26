const router = require("express").Router();
const conn=require('../DB/connection');
const{ body, validationResult}=require("express-validator");
const util =require("util");
const bcrypt = require ("bcrypt");
const crypto= require("crypto");
const admin = require("../middleware/admin");


//login 
router.post("/login",
body("email").isEmail().withMessage("enter a valid Email"),
body("password").isLength({min:8,max:15}).withMessage("Password should be between (8-15) character"),
async (req,res)=>{
    try{
        //validation request
        const errors=validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({error:errors.array()});
        }
        else{
        //check email if its already exists
            const query =util.promisify(conn.query).bind(conn);// transform sql query to promise to use (await / async)
            const user = await query("select * from users where email = ?",[req.body.email]);
            const active = await query ("select Status from users");
            if (user.length==0){
                res.status(404).json({
                    errors:[{
                    msg:"Email not found",
                    },
                ],
                });
            }
            // compare hashed password
            const checkPassword= await bcrypt.compare(req.body.password,user[0].password);
            if(checkPassword){
                // btcheck  law al account active 
                if(user[0].Status==[1]){
                    delete user[0].password;
                    // bt print al data bt3ty
                    res.status(200).json(user);}
                    else {
                        res.status(404).json({
                            errors:[{
                            msg:"your account is not activated yet wait till admin activate it",
                            },
                        ],
                        });
                    }
            }
            else{
                res.status(404).json({
                    errors:[{
                    msg:"wrong password",
                    },
                ],
                });
            }

            res.json("hi");
        }
}catch(err){
    res.status(500).json({err:err});
}
});

//register
router.post("/register",
body("email").isEmail().withMessage("enter a valid  Email"),
body("name").isString().withMessage("enter a valid  Name").isLength({min :8,max:20}).withMessage("Name should be between (8-20) character"),
body("password").isLength({min:8,max:15}).withMessage("Password should be between (8-25) character"),
body("phone").isMobilePhone(['ar-EG']).withMessage("plz enter valid phone number"),
async (req,res)=>{
    try{
        //validation request 
        const errors=validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({error:errors.array()});
        }
        else{
        //check email if its already exists
            const query =util.promisify(conn.query).bind(conn);// transform sql query to promise to use (await / async)
            const checkEmailExists = await query("select * from users where email = ?",[req.body.email]);
            if (checkEmailExists.length>0){
                res.status(400).json({
                    errors:[{
                    msg:"Email is registered before",
                    },
                ],
                });
            }
            else{
                //save new user                  (userdata : receive data as json(key ; value) )
                const userData ={
                    email: req.body.email,
                    name:req.body.name,
                    password: await bcrypt.hash(req.body.password,10),
                    phone:req.body.phone,
                    token:crypto.randomBytes(16).toString("hex"),        // crypto makes token
                }
                //insert new user to db
                await query("insert into users set ?",userData);
                delete userData.password;
                res.status(200).json(userData);
            }
        }

    }catch(err){
        res.status(500).json({err:err});
    }
});

// activate account
router.put("/active"
,admin,
body("email").isEmail().withMessage("enter a valid Email"),
async (req,res)=>{
    try{
        //validation request
        const errors=validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({error:errors.array()});
        }
        else{
        //check email if its already exists
            const query =util.promisify(conn.query).bind(conn);// transform sql query to promise to use (await / async)
            const user = await query("select * from users where email = ?",[req.body.Email]);
            const active = await query ("select Status from users");
            if (user.length==0){
                res.status(404).json({
                    errors:[{
                    msg:"Email not found",
                    },
                ],
                });
            }
            //check if status is active or not 
            if(user[0].Status==[1]){
                res.status(404).json({
                    msg:"account is already activated"
                });
            }
            else {
                await query("update users SET Status ='1' where email = ? ",user[0].email);
                res.status(200).json({
                    mag:"account activated"
                });
            }
}}catch(err){
    res.status(500).json({err:err});
}
});




module.exports = router;
