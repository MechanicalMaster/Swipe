import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";

const traverse = traverseModule.default;

const root = process.argv[2];

function parseFile(file) {
    const code = fs.readFileSync(file, "utf8");

    const ast = parse(code, {
        sourceType: "module",
        plugins: ["jsx", "typescript"]
    });

    traverse(ast, {
        Function(path) {
            const name =
                path.node.id?.name ||
                path.parent?.id?.name ||
                "anonymous";

            const calls = [];
            path.traverse({
                CallExpression(p) {
                    if (p.node.callee.type === "Identifier") {
                        calls.push(p.node.callee.name);
                    }
                }
            });

            console.log({
                file,
                function: name,
                calls
            });
        }
    });
}

function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) walk(full);
        else if (full.match(/\.(js|ts|tsx)$/)) parseFile(full);
    });
}

walk(root);
