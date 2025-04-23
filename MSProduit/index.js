const express = require("express");
const productR = require("./routes/ProductRoutes");
const connectDB = require("./config/db");
const app = express();
connectDB();

app.use(express.json());
app.use("/product", productR);

app.listen(5000, () => {
    console.log("Server is on port 5000");
});