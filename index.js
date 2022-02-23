const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const fileUpload = require("express-fileupload")
require("dotenv").config()
const { MongoClient } = require('mongodb')
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ka9ky.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(fileUpload())
// app.use(express.urlencoded({extended:false}))
app.use(bodyParser.urlencoded({ extended: false }))


client.connect(err => {

  const collection = client.db("aircnc").collection("aircncCollection");
  const guestCollection = client.db("aircnc").collection("guests");

  app.post("/postitem",(req,res)=>{
    const file = req.files.file;
    const key = req.body.key;
    const name = req.body.name;
    const rating = req.body.rating;
    const baths = req.body.baths;
    const des = req.body.des;
    const price = req.body.price;
    const newImg = file.data
    const newFile = newImg.toString("base64")
    var image = {
      contentType : file.mimetype,
      size : file.size,
      img : Buffer.from(newFile,"base64")
  }
    console.log({key,name,rating,baths,des,price,image})
    
    collection.insertOne({key,name,rating,baths,des,price,image})
    .then(function(result){
        res.send(result.insertedCount > 0)
    })
  })

  app.get("/getitem",(req,res)=>{
    const searchresult = req.query.search;
    collection.find({ name : { $regex:searchresult }})
    .toArray((err,document)=>{
      res.send(document)
    })
  })

  app.post("/applyguest",(req,res)=>{
    const applyInformation = req.body
    console.log(applyInformation)
    guestCollection.insertOne(applyInformation)
    .then(function(result){
      res.send(result)
    })
  })

  app.get("/keyresult/:key",(req,res)=>{
    const key = req.params.key
    collection.find({key})
    .toArray((err,documents)=>{
      res.send(documents[0])
    })
  })

  app.get("/getdetails",(req,res)=>{
    console.log(req.query.email)
    guestCollection.find({email:req.query.email})
    .toArray((err,users)=>{
      res.send(users[0])
    })
  })

  
  
  console.log("db connected")
});

app.get("/",(req,res)=>{
    res.send("aircnc website")
})

const port = 4000;

app.listen(process.env.PORT || port,console.log("running port 4000"))