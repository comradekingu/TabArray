// -*- indent-tabs-mode: nil; tab-width: 2; -*-
// vim: set ts=2 sw=2 et ai :

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

import { CookieStoreParams } from "./CookieStoreParams";
import { ContextualIdentityUniqueParams } from "./ContextualIdentityUniqueParams";

/**
 * The parameters for a contextual identity. This interface represents
 * the containers **defined** in Firefox. For the containers **displayed** in
 * the UI (may not be defined in the browser in rare cases), see {@link ContainerAttributes}.
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/contextualIdentities/ContextualIdentity
 */
export interface ContextualIdentityParams extends CookieStoreParams, ContextualIdentityUniqueParams {}
