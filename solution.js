// index.js
import express from "express";
import bodyParser from "body-parser";
import pool from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// serve static files & set view engine
app.use(express.static("public"));
app.use(express.static("public1"));
app.set("view engine", "ejs");

let message = "";

// ✅ Home
app.get("/", (req, res) => {
  res.render("front.ejs");
});

// ✅ Signup Page
app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

// ✅ Login Page
app.get("/login", (req, res) => {
  res.render("login.ejs", { message });
});

// ✅ Signup Route
app.post("/signup", async (req, res) => {
  const { userid: username, username: email, password, cpassword } = req.body;

  const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  const passPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!email.match(emailPattern)) {
    return res.render("signup.ejs");
  }
  if (!password.match(passPattern)) {
    return res.render("signup.ejs");
  }
  if (password !== cpassword || !cpassword) {
    return res.render("signup.ejs");
  }

  try {
    const checkResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (checkResult.rows.length > 0) {
      return res.send("Email already exists. Try logging in.");
    }

    await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, password]
    );

    res.render("index.ejs", { username });
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error registering user");
  }
});

// ✅ Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  if (!email.match(pattern)) {
    return res.render("login.ejs", { message: "Invalid Email" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (password === user.password) {
        return res.render("index.ejs", { username: user.username });
      } else {
        return res.render("login.ejs", { message: "Incorrect Password" });
      }
    } else {
      return res.render("login.ejs", { message: "Email not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error logging in");
  }
});

// ✅ Test route
app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
