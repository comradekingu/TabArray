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
import { ContainerAttributes, ContextualIdentity, CookieStore } from '../frameworks/tabAttributes';
import { UserContext } from '../frameworks/tabGroups';
import { Uint32 } from '../frameworks/types';
import { UserContextService } from '../userContexts/UserContextService';
import { UserContextSortingOrderStore } from '../userContexts/UserContextSortingOrderStore';
import { ExtensionService } from '../frameworks/extension';

type ContainerInfo = {
  cookieStoreId: string;
  name: string;
  iconUrl: string;
};

const userContextService = UserContextService.getInstance();
const userContextSortingOrderStore = UserContextSortingOrderStore.getInstance();
const extensionService = ExtensionService.getInstance();

const mainElement = document.querySelector('#main');

const setTextContent = (query: string, message: string) => {
  const element = document.querySelector(query);
  if (!element) {
    throw new Error(`Missing element: ${query}`);
  }
  element.textContent = browser.i18n.getMessage(message);
};

setTextContent('#headingReopen', 'headingReopen');

const currentBrowserTabPromise = browser.tabs.query({active: true, currentWindow: true}).then((browserTabs) => browserTabs[0]);

const getContainerInfos = async (): Promise<ContainerInfo[]> => {
  const currentBrowserTab = await currentBrowserTabPromise;
  const currentCookieStoreId = currentBrowserTab?.cookieStoreId;
  const userContexts = await UserContext.getAll();
  const filledUserContexts = userContexts.map((userContext) => userContextService.fillDefaultValues(userContext));
  await userContextSortingOrderStore.initialized;
  const sortedUserContext = userContextSortingOrderStore.sort(filledUserContexts).filter((userContext) => userContext.id !== UserContext.ID_DEFAULT);
  const defaultContainer = CookieStore.DEFAULT;
  const privateBrowsingContainer = CookieStore.PRIVATE;
  const privateBrowsingContainerInfos = await extensionService.isAllowedInPrivateBrowsing() ? [
    {
      cookieStoreId: privateBrowsingContainer.id,
      name: browser.i18n.getMessage('privateBrowsing'),
      iconUrl: '/img/firefox-icons/private-browsing-icon.svg',
    },
  ] : [];
  const containerInfos: ContainerInfo[] = [
    {
      cookieStoreId: defaultContainer.id,
      name: browser.i18n.getMessage('noContainer'),
      iconUrl: '',
    },
    ... sortedUserContext.map((userContext) => {
      const contextualIdentity = new ContextualIdentity({
        userContextId: userContext.id,
        privateBrowsingId: 0 as Uint32.Uint32,
        name: userContext.name,
        icon: userContext.icon,
        color: userContext.color,
      });
      const containerAttributes = new ContainerAttributes(contextualIdentity, contextualIdentity.name, contextualIdentity.color, contextualIdentity.icon);
      return {
        cookieStoreId: containerAttributes.id,
        name: containerAttributes.name,
        iconUrl: containerAttributes.iconUrl,
      };
    }),
    ... privateBrowsingContainerInfos,
  ];
  return containerInfos.filter((containerInfo) => containerInfo.cookieStoreId !== currentCookieStoreId);
};

const openTabAndCloseCurrent = async (url: string, cookieStoreId: string, windowId: number, currentTabId: number) => {
  await Promise.all([
    browser.tabs.create({
      url,
      cookieStoreId,
      windowId,
      active: true,
    }),
    browser.tabs.remove(currentTabId),
  ]);
};

const reopenTab = async (targetCookieStoreId: string, currentBrowserTab: browser.Tabs.Tab) => {
  if (currentBrowserTab.url == null || currentBrowserTab.id == null) return;
  const url = currentBrowserTab.url;
  const cookieStore = CookieStore.fromId(targetCookieStoreId);

  // private and non-private tabs can't be on the same window
  const windowId = cookieStore.isPrivate == currentBrowserTab.incognito ? currentBrowserTab.windowId : undefined;
  if (windowId != null) {
    return openTabAndCloseCurrent(url, targetCookieStoreId, windowId, currentBrowserTab.id);
  }

  const browserWindows = (await browser.windows.getAll({windowTypes: ['normal']})).filter((browserWindow) => cookieStore.isPrivate == browserWindow.incognito);
  for (const browserWindow of browserWindows) {
    if (browserWindow.id == null) continue;
    return openTabAndCloseCurrent(url, targetCookieStoreId, browserWindow.id, currentBrowserTab.id);
  }

  Promise.all([
    await browser.windows.create({
      url,
      cookieStoreId: targetCookieStoreId,
      incognito: cookieStore.isPrivate,
    }),
    await browser.tabs.remove(currentBrowserTab.id),
  ]);
};

(async () => {
  const containerInfos = await getContainerInfos();
  for (const containerInfo of containerInfos) {
    const containerButton = document.createElement('button');
    const containerIcon = document.createElement('img');
    containerIcon.classList.add('container-icon');
    if (containerInfo.iconUrl) containerIcon.src = containerInfo.iconUrl;
    containerButton.appendChild(containerIcon);
    const containerLabel = document.createElement('span');
    containerLabel.textContent = containerInfo.name;
    containerLabel.classList.add('container-label');
    containerButton.appendChild(containerLabel);
    containerButton.classList.add('container-button');
    containerButton.addEventListener('click', async () => {
      const browserTab = await currentBrowserTabPromise;
      if (!browserTab || null == browserTab.id || null == browserTab.windowId || null == browserTab.url) {
        console.warn('invalid browser tab', browserTab);
        return;
      }

      // this menu is never shown on non-HTTP tabs
      await reopenTab(containerInfo.cookieStoreId, browserTab);
    });
    mainElement?.appendChild(containerButton);
  }
})().catch((e) => {
  console.error(e);
});
