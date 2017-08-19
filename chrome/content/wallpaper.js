/* Copyright (c) 2017, Mark "Happy-Ferret" Bauermeister
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */

/* eslint-env mozilla/frame-script */

"use strict";

const { classes: Cc, interfaces: Ci, utils: Cu } = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/Preferences.jsm");
const { require } = Cu.import("resource://gre/modules/commonjs/toolkit/require.js", {})

const Render = require("./modules/render");
const IPC = require("./modules/ipc");

const ABOUT_NEWTAB_URL = "about:newtab";
const BUNDLE_URI = "chrome://wallpaper/locale/wallpaper.properties";

class Wallpaper {
  constructor(contentWindow) {
    this.init(contentWindow);
  }

  get wallpaperURL() {
    return Preferences.get(`shell.wallpaper.URL`);
  }

  get wallpaperType() {
    return Preferences.get(`shell.wallpaper.type`);
  }

  set wallpaperURL(URL) {
    IPC.sendMessageToChrome(this._window, "set-prefs", [
      {
        name: "shell.wallpaper.URL",
        value: URL
      }])
  }

  set wallpaperType(type) {
    IPC.sendMessageToChrome(this._window, "set-prefs", [
      {
        name: "shell.wallpaper.type",
        value: type,
      }
    ]);
  }

  async init(contentWindow) {
    this._window = contentWindow;
    this._tourItems = [];
    this._tourPages = [];

    this.nsIFilePicker = Ci.nsIFilePicker;
    this.fp = Cc["@mozilla.org/filepicker;1"].createInstance(this.nsIFilePicker);

    this.fp.appendFilter("Animated", "*.webm; *.mp4");
    this.fp.appendFilter("Still", "*.jpg; *.jpeg; *.png");
    this.fp.init(this._window, "Select a wallpaper", this.nsIFilePicker.modeOpen);

    this._bundle = Services.strings.createBundle(BUNDLE_URI);

    let wallpaperContainer = this._window.document.getElementById("newtab-customize-overlay");
    let optionContainer = this._window.document.getElementById("newtab-customize-panel-inner-wrapper");

    this._option = this._renderOption();
    this._wallpaperView = Render.renderWallpaperView(this._window);
    wallpaperContainer.insertAdjacentElement("beforebegin", this._wallpaperView);

    this._wallpaper = Render.renderWallpaper(this._window, { url: this.wallpaperURL, type: this.wallpaperType })

    wallpaperContainer.insertAdjacentElement("beforebegin", this._wallpaperView);
    optionContainer.appendChild(this._option)

    this._window.document.getElementById("newtab-customize-wallpaper").addEventListener("click", this);
  }

  _selectWallpaper(evt) {
    let rv = this.fp.show();
    if (rv == this.nsIFilePicker.returnOK || rv == this.nsIFilePicker.returnReplace) {
      let path = this.fp.fileURL.spec;
      let mimeService = Components.classes["@mozilla.org/mime;1"]
        .getService(Components.interfaces.nsIMIMEService);
      let type = mimeService.getTypeFromFile(this.fp.file);

      this.wallpaperURL = path;
      this.wallpaperType = type;
    }
    this._window.requestIdleCallback(() =>
      Render.renderWallpaper(this._window, { url: this.wallpaperURL, type: this.wallpaperType }))
  }

  handleEvent(evt) {
    switch (evt.target.id) {
      case "newtab-customize-wallpaper":
        this._selectWallpaper()
        break;
    }
  }

  _renderOption() {
    let div = this._window.document.createElement("div");
    div.id = "newtab-customize-wallpaper";
    div.className = "newtab-customize-panel-item newtab-customize-blank";
    div.innerHTML = `
            <label for="newtab-customize-wallpaper"></label>
            `;

    div.querySelector("label[for='newtab-customize-wallpaper']").textContent =
      this._bundle.GetStringFromName("wallpaper.option.button");
    return div;
  }
}

addEventListener("load", function onLoad(evt) {
  if (!content || evt.target != content.document) {
    return;
  }
  removeEventListener("load", onLoad);

  let window = evt.target.defaultView;
  let location = window.location.href;
  if (location == ABOUT_NEWTAB_URL) {
    window.requestIdleCallback(() => {
      new Wallpaper(window);
    });
  }
}, true);