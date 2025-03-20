import * as fs from "fs/promises";
import {Writable} from "stream";
import luamin from "luamin";

/**
 * @param {string} str
 * @param {number} len
 * @param {string|undefined} c
 */
function pad(str, len, c) {return str.length < len ? str.substring(0, len) + (c ?? " ").repeat(len - str.length) : str;}

/**
 * Saves a table to an archive file
 * @param {Array} data
 * @param {Writable|undefined} file
 * @returns {Buffer}
 */
function ar_save(data, file) {
    let retval = Buffer.alloc(0);
    if (file === undefined || file === null) {
        file = new Writable();
        file._write = (chunk, enc, cb) => {retval += chunk; cb();}
        file._final = () => {};
        file._destroy = () => {};
    }
    file.write("!<arch>\n")
    let name_table = {}
    let name_str = null
    for (let v of data) if (v.name.length > 15) {
        name_table[v.name] = (name_str ?? "").length
        name_str = (name_str ?? "") + v.name + "/\n"
    }
    if (name_str !== null) {
        file.write("//              0           0     0     666     " + pad(name_str.length.toString(), 10) + "`\n" + name_str)
        if (name_str.length % 2 == 1) file.write("\n")
    }
    for (let v of data) {
        let name = name_table[v.name] !== undefined ? "/" + name_table[v.name] : v.name + (name_str !== null ? "/" : "")
        file.write(pad(name, 16) + pad(v.timestamp.toString(), 12) + pad(v.owner.toString(), 6) + pad(v.group.toString(), 6))
        file.write(pad(v.mode.toString(8), 8) + pad(v.data.length.toString(), 10) + "`\n" + v.data)
        if (v.data.length % 2 == 1) file.write("\n")
    }
    return retval
}

let files = []
fs.readdir("bin/CCKit2")
    .then(names => Promise.all(names.flatMap(name => name.indexOf(".lua") !== -1 ?
        fs.readFile("bin/CCKit2/" + name)
            .then(data => data.indexOf("local ____exports = {}\nreturn ____exports") === -1 ? files.push({
                name: name,
                timestamp: Math.floor(Date.now() / 1000),
                owner: 0,
                group: 0,
                mode: 0o755,
                data: luamin.minify(data.toString('latin1'))
            }) : null)
        : null)))
    .then(() => fs.readFile("src/CCKit2/LuaWrappers.lua"))
    .then(data => files.push({
        name: "LuaWrappers.lua",
        timestamp: Math.floor(Date.now() / 1000),
        owner: 0,
        group: 0,
        mode: 0o755,
        data: luamin.minify(data.toString('latin1'))
    }))
    .then(() => fs.writeFile("bin/libCCKit2.a", ar_save(files)));
