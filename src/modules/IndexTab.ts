// vim: ts=2 sw=2 et ai
/*
  Container Tab Groups
  Copyright (C) 2022 Menhera.org

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

import browser from 'webextension-polyfill';

const indexPageUrl = browser.runtime.getURL('/index/index-tab.html');
const defaultIconUrl = browser.runtime.getURL('/img/material-icons/category.svg');
const iconUrl = browser.runtime.getURL('/img/usercontext.svg');

export class IndexTab {
  public readonly url: string;
  public readonly iconUrl: string;
  public readonly title: string;
  public readonly colorCode: string;

  public static isIndexTabUrl(url: string) {
    try {
      new IndexTab(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  public static getUrl(title: string, icon: string, colorCode: string) {
    const url = new URL(indexPageUrl);
    const params = new URLSearchParams();
    params.set('i', icon || '');
    params.set('t', title || '');
    params.set('c', colorCode || '#000000');
    url.hash = '#' + params;
    return new IndexTab(url.href);
  }

  public constructor(aUrl: string) {
    const url = new URL(aUrl);
    this.url = url.href;
    const hash = url.hash.slice(1);
    url.hash = '';
    if (url.href != indexPageUrl) {
      throw new TypeError('Not an IndexTab');
    }
    const params = new URLSearchParams(hash);
    const icon = params.get('i');
    if (!icon) {
      this.iconUrl = defaultIconUrl;
    } else {
      this.iconUrl = iconUrl + '#' + icon;
    }
    this.title = params.get('t') || '';
    this.colorCode = params.get('c') || '#000000';
  }
}
