import got, { Response } from 'got';
import { Constants } from './Constants';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as moment from 'moment';
import { UIUtils } from './UIUtils';
import { codeShareProvider, extensionFolder } from './extension';

export class CodeShareAPI {

  public static async createShare(text: string, language: string, password?: string, showError?: boolean): Promise<Response<string> | undefined> {
    let jsonRequest: any = {
      share: text,
      language: language
    };

    if(password != undefined) {
      jsonRequest["password"] = password;
    }

    let response;
		try {
			response = await got.post(`${Constants.API_URL}/share/create`, {
				json: jsonRequest
			});
		} catch(error) {
			response = error.response;
    }
    
    if(showError) {
      if(response.statusCode != 201) {
        const jsonResponse = JSON.parse(response.body);
  
        const result = await vscode.window.showErrorMessage("Error while creating code share", "More Details");
        if(result?.toLowerCase() == "more details") {
          const displayJson = {
            statusCode: response.statusCode,
            response: jsonResponse
          };
  
          UIUtils.showErrorView(JSON.stringify(displayJson));
        }

        return undefined;
      }
    }

    if(response.statusCode == 201) {
      const shareHistoryPath = extensionFolder + "/shareHistory.json";

      // read share history
      const shareHistory = this.getShareHistory();

      // check if history has reached 100 -> remove first item
      if(shareHistory.length >= 100) shareHistory.shift;

      // get share id
      const jsonResponse = JSON.parse(response.body);
      const shareID = jsonResponse.result.id;

      const newShare = {
        shareID: shareID, 
        date: moment().toDate(),
        type: "normal"
      };
      
      if(password != undefined) newShare["type"] = "password";

      // save share
      shareHistory.push(newShare);

      // write share history
      fs.writeFileSync(shareHistoryPath, JSON.stringify(shareHistory));

      // refresh view
      codeShareProvider.refresh();
    }

    return response;
  }

  public static getShareURL(shareID: string): string {
    return `${Constants.APP_URL}/${shareID}`;
  }

  public static getShareHistory(): Array<any> {
    const shareHistoryPath = extensionFolder + "/shareHistory.json";

    // check if file exists -> create file
    if(!fs.existsSync(shareHistoryPath)) fs.writeFileSync(shareHistoryPath, JSON.stringify([]));

    // read share history and return
    return JSON.parse(fs.readFileSync(shareHistoryPath).toString());
  }

}