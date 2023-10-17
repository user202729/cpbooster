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
import OnlineJudge from "./OnlineJudge";
import { OnlineJudgeName } from "../../Config/Types/OnlineJudgeName";
import * as fs from "fs";

export default class Vjudge extends OnlineJudge {
  readonly onlineJudgeName = OnlineJudgeName.vjudge;
  readonly loginUrl = "https://vjudge.net/";
  readonly blockedResourcesOnSubmit: Set<string> = new Set([
    "image",
    "stylesheet",
    "font"
  ]);

  async isLoggedIn(page: Page): Promise<boolean> {
    return (await page.locator('a.nav-link.logout').count()) !== 0;
  }

  async uploadFile(filePath: string, page: Page, langAlias: string): Promise<boolean> {
    try {
      const fileContent = await fs.promises.readFile(filePath, "utf8");
      await page.locator('button#btn-submit').click();
      await page.locator('form#submit-form textarea#submit-solution').fill(fileContent);
      const languageSelector = page.locator('form#submit-form select#submit-language');
      await languageSelector.waitFor();
      const availableAliases = await Promise.all(
        (await languageSelector.locator("option").all())
        .map(element => element.getAttribute("value"))
      );
      const configuredLangAliases = langAlias.split("/");
      const usedLangAlias = configuredLangAliases.find(alias => availableAliases.includes(alias));
      if (!usedLangAlias) {
        console.log(`None of the specified language alias (${configuredLangAliases}) can be found for this online judge (available aliases are ${availableAliases})`);
        return false;
      }
      languageSelector.selectOption(usedLangAlias);

      await page.locator("div.modal-content div.modal-footer button#btn-submit").click();
      await page.waitForLoadState("domcontentloaded");

      const errorMessage = page.locator('div#submit-alert');
      if(await Promise.any([
        errorMessage.waitFor({ state: "visible" }).then(_ => true),
        page.locator('div#solutionModal').waitFor({ state: "visible" }).then(_ => false)
      ])){
        console.log("Error: " + await errorMessage.innerText());
        return false;
      }

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}

