const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 2001;

// Middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.awjlwox.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const db = client.db("assignment10");
    const carCollection = db.collection("carProudct"); // আপনার বানান অনুযায়ী
    const bookingCollection = db.collection("bookings");
    const newsandarticle = db.collection("newsandarticle");
    const testimonialCollection = db.collection("testimonials");


    // ১. সব গাড়ি অথবা ইমেইল দিয়ে ফিল্টার করা গাড়ি আনা (My Listing এর জন্য)
    app.get("/carProduct", async (req, res) => {
      const email = req.query.email; // ফ্রন্টএন্ড থেকে আসা ইমেইল কুয়েরি
      let query = {};
      if (email) {
        query = { providerEmail: email }; // শুধু ওই ইউজারের গাড়ি খুঁজবে
      }
      try {
        const result = await carCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error fetching cars" });
      }
    });

    // ২. সিঙ্গেল গাড়ি ডিটেইলস
    app.get("/cardetails/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await carCollection.findOne({ _id: new ObjectId(id) });
        if (result) res.send(result);
        else res.status(404).send({ message: "Car not found" });
      } catch (error) {
        res.status(500).send({ message: "Invalid ID format" });
      }
    });

    // ৩. নতুন গাড়ি অ্যাড করা
    app.post("/add-car", async (req, res) => {
      const car = req.body;
      try {
        const result = await carCollection.insertOne(car);
        res.status(201).send({ insertedId: result.insertedId });
      } catch (error) {
        res.status(500).send({ message: "Failed to add car" });
      }
    });

    // ৪. গাড়ি আপডেট করা
    app.put("/update-car/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      // আইডি এবং ইমেইল যাতে আপডেট না হয়
      delete updatedData._id;
      delete updatedData.providerEmail;

      try {
        const query = { _id: new ObjectId(id) };
        const updateDoc = { $set: { ...updatedData } };
        const result = await carCollection.updateOne(query, updateDoc);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Update failed" });
      }
    });

    // ৫. গাড়ি ডিলিট করা (My Listing থেকে)
  

    app.delete("/carProduct/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const query = { _id: new ObjectId(id) };
        const result = await carCollection.deleteOne(query);

        // সরাসরি result পাঠিয়ে দিন, যাতে deletedCount ফ্রন্টএন্ডে পাওয়া যায়
        res.send(result);
      } catch (error) {
        console.error("Error deleting car:", error);
        res.status(500).send({ message: "Failed to delete car", error: error.message });
      }
    });

  

    // ৬. বুকিং সেভ করা (ডুপ্লিকেট চেকসহ)
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      try {
        const existing = await bookingCollection.findOne({
          carId: booking.carId,
          userEmail: booking.userEmail,
        });
        if (existing) {
          return res.status(409).send({ message: "Already booked!" });
        }
        const result = await bookingCollection.insertOne(booking);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Booking failed" });
      }
    });

    // ৭. ইউজারের সব বুকিং দেখা (My Bookings এর জন্য)
    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      const query = email ? { userEmail: email } : {};
      try {
        const result = await bookingCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Fetch failed" });
      }
    });

    // ৮. বুকিং ক্যান্সেল/ডিলিট করা
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await bookingCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Cancel failed" });
      }
    });

    // ---------------------------------------------------------
    // OTHER ROUTES
    // ---------------------------------------------------------
    app.get("/newsandarticle", async (req, res) => {
      const result = await newsandarticle.find().toArray();
      res.send(result);
    });

    app.get("/testimonial", async (req, res) => {
      const result = await testimonialCollection.find().toArray();
      res.send(result);
    });

    console.log("✅ Connected to MongoDB!");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Car Rental Server is running...");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});