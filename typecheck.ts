import * as ts from "typescript";
import * as tstl from "@jackmacwindows/typescript-to-lua";

const EXPECT_PLUGIN = "system.expect";
const EXPECT_METHOD = "expect";
const EXPECT_FIELD_METHOD = "field";
const EXPECT_FUNCTION = "___TS_Expect";
const EXPECT_FIELD_FUNCTION = "___TS_Expect_Field";

function fillTypeList(obj: ts.Expression, args: ts.Expression[], fields: ts.Statement[], type: ts.TypeNode, context: tstl.TransformationContext, inUnion: boolean, source?: ts.SourceFile): boolean {
    if (ts.isUnionTypeNode(type)) {
        for (let t of type.types) if (!fillTypeList(obj, args, fields, t, context, true, source)) return false;
    } else if (ts.isFunctionTypeNode(type)) {
        args.push(ts.factory.createStringLiteral("function"));
    } else if (ts.isConstructorTypeNode(type)) {
        args.push(ts.factory.createStringLiteral("table"));
    } else if (ts.isArrayTypeNode(type)) {
        args.push(ts.factory.createStringLiteral("table"));
    } else if (ts.isMappedTypeNode(type)) {
        args.push(ts.factory.createStringLiteral("table"));
    } else if (ts.isTypeLiteralNode(type)) {
        const table = ts.factory.createStringLiteral("table");
        args.push(table);
        let newFields: ts.Statement[] = [];
        for (let field of type.members) {
            
            if (field.name !== undefined) {
                if (ts.isPropertySignature(field) && field.type !== undefined && (ts.isIdentifier(field.name) || ts.isStringLiteral(field.name))) {
                    let args2: ts.Expression[] = [
                        obj,
                        ts.factory.createStringLiteral(field.name.text)
                    ];
                    if (field.questionToken) args2.push(ts.factory.createStringLiteral("nil"));
                    if (fillTypeList(ts.factory.createPropertyAccessExpression(obj, field.name.text), args2, fields, field.type, context, inUnion, source)) {
                        context.program["__usesExpect"] = true;
                        newFields.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                            ts.factory.createIdentifier(EXPECT_FIELD_FUNCTION),
                            [
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                ts.factory.createRestTypeNode(ts.factory.createArrayTypeNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)))
                            ], args2)));
                    }
                } else if (ts.isMethodSignature(field) && (ts.isIdentifier(field.name) || ts.isStringLiteral(field.name))) {
                    let args2: ts.Expression[] = [
                        obj,
                        ts.factory.createStringLiteral(field.name.text),
                        ts.factory.createStringLiteral("function")
                    ];
                    if (field.questionToken) args2.push(ts.factory.createStringLiteral("nil"));
                    context.program["__usesExpect"] = true;
                    newFields.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                        ts.factory.createIdentifier(EXPECT_FIELD_FUNCTION),
                        [
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                            ts.factory.createRestTypeNode(ts.factory.createArrayTypeNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)))
                        ], args2)));
                }
            }
        }
        if (inUnion) fields.push(ts.factory.createIfStatement(ts.factory.createEquality(ts.factory.createTypeOfExpression(obj), table), ts.factory.createBlock(newFields)));
        else fields.unshift(...newFields);
    } else if (ts.isLiteralTypeNode(type)) {
        if (type.literal.kind === ts.SyntaxKind.NullKeyword) args.push(ts.factory.createStringLiteral("nil"));
        else if (type.literal.kind === ts.SyntaxKind.FalseKeyword || type.literal.kind === ts.SyntaxKind.TrueKeyword) args.push(ts.factory.createStringLiteral("boolean"));
        else return false;
    } else if (ts.isParenthesizedTypeNode(type)) {
        return fillTypeList(obj, args, fields, type.type, context, inUnion, source);
    } else if (ts.isOptionalTypeNode(type)) {
        if (!fillTypeList(obj, args, fields, type.type, context, true, source)) return false;
        args.push(ts.factory.createStringLiteral("nil"));
    } else if (type.kind === ts.SyntaxKind.NullKeyword || type.kind == ts.SyntaxKind.UndefinedKeyword) {
        args.push(ts.factory.createStringLiteral("nil"));
    } else if (type.kind === ts.SyntaxKind.AnyKeyword) {
        // do nothing
    } else if (type.kind === ts.SyntaxKind.BooleanKeyword) {
        args.push(ts.factory.createStringLiteral("boolean"));
    } else if (type.kind === ts.SyntaxKind.NumberKeyword) {
        args.push(ts.factory.createStringLiteral("number"));
    } else if (type.kind === ts.SyntaxKind.StringKeyword) {
        args.push(ts.factory.createStringLiteral("string"));
    } else if (type.kind === ts.SyntaxKind.FunctionKeyword) {
        args.push(ts.factory.createStringLiteral("function"));
    } else if (type.kind === ts.SyntaxKind.ObjectKeyword) {
        args.push(ts.factory.createStringLiteral("table"));
    } else if (ts.isTypeReferenceNode(type)) {
        const t = context.checker.getTypeFromTypeNode(type);
        if (t.flags & ts.TypeFlags.EnumLike) {
            args.push(ts.factory.createStringLiteral("number"));
        } else if (t.isClass()) {
            const t2 = context.checker.typeToTypeNode(t, type, ts.NodeBuilderFlags.InTypeAlias);
            if (t2 && !ts.isTypeReferenceNode(t2)) return fillTypeList(obj, args, fields, t2, context, inUnion, (t.aliasSymbol?.declarations ?? [])[0]?.getSourceFile() ?? type.getSourceFile());
            args.push(ts.factory.createStringLiteral(type.typeName.getText(source)));
        } else {
            args.push(ts.factory.createStringLiteral("table"));
        }
    } else {
        context.diagnostics.push({
            category: ts.DiagnosticCategory.Warning,
            code: 0,
            file: type.getSourceFile() ?? source,
            start: type.pos,
            length: type.end - type.pos,
            messageText: `Could not construct type name for parameter (${type.kind}); no type check will be emitted.`
        })
        return false;
    }
    return true;
}

