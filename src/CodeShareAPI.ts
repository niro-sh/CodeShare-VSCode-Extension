import got, { Response } from 'got';
import { Constants } from './Constants';
import * as vscode from 'vscode';
import { UIUtils } from './UIUtils';

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

    return response;
  }

  public static getShareURL(shareID: string): string {
    return `${Constants.APP_URL}/${shareID}`;
  }

}