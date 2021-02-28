import * as vscode from 'vscode';
import { CodeShareAPI } from './CodeShareAPI';
import { CodeShareProvider } from './CodeShareProvider';
import { Constants } from './Constants';
import { UIUtils } from './UIUtils';
import * as fs from 'fs';

export let extensionFolder: string;
export const codeShareProvider = new CodeShareProvider();

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

	// create extension folder
	extensionFolder = context.globalStorageUri.path.substring(1, context.globalStorageUri.path.length);
	if(!fs.existsSync(extensionFolder)) {
    fs.mkdirSync(extensionFolder);
	}

	//#region register tree data provider
	vscode.window.registerTreeDataProvider('codeshareShares', codeShareProvider);
	//#endregion


	//#region website command
	const websiteCommand = vscode.commands.registerCommand('codeshare.website', async () => {
		vscode.env.openExternal(vscode.Uri.parse(Constants.APP_URL));
	});

	context.subscriptions.push(websiteCommand);
	//#endregion


	//#region share code command
	const shareCommand = vscode.commands.registerCommand('codeshare.share', async () => {
		const currentEditor = vscode.window.activeTextEditor;
		if(!currentEditor) return;

		const currentLanguage = currentEditor.document.languageId;
		const selection = currentEditor.selection;
		let selectedText = currentEditor.document.getText(selection);

		// get whole text if nothing selected
		if(selectedText == '') {
			selectedText = currentEditor.document.getText();
		}

		const shareID = await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Generating code share...",
		}, async (progress, token) => {
			const response = await CodeShareAPI.createShare(selectedText, currentLanguage, undefined, true);
			if(response == undefined) return;
	
			const jsonResponse = JSON.parse(response.body);
	
			const shareID = jsonResponse.result.id;
			return new Promise(resolve => {
				resolve(shareID);
			});
		});

		UIUtils.showCodeShareMessage(shareID as string);
	});

	context.subscriptions.push(shareCommand);
	//#endregion


	//#region share code with password command
	const shareWithPasswordCommand = vscode.commands.registerCommand('codeshare.shareWithPassword', async () => {
		const currentEditor = vscode.window.activeTextEditor;
		if(!currentEditor) return;

		const password = await vscode.window.showInputBox({ 
			password: true,
			placeHolder: 'enter password for code share'
		});

		// check if password is filled
		if(password == undefined || password == '') return;

		const currentLanguage = currentEditor.document.languageId;
		const selection = currentEditor.selection;
		let selectedText = currentEditor.document.getText(selection);

		// get whole text if nothing selected
		if(selectedText == '') {
			selectedText = currentEditor.document.getText();
		}

		const shareID = await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Generating code share...",
		}, async (progress, token) => {
			const response = await CodeShareAPI.createShare(selectedText, currentLanguage, password, true);
			if(response == undefined) return;
	
			const jsonResponse = JSON.parse(response.body);
	
			const shareID = jsonResponse.result.id;
			return new Promise(resolve => {
				resolve(shareID);
			});
		});

		UIUtils.showCodeShareMessage(shareID as string);
	});

	context.subscriptions.push(shareWithPasswordCommand);
	//#endregion


	//#region view: open share in browser
	const openShareInBrowserCommand = vscode.commands.registerCommand('codeshare.view.openShare', async (contextItem) => {
		if(contextItem == null) return;
		vscode.env.openExternal(vscode.Uri.parse(CodeShareAPI.getShareURL(contextItem.shareID)));
	});

	context.subscriptions.push(openShareInBrowserCommand);
	//#endregion


	//#region view: copy share
	const copyShareCommand = vscode.commands.registerCommand('codeshare.view.copyShare', async (contextItem) => {
		if(contextItem == null) return;
		vscode.env.clipboard.writeText(CodeShareAPI.getShareURL(contextItem.shareID));
	});

	context.subscriptions.push(copyShareCommand);
	//#endregion


	//#region view: remove share
	const removeShareCommand = vscode.commands.registerCommand('codeshare.view.removeShare', async (contextItem) => {
		if(contextItem == null) return;
		CodeShareAPI.removeShareHistoryItem(contextItem.shareID);
		codeShareProvider.refresh();
	});

	context.subscriptions.push(removeShareCommand);
	//#endregion

}

// this method is called when your extension is deactivated
export function deactivate() { }
