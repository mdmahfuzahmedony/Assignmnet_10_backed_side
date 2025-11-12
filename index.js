const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 2001;
require("dotenv").config();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.awjlwox.mongodb.net/?appName=Cluster0`;
// console.log(process.env.DB_USERNAME);
// console.log(process.env.DB_PASSWORD);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const db = client.db("assignment10");
    const carCollection = db.collection("carProudct");
    const bookingCollection = db.collection("bookings");
    const newsandarticle = db.collection("newsandarticle");
    const testimonialCollection = db.collection("testimonials");
    const bookingCollections = db.collection("bookings");

    // Get all cars
    app.get("/carProduct", async (req, res) => {
      const result = await carCollection.find().toArray();
      res.send(result);
      console.log("Fetched all car products.");
    });

    // Get single car details
    app.get("/cardetails/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await carCollection.findOne({ _id: new ObjectId(id) });
        if (result) {
          res.send(result);
        } else {
          res.status(404).send({ message: "Car not found" });
        }
      } catch (error) {
        console.error("Error fetching car details:", error);
        res.status(500).send({ message: "Invalid ID format or server error" });
      }
    });

    // Add new car
    app.post("/add-car", async (req, res) => {
      const car = req.body;
      console.log("Received new car data:", car);
      try {
        const result = await carCollection.insertOne(car);
        res.status(201).send({
          message: "Car added successfully!",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error("Error adding car to database:", error);
        res
          .status(500)
          .send({ message: "Failed to add car", error: error.message });
      }
    });

    // Update car
    app.put("/update-car/:id", async (req, res) => {
      const id = req.params.id;
      const updatedCarData = req.body;
      console.log(`Attempting to update car with ID: ${id}`);
      console.log("Updated data:", updatedCarData);

      delete updatedCarData.providerName;
      delete updatedCarData.providerEmail;
      delete updatedCarData._id;

      try {
        const query = { _id: new ObjectId(id) };
        const updateDoc = { $set: { ...updatedCarData } };
        const result = await carCollection.updateOne(query, updateDoc);

        if (result.matchedCount === 0) {
          res.status(404).send({ message: "Car not found" });
        } else {
          res.send({ message: "Car updated successfully!" });
        }
      } catch (error) {
        console.error("Error updating car:", error);
        res
          .status(500)
          .send({ message: "Failed to update car", error: error.message });
      }
    });

    // Delete car
    app.delete("/carProduct/:id", async (req, res) => {
      const id = req.params.id;
      console.log(`Attempting to delete car with ID: ${id}`);

      try {
        const query = { _id: new ObjectId(id) };
        const result = await carCollection.deleteOne(query);

        if (result.deletedCount === 1) {
          res.send({ message: "Car deleted successfully!" });
        } else {
          res.status(404).send({ message: "Car not found or already deleted" });
        }
      } catch (error) {
        console.error("Error deleting car:", error);
        res
          .status(500)
          .send({ message: "Failed to delete car", error: error.message });
      }
    });

    // Provider-wise car fetch
    app.get("/my-cars/:email", async (req, res) => {
      const email = req.params.email;
      console.log(`Fetching cars for provider: ${email}`);

      try {
        const query = { providerEmail: email };
        const result = await carCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching provider's cars:", error);
        res
          .status(500)
          .send({ message: "Failed to fetch cars", error: error.message });
      }
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      console.log("Received new booking:", booking);

      try {
        const result = await bookingCollection.insertOne(booking);
        res.status(201).send({
          message: "Booking added successfully!",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error("Error saving booking:", error);
        res
          .status(500)
          .send({ message: "Failed to save booking", error: error.message });
      }
    });

    // Get all bookings for a specific user
    app.get("/bookings/:email", async (req, res) => {
      const email = req.params.email;
      console.log("Fetching bookings for:", email);

      try {
        const query = { userEmail: email };
        const result = await bookingCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        res
          .status(500)
          .send({ message: "Failed to fetch bookings", error: error.message });
      }
    });

    // Delete booking by ID
    app.delete("/bookings/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await bookingCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 1) {
          res.send({ message: "Booking cancelled successfully!" });
        } else {
          res.status(404).send({ message: "Booking not found" });
        }
      } catch (error) {
        console.error("Error deleting booking:", error);
        res
          .status(500)
          .send({ message: "Failed to cancel booking", error: error.message });
      }
    });

    app.post("/bookings", async (req, res) => {
      try {
        const booking = req.body;
        const result = await bookingCollections.insertOne(booking);
        res.status(201).send({
          message: "Booking successful!",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error("Error creating booking:", error);
        res
          .status(500)
          .send({ message: "Failed to create booking", error: error.message });
      }
    });

    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      console.log("📩 Fetch request for email:", email);

      const query = email ? { userEmail: email } : {};
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    // News & Articles
    app.get("/newsandarticle", async (req, res) => {
      const result = await newsandarticle.find().toArray();
      res.send(result);
    });

    // Testimonials
    app.get("/testimonial", async (req, res) => {
      const testimonialsResult = await testimonialCollection.find().toArray();
      console.log("Fetched testimonials:", testimonialsResult);
      res.send(testimonialsResult);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB successfully!");
  } finally {
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
