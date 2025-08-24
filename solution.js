import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();

// Use Render’s port
const PORT = process.env.PORT || 3000;

// Create database client using environment variable
const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,  // Render env var
  ssl: {
    rejectUnauthorized: false,  // Required by Render PostgreSQL
  },
});

db.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("public1"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("front.ejs");
});

let message = "";
app.get("/login", (req, res) => {
  res.render("login.ejs", { message });
});

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

// Test DB route (so you don’t get 404 anymore)
app.get("/db-test", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// signup & login routes (unchanged, just using new db)
app.post("/signup", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  const cpassword = req.body.cpassword;
  const username = req.body.userid;

  const emaiPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  if (!email.match(emaiPattern)) {
    return res.render("signup.ejs");
  } else {
    const passPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!password.match(passPattern)) {
      return res.render("signup.ejs");
    } else if (password !== cpassword || cpassword === "") {
      return res.render("signup.ejs");
    } else {
      try {
        const checkResult = await db.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );
        if (checkResult.rows.length > 0) {
          res.send("Email already exists. Try logging in.");
        } else {
          await db.query(
            "INSERT INTO users (username,email, password) VALUES ($1, $2 ,$3)",
            [username, email, password]
          );

          res.render("index.ejs", { username });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  let pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  if (email.match(pattern)) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedPassword = user.password;
        const username = user.username;
        if (password === storedPassword) {
          res.render("index.ejs", { username });
        } else {
          return res.render("login", { message: "Incorrect Password" });
        }
      } else
        return res.render("login", { message: "Invalid Email" });
    } catch (err) {
      console.log(err);
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
