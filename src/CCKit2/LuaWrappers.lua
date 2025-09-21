local typescript = require "typescript"

local LuaWrappers = {}

--- Imports a TypeScript module.
---@param module string The name of the module
---@return unknown module The module loaded (use @module annotations for completion)
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

--- Creates a new class.
---@generic T
---@generic U
---@param name string The name of the class
---@param super U|nil The base class for the new class
---@param methods T The methods in the class
---@return T class The newly created class
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

--- Creates a new instance of a class.
---@generic T
---@param class T The class to instantiate
---@param ... any Any arguments to pass to the constructor
---@return T obj The new object
function LuaWrappers.new(class, ...) return typescript.__TS__New(class, ...) end

--- Returns whether an object is an instance of a class.
---@generic T
---@param obj T|table The object to check
---@param class T The class to check for
---@return boolean instanceOf Whether the object is an instance of the class
function LuaWrappers.instanceOf(obj, class) return typescript.__TS__InstanceOf (obj, class) end

return LuaWrappers
