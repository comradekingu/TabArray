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

/* eslint-disable @typescript-eslint/no-unused-vars */

type CloneIntoOptions = {
  cloneFunctions?: boolean;
  defineAs?: string;
};

declare const cloneInto: <T,>(value: T, scope?: unknown, options?: CloneIntoOptions) => T;

// eslint-disable-next-line @typescript-eslint/ban-types
declare const exportFunction: <T extends Function>(fn: T, scope?: unknown, options?: CloneIntoOptions) => T;

interface Object {
  wrappedJSObject: this;
}
