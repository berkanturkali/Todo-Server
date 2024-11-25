const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const dotenv = require("dotenv");
const globalErrorHandler = require("./controllers/errorController");
dotenv.config({ path: "./config.env" });
const app = express();
const port = process.env.PORT;
const MONGO_URL = process.env.MONGO_URI;
const ErrorResponse = require("./models/error_response");

if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}
const authRoutes = require("./routes/auth");
const todoRoutes = require("./routes/todo");

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/auth",authRoutes);
app.use("/todo", todoRoutes);

app.all("*", (req, res, next) => {
  next(new ErrorResponse(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useUnifiedTopology", true);

mongoose
  .connect(MONGO_URL)
  .then((result) => {
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(`Something went wrong ${err}`);
  });
