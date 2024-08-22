const express = require("express");
const router = require("./routes/index");
const mongoose = require("mongoose");
 
require("dotenv").config();
const PORT = process.env.PORT || 3306;
mongoose.connect(process.env.MONGO_URI);
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/", router);
 
app.get("/v1", (req, res) => {
  res.send("Africa is home");
});
 
app.listen(PORT, (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log(`Server running on port ${PORT}`);
  }
});
 
module.exports = app;
 
 