const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const router = require("./routes");
const cors = require('cors');
const { default: mongoose } = require("mongoose");

require("dotenv").config();
const port = process.env.PORT || 3000;
const mongodb_connect_string = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/test';

// Sử dụng cors middleware ở đầu ứng dụng để gg không chặn request
app.use(cors());

// Chuyển đổi dữ liệu sang json và ngược lại
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(router);

// Khởi chạy app
mongoose.connect(mongodb_connect_string)
.then(() =>
app.listen(port, () =>
  console.log("> Server is up and running on port : http://localhost:" + port),
))
.catch(err =>
    console.log(err))
