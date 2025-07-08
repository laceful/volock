--// before we begin, i'd like to notify you something, this loader should NEVER be used for a paid script. 
--// Its only for something if you don't want some random to use your stuff.
--// keep in mind, this was made by vouza (@laceful on github, @worstmemory on discord) and nobody has the rights to modify this code and sell it.
local http = http_request or request
local json = game:GetService("HttpService")
local base = "http://localhost:3000/api/verify"

local function getHWID()
    return game:GetService("RbxAnalyticsService"):GetClientId()
end

local function getIP()
    return game:HttpGet("https://api.ipify.org")
end

local function promptKey()
    return tostring(readfile and readfile("volock_key.txt")) or ""
end

local function notify(text)
    pcall(function()
        game.StarterGui:SetCore("SendNotification", {
            Title = "VoLock", Text = text, Duration = 5
        })
    end)
end

local function check(key)
    local response = http({
        Url = base,
        Method = "POST",
        Headers = { ["Content-Type"] = "application/json" },
        Body = json:JSONEncode({
            key = key,
            hwid = getHWID(),
            ip = getIP()
        })
    })
    return json:JSONDecode(response.Body)
end

local key = promptKey()
local result = check(key)

if not result.success then
    notify("Key failed: " .. (result.message or "unknown error"))
    return
end

notify("Access Granted. Loading...")

-- replace with your script link
loadstring(game:HttpGet("https://your.script.url/script.lua"))()
