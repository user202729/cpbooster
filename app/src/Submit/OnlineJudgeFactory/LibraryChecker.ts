/*
    cpbooster "Competitive Programming Booster"
    Copyright (C) 2023  user202729

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Page } from "playwright-chromium";
import OnlineJudge, { OnlineJudgeName } from "./OnlineJudge";
import * as fs from "fs";

declare const window: any; // https://stackoverflow.com/a/74080826/5267751

export default class LibraryChecker extends OnlineJudge {
  readonly onlineJudgeName = OnlineJudgeName.librarychecker;
  readonly loginUrl = "https://judge.yosupo.jp/login";
  readonly blockedResourcesOnSubmit: Set<string> = new Set([
    "image",
    "font"
  ]);

  async isLoggedIn(page: Page): Promise<boolean> {
    return true;
    /*
    return (await 
            page.locator('header.MuiPaper-root button', { hasText: /^Login$/ }).count()
           ) === 0;
           */
  }

  async uploadFile(filePath: string, page: Page, langAlias: string): Promise<boolean> {
    try {
      const fileContent = await fs.promises.readFile(filePath, "utf8");
      await page.locator('form section div.monaco-editor').waitFor();

      //await page.evaluate('monaco.editor.getEditors()[0].setValue(' + JSON.stringify(fileContent) + ')')  // https://stackoverflow.com/a/74082778 (no idea how to pass in arguments apart from JSON.stringify)
      await page.evaluate(fileContent => window.monaco.editor.getEditors()[0].setValue(fileContent),
                          fileContent)
      await page.locator('form div.MuiSelect-select + input').fill(langAlias);

      await page.locator('form button[type=submit]', { hasText: /^Submit$/ }).click();
      await page.waitForLoadState("domcontentloaded");

      console.log("done");
      await new Promise(p=>setTimeout(p, 20000));

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
