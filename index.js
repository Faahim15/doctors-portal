const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r1m7h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
         // for sending data on database
         const database = client.db("Services");
         const appointmentCollection = database.collection("appointments");
         const usersCollection = database.collection("users");
         
         app.get("/deshboard/appointments",async(req,res)=>{
            const appointments = appointmentCollection.find({});
            const result = await appointments.toArray();
            res.send(result)
          })
        
         app.get("/appointments",async(req,res)=>{
           const email = req.query.email;
           const date = new Date (req.query.date).toLocaleDateString();
           const query = {email:email, date:date};
           const result = appointmentCollection.find(query);
           const appointments = await result.toArray();
           res.json(appointments);
         })
         
         app.get("/users/:email",async(req,res)=>{
           const email = req.params.email;
           const query = {email:email};
           const user = await usersCollection.findOne(query);
           let isAdmin = false;
           if(user?.role === "admin"){
               isAdmin = true;
           }
           res.json({admin:isAdmin})
         })
 
         app.post("/appointments",async(req,res)=>{
           const appointment = req.body;
           const result = await appointmentCollection.insertOne(appointment);
           res.json(result)
         })
         
         app.post("/users",async(req,res)=>{
           const user = req.body;
           const result = await usersCollection.insertOne(user);
           res.json(result)
         })
 
         app.put('/users',async(req,res)=>{
           const user= req.body;
           const filter = {email: user.email};
           const options = {upsert:true};
           const updateDoc = {$set:user};
           const result = await usersCollection.updateOne(filter,updateDoc,options)
           res.json(result);
         })
         
         app.put('/users/admin',async(req,res)=>{
           const user= req.body;
           console.log(req.headers.authorization);
           const filter = {email: user.email};
           const options = {upsert:true};
           const updateDoc = {$set:user};
           const result = await usersCollection.updateOne(filter,updateDoc,options)
           res.json(result);
         }) 
    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})