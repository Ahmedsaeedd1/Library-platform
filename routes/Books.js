const router = require("express").Router();
const conn=require('../DB/connection');
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const{ body, validationResult}=require("express-validator");
const upload = require("../middleware/uploading");
const util =require("util"); 
const fs = require("fs");   //file system
const { query } = require("express");

//admin [create , update , delete, list]

router.post("/create",
admin,
upload.single("Photo"),

body("Title").isString()
.withMessage("enter a valid  Title")
.isLength({min :4,max:20})
.withMessage("Title should be between (4-20) character"),

body("Racknumber").isNumeric(),

body ("ISBN").isNumeric() ,

body("Author").isString()
.withMessage("enter a the author name")
.isLength({min:3,max:15}).
withMessage("Author should be between (3-15) character"),

body("Category").isString()
.withMessage("plz the category"),


async(req,res)=>{
    try{
     //validation request 
    const errors=validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({error:errors.array()});
    }
    // validate the image 
    if(!req.file){
        return res.status(400).json({
            errors:[{
                msg:"image is required",
            },],
        });
    }
    // prepare question object
    const book={
        Title: req.body.Title,
        Racknumber: req.body.Racknumber,
        ISBN: req.body.ISBN,
        Author: req.body.Author,
        Category: req.body.Category,
        Photo: req.file.filename
    };
    // insert into database
    const query =util.promisify(conn.query).bind(conn);// transform sql query to promise to use (await / async)
    await query("insert into book set ?",book);

    res.status(200).json({
        msg:"book created",
    });
    }
    catch(err){
        res.status(500).json(err);
    }
});


//update book
router.put("/:Id",
admin,
upload.single("	Photo"),   //photo da esm el file ely fyh el sora ely hb3to fe el file lazm fe el awl 34an el form data btshof el image el awl b3dha b access el data ely mb3tpa m3aha

body("Title").isString()
.withMessage("enter a valid  Title")
.isLength({min :4,max:20})
.withMessage("Title should be between (4-20) character"),

body("Racknumber").isNumeric(),

body ("ISBN").isNumeric() ,

body("Author").isString()
.withMessage("enter a the author name")
.isLength({min:3,max:15}).
withMessage("Author should be between (3-15) character"),

body("Category").isString()
.withMessage("plz the category"),

async(req,res)=>{
    try{
     //validation request 
    const query =util.promisify(conn.query).bind(conn);// transform sql query to promise to use (await / async)
    const errors=validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({error:errors.array()});
    }
    // 2- check if question exist
    const book = await query("select * from book where Id= ? ",[req.params.Id]);
    if (!book[0]){
        res.status(404).json({
            msg:"book not found"
        });
    }

    //3- prepare question object
    const BooKObj={
        Title: req.body.Title,
        Racknumber: req.body.Racknumber,
        ISBN: req.body.ISBN,
        Author: req.body.Author,
        Category: req.body.Category,

    }
    // lw 3ayz a8yr el image
    if (req.file){
        BooKObj.Photo=req.file.filename;
        //delete old image
        fs.unlinkSync("./upload/"+book[0].Photo)
    }
    //update question
        await query("update book set ? where Id =?",
        [
            BooKObj,
            book[0].Id
        ]);
        res.status(200).json({
            msg:"book updated"
        });
    }
    catch(err){
        res.status(500).json(err);
    }
});

router.delete(
"/:Id",
admin,
async(req,res)=>{
    try{

    // 1- check if book exists
    const query =util.promisify(conn.query).bind(conn);// transform sql query to promise to use (await / async)
    const book = await query("select * from book where Id= ? ",[req.params.Id]);
    if (!book[0]){
        res.status(404).json({ msg:"book not found!" });
    }

       // 2- remove book image
        fs.unlinkSync("./upload/"+book[0].Photo);   //delete old image
    //delete book
        await query("delete from book where Id =?",
        [ book[0].Id]);
        res.status(200).json({  msg:"book deleted successfully" });
    }
    catch(err){
        res.status(500).json(err);
    }
});

// filter by isbn & racknumber [user , admin]
router.get( "/filter" , 
admin,

 async(req ,res)=>{
    const query =util.promisify(conn.query).bind(conn);
    let ISBN = "" ;
    let Racknumber = "";

    if(req.query.ISBN && req.query.Racknumber){
        // query params
        ISBN =  `where ISBN LIKE '%${req.query.ISBN}%' `;
        Racknumber = `AND Racknumber LIKE'%${req.query.Racknumber}%' `;

      const books = await query(` select * from book ${ISBN} ${Racknumber} `);
      books.map (book =>{
          book.Photo = "http://" + req.hostname +  ":4000/" + book.Photo;
      });
      if (!books[0]){
        res.status(404).json({msg : "book not found"});
    }
        
        
      res.status(200).json(books);
    }
    else{
        res.status(500).json({msg: "u must enter the both rack number and ISBN" });
    }
 }
);

// searching by user 
router.get( "/searchUser" , 


 async(req ,res)=>{
    const query =util.promisify(conn.query).bind(conn);
    let Author = "" ;
    let Racknumber = "";
    let Category = "" ;
    let Id = "" ;
    let Title = "" ;
    let ISBN = "" ;


    if(req.query.Author || req.query.Category || req.query.Racknumber || req.query.Id || req.query.Title
        || req.query.ISBN ){
        // query params
        SearchByAttribute =  `where ISBN LIKE '%${req.query.ISBN}%' 
        OR Racknumber LIKE '%${req.query.Racknumber}%'
        OR Author LIKE'%${req.query.Author}%'
        OR Category LIKE'%${req.query.Category}%'
        OR Id LIKE'%${req.query.Id}%'
        OR Title LIKE'%${req.query.Title}%'
         `;

      const books = await query(` select * from book ${SearchByAttribute} `);
      books.map (book =>{
          book.Photo = "http://" + req.hostname +  ":4000/" + book.Photo;
      });
      if (!books[0]){
        res.status(404).json({msg : "book not found"});
    }
        
        
      res.status(200).json(books);
    }
    else{
        res.status(500).json({msg: "Error" });
    }
 }
);










/* router.get( "/searching" ,
//authorized,
 async(req ,res)=>{
    const query =util.promisify(conn.query).bind(conn);
    let search = "" ;
    if(req.query.search){
        // query params
        search =  `where 
        ISBN LIKE '%${req.query.search}%'
         or Id LIKE '%${req.query.search}%'
         or Title LIKE '%${req.query.search}%'
         or Author LIKE '%${req.query.search}%'
         or Category LIKE '%${req.query.search}%'
         or Racknumber LIKE '%${req.query.search}%' `;
    }

    const books = await query(` select * from book ${search}`);
    books.map (book =>{
        book.Photo = "http://" + req.hostname +  ":4000/" + book.Photo;
    });
    res.status(200).json(books);
 }
); */

//show api [user , admin]
router.get( "/:Id" ,
 async(req ,res)=>{
    const query =util.promisify(conn.query).bind(conn);
    const book = await query(" select * from book where Id = ?" , [req.params.Id]);

    if (!book[0]){
        res.status(404).json({ msg:"book not found !" });
    }
    
     book[0].Photo = "http://" + req.hostname +  ":4000/" + book[0].Photo;
     res.status(200).json(book[0]);
 }
);


router.post( "/review" ,
 (req ,res)=>{
    res.status(200).json({
        msg :"review added" ,
    })
 }
);
module.exports = router ;
//imoknmklnlnkl
const xcxzc=100 ;
