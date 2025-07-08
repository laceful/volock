require("dotenv").config();
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

let keys = require("./keys.json");

// yes bro lets save to some fuckass json LETS GO
function saveKeys() {
  fs.writeFileSync("./backend/keys.json", JSON.stringify(keys, null, 2));
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

  saveKeys();
  res.json({ success: true });
});

// tell the console we're online
app.listen(PORT, () => console.log(`✅ VoLock backend running on port ${PORT}`));