function addTypeChecks(m: ts.MethodDeclaration | ts.FunctionDeclaration, context: tstl.TransformationContext) {
    if (m["jsDoc"]) {
        let jsDoc = m["jsDoc"] as ts.JSDoc[];
        if (jsDoc.length > 0 && jsDoc[0].tags?.find(v => v.tagName.escapedText === "typecheck")) {
            let add: ts.Statement[] = [];
            for (let a in m.parameters) {
                let arg = m.parameters[a];
                if (arg.type && !ts.isThisTypeNode(arg.type)) {
                    let obj = ts.factory.createIdentifier((context.transformNode(arg.name)[0] as tstl.Identifier).text);
                    let args: ts.Expression[] = [
                        ts.factory.createNumericLiteral(parseInt(a) + 1),
                        obj
                    ];
                    let fields: ts.Statement[] = [];
                    if (fillTypeList(obj, args, fields, arg.type, context, false)) {
                        context.program["__usesExpect"] = true;
                        add.push(ts.factory.createExpressionStatement(ts.factory.createCallExpression(
                            ts.factory.createIdentifier(EXPECT_FUNCTION),
                            [
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                                ts.factory.createRestTypeNode(ts.factory.createArrayTypeNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)))
                            ], args)));
                        for (let expr of fields) add.push(expr);
                    }
                }
            }
            m.body?.statements["unshift"](...add);
        }
    }
}

class TypeCheckPlugin implements tstl.Plugin {
    public visitors = {
        [ts.SyntaxKind.FunctionDeclaration]: (node: ts.FunctionDeclaration, context: tstl.TransformationContext): tstl.Statement[] => {
            addTypeChecks(node, context);
            return context.superTransformStatements(node);
        },
        [ts.SyntaxKind.ClassDeclaration]: (node: ts.ClassDeclaration, context: tstl.TransformationContext): tstl.Statement[] => {
            for (let m of node.members) {
                if (ts.isMethodDeclaration(m)) {
                    addTypeChecks(m, context);
                }
            }
            let stat = context.superTransformStatements(node);
            for (const idx in stat) {
                const s = stat[idx]
                if (tstl.isAssignmentStatement(s) && tstl.isStringLiteral(s.right[0]) && tstl.isTableIndexExpression(s.left[0]) && tstl.isStringLiteral(s.left[0].index) && s.left[0].index.value == "name") {
                    stat.splice(parseInt(idx), 0, tstl.createAssignmentStatement(tstl.createTableIndexExpression(tstl.createTableIndexExpression(s.left[0].table, tstl.createStringLiteral("prototype")), tstl.createStringLiteral("__name")), s.right[0]));
                    break;
                }
            }
            return stat;
        }
    }
    public beforeEmit(program: ts.Program, options: tstl.CompilerOptions, emitHost: tstl.EmitHost, result: tstl.EmitFile[]): void | ts.Diagnostic[] {
        if (program["__usesExpect"]) {
            for (const file of result) {
                file.code = `local ___TS_Expect_Temp = require('${EXPECT_PLUGIN}')\nlocal function ${EXPECT_FUNCTION}(this, ...) return ___TS_Expect_Temp.${EXPECT_METHOD}(...) end\nlocal function ${EXPECT_FIELD_FUNCTION}(this, ...) return ___TS_Expect_Temp.${EXPECT_FIELD_METHOD}(...) end\n` + file.code;
            }
        }
    }
}

const plugin = new TypeCheckPlugin();
export default plugin;