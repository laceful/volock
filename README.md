# 🔐 VoLock - Open Source Whitelist System for Roblox Scripts

**VoLock** is a fully open-source, Luarmor-style whitelisting system designed to protect Roblox scripts with key-based access, compatible with **XENO, SOLARA, WAVE, SYNAPSE Z**, and more. It supports MockAPI or a self-hosted backend using Node.js.

---

## 📁 Folder Structure (Laceful Layout)

```
volock/
├── backend/        # Express backend for key verification
├── frontend/       # Optional: future dashboard or key panel
├── lua/            # Client-side Lua loader script
├── .env.example    # Config sample for backend
├── LICENSE         # MIT License. Free for use. 
└── README.md       # You're here
```

---

## 🚀 How to Use

### 1. Clone the Repo

```bash
git clone https://github.com/laceful/volock.git
cd volock
```

### 2. Set Up Backend

#### 🔹 Install Dependencies

```bash
cd backend
npm install
```

#### 🔹 Create `.env`

Copy `.env.example` to `.env`:

```env
PORT=3000
MASTER_KEY=donotsharethis
```

#### 🔹 Create `keys.json` in `backend/`

```json
[
  {
    "key": "VOLOCK123",
    "hwid": "",
    "ip": "",
    "used": false,
    "banned": false,
    "expires": "2025-12-31T23:59:59Z"
  }
]
```

#### 🔹 Run Backend Server

```bash
node index.js
```

Backend will run on: `http://localhost:3000`

---

### 3. Configure Lua Loader

Go to `lua/loader.lua` and update:

```lua
local api_url = "http://localhost:3000/api/verify"
local script_url = "https://localhost:3000/api/script.lua"
```

Paste the loader into your executor.

---

## 🧠 How It Works

1. User runs `loader.lua` in executor
2. Prompts for key input
3. Sends key, IP, and HWID to backend
4. If valid → script loads from your URL
5. If invalid → error and blocked

---

## 🛡️ Security Features

* HWID + IP binding
* Expiration dates
* Ban keys
* Discord webhook (optional)
