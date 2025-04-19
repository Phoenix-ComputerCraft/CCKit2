if fs and term then
    if not http then error("This program requires HTTP.") end
    print("Downloading CCKit2-CraftOS...")
    local function trim(s) return s:match('^()[%s%z]*$') and '' or s:match('^[%s%z]*(.*[^%s%z])') end
    local file = assert(http.get("https://github.com/Phoenix-ComputerCraft/CCKit2/releases/latest/download/libCCKit2-craftos.a", nil, true))
    if file.read(8) ~= "!<arch>\n" then
        file.close()
        error("Not an ar archive", 2)
    end
    local retval = {}
    local name_table = nil
    local name_rep = {}
    while true do
        local data = {}
        local first_c = file.read(1)
        while first_c == "\n" do first_c = file.read(1) end
        if first_c == nil then break end
        local name = file.read(15)
        if name == nil then break end
        name = first_c .. name
        if name:find("/") and name:find("/") > 1 then name = name:sub(1, name:find("/") - 1)
        else name = trim(name) end
        data.timestamp = tonumber(trim(file.read(12)))
        data.owner = tonumber(trim(file.read(6)))
        data.group = tonumber(trim(file.read(6)))
        data.mode = tonumber(trim(file.read(8)), 8)
        local size = tonumber(trim(file.read(10)))
        if file.read(2) ~= "`\n" then error("Invalid header for file " .. name, 2) end
        if name:match("^#1/%d+$") then name = file.read(tonumber(name:match("#1/(%d+)")))
        elseif name:match("^/%d+$") then if name_table then
            local n = tonumber(name:match("/(%d+)"))
            name = name_table:sub(n+1, name_table:find("\n", n+1) - 1)
        else name_rep[#name_rep+1] = name end end
        data.name = name
        data.data = file.read(size)
        if name == "//" then name_table = data.data
        elseif name ~= "/" and name ~= "/SYM64/" then retval[#retval+1] = data end
    end
    file.close()
    if name_table then for _, v in ipairs(name_rep) do
        local n = tonumber(v:match("/(%d+)"))
        for _, w in ipairs(retval) do if w.name == v then w.name = name_table:sub(n, name_table:find("/", n) - 1); break end end
    end end
    print("Downloading system.expect...")
    file = assert(http.get("https://raw.githubusercontent.com/Phoenix-ComputerCraft/libsystem-craftos/refs/heads/master/expect.lua"))
    system_expect = file.readAll()
    file.close()
    print("Installing...")
    fs.makeDir("CCKit2")
    for _, f in ipairs(retval) do
        local handle = assert(fs.open("CCKit2/" .. f.name, "w"))
        handle.write(f.data)
        handle.close()
    end
    fs.makeDir("system")
    local handle = assert(fs.open("system/expect.lua", "w"))
    handle.write(system_expect)
    handle.close()
    print("Done!")
else
    local hasfilesystem, filesystem = pcall(require, "system.filesystem")
    if hasfilesystem then
        if not filesystem.exists("/usr/bin/apt.lua") then error("APT is not installed. Please install 'apt' with 'sudo components'.") end
        local process = require "system.process"
        local apt_cache = require "apt.cache"
        apt_cache:load()
        if apt_cache:get("apt") == nil then
            -- TODO: add supporter repo
            error("CCKit2 is not currently available for Phoenix platforms.")
        end
        io.write("CCKit2 provides two window managers: a basic framebuffer manager for single apps, and the Hydra window manager for a multitasking desktop. Which would you like to install? (1 = basic, 2 = Hydra) ")
        local choice
        repeat
            local event, param = coroutine.yield()
            if event == "char" then choice = param.character end
        until choice == "1" or choice == "2"
        print()
        process.run("/usr/bin/apt-get", "install", "cckit2")
        if choice == "1" then
            process.run("/usr/bin/apt-get", "install", "cckit2-wm-fb")
        elseif choice == "2" then
            process.run("/usr/bin/apt-get", "install", "hydra", "cckit2-wm-hydra")
        end
        print("CCKit2 is now installed.")
    else
        error("This program only works on Phoenix and CraftOS.")
    end
end
