const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8000;

const publicFolder = path.join(__dirname, "by");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(publicFolder));

app.get("/", (req, res) => {
    res.sendFile(path.join(publicFolder, "youtube.html"));
});

app.get("/youtube.html", (req, res) => {
    res.sendFile(path.join(publicFolder, "youtube.html"));
});

app.use((req, res) => {
    res.status(404).send("Page not found");
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Serving: ${path.join(publicFolder, "youtube.html")}`);
});