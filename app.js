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
const i18n = require("./utils/localization");

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

app.use(i18n.init);

const setLocaleFromHeader = (req, res, next) => {
  const language = req.header('Accept-Language');

  if(language) {
    const preferedLanguages = language.split(',').map(language => {
      const parts = language.trim().split(';');
      return parts[0].toLowerCase();
    });
    
    const supportedLocales = i18n.getLocales();
    const matchedLocale = preferedLanguages.find(language => supportedLocales.includes(language));
    if(matchedLocale) {
      i18n.setLocale(matchedLocale)
    }
  }
  next();
}

app.use(setLocaleFromHeader);

app.use("/auth",authRoutes);
app.use("/todo", todoRoutes);

app.all("*", (req, res, next) => {
  const url = req.originalUrl
  next(new ErrorResponse(res.__("can_not_find_url_on_this_server", { url }), 404));
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
