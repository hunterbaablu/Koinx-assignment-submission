const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cron = require("node-cron");

const app = express();

const PORT = 3000;

mongoose.connect("mongodb://127.0.0.1:27017/cryptoBase");

const cryptoSchema = new mongoose.Schema({
  name: String,
});

const Crypto = mongoose.model("crypto", cryptoSchema);

// update cryptocurrency list every hour dynamically
// task 1
cron.schedule("0 */1 * * *", async () => {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/list"
    );
    
    const cryptoList = response.data.map((crypto) => ({ name: crypto.name }));
    await Crypto.deleteMany({});
    await Crypto.insertMany(cryptoList);
    console.log("Cryptocurrency list updated.");
  } catch (error) {
    console.error("Error updating cryptocurrency list:", error.message);
  }
});

//task 2

app.get("/getPrice", async (req, res) => {
  try {
    const { fromCurrency, toCurrency, date } = req.query;

    let api = `https://api.coingecko.com/api/v3/coins/${fromCurrency}/history?date=${date}`;

    const response = await axios.get(api);
    let currentPriceList = response.data.market_data.current_price;

    let priceList = JSON.parse(JSON.stringify(currentPriceList)); // here we convert the response data into the array format to check current price of particular currency
    let price = Object.entries(priceList);

    for (let i = 0; i < price.length; i++) {
      if (price[i][0] == toCurrency) {
        console.log(price[i]);
        res.json({ fromCurrency: fromCurrency, data: price[i] });
        break;
      }
    }
  } catch (error) {
    console.error("Error fetching cryptocurrency price:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//localhost url for request Get: http://localhost:3000/getPrice?fromCurrency=bitcoin&toCurrency=usd&date=12-10-2021


app.listen(PORT, () => {
  console.log(`Server started on PORT: ${PORT}`);
});
