require("dotenv").config();
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const adminUser = process.env.ADMIN_USERNAME;
const adminPass = process.env.ADMIN_PASSWORD;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

let keys = require("./keys.json");

// yes bro lets save to some fuckass json LETS GO
function saveKeys() {
  fs.writeFileSync("./backend/keys.json", JSON.stringify(keys, null, 2));
}

// woopsies, forgot to make this for the frontend
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", "Basic realm='VoLock'");
    return res.status(401).send("Authentication required.");
  }

  // GET AUTH
  const [user, pass] = Buffer.from(auth.split(" ")[1], "base64")
    .toString()
    .split(":");

  // HI IS THIS NEXT ???
  if (user === adminUser && pass === adminPass) {
    return next();
  }

  // send them an error with a log
  res.status(403).send("Invalid credentials.");
}

// verify this bitch
app.post("/api/verify", (req, res) => {
  const { key, hwid, ip } = req.body;
  const found = keys.find(k => k.key === key);

  if (!found) return res.status(404).json({ success: false, message: "Invalid key" });
  if (found.banned) return res.status(403).json({ success: false, message: "Key banned" });

  const now = new Date();
  if (found.expires && new Date(found.expires) < now) {
    return res.status(403).json({ success: false, message: "Key expired" });
  }

  if (found.hwid && found.hwid !== hwid) return res.status(403).json({ success: false, message: "HWID mismatch" });
  if (found.ip && found.ip !== ip) return res.status(403).json({ success: false, message: "IP mismatch" });

  // lock their ip and hwid
  if (!found.hwid) found.hwid = hwid;
  if (!found.ip) found.ip = ip;
  found.used = true;

  app.get("/api/keys", authMiddleware, (req, res) => {
    res.json(keys);
  });

  app.put("/backend/keys.json", authMiddleware, (req, res) => {
    keys = req.body;
    saveKeys();
    res.send("Updated.");
  });

  
  res.json({ success: true });
});

// tell the console we're online
app.listen(PORT, () => console.log(`✅ VoLock backend running on port ${PORT}`));
