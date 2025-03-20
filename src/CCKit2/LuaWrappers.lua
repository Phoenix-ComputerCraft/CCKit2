local typescript = require "typescript"

local LuaWrappers = {}

function LuaWrappers.import(module)
    local m = require(module)
    if m.default then return m.default
    else return m end
end

local function deepcopy(tab)
    if type(tab) == "table" then
        local retval = setmetatable({}, deepcopy(getmetatable(tab)))
        for k,v in pairs(tab) do retval[deepcopy(k)] = deepcopy(v) end
        return retval
    else return tab end
end

function LuaWrappers.class(name, super, methods)
    local class = typescript.__TS__Class()
    class.prototype.__name = name
    class.name = name
    if super then typescript.__TS__ClassExtends(class, super) end
    local fields = {}
    for k, v in pairs(methods) do
        if type(v) == "table" and type(v.get) == "function" then
            typescript.__TS__SetDescriptor(class.prototype, k, v, true)
        elseif type(v) == "function" then
            class.prototype[k] = v
        else
            fields[k] = v
        end
    end
    if next(fields) then
        local constructor = class.prototype.____constructor
        function class.prototype.____constructor(self, ...)
            for k, v in pairs(fields) do
                self[deepcopy(k)] = deepcopy(v)
            end
            if constructor then return constructor(self, ...) end
        end
    end
    if not class.prototype.____constructor then function class.prototype.____constructor(self) end end
    return class
end

LuaWrappers.new = typescript.__TS__New
LuaWrappers.instanceOf = typescript.__TS__InstanceOf

return LuaWrappers
