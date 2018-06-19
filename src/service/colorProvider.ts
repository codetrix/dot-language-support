import * as lst from "vscode-languageserver-types";
import { ColorInformation } from "vscode-languageserver-protocol"; // TODO: Remove this import and use lst later
import { SourceFile, ColorTable } from "../types";
import { DocumentLike } from "../";
import { syntaxNodeToRange } from "./util";
import * as languageFacts from "./languageFacts";

const colorMap = languageFacts.colors as { [i: string]: string | undefined };

export function getDocumentColors(doc: DocumentLike, sourceFile: SourceFile): ColorInformation[] | undefined {
	const cs = sourceFile.colors;
	return cs
		? colorTableToColorInformation(doc, sourceFile, cs)
		: undefined;
}

function colorTableToColorInformation(doc: DocumentLike, sf: SourceFile, colors: ColorTable): ColorInformation[] {
	if (!colors || colors.size === 0)
		return [];

	const res: ColorInformation[] = [];
	for (const [name, value] of colors) {
		if (!name || !value)
			continue;

		const color = getColorFromName(name);
		if (color) {
			res.push({
				range: syntaxNodeToRange(doc, sf, value.node),
				color,
			});
		}
	}

	return res;
}

function getColorFromName(name: string): ColorInformation["color"] | undefined {

	// If the user wrote "color=#123456", treat the name as a hex code
	if (name.charAt(0) === "#")
		return getHexCodeColor(name);

	// Otherwise, the name must be an laias defined in our color map
	const colorAlias = colorMap[name];
	return colorAlias
		? getHexCodeColor(colorAlias)
		: undefined;
}

function getHexCodeColor(colorCode: string) {
	const hexCode = colorCode.charAt(0) === "#"
		? colorCode.substring(1)
		: colorCode;

	const colorInt = parseInt(hexCode, 16);
	return {
		red: (colorInt & 0x00ff0000) / 255.0,
		green: (colorInt & 0x0000ff00) / 255.0,
		blue: (colorInt & 0x00000ff) / 255.0,
		alpha: hexCode.length === 8 ? (colorInt & 0xff00000) / 255.0 : 1.0,
	};
}
