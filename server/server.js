const mongoDBConnection = require("./config/database");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use(cors({
  origin: 'http://localhost:3000',
}));

require('dotenv').config()

const PORT = process.env.PORT;
// connect to database
mongoDBConnection();

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