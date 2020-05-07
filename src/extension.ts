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

function writeFileInDir(dir: string, name: string, data: string) {
	let fullDir = vscode.workspace.rootPath + path.sep + dir
	if (!fs.existsSync(fullDir))
		fs.mkdirSync(fullDir)
	let fullFilePath = fullDir + path.sep + name
	fs.writeFileSync(fullFilePath, data)
}

function createHeader(dir: string, name: string) {

	let headerFileData =
		`#pragma once\n` +
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
		``
	writeFileInDir(dir, `${name}.h`, headerFileData)
}

function createSource(dir: string, name: string) {

	let sourceData =
		`#include "${name}.h"\n` +
		`\n` +
		`\n` +
		``
	writeFileInDir(dir, `${name}.cpp`, sourceData)
}

/**
 * Returns the path of a sub-directory, after "src" or "include".
 * Example: "src/some/sub/dir" returns "some/sub/dir"
 * @param dir A directory path relative to project root
 * @returns A directory path
 */
function inferSubdir(dir: string): string {

	let dirSplit = dir.split(path.sep)
	if (["src", "include"].includes(dirSplit[0]) && (dirSplit.length > 1)) {
		dirSplit.splice(0, 1)
		return dirSplit.join(path.sep)
	}
	return ""
}

function createClass(targetDir: string, name: string) {

	let projectDir = vscode.workspace.rootPath
	if (projectDir == undefined) {
		showErrorMsg("Cannot create class: No folder open")
		return
	}

	let headerDir: string
	let cppDir: string

	let relativeDir: string
	if (projectDir == targetDir) {
		relativeDir = ""
	} else {
		relativeDir = targetDir.replace(projectDir + path.sep, "")
	}

	let subdir = inferSubdir(relativeDir)
	if (subdir != "") {
		headerDir = "include" + path.sep + subdir
		cppDir = "src" + path.sep + subdir
	} else {
		headerDir = "include"
		cppDir = "src"
	}

	createHeader(headerDir, name)
	createSource(cppDir, name)
	openTextDocument(`${vscode.workspace.rootPath}${path.sep}${headerDir}${path.sep}${name}.h`)
}

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('cpp-class-creator.createClass', (context) => {

		let targetDir = ""
		if (context != undefined) {
			targetDir = context.fsPath
		} else {
			if (vscode.window.activeTextEditor != undefined) {
				targetDir = vscode.window.activeTextEditor.document.uri.path
			}
		}

		createInput().then((className: string | undefined) => {

			if (className == undefined) {
				return
			}

			if (className.indexOf(" ") != -1) {
				showErrorMsg("Cannot create class: Spaces not allowed")
				return
			}

			if (className == "") {
				className = "MyClass"
			}

			createClass(targetDir, className)
		})
	})
	context.subscriptions.push(disposable)
}

export function deactivate() { }
