# 🔐 VoLock - Open Source Whitelist System for Roblox Scripts

**VoLock** is a fully open-source, Luarmor-style whitelisting system designed to protect Roblox scripts with key-based access, compatible with **XENO, SOLARA, WAVE, SYNAPSE Z**, and more.  
It’s simple to set up, free to use, and supports **MockAPI** for backend key storage — no paid services or logins required.

---

## ✅ Features

- Works with any executor: XENO, SOLARA, WAVE, etc.
- Key-based whitelisting
- HWID + IP Locking
- Auto-ban failed key attempts (optional)
- Script delivered from external URL or inline
- Obfuscation-friendly
- Discord webhook support (optional)

---

## 📦 What You Need

- A **MockAPI.io** account
- A Roblox script you want to protect
- Any **Roblox Lua executor**
- Optional: Obfuscator for added security **(RECOMMENDED)**

---

### 🔸 1. HOW TO USE?

1. Go to [https://mockapi.io](https://mockapi.io)
2. Create a project (e.g. `VoLock`)
3. Add a **"keys"** resource
4. Create these fields:
   - `key` (String)
   - `hwid` (String)
   - `ip` (String)
   - `used` (Boolean)

> ✅ Example key object:
```json
{
  "key": "ABC123-XYZ789",
  "hwid": "",
  "ip": "",
  "used": false
}
```

> Copy your base API URL (should look like this)
```bash
https://mockapi.io/api/v1/keys
```

Put this into your executor
```lua
--// CONFIG //--
local api_url = "https://your-mockapi-url.mockapi.io/api/v1/keys"
local script_url = "https://your-raw-script-link.lua" -- Optional
local use_hwid = true
local use_ip = true

--// UI Prompt //--
local function prompt_key()
    if syn then syn.request = syn.request or http_request end
    local key = ""
    pcall(function()
        key = tostring(game:GetService("StarterGui"):PromptInput("Enter your whitelist key"))
    end)
    return key or readfile and readfile("volock_key.txt") or ""
end

--// Get IP & HWID //--
local function get_ip()
    local res = game:HttpGet("https://api.ipify.org")
    return res or "unknown"
end

local function get_hwid()
    return game:GetService("RbxAnalyticsService"):GetClientId()
end

--// Request Check //--
local function check_key(k)
    local headers = {["Content-Type"] = "application/json"}
    local body = game:HttpGet(api_url .. "?key=" .. k)
    if not body or body == "[]" then return false, "Invalid key" end

    local data = game:GetService("HttpService"):JSONDecode(body)[1]
    if not data then return false, "Key not found" end

    -- HWID/IP lock
    local ip = get_ip()
    local hwid = get_hwid()

    if use_hwid and data["hwid"] ~= "" and data["hwid"] ~= hwid then
        return false, "HWID mismatch"
    end
    if use_ip and data["ip"] ~= "" and data["ip"] ~= ip then
        return false, "IP mismatch"
    end

    -- Auto-bind if first use
    local req = syn and syn.request or http_request or request
    if req then
        if data["hwid"] == "" and use_hwid then
            req({
                Url = api_url .. "/" .. data["id"],
                Method = "PUT",
                Headers = headers,
                Body = game:GetService("HttpService"):JSONEncode({
                    hwid = hwid
                })
            })
        end
        if data["ip"] == "" and use_ip then
            req({
                Url = api_url .. "/" .. data["id"],
                Method = "PUT",
                Headers = headers,
                Body = game:GetService("HttpService"):JSONEncode({
                    ip = ip
                })
            })
        end
    end

    return true
end

--// Main //--
local user_key = prompt_key()
local success, msg = check_key(user_key)

if not success then
    game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "VoLock",
        Text = msg or "Access Denied",
        Duration = 5
    })
    return
end

-- Save key (optional)
if writefile then
    pcall(function()
        writefile("volock_key.txt", user_key)
    end)
end

-- Load your script
loadstring(game:HttpGet(script_url))()```
```
> ✏️ Replace:
> **api_url** with your MockAPI "keys" endpoint
> **script_url** with your hosted raw Lua script (Pastebin, GitHub Raw, etc.)

### 🔐 Optional: Discord Webhook Logs
# To log key uses to Discord, add the following inside check_key() after a successful login:
```lua
pcall(function()
    local webhook = "https://discord.com/api/webhooks/your_webhook_here"
    local data = {
        content = "**Key Used**: " .. k .. "\nIP: " .. get_ip() .. "\nHWID: " .. get_hwid()
    }
    syn.request({
        Url = webhook,
        Method = "POST",
        Headers = {["Content-Type"] = "application/json"},
        Body = game:GetService("HttpService"):JSONEncode(data)
    })
end)
```

---

🧠 Tips for Use
Use an obfuscator like Luraph or Fubu to protect your loader

Host your main script on a raw URL (Pastebin, GitHub raw)

You can disable HWID/IP check by setting use_hwid = false or use_ip = false

---

🔓 Example Use Case
You upload your script to Pastebin.

You make a few whitelist keys on MockAPI.

You send users the loader script above.

Only people with valid keys can run your main script.

---
