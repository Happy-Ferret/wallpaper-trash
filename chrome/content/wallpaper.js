/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-env mozilla/frame-script */

"use strict";

const { classes: Cc, interfaces: Ci, utils: Cu } = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/Preferences.jsm");
const { require } = Cu.import("resource://gre/modules/commonjs/toolkit/require.js", {})

var test = require("./module");
var test2 = new test();

const wallpaper_CSS_URL = "resource://wallpaper/wallpaper.css";
const ABOUT_NEWTAB_URL = "about:newtab";
const BUNDLE_URI = "chrome://wallpaper/locale/wallpaper.properties";

/**
 * The script won't be initialized if we turned off wallpaper by
 * setting "browser.wallpaper.enabled" to false.
 */
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
    this.sendMessageToChrome("set-prefs", [
      {
        name: "shell.wallpaper.URL",
        value: URL
      }])
  }

  set wallpaperType(type) {
    this.sendMessageToChrome("set-prefs", [
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

    // let url = "file:///C:/Users/marku/Desktop/photo-1471068139873-46abd34a24b7.jpg";
    // let type = "still";

    var container = this._window.document.getElementById("newtab-customize-overlay");

    this._option = this._renderOption();
    this._wallpaperView = test2.renderWallpaperView(this._window);
    container.insertAdjacentElement("beforebegin", this._wallpaperView);
    this._wallpaper = test2.renderWallpaper(this._window, { url: this.wallpaperURL, type: this.wallpaperType })

    var container2 = this._window.document.getElementById("newtab-customize-panel-inner-wrapper");
    var wallpaperContainer = this._window.document.getElementById("wallpaper");

    // this._window.document.body.insertAdjacentElement("beforebegin", this._wallpaperView);
    container.insertAdjacentElement("beforebegin", this._wallpaperView);
    // wallpaperContainer.innerHTML(this._wallpaper);
    // container.insertAdjacentElement("beforebegin", this._wallpaper);
    container2.appendChild(this._option)

    this._window.document.getElementById("newtab-customize-wallpaper").addEventListener("click", this);
  }

  _selectWallpaper(evt) {
    // evt.target.fp.show()
    var rv = this.fp.show();
    if (rv == this.nsIFilePicker.returnOK || rv == this.nsIFilePicker.returnReplace) {
      var path = this.fp.fileURL.spec;
      var mimeService = Components.classes["@mozilla.org/mime;1"]
        .getService(Components.interfaces.nsIMIMEService);
      var type = mimeService.getTypeFromFile(this.fp.file);

      // Async issue. It's why we have to "load" the wallpaper twice.
      // Message takes a while to receive, so renderWallpaper actually gets the old
      // wallpaper URL on the first try.
      this.wallpaperURL = path;
      this.wallpaperType = type;
    }
    this._window.requestIdleCallback(() =>
      test2.renderWallpaper(this._window, { url: this.wallpaperURL, type: this.wallpaperType }))
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

  // Implement "receiveMessageFromChrome" here, then find a way to wrap test2.renderWallpaper into a callback interface waiting for the method to return.

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
      this._bundle.GetStringFromName("wallpaper.wallpaper.title");
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
      link.href = wallpaper_CSS_URL;
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