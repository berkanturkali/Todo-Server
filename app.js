const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const morgan = require("morgan");
const dotenv = require("dotenv");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
dotenv.config({ path: "./config.env" });
const app = express();
const port = process.env.PORT;
const MONGO_URL = process.env.MONGO_URI;

if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/*") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const userRoutes = require("./routes/user");
const todoRoutes = require("./routes/todo");

app.use(express.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/user", userRoutes);
app.use("/todo", todoRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
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
