const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8000;
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const multer = require("multer");
const bcrypt = require("bcryptjs");
require("dotenv").config();
app.use(express.static("uploads"));

const db_URL = process.env.MONGODB_URL;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../src/components/Dashboard/images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Mongoose connection starts
async function main() {
  await mongoose.connect(
    "mongodb+srv://arbaz151033:Arbazkhan%406757@cluster.dapmmwg.mongodb.net/Lucky_Shop?retryWrites=true&w=majority&appName=clusternp"
  );
}
main().catch((err) => console.log(err));

const contactSchema = new mongoose.Schema({
  name: { type: String, unique: false },
  email: { type: String, unique: false },
  message: { type: String, unique: false },
  time: { type: Date, default: Date.now() },
});

const userSchema = new mongoose.Schema({
  name: { type: String, unique: false },
  email: { type: String, unique: false },
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
  email: { type: String, unique: false },
  address: { type: String, unique: false },
  mobile: { type: Number, unique: false },
  items: [{ type: Object }],
  total: { type: String, unique: false },
});

const saleSchema = new mongoose.Schema({
  name: { type: String, unique: false },
  date: { type: String, unique: false },
  rate: { type: String, unique: false },
  quantity: { type: Number, unique: false },
  total: { type: String, unique: false },
});

let Contact = mongoose.model("contacts", contactSchema);
let User = mongoose.model("users", userSchema);
let Admin = mongoose.model("admins", adminSchema);
let Item = mongoose.model("items", itemSchema);
let Order = mongoose.model("order", orderSchema);
let Sales = mongoose.model("sales", saleSchema);
// Mongoose connection ends

// Middleware starts
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());
// Middleware ends

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
  console.log(admin);
  if (result.length > 0) {
    res.json({ message: "login Success" });
  } else if (admin.length > 0) {
    res.json({ message: "Admin login Success" });
  } else {
    res.json({ message: "login Failed" });
  }
});

app.post("/register", async (req, res) => {
  let user = new User();
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword });
  newUser.save();
  res.json({ message: "success" });
});

app.post("/order", async (req, res) => {
  let order = new Order();
  res.json({ message: "success" });
  let result = Order.find(req.body);
  if (result > 0) {
    res.json({ message: "Data Already Present" });
  } else {
    order.name = req.body.name;
    order.email = req.body.email;
    order.address = req.body.address;
    order.mobile = req.body.mobile;
    order.items = req.body.order;
    order.total = req.body.total;
    await order.save();
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

    if (!data.$isEmpty()) {
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

    await Order.deleteOne({ _id: id });
  } catch (error) {
    console.log(error);
  }
});

app.put("/edititem/:id", upload.single("image"), async (req, res) => {
  try {
    console.log(req.params.id);
    await Item.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          description: req.body.description,
          rate: req.body.rate,
          image: req.file.filename,
        },
      }
    );
    res.json({ message: "success" });
  } catch (error) {
    res.json({ error });
  }
});

app.delete("/userDelete/:id", async (req, res) => {
  try {
    let id = await req.params.id;
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

app.post("/item", upload.single("image"), async (req, res) => {
  try {
    var obj = {
      name: req.body.name,
      description: req.body.description,
      rate: req.body.rate,
      image: req.file.filename,
    };
    // req.file is the name of your file in the form above, here 'uploaded_file'
    // req.body will hold the text fields, if there were any
    let item = new Item();
    Item.create(obj);

    // await item.save();

    res.json({ message: "success" });
  } catch (error) {
    res.json({ error });
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

app.post("/sales",async (req,res)=>{
  
  try {
    let sale = new Sales();
    sale.name = req.body.name;
    sale.date = req.body.date;
    sale.rate = req.body.rate;
    sale.quantity = req.body.quantity;
    sale.total = req.body.total
    await sale.save();
    res.json({message:"Success"})
  } catch (error) {
    res.json(error)
  }
})

app.get("/sales", async (req,res)=>{
  let data = await Sales.find({});
  res.json(data)
})


// Server point
app.listen(PORT, () => {
  console.log(` http://localhost:${PORT}`);
});
