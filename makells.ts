import * as ts from "typescript";
import * as tstl from "@jackmacwindows/typescript-to-lua";

let llsStatements = {};

const plugin: tstl.Plugin = {
    // `visitors` is a record where keys are TypeScript node syntax kinds
    visitors: {
        // Visitor can be a function that returns Lua AST node
        [ts.SyntaxKind.ClassDeclaration]: (node, context: tstl.TransformationContext) => {
            console.log(`Declared class ${node.name?.text}`);
            const className = node.name?.getText() ?? "UnknownClass";
            let headerText = `---@class ${className}\n`, functionText = "";
            node.forEachChild(n => {
                if (ts.isJSDoc(n)) {
                    headerText = "--- " + (n.comment?.toString() ?? "").replaceAll("\n", "\n--- ") + "\n" + headerText;
                } else if (ts.isHeritageClause(n)) {
                    headerText = headerText.replace(/\n$/, `: ${n.types.map(type => type.getText()).join(", ")}\n`);
                } else if (ts.isPropertyDeclaration(n)) {
                    if (n.modifiers && n.modifiers.find(m => m.getText() === "public")) {
                        let doc = "";
                        n.forEachChild(c => {
                            if (ts.isJSDoc(c)) doc = c.comment?.toString() ?? "";
                        })
                        headerText += `---@field ${n.name.getText()} ${n.type?.getText() ?? "any"} ${doc}\n`;
                    }
                } else if (ts.isGetAccessor(n)) {
                    if (n.modifiers && n.modifiers.find(m => m.getText() === "public")) {
                        let doc = "";
                        n.forEachChild(c => {
                            if (ts.isJSDoc(c)) doc = c.comment?.toString() ?? "";
                        })
                        headerText += `---@field ${n.name.getText()} ${n.type?.getText() ?? "any"} ${doc}\n`;
                    }
                } else if (ts.isMethodDeclaration(n)) {
                    if (n.modifiers && n.modifiers.find(m => m.getText() === "public")) {
                        const doc = n.getChildAt(0);
                        let paramMap = {};
                        let returnDoc = "";
                        if (ts.isJSDoc(doc)) {
                            functionText += "--- " + (doc.comment?.toString() ?? "").replaceAll("\n", "\n--- ") + "\n";
                            doc.forEachChild(d => {
                                if (ts.isJSDocParameterTag(d)) {
                                    paramMap[d.name.getText()] = d.comment?.toString() ?? "";
                                } else if (ts.isJSDocReturnTag(d)) {
                                    returnDoc = d.comment?.toString() ?? "";
                                }
                            })
                        }
                        let plist: string[] = [];
                        n.parameters.forEach(p => {
                            functionText += `---@param ${p.name.getText()} ${p.type?.getText() ?? "any"} ${paramMap[p.name.getText()] ?? ""}\n`;
                            plist.push(p.name.getText());
                        })
                        if (n.type && n.type.getText() !== "void") functionText += `---@return ${n.type.getText()} ${returnDoc}\n`;
                        functionText += `function ${className}:${n.name.getText()}(${plist.join(", ")}) end\n\n`;
                    }
                }
            });
            let res = context.superTransformStatements(node);
            llsStatements[context.sourceFile.fileName] = (llsStatements[context.sourceFile.fileName] ?? "") + `${headerText}local ${className} = {}\n\n${functionText}`;
            console.log(`Finished class ${node.name?.text}`);
            return res;
        },
        [ts.SyntaxKind.NamespaceExportDeclaration]: (node, context: tstl.TransformationContext) => {
            console.log(`Declared namespace ${node.name?.text}`);
            let res = context.superTransformStatements(node);
            console.log(`Finished namespace ${node.name?.text}`);
            return res;
        },
    },
    afterEmit(program, options, emitHost, result) {
        for (const file of result) {
            if (file.sourceFiles) {
                let res = "---@meta\n\n";
                for (const source of file.sourceFiles) {
                    if (llsStatements[source.fileName]) {
                        res += llsStatements[source.fileName];
                    }
                }
                emitHost.writeFile(file.outputPath.replace(/\.lua$/, ".d.lua"), res, false);
            }
        }
    },
};

export default plugin;