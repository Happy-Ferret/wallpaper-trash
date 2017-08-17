/* Copyright (c) 2017, Mark "Happy-Ferret" Bauermeister
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */
"use strict";

const {utils: Cu} = Components;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "Preferences",
  "resource://gre/modules/Preferences.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "Services",
  "resource://gre/modules/Services.jsm");

const PREF_WHITELIST = [
  "shell.wallpaper.URL",
  "shell.wallpaper.type"
];

const PREF_BRANCH = "shell.wallpaper.";
const PREFS = {
  "URL": "resource://wallpaper/Opera.webm",
  "type": "video/webm"
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

function install(aData, aReason) {}

function uninstall(aData, aReason) {}

function startup(aData, reason) {
  setDefaultPrefs();
  Services.mm.loadFrameScript("resource://wallpaper/wallpaper.js", true);
  initContentMessageListener();
}

function shutdown(aData, reason) {}
