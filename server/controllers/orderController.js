const Order = require("../models/orders");

// Khởi tạo apicode để quy về 1 định dạng api duy nhất
const ApiCode = require("../utils/apicode");
const apiCode = new ApiCode();

//get list orders
const listOrder = (req, res) => {
    Order.find()
    .then((listOrder) => {
        return res.json(apiCode.success(listOrder, "List All Food Success"));
      })
      .catch((err) => {
        return res.json(apiCode.error(err, "List All Food Fail"));
      });
}

module.exports = {
    listOrder,
}