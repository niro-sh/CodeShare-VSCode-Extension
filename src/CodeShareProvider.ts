import * as vscode from 'vscode';
import * as moment from 'moment';
import * as path from 'path';
import { CodeShareAPI } from './CodeShareAPI';

export class CodeShareProvider implements vscode.TreeDataProvider<ShareItem> {

	private _onDidChangeTreeData: vscode.EventEmitter<ShareItem | undefined | void> = new vscode.EventEmitter<ShareItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<ShareItem | undefined | void> = this._onDidChangeTreeData.event;

	constructor() { }

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: ShareItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: ShareItem): Thenable<ShareItem[]> {
    const items = [];
    const shareHistory = CodeShareAPI.getShareHistory();

    for(let i = shareHistory.length - 1; i >= 0; i--) {
      const jsonShare = shareHistory[i];

      let icon: string = "";
      if(jsonShare.type.toLowerCase() == "normal") {
        icon = "📄";
      } else if(jsonShare.type.toLowerCase() == "password") {
        icon = "📑";
      }

      items.push(new ShareItem(jsonShare.shareID, jsonShare.date, icon, vscode.TreeItemCollapsibleState.None));
    }

		return Promise.resolve(items);
  }
  
}

export class ShareItem extends vscode.TreeItem {

  public formatedDate: string; 

	constructor(
    public readonly shareID: string,
    public readonly date: Date,
    public readonly icon: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
    super(icon + " " + shareID, collapsibleState);
    
    this.formatedDate = moment(date).format('MMMM Do YYYY, hh:mm:ss a');

		this.tooltip = `${this.shareID} - ${this.formatedDate}`;
    this.description = this.formatedDate;
  }
  
}