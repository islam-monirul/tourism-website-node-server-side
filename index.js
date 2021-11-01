const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9tg9f.mongodb.net/${process.env.DB_HOST}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// console.log(uri);

async function run() {
  try {
    await client.connect();
    console.log("Database connection successful!");

    const database = client.db("tourPacks");
    const tourCollection = database.collection("tours");
    const allOrders = database.collection("orders");

    //     get tours api
    app.get("/tours", async (req, res) => {
      const cursor = tourCollection.find({});
      const tours = await cursor.toArray();

      res.send(tours);
    });

    //     get single tour api
    app.get("/tours/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const result = await tourCollection.findOne(query);
      console.log(result);

      res.json(result);
    });

    //     get myorders api
    app.get("/myorders/:email", async (req, res) => {
      const usermail = req.params.email;
      console.log(usermail);

      const query = { email: usermail };

      const result = await allOrders.find(query).toArray();

      res.send(result);
    });

    //     get all orders api
    app.get("/allorders", async (req, res) => {
      const cursor = allOrders.find({});
      const orders = await cursor.toArray();

      res.send(orders);
    });

    //     update status api
    app.put("/updateOrder/:id", async (req, res) => {
      const id = req.params.id;
      const updatedOrder = req.body;

      const filter = { _id: ObjectId(id) };
      const options = { updsert: true };

      const updateDoc = {
        $set: {
          status: updatedOrder.status,
        },
      };

      const result = await allOrders.updateOne(filter, updateDoc, options);

      res.json(result);
    });

    //     post order api
    app.post("/tours/placeorders", async (req, res) => {
      const addedOrders = req.body;

      const result = await allOrders.insertOne(addedOrders);

      console.log("Added order ", result);
      res.json(result);
    });

    //     delete order api
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Delete order having id ", id);

      const query = { _id: ObjectId(id) };
      const result = await allOrders.deleteOne(query);

      console.log("Deleted order: ", result);

      res.json(result);
    });
  } finally {
    //     await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to the Server Side!");
});

app.listen(port, () => {
  console.log("Listening to port: ", port);
});
