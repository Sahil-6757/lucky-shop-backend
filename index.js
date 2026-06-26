const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8000;
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config();
app.use(express.static("uploads"));

const db_URL = process.env.MONGODB_URL;


// Mongoose connection starts
async function main() {
  await mongoose.connect(
    "mongodb+srv://arbaz151033:Arbazkhan%406757@cluster.dapmmwg.mongodb.net/Lucky_Shop?retryWrites=true&w=majority&appName=clusternp"
  );
  console.log("MongoDB Connected");
}
main().catch((err) => console.log(err));

// Nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 587,
  secure: false,
  auth: {
    user: "support@blogbeast.in",
    pass: "Sahilkhan@6757",
  },
  rejectUnauthorized: false,
});

const contactSchema = new mongoose.Schema({
  name: { type: String, unique: false },
  email: { type: String, unique: false },
  message: { type: String, unique: false },
  time: { type: Date, default: Date.now() },
});

const userSchema = new mongoose.Schema({
  name: { type: String, unique: false },
  email: { type: String, unique: false },
  phone: { type: String, unique: false },
  address: { type: String, unique: false },
  password: { type: String, unique: false },
  time: { type: Date, default: Date.now() },
});

const adminSchema = new mongoose.Schema({
  email: { type: String, unique: false },
  password: { type: String, unique: false },
});

const itemSchema = new mongoose.Schema({
  name: { type: String, unique: false },
  description: { type: String, unique: false },
  rate: { type: String, unique: false },
  image: { type: String, unique: false },
});

const orderSchema = new mongoose.Schema({
  name: { type: String, unique: false },
  order_id: { type: String, unique: false },
  payement_id: { type: String, unique: false },
  time: { type: String, unique: false },
  email: { type: String, unique: false },
  address: { type: String, unique: false },
  mobile: { type: Number, unique: false },
  status: { type: String, default: "Pending" },
  items: [{ type: Object }],
  total: { type: String, unique: false },
});

const saleSchema = new mongoose.Schema({
  name: { type: String, unique: false },
  date: { type: String, unique: false },
  rate: { type: String, unique: false },
  quantity: { type: Number, unique: false },
  total: { type: String, unique: false },
  paid: { type: Number, default: 0 },
  pending: { type: Number, default: 0 },
  payments: [
    {
      amount: { type: Number },
      date: { type: String },
      receivedBy: { type: String },
      mode: { type: String }
    }
  ]
});

const transactionSchema = new mongoose.Schema({
  name: { type: String, unique: false },
  date: { type: String, unique: false },
  type: { type: String, unique: false },
  description: { type: String, unique: false },
  amount: { type: String, unique: false },
});

const vehicalSchema = new mongoose.Schema({
  name: { type: String, unique: false },
  date: { type: String, unique: false },
  totalAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, default: 0 },
  payments: [
    {
      amount: { type: Number },
      date: { type: String },
    }
  ]
});

let Contact = mongoose.model("contacts", contactSchema);
let User = mongoose.model("users", userSchema);
let Admin = mongoose.model("admins", adminSchema);
let Item = mongoose.model("items", itemSchema);
let Order = mongoose.model("order", orderSchema);
let Sales = mongoose.model("sales", saleSchema);
let Transaction = mongoose.model("transaction", transactionSchema);
let Vehical = mongoose.model("vehical", vehicalSchema);
// Mongoose connection ends

// Middleware starts
app.use(express.json());
app.use(bodyparser.json());
// Middleware ends

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://luckyshop.blogbeast.in",
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Origin:", origin);

      // Allow requests without an Origin (Postman, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS policy: Origin not allowed"));
    },
    credentials: true,
  })
);

app.use("/api", (req, res) => {
  res.json({ message: "Hello World" });
});

app.post("/contact", async (req, res) => {
  let contact = new Contact();
  contact.name = req.body.name;
  contact.email = req.body.email;
  contact.message = req.body.message;
  await contact.save();
  res.json({ message: "Success" });
});

app.post("/login", async (req, res) => {
  let result = await User.find(req.body);
  let admin = await Admin.find(req.body);
  if (result.length > 0) {
    res.json({ message: "login Success", user: result });
  } else if (admin.length > 0) {
    res.json({ message: "Admin login Success" });
  } else {
    res.json({ message: "login Failed" });
  }
});

