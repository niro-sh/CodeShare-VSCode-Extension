import * as vscode from 'vscode';
import { CodeShareAPI } from './CodeShareAPI';
import { Constants } from './Constants';
import { UIUtils } from './UIUtils';

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

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
		const selectedText = currentEditor.document.getText(selection);

		const response = await CodeShareAPI.createShare(selectedText, currentLanguage, undefined, true);
		if(response == undefined) return;

		const jsonResponse = JSON.parse(response.body);

		const shareID = jsonResponse.result.id;
		UIUtils.showCodeShareMessage(shareID);
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

		const currentLanguage = currentEditor.document.languageId;
		const selection = currentEditor.selection;
		const selectedText = currentEditor.document.getText(selection);

		const response = await CodeShareAPI.createShare(selectedText, currentLanguage, password, true);
		if(response == undefined) return;

		const jsonResponse = JSON.parse(response.body);

		const shareID = jsonResponse.result.id;
		UIUtils.showCodeShareMessage(shareID);
	});

	context.subscriptions.push(shareWithPasswordCommand);
	//#endregion

}

// this method is called when your extension is deactivated
export function deactivate() {}
