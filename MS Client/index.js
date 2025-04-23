const express = require("express");
const authRoutes = require("./routes/AuthRoutes"); // Adjust path based on your directory structure
const connectDB = require("./config/db");
connectDB();
const app = express();

app.use(express.json());
app.use("/auth", authRoutes);

app.listen(6000, () => {
    console.log("Server is on port 6000");
});