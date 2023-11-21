const mongoDBConnection = require("./config/database");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('dotenv').config()

const PORT = process.env.PORT;
// connect to database
mongoDBConnection();

// Error-handling middleware
app.use((err, req, res, next) => {
  // Handle unauthorized errors
  if (err.message === 'Refresh token has expired') {
    return res.status(401).json({ error: 'Refresh token expired' });
  }
  if (err.message === 'Invalid refresh token') {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  // Handle other errors or pass them to the default error handler
  next(err);
});

//import routers
const userRouter = require("./routes/userRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const orderRouter = require("./routes/orderRoutes");
const productRouter = require("./routes/productsRoutes");
const subcategoriesRouter = require("./routes/subcategoriesRoutes");
const customersRouter = require("./routes/customersRoutes");
const reviewsRouter = require("./routes/reviewsRoutes")


// use routers
app.use("/v1/users", userRouter);
app.use("/v1/categories", categoryRouter);
app.use("/v1/orders", orderRouter);
app.use("/v1/products", productRouter);
app.use("/v1/subcategories", subcategoriesRouter);
app.use("/v1/customers" , customersRouter);
app.use("/v1/reviews" , reviewsRouter);


app.listen(PORT, () => {
  console.log(`running on :  http://localhost:${PORT}`);
});