app.post("/addTransaction", async (req, res) => {
  let transaction = new Transaction();
  transaction.name = req.body.name;
  transaction.date = req.body.date;
  transaction.type = req.body.type;
  transaction.description = req.body.description;
  transaction.amount = req.body.amount;
  await transaction.save();
  res.json({ message: "success" });
});

app.get("/getTransaction", async (req, res) => {
  let transaction = await Transaction.find({});
  res.json(transaction);
});

app.put("/updateProfile", async (req, res) => {
  try {
    console.log(req.body);
    await User.findOneAndUpdate(
      { email: req.body.email },
      {
        $set: {
          name: req.body.name,
          phone: req.body.mobile,
          email: req.body.email,
          address: req.body.address,
        },
      },
    );
    const result = await User.findOne({ email: req.body.email });
    res.json({ result });
  } catch (error) {
    res.json({ error });
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const newUser = new User({ name, email, password });
  newUser.save();
  res.json({ message: "success" });
});

app.put("/updateOrderStatus/:id", async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, {
      status: req.body.status,
    });
    res.json({ message: "Status Updated" });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.post("/order", async (req, res) => {
  try {
    let order = new Order();

    order.name = req.body.name;
    order.email = req.body.email;
    order.address = req.body.address;
    order.mobile = req.body.mobile;
    order.items = req.body.order;
    order.total = req.body.total;
    order.time = req.body.time;
    order.status = req.body.status;
    order.payement_id = req.body.payement_id;
    order.order_id = req.body.order_id;

    await order.save();

    // Send mail
    // try {
    //   await transporter.sendMail({
    //     from: "support@blogbeast.in",
    //     to: req.body.email,
    //     subject: `${req.body.name} - Order Placed - Lucky Shop`,
    //     html: `<h1>Order Confirmed</h1>`,
    //   });
    // } catch (error) {
    //   console.log("Mail Error:", error.message);
    // }

    res.json({ message: "success" }); // ✅ ONLY ONCE
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/order", async (req, res) => {
  let order = await Order.find({});
  res.json(order);
});

app.delete("/delete/:id", async (req, res) => {
  try {
    let id = await req.params.id;
    let data = await Contact.findById({ _id: id });

    if (data) {
      await Contact.deleteOne({ _id: id });
      res.json({ message: "Deleted" });
    } else {
      res.json({ message: "No data Found" });
    }
  } catch (error) {
    console.log(error);
  }
});

app.delete("/delete-order/:id", async (req, res) => {
  try {
    let id = await req.params.id;
    let data = await Order.findById({ _id: id });

    if (data) {
      await Order.deleteOne({ _id: id });
      res.json({ message: "Order Deleted" });
    } else {
      res.json({ message: "No Data found" });
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/getOrders", async (req, res) => {
  try {
    let email = req.body.email;
    let data = await Order.find({ email: email });
    res.json(data);
  } catch (error) {
    console.log(error);
  }
});

app.delete("/deleteOrder/:id", async (req, res) => {
  try {
    let id = await req.params.id;
    let data = await Order.findById({ _id: id });
    if (data) {
      await Order.deleteOne({ _id: id });
      res.json({ message: "Order Deleted" });
    } else {
      res.json({ message: "No Data found" });
    }
  } catch (error) {
    console.log(error);
  }
});

app.put("/edititem/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    await Item.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          description: req.body.description,
          rate: req.body.rate,
          image: req.body.image,
        },
      },
    );
    res.json({ message: "success" });
  } catch (error) {
    res.json({ error });
  }
});

app.delete("/userDelete/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let data = await User.findById({ _id: id });
    console.log(data.$isEmpty());
    if (!data.$isEmpty()) {
      await User.deleteOne({ _id: id });
      res.json({ message: "Deleted" });
    } else {
      res.json({ message: "No data Found" });
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/user", async (req, res) => {
  let user = await User.find({});
  res.json(user);
});

app.get("/", async (req, res) => {
  let docs = await Contact.find({});
  res.json(docs);
});

app.get("/item", async (req, res) => {
  let data = await Item.find({});
  res.json(data);
});

