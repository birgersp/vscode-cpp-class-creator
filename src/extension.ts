import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

function openTextDocument(filename: string) {
	vscode.workspace.openTextDocument(filename).then(doc => {
		vscode.window.showTextDocument(doc)
	})
}

function createInput(): Thenable<string | undefined> {

	var options: vscode.InputBoxOptions = {
		ignoreFocusOut: false,
		placeHolder: "MyClass",
		prompt: "Type your class name"
	}
	return vscode.window.showInputBox(options)
}

function showInfoMsg(msg: string) {
	vscode.window.showInformationMessage(msg)
}

function showErrorMsg(msg: string) {
	vscode.window.showErrorMessage(msg)
}

function createHeader(dir: string, name: string) {

	let headerGuardMacro = `${name.toUpperCase()}_H`
	let headerFileData =
		`#ifndef ${headerGuardMacro}\n` +
		`#define ${headerGuardMacro}\n` +
		`\n` +
		`class ${name}\n` +
		`{\n` +
		`public:\n` +
		`\n` +
		`\n` +
		`\n` +
		`private:\n` +
		`\n` +
		`\n` +
		`\n` +
		`};\n` +
		`\n` +
		`#endif\n` +
		``
	fs.writeFileSync(`${dir}/${name}.h`, headerFileData)
}

function createSource(dir: string, name: string) {

	let sourceData =
		`#include "${name}.h"\n` +
		`\n` +
		`\n` +
		``
	fs.writeFileSync(`${dir}/${name}.cpp`, sourceData)
}

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('cpp-class-creator.createClass', (context) => {

		let srcDir: string
		if (context != undefined) {
			if (context.fsPath != null) {
				srcDir = context.fsPath
			}
		}

		createInput().then((className: string | undefined) => {

			if (className == undefined) {
				return
			}

			let projectDir = vscode.workspace.rootPath
			if (projectDir == undefined) {
				showErrorMsg("Cannot create class: No folder open")
				return
			}

			if (srcDir == null) {

				let currentFile = vscode.window.activeTextEditor?.document.fileName
				if (currentFile != undefined) {
					srcDir = path.dirname(currentFile)
				} else {
					srcDir = `${projectDir}/src`
					if (!fs.existsSync(srcDir)) {
						fs.mkdirSync(srcDir)
					}
				}
			}

			if (className == "") {
				className = "MyClass"
			}

			if (className.indexOf(" ") != -1) {
				showErrorMsg("Cannot create class: Spaces not allowed")
			}

			createHeader(srcDir, className)
			createSource(srcDir, className)
			openTextDocument(`${srcDir}/${className}.h`)
		})
	})
	context.subscriptions.push(disposable)
}

export function deactivate() { }
