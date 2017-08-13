/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const {utils: Cu} = Components;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "wallpaperTourType",
  "resource://wallpaper/modules/wallpaperTourType.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "Preferences",
  "resource://gre/modules/Preferences.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "Services",
  "resource://gre/modules/Services.jsm");

const PREF_WHITELIST = [
  "browser.wallpaper.enabled",
  "browser.wallpaper.hidden",
  "browser.wallpaper.notification.finished",
  "browser.wallpaper.notification.lastPrompted",
  "browser.wallpaper.tourset-version",
  "browser.wallpaper.tour-type",
  "browser.wallpaper.seen-tourset-version"
];

[
  "wallpaper-tour-private-browsing",
  "wallpaper-tour-addons",
  "wallpaper-tour-customize",
  "wallpaper-tour-search",
  "wallpaper-tour-default-browser",
  "wallpaper-tour-sync",
].forEach(tourId => PREF_WHITELIST.push(`browser.wallpaper.tour.${tourId}.completed`));


const PREF_BRANCH = "browser.wallpaper.";
const PREFS = {
  "enabled": true,
  "tourset-version": 1
};

function setDefaultPrefs() {
  let branch = Services.prefs.getDefaultBranch(PREF_BRANCH);
  for (let [key, val] in Iterator(PREFS)) {
    switch (typeof val) {
      case "boolean":
        branch.setBoolPref(key, val);
        break;
      case "number":
        branch.setIntPref(key, val);
        break;
      case "string":
        branch.setCharPref(key, val);
        break;
    }
  }
}

/**
 * Set pref. Why no `getPrefs` function is due to the priviledge level.
 * We cannot set prefs inside a framescript but can read.
 * For simplicity and effeciency, we still read prefs inside the framescript.
 *
 * @param {Array} prefs the array of prefs to set.
 *   The array element carrys info to set pref, should contain
 *   - {String} name the pref name, such as `browser.wallpaper.hidden`
 *   - {*} value the value to set
 **/
function setPrefs(prefs) {
  prefs.forEach(pref => {
    if (PREF_WHITELIST.includes(pref.name)) {
      Preferences.set(pref.name, pref.value);
    }
  });
}

function initContentMessageListener() {
  Services.mm.addMessageListener("wallpaper:OnContentMessage", msg => {
    switch (msg.data.action) {
      case "set-prefs":
        setPrefs(msg.data.params);
        break;
    }
  });
}

function install(aData, aReason) {
  setDefaultPrefs();
}

function uninstall(aData, aReason) {}

function startup(aData, reason) {
  wallpaperTourType.check();
  Services.mm.loadFrameScript("resource://wallpaper/wallpaper.js", true);
  initContentMessageListener();
}

function shutdown(aData, reason) {}