app.post("/item", async (req, res) => {
  try {
    console.log("Received:", req.body);

    let item = new Item({
      name: req.body.name,
      description: req.body.description,
      rate: req.body.rate,
      image: req.body.image,
    });

    const savedItem = await item.save();

    console.log("Saved:", savedItem);

    res.json({
      success: true,
      item: savedItem,
    });
  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.delete("/deleteitem/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let data = await Item.findById({ _id: id });
    await Item.deleteOne({ _id: id });
    res.json(data);
  } catch (error) {
    console.log(error);
  }
});

app.post("/sales", async (req, res) => {
  try {
    let sale = new Sales();
    sale.name = req.body.name;
    sale.date = req.body.date;
    sale.rate = req.body.rate;
    sale.quantity = req.body.quantity;
    sale.total = req.body.total;
    sale.paid = req.body.paid !== undefined ? Number(req.body.paid) : 0;
    sale.pending = req.body.pending !== undefined ? Number(req.body.pending) : 0;

    // Create an initial payment in the history if paid amount > 0
    if (sale.paid > 0) {
      sale.payments = [
        {
          amount: sale.paid,
          date: req.body.date || new Date().toISOString().split("T")[0],
          receivedBy: req.body.receivedBy || "Admin",
          mode: req.body.mode || "Cash"
        }
      ];
    } else {
      sale.payments = [];
    }

    await sale.save();
    res.json({ message: "Success" });
  } catch (error) {
    res.json(error);
  }
});

app.post("/sales-result", async (req, res) => {
  try {
    let data = await Sales.find({ date: req.body.date });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/sales-edit/:id", async (req, res) => {
  try {
    const updatedSale = await Sales.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: req.body.name,
          date: req.body.date,
          rate: req.body.rate,
          quantity: req.body.quantity,
          total: req.body.total,
          paid: req.body.paid !== undefined ? Number(req.body.paid) : 0,
          pending: req.body.pending !== undefined ? Number(req.body.pending) : 0,
          payments: req.body.payments || [],
        },
      },
      { new: true }
    );
    res.json(updatedSale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/sales-delete/:id", async (req, res) => {
  try {
    await Sales.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/sales", async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const year = sixMonthsAgo.getFullYear();
    const month = String(sixMonthsAgo.getMonth() + 1).padStart(2, '0');
    const day = String(sixMonthsAgo.getDate()).padStart(2, '0');
    const sixMonthsAgoStr = `${year}-${month}-${day}`;

    // Auto-delete sales history older than 6 months (YYYY-MM-DD comparison)
    const result = await Sales.deleteMany({
      date: { $lt: sixMonthsAgoStr }
    });
    if (result.deletedCount > 0) {
      console.log(`Auto-deleted ${result.deletedCount} old sales records older than 6 months (${sixMonthsAgoStr}).`);
    }
  } catch (error) {
    console.error("Failed to auto-delete old sales history:", error);
  }

  let data = await Sales.find({});
  res.json(data);
});

// Vehical Bill Routes
app.get("/vehical", async (req, res) => {
  try {
    let data = await Vehical.find({});
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/vehical", async (req, res) => {
  try {
    let vehical = new Vehical();
    vehical.name = req.body.name;
    vehical.date = req.body.date;
    vehical.totalAmount = req.body.totalAmount !== undefined ? Number(req.body.totalAmount) : 0;
    vehical.paidAmount = req.body.paidAmount !== undefined ? Number(req.body.paidAmount) : 0;
    vehical.pendingAmount = req.body.pendingAmount !== undefined ? Number(req.body.pendingAmount) : 0;

    // Add initial payment if exists
    if (vehical.paidAmount > 0) {
      vehical.payments = [{
        amount: vehical.paidAmount,
        date: req.body.date || new Date().toISOString().split('T')[0]
      }];
    } else {
      vehical.payments = [];
    }

    await vehical.save();
    res.json({ message: "Success", vehical });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/vehical/:id", async (req, res) => {
  try {
    const updated = await Vehical.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: req.body.name,
          date: req.body.date,
          totalAmount: req.body.totalAmount !== undefined ? Number(req.body.totalAmount) : 0,
          paidAmount: req.body.paidAmount !== undefined ? Number(req.body.paidAmount) : 0,
          pendingAmount: req.body.pendingAmount !== undefined ? Number(req.body.pendingAmount) : 0,
          payments: req.body.payments || [],
        },
      },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/vehical/:id", async (req, res) => {
  try {
    await Vehical.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Server point
app.listen(PORT, () => {
  console.log(` http://localhost:${PORT}`);
});
