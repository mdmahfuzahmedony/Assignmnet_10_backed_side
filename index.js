const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = "mongodb+srv://assignment10:iXTjod3IWq2Nd57r@cluster0.awjlwox.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

let carCollection, bookingCollection, newsandarticle, testimonialCollection;

// Connect to MongoDB once
async function connectDB() {
  try {
    await client.connect();
    const db = client.db("assignment10");
    carCollection = db.collection("carProudct");
    bookingCollection = db.collection("bookings");
    newsandarticle = db.collection("newsandarticle");
    testimonialCollection = db.collection("testimonials");
    console.log("✅ Connected to MongoDB successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/carProduct", async (req, res) => {
  const result = await carCollection.find().toArray();
  res.send(result);
});

app.get("/cardetails/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await carCollection.findOne({ _id: new ObjectId(id) });
    if (!result) return res.status(404).send({ message: "Car not found" });
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Invalid ID format or server error" });
  }
});

app.post("/add-car", async (req, res) => {
  const car = req.body;
  const result = await carCollection.insertOne(car);
  res.status(201).send({ message: "Car added successfully!", insertedId: result.insertedId });
});

app.put("/update-car/:id", async (req, res) => {
  const id = req.params.id;
  const updatedCarData = req.body;
  delete updatedCarData._id;
  const result = await carCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedCarData });
  if (result.matchedCount === 0) return res.status(404).send({ message: "Car not found" });
  res.send({ message: "Car updated successfully!" });
});

app.delete("/carProduct/:id", async (req, res) => {
  const id = req.params.id;
  const result = await carCollection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) return res.status(404).send({ message: "Car not found" });
  res.send({ message: "Car deleted successfully!" });
});

// Bookings
app.post("/bookings", async (req, res) => {
  const booking = req.body;
  const result = await bookingCollection.insertOne(booking);
  res.status(201).send({ message: "Booking successful!", insertedId: result.insertedId });
});

app.get("/bookings", async (req, res) => {
  const email = req.query.email;
  const query = email ? { userEmail: email } : {};
  const result = await bookingCollection.find(query).toArray();
  res.send(result);
});

app.delete("/bookings/:id", async (req, res) => {
  const { id } = req.params;
  const result = await bookingCollection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) return res.status(404).send({ message: "Booking not found" });
  res.send({ message: "Booking cancelled successfully!" });
});

// News & Articles
app.get("/newsandarticle", async (req, res) => {
  const result = await newsandarticle.find().toArray();
  res.send(result);
});

// Testimonials
app.get("/testimonial", async (req, res) => {
  const result = await testimonialCollection.find().toArray();
  res.send(result);
});

// ⚠️ Important: Export app for Vercel serverless
module.exports = app;
