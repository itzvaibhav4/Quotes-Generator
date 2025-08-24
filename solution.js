import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "secrets",
  password: "itzvaibhav4",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("public1"));
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.render("front.ejs");
});
const message ="";
app.get("/login", (req, res) => {
  
  res.render("login.ejs" ,
  {
    message
  });
});

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.post("/signup", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  const cpassword = req.body.cpassword;
  const username =req.body.userid;

  const emaiPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  if (!email.match(emaiPattern)) 
  {
    return res.render("signup.ejs"
 )
}
  else
  {
    
  const passPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!password.match(passPattern)) 
  {
    return res.render("signup.ejs")
}
  
  else
  {
  if (password !== cpassword || cpassword === "")
  {
    
    return res.render("signup.ejs")
  }
  else
  {
    
     try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } else {
      const result = await db.query(
        "INSERT INTO users (username,email, password) VALUES ($1, $2 ,$3)",
        [username,email, password]
      );
      
      res.render("index.ejs",
      {
        username
      });
    }
  } catch (err) {
    console.log(err);
  }
}
  }
}
});
  

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  
   let pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/; 
      if(email.match(pattern))
      { 
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;
      const username =user.username;
      if (password === storedPassword) {
        res.render("index.ejs",{
          username
        });
      } else {
    return res.render("login",
    {
      message:'Incorrect Password'
    });
      }
    } else  
    return res.render("login",
    {
      message:'Invalid Email'
    });
  } catch (err) {
    console.log(err);
  }
}
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

