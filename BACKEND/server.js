const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path"); 
const db = require("./index"); 


//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//routes
const studentroutes = require("./routes/studentsroutes"); 
const courseroutes = require("./routes/courseroutes");
const coursecontents = require("./routes/coursecontentroutes");
const quizrouter = require("./routes/quizroutes");
const studentenrollmnt = require("./routes/studentenrollmentrouter");
const adminrouter = require("./routes/admin");
const paymentroute = require("./routes/paymntroute");
const loginrouter = require("./routes/loginrouter");
const register = require("./routes/register");
const Paymntgateway = require("./routes/PaymntGateay");
const invoice = require ("./routes/invoice")


//http://localhost:5000/api
app.get("/", (req, res) => {
  res.send("LMS Backend Running");
});


//API Routes
app.use("/api/students", studentroutes);
app.use("/api/courses",courseroutes);
app.use("/api/content",coursecontents);
app.use("/api/quiz", quizrouter);
app.use("/api/enroll",studentenrollmnt);
app.use("/api/admin",adminrouter);
app.use("/api/payment", paymentroute);
app.use("/api/login", loginrouter);
app.use("/api/register", register);
app.use("/api/pgateway", Paymntgateway);
app.use("/api/invoice", invoice);




app.post("/test", (req, res) => {
  console.log(req.body);
  res.json({ received: req.body });
});


app.listen(5000, () => {
  console.log("Server running on port 5000");
});
