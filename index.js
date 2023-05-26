const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json())




const uri = process.env.DB_URI

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const dollCollection = client.db('toyDB').collection('products');

    
    app.delete('/products/:id' , async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await dollCollection.deleteOne(query)
      res.send(result)
    })
    app.put('/products/:id', async(req,res)=>{
      const id = req.params.id;
      const updatedUser = req.body;
      console.log(id,updatedUser)
      const filter = {_id: new ObjectId(id)}
      const options = {upsert : true}
      const newUser = {
        $set:{
          price:updatedUser.price,          
          available_quantity:updatedUser.available_quantity,
          description:updatedUser.description
        }
        
      }
      const result = await dollCollection.updateOne(filter,newUser,options)
      res.send(result)
    })
    app.post('/products',async(req,res)=>{
        console.log(req.body)
        const doll = req.body
        const result = await dollCollection.insertOne(doll)
        res.send(result)
      })
      app.get('/trending' , async(req,res)=>{
        let query = {};
        if(req.query?.trending){
          query = {trending: req.query.trending}
        }
        const result = await dollCollection.find(query).toArray();
        res.send(result)
      })
    app.get('/products' , async(req,res)=>{
      let query = {};
      if(req.query?.seller_email){
        query = {seller_email: req.query.seller_email}
      }
      const result = await dollCollection.find(query).toArray();
      res.send(result)
    })

    app.get('/products', async(req,res)=>{
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 10;
      const skip = page * limit;

      const result = await dollCollection.find().skip(skip).limit(limit).toArray();
      res.send(result)
    })
    app.get('/total', async (req, res) => {
      const result = await dollCollection.estimatedDocumentCount();
      res.send({ total: result })
    })

    app.get('/products/:id' , async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await dollCollection.findOne(query);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('doll server is running')
})

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
})