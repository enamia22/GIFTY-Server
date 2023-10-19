const mongoDBConnection = require("./config/database");
const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 3001;
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//import routers

const userRouter = require("./routes/userRoutes");
const customersRouter = require("./routes/customersRoutes");


// connect to database
mongoDBConnection();

// use routers

app.use("/v1/users", userRouter);
app.use("/v1/customers" , customersRouter);


app.listen(PORT, () => {
  console.log(`running on :  http://localhost:${PORT}`);
});