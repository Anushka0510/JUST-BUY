require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const { DatabaseSync } = require("node:sqlite");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.json()); // lets the server read JSON sent from the frontend

// --- Database setup ---
const db = new DatabaseSync("justbuy.db"); // creates a real file on disk, once
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

// --- Products (unchanged from before) ---
const products = [
  { id: 1, img: "images/kurtaset4.webp", badge: "Sale", title: "Embroided Kurta Set", price: "₹750", rating: 4.5 },
  { id: 2, img: "images/saree6.webp", badge: "New", title: "Kanjeevaram Silk Saree", price: "₹1590", rating: 4.5 },
  { id: 3, img: "images/top6.jpg", badge: "", title: "Printed Women Shirt", price: "₹600", rating: 4.5 },
  { id: 4, img: "images/heels7.webp", badge: "New", title: "White Shoes", price: "₹1200", rating: 4.5 },
  { id: 5, img: "images/mentshirt.jpg", badge: "New", title: "Men Printed Tshirt", price: "₹700", rating: 4.5 },
  { id: 6, img: "images/plate1.jpeg", badge: "Hot", title: "Ceramic Blue Plates", price: "₹1499", rating: 4.5 },
  { id: 7, img: "images/heels4.webp", badge: "Hot", title: "Women Heels", price: "₹800", rating: 4.5 },
  { id: 8, img: "images/table1.jpg", badge: "", title: "Living Room table", price: "₹3000", rating: 4.5 },
  { id: 9, img: "images/earring1.jpg", badge: "", title: "Beautiful kundan Earrings", price: "₹530", rating: 3.5 },
  { id: 10, img: "images/watch1.jpg", badge: "Hot", title: "Stylish Analog Watch", price: "₹3500", rating: 4.5 }
];

app.get("/api/products", function (req, res) {
  res.json(products);
});

app.post("/api/login", function (req, res) {
  const { email, password } = req.body;

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const passwordMatches = bcrypt.compareSync(password, user.password);

  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, fullName: user.fullName },
    JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({ message: "Login successful!", token, fullName: user.fullName });
});

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization; // expects "Bearer <token>"

  if (!authHeader) {
    return res.status(401).json({ error: "Please log in first." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // attach user info to the request, for the route to use
    next(); // valid — continue to the actual route
  } catch (err) {
    res.status(401).json({ error: "Session expired or invalid. Please log in again." });
  }
}

// --- Register endpoint ---
app.post("/api/register", function (req, res) {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const hashedPassword = bcrypt.hashSync(password, 10); // 10 = hashing strength

  try {
    const insert = db.prepare("INSERT INTO users (fullName, email, password) VALUES (?, ?, ?)");
    insert.run(fullName, email, hashedPassword);
    res.status(201).json({ message: "Registered successfully!" });
  } catch (err) {
    res.status(400).json({ error: "Email already registered." });
  }
});

app.listen(PORT, function () {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.post("/api/checkout", requireAuth, function (req, res) {
  res.json({ message: `Order placed for ${req.user.fullName}! (Demo — no real payment processed.)` });
});