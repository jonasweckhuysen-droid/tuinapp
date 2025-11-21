const express = require("express");
const fetch = require("node-fetch"); // npm install node-fetch@2
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors());

// Endpoint om planten op te halen
app.get("/plants", async (req, res) => {
  const page = req.query.page || 1;
  const apiUrl = `https://trefle.io/api/v1/plants?token=usr-46Bb6d5A0nMov4n2jw-C8mTAKvtpetDHMwDXlDEr2aA&page=${page}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Fout bij Trefle API:", err);
    res.status(500).json({ error: "Fout bij Trefle API" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend draait op poort ${PORT}`);
});
