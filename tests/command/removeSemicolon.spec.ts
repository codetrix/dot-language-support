import { ensureDocAndSourceFile, ensureGraph } from "../testutils";
import { SyntaxKind } from "../../src/types";
import { Parser } from "../../src/parser";
import { expect } from "chai";
import "mocha";

import * as RemoveSemicolons from "../../src/service/command/RemoveSemicolons";
import { TextDocument } from "vscode-languageserver-types/lib/umd/main";
import { CommandIds } from "../../src/service/codeAction";

describe("Command execution", () => {

	it("should get correct semicolon edits", () => {
		const content = `strict digraph {
			a -> b;
			a -> C
			a -> d;
			a -> e [color=red];
			a -> f [color=red]
			a -> { g h i };
			a -> { g; { g; h -> c; i }; i }
			a -> { g h i } [color=blue];
		}`;
		const expected = `strict digraph {
			a -> b
			a -> C
			a -> d
			a -> e [color=red]
			a -> f [color=red]
			a -> { g h i }
			a -> { g { g h -> c i } i }
			a -> { g h i } [color=blue]
		}`;
		const semicolons = 9;

		const [doc, sf] = ensureDocAndSourceFile(content);
		const pg = ensureGraph(sf);

		const command = {
			command: CommandIds.RemoveSemicolons,
			arguments: undefined
		};

		const execution = RemoveSemicolons.execute(doc, sf, command);

		expect(execution).to.exist;
		if(!execution) throw "Just for the type checker";


		expect(execution.edit.changes).to.exist;
		if(!execution.edit.changes) throw "Just for the type checker";

		const edits = execution.edit.changes[doc.uri];
		expect(edits).to.exist;
		if(!edits) throw "Just for the type checker";

		expect(edits).to.have.length(semicolons);

		const actual = TextDocument.applyEdits(doc, edits);

		expect(actual).to.equal(expected);
	});
});
