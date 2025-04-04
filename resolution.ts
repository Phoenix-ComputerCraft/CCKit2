import * as ts from "typescript";
import * as tstl from "@jackmacwindows/typescript-to-lua";

const plugin: tstl.Plugin = {
  beforeEmit(program: ts.Program, options: tstl.CompilerOptions, emitHost: tstl.EmitHost, result: tstl.EmitFile[]) {
    let i = 0;
    while (i < result.length) {
      result[i].code = result[i].code.replace(/require\(["']CCKit2\/(CC\w+)["']\)/g, "require(\"CCKit2.$1\")")
      if (result[i].outputPath.match(/CCKit2\/CC\w+\.lua$/)) result.splice(i);
      else i++;
    }
  },
  beforeTransform(program: ts.Program, options: tstl.CompilerOptions, emitHost: tstl.EmitHost) {
    if (!options.noResolvePaths) options.noResolvePaths = [];
    options.noResolvePaths.push("CCKit2/*");
  },
};

export default plugin;