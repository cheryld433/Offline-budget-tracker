const express = require("express");
const mongoose = require("mongoose");
const apiRoutes = require("./routes/api.js");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost/budget";
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useFindAndModify: false,
});

app.use(apiRoutes);

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
