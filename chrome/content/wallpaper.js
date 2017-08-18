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

const WALLPAPER_CSS_URL = "resource://wallpaper/wallpaper.css";
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

    // We want to create and append elements after CSS is loaded so
    // no flash of style changes and no additional reflow.
    await this._loadCSS();
    this._bundle = Services.strings.createBundle(BUNDLE_URI);

    let url = "resource://wallpaper/Opera.webm";
    let type = "animated";

    var container = this._window.document.getElementById("newtab-customize-overlay");

    this._option = this._renderOption();
    this._wallpaperView = Render.renderWallpaperView(this._window);
    container.insertAdjacentElement("beforebegin", this._wallpaperView);
    this._wallpaper = Render.renderWallpaper(this._window, { url: this.wallpaperURL, type: this.wallpaperType })

    var container2 = this._window.document.getElementById("newtab-customize-panel-inner-wrapper");
    var wallpaperContainer = this._window.document.getElementById("wallpaper");

    container.insertAdjacentElement("beforebegin", this._wallpaperView);
    // wallpaperContainer.innerHTML(this._wallpaper);
    // container.insertAdjacentElement("beforebegin", this._wallpaper);
    container2.appendChild(this._option)

    this._window.document.getElementById("newtab-customize-wallpaper").addEventListener("click", this);
  }

  _selectWallpaper(evt) {
    var rv = this.fp.show();
    if (rv == this.nsIFilePicker.returnOK || rv == this.nsIFilePicker.returnReplace) {
      var path = this.fp.fileURL.spec;
      var mimeService = Components.classes["@mozilla.org/mime;1"]
        .getService(Components.interfaces.nsIMIMEService);
      var type = mimeService.getTypeFromFile(this.fp.file);

      this.wallpaperURL = path;
      this.wallpaperType = type;
    }
    this._window.requestIdleCallback(() =>
      Render.renderWallpaper(this._window, { url: this.wallpaperURL, type: this.wallpaperType }))
  }

  /**
   * @param {String} action the action to ask the chrome to do
   * @param {Array} params the parameters for the action
   */
  sendMessageToChrome(action, params) {
    sendAsyncMessage("wallpaper:OnContentMessage", {
      action, params
    });
  }

  // Implement "receiveMessageFromChrome" here, then find a way to wrap Render.renderWallpaper into a callback interface waiting for the method to return.

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
    // let onclick = this._openWallpaper();
    div.innerHTML = `
            <label for="newtab-customize-wallpaper"></label>
            `;

    div.querySelector("label[for='newtab-customize-wallpaper']").textContent =
      this._bundle.GetStringFromName("wallpaper.option.button");
    return div;
  }

  _loadCSS() {
    // Returning a Promise so we can inform caller of loading complete
    // by resolving it.
    return new Promise(resolve => {
      let doc = this._window.document;
      let link = doc.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = WALLPAPER_CSS_URL;
      link.addEventListener("load", resolve);
      doc.head.appendChild(link);
    });
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