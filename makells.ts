import * as ts from "typescript";
import * as tstl from "@jackmacwindows/typescript-to-lua";

let llsStatements = {};

function fixType(type: ts.TypeNode | undefined): string {
    if (type === undefined) return "any";
    else if (type.getText() === "null" || type.getText() === "undefined") return "nil";
    else if (ts.isFunctionTypeNode(type)) {
        let rettype = type.getChildAt(type.getChildren().findIndex(n => ts.isEqualsGreaterThanToken(n)) + 1)
        if (rettype.getText() === "void") return `fun(${type.getChildren().find(n => n.kind == ts.SyntaxKind.SyntaxList)?.getChildren().flatMap(n => ts.isParameter(n) && n.name.getText() !== "this" ? [`${n.name.getText()}: ${fixType(n.type)}`] : []).join(", ") ?? ""})`;
        return `fun(${type.parameters.flatMap(n => n.name.getText() !== "this" ? [`${n.name.getText()}: ${fixType(n.type)}`] : []).join(", ") ?? ""}): ${fixType(rettype as ts.TypeNode)}`;
    } else if (ts.isConstructorTypeNode(type)) {
        return `Class<${[fixType(type.type)].concat(type.parameters.flatMap(n => n.name.getText() !== "this" ? [`${n.name.getText()}: ${fixType(n.type)}`] : [])).join(", ") ?? ""}>`;
    } else if (ts.isUnionTypeNode(type)) {
        return (type.getChildAt(0) as ts.SyntaxList).getChildren().flatMap(node => ts.isTypeNode(node) ? [fixType(node)] : []).join(" | ");
    } else return type.getText();
}

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
                    headerText = headerText.replace(/\n$/, `: ${n.types.map(type => fixType(type)).join(", ")}\n`);
                } else if (ts.isPropertyDeclaration(n)) {
                    if (n.modifiers && n.modifiers.find(m => m.getText() === "public")) {
                        let doc = "";
                        n.forEachChild(c => {
                            if (ts.isJSDoc(c)) doc = c.comment?.toString() ?? "";
                        })
                        headerText += `---@field ${n.name.getText()} ${fixType(n.type)} ${doc}\n`;
                    }
                } else if (ts.isGetAccessor(n)) {
                    if (n.modifiers && n.modifiers.find(m => m.getText() === "public")) {
                        let doc = "";
                        n.forEachChild(c => {
                            if (ts.isJSDoc(c)) doc = c.comment?.toString() ?? "";
                        })
                        headerText += `---@field ${n.name.getText()} ${fixType(n.type)} ${doc}\n`;
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
                            functionText += `---@param ${p.name.getText()} ${fixType(p.type)} ${paramMap[p.name.getText()] ?? ""}\n`;
                            plist.push(p.name.getText());
                        })
                        if (n.type && n.type.getText() !== "void") functionText += `---@return ${fixType(n.type)} ${returnDoc}\n`;
                        if (n.modifiers.find(m => m.getText() === "static")) functionText += `function ${className}.${n.name.getText()}(${plist.join(", ")}) end\n\n`;
                        else functionText += `function ${className}:${n.name.getText()}(${plist.join(", ")}) end\n\n`;
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
            let namespaceName = node.name?.text;
            let headerText = "";
            node.forEachChild(n => {
                if (ts.isVariableDeclaration(n)) {
                    n.forEachChild(c => {
                        if (ts.isJSDoc(c)) headerText += "--- " + (c.comment?.toString() ?? "") + "\n";
                    });
                    headerText += `---@type ${fixType(n.type)}\n${namespaceName}.${n.name.getText()} = _\n\n`;
                } else if (ts.isFunctionDeclaration(n)) {
                    const doc = n.getChildAt(0);
                    let paramMap = {};
                    let returnDoc = "";
                    if (ts.isJSDoc(doc)) {
                        headerText += "--- " + (doc.comment?.toString() ?? "").replaceAll("\n", "\n--- ") + "\n";
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
                        headerText += `---@param ${p.name.getText()} ${fixType(p.type)} ${paramMap[p.name.getText()] ?? ""}\n`;
                        plist.push(p.name.getText());
                    })
                    if (n.type && n.type.getText() !== "void") headerText += `---@return ${fixType(n.type)} ${returnDoc}\n`;
                    headerText += `function ${namespaceName}.${n.name?.getText()}(${plist.join(", ")}) end\n\n`;
                } else if (ts.isEnumDeclaration(n)) {
                    n.forEachChild(c => {
                        if (ts.isJSDoc(c)) headerText += "--- " + (c.comment?.toString() ?? "") + "\n";
                    });
                    headerText += `---@enum ${namespaceName}.${n.name.text}\n${namespaceName}.${n.name.text} = {\n`;
                    let i = 0;
                    n.forEachChild(c => {
                        if (ts.isEnumMember(c)) {
                            headerText += `    ${c.name.getText()} = ${c.initializer?.getText() ?? i++},\n`;
                        }
                    });
                    headerText += "}\n\n";
                } else if (ts.isTypeAliasDeclaration(n)) {
                    headerText += `---@alias ${namespaceName}.${n.name.text} ${fixType(n.type)}\n\n`;
                }
            });
            let res = context.superTransformStatements(node);
            llsStatements[context.sourceFile.fileName] = (llsStatements[context.sourceFile.fileName] ?? "") + headerText;
            console.log(`Finished namespace ${node.name?.text}`);
            return res;
        },
        [ts.SyntaxKind.FunctionDeclaration]: (node, context: tstl.TransformationContext) => {
            console.log(`Declared function ${node.name?.text}`);
            let headerText = "";
            const doc = node.getChildAt(0);
            let paramMap = {};
            let returnDoc = "";
            if (ts.isJSDoc(doc)) {
                headerText += "--- " + (doc.comment?.toString() ?? "").replaceAll("\n", "\n--- ") + "\n";
                doc.forEachChild(d => {
                    if (ts.isJSDocParameterTag(d)) {
                        paramMap[d.name.getText()] = d.comment?.toString() ?? "";
                    } else if (ts.isJSDocReturnTag(d)) {
                        returnDoc = d.comment?.toString() ?? "";
                    }
                })
            }
            let plist: string[] = [];
            node.parameters.forEach(p => {
                headerText += `---@param ${p.name.getText()} ${fixType(p.type)} ${paramMap[p.name.getText()] ?? ""}\n`;
                plist.push(p.name.getText());
            })
            if (node.type && node.type.getText() !== "void") headerText += `---@return ${fixType(node.type)} ${returnDoc}\n`;
            headerText += `local function ${node.name?.getText()}(this, ${plist.join(", ")}) end\n\n`;
            let res = context.superTransformStatements(node);
            llsStatements[context.sourceFile.fileName] = (llsStatements[context.sourceFile.fileName] ?? "") + headerText;
            console.log(`Finished function ${node.name?.text}`);
            return res;
        },
        [ts.SyntaxKind.VariableDeclaration]: (node, context: tstl.TransformationContext) => {
            console.log(`Declared variable ${node.name?.getText()}`);
            let headerText = "";
            node.forEachChild(c => {
                if (ts.isJSDoc(c)) headerText += "--- " + (c.comment?.toString() ?? "") + "\n";
            })
            headerText += `---@type ${fixType(node.type)}\nlocal ${node.name.getText()} = _\n\n`;
            let res = context.superTransformNode(node);
            llsStatements[context.sourceFile.fileName] = (llsStatements[context.sourceFile.fileName] ?? "") + headerText;
            console.log(`Finished variable ${node.name?.getText()}`);
            return res;
        }
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