const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jgjgvfa.mongodb.net/?retryWrites=true&w=majority`;

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


    const roomCollection = client.db('hotelRoom').collection('room');

    const availableRoomsCollection = client.db('hotelRoom').collection('availableRooms');

    const bookingCollectionRooms = client.db('hotelRoom').collection('bookingsAll')

    app.get('/room', async (req, res) => {
      const cursor = roomCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/availableRooms', async (req, res) => {
      const cursor = availableRoomsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/availableRooms/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await availableRoomsCollection.findOne(query)
      res.send(result)
    })

    app.get('/bookingsAll', async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email}
      }
      const result = await bookingCollectionRooms.find(query).toArray();
      res.send(result)
    })

    app.post('/bookingsAll', async(req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollectionRooms.insertOne(booking);
      res.send(result)

    })

    app.delete('/bookingsAll/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollectionRooms.deleteOne(query)
      res.send(result)
    })

    
    app.get('/sortedPrice/:id', async (req, res) => {
      const sortedValue = req.params.id;
      console.log(sortedValue);
      if(sortedValue === 'low'){
        const products = await availableRoomsCollection.find().sort({ price: 1 }).toArray();
        res.json(products);
        return;

      }
      else if (sortedValue == 'high'){
        const products = await availableRoomsCollection.find().sort({ price: -1 }).toArray();
        res.json(products);
        return;
      }
      else{
        const products = await availableRoomsCollection.find().toArray();
        res.json(products);
        return;
      }
     
    });

    // Route to get six products sorted by price in descending order
    app.get('/descending', async (req, res) => {
      try {
        const products = await Product.find().sort({ price: -1 }).limit(6);
        res.json(products);
      } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
      }
    });

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
  res.send('hotel is running')
})

app.listen(port, () => {
  console.log(`hotel room server is running on port ${port}`);
})