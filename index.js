//init express

const express =require("express");
const app=express();

// global middleware

app.use(express.json());
app.use(express.urlencoded({extended: true}));// to access urlencoded
app.use(express.static("upload"));
const cors = require("cors")
app.use(cors());//allow http request localhost 

// require modules 
const auth = require("./routes/Auth");
const book = require("./routes/Books");


//run the app

app.listen(4000.,"localhost",()=>{
    console.log("server started");
});


// api routes 
app.use("/Auth",auth);
app.use("/book" , book);

