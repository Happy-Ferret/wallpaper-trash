/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-env mozilla/frame-script */

"use strict";

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/Preferences.jsm");
const { require } = Cu.import("resource://gre/modules/commonjs/toolkit/require.js", {})

var test = require("./module");
var test2 = new test();

const wallpaper_CSS_URL = "resource://wallpaper/wallpaper.css";
const ABOUT_HOME_URL = "about:home";
const ABOUT_NEWTAB_URL = "about:newtab";
const BUNDLE_URI = "chrome://wallpaper/locale/wallpaper.properties";
const UITOUR_JS_URI = "resource://wallpaper/lib/UITour-lib.js";
const TOUR_AGENT_JS_URI = "resource://wallpaper/wallpaper-tour-agent.js";
const BRAND_SHORT_NAME = Services.strings
  .createBundle("chrome://branding/locale/brand.properties")
  .GetStringFromName("brandShortName");

/**
 * Add any number of tours, following the format
 * {
 *   // The unique tour id
 *   id: "wallpaper-tour-addons",
 *   // The string id of tour name which would be displayed on the navigation bar
 *   tourNameId: "wallpaper.tour-addon",
 *   // The method returing strings used on tour notification
 *   getNotificationStrings(bundle):
 *     - title: // The string of tour notification title
 *     - message: // The string of tour notification message
 *     - button: // The string of tour notification action button title
 *   // Return a div appended with elements for this tours.
 *   // Each tour should contain the following 3 sections in the div:
 *   // .wallpaper-tour-description, .wallpaper-tour-content, .wallpaper-tour-button-container.
 *   // Add wallpaper-no-button css class in the div if this tour does not need a button container.
 *   // If there was a .wallpaper-tour-action-button present and was clicked, tour would be marked as completed.
 *   getPage() {},
 * },
 **/
var wallpaperTours = [
  {
    id: "wallpaper-tour-private-browsing",
    tourNameId: "wallpaper.tour-private-browsing",
    getNotificationStrings(bundle) {
      return {
        title: bundle.GetStringFromName("wallpaper.notification.wallpaper-tour-private-browsing.title"),
        message: bundle.GetStringFromName("wallpaper.notification.wallpaper-tour-private-browsing.message"),
        button: bundle.GetStringFromName("wallpaper.button.learnMore"),
      };
    },
    getPage(win) {
      let div = win.document.createElement("div");
      div.innerHTML = `
        <section class="wallpaper-tour-description">
          <h1 data-l10n-id="wallpaper.tour-private-browsing.title"></h1>
          <p data-l10n-id="wallpaper.tour-private-browsing.description"></p>
        </section>
        <section class="wallpaper-tour-content">
          <img src="resource://wallpaper/img/figure_private.svg" />
        </section>
        <aside class="wallpaper-tour-button-container">
          <button id="wallpaper-tour-private-browsing-button" class="wallpaper-tour-action-button" data-l10n-id="wallpaper.tour-private-browsing.button"></button>
        </aside>
      `;
      return div;
    },
  },
  {
    id: "wallpaper-tour-addons",
    tourNameId: "wallpaper.tour-addons",
    getNotificationStrings(bundle) {
      return {
        title: bundle.GetStringFromName("wallpaper.notification.wallpaper-tour-addons.title"),
        message: bundle.formatStringFromName("wallpaper.notification.wallpaper-tour-addons.message", [BRAND_SHORT_NAME], 1),
        button: bundle.GetStringFromName("wallpaper.button.learnMore"),
      };
    },
    getPage(win) {
      let div = win.document.createElement("div");
      div.innerHTML = `
        <section class="wallpaper-tour-description">
          <h1 data-l10n-id="wallpaper.tour-addons.title"></h1>
          <p data-l10n-id="wallpaper.tour-addons.description"></p>
        </section>
        <section class="wallpaper-tour-content">
          <img src="resource://wallpaper/img/figure_addons.svg" />
        </section>
        <aside class="wallpaper-tour-button-container">
          <button id="wallpaper-tour-addons-button" class="wallpaper-tour-action-button" data-l10n-id="wallpaper.tour-addons.button"></button>
        </aside>
      `;
      return div;
    },
  },
  {
    id: "wallpaper-tour-customize",
    tourNameId: "wallpaper.tour-customize",
    getNotificationStrings(bundle) {
      return {
        title: bundle.GetStringFromName("wallpaper.notification.wallpaper-tour-customize.title"),
        message: bundle.formatStringFromName("wallpaper.notification.wallpaper-tour-customize.message", [BRAND_SHORT_NAME], 1),
        button: bundle.GetStringFromName("wallpaper.button.learnMore"),
      };
    },
    getPage(win) {
      let div = win.document.createElement("div");
      div.innerHTML = `
        <section class="wallpaper-tour-description">
          <h1 data-l10n-id="wallpaper.tour-customize.title"></h1>
          <p data-l10n-id="wallpaper.tour-customize.description"></p>
        </section>
        <section class="wallpaper-tour-content">
          <img src="resource://wallpaper/img/figure_customize.svg" />
        </section>
        <aside class="wallpaper-tour-button-container">
          <button id="wallpaper-tour-customize-button" class="wallpaper-tour-action-button" data-l10n-id="wallpaper.tour-customize.button"></button>
        </aside>
      `;
      return div;
    },
  },
  {
    id: "wallpaper-tour-search",
    tourNameId: "wallpaper.tour-search",
    getNotificationStrings(bundle) {
      return {
        title: bundle.GetStringFromName("wallpaper.notification.wallpaper-tour-search.title"),
        message: bundle.GetStringFromName("wallpaper.notification.wallpaper-tour-search.message"),
        button: bundle.GetStringFromName("wallpaper.button.learnMore"),
      };
    },
    getPage(win) {
      let div = win.document.createElement("div");
      div.innerHTML = `
        <section class="wallpaper-tour-description">
          <h1 data-l10n-id="wallpaper.tour-search.title"></h1>
          <p data-l10n-id="wallpaper.tour-search.description"></p>
        </section>
        <section class="wallpaper-tour-content">
          <img src="resource://wallpaper/img/figure_search.svg" />
        </section>
        <aside class="wallpaper-tour-button-container">
          <button id="wallpaper-tour-search-button" class="wallpaper-tour-action-button" data-l10n-id="wallpaper.tour-search.button"></button>
        </aside>
      `;
      return div;
    },
  },
  {
    id: "wallpaper-tour-default-browser",
    tourNameId: "wallpaper.tour-default-browser",
    getNotificationStrings(bundle) {
      return {
        title: bundle.formatStringFromName("wallpaper.notification.wallpaper-tour-default-browser.title", [BRAND_SHORT_NAME], 1),
        message: bundle.formatStringFromName("wallpaper.notification.wallpaper-tour-default-browser.message", [BRAND_SHORT_NAME], 1),
        button: bundle.GetStringFromName("wallpaper.button.learnMore"),
      };
    },
    getPage(win) {
      let div = win.document.createElement("div");
      let defaultBrowserButtonId = win.matchMedia("(-moz-os-version: windows-win7)").matches ?
        "wallpaper.tour-default-browser.win7.button" : "wallpaper.tour-default-browser.button";
      div.innerHTML = `
        <section class="wallpaper-tour-description">
          <h1 data-l10n-id="wallpaper.tour-default-browser.title"></h1>
          <p data-l10n-id="wallpaper.tour-default-browser.description"></p>
        </section>
        <section class="wallpaper-tour-content">
          <img src="resource://wallpaper/img/figure_default.svg" />
        </section>
        <aside class="wallpaper-tour-button-container">
          <button id="wallpaper-tour-default-browser-button" class="wallpaper-tour-action-button" data-l10n-id="${defaultBrowserButtonId}"></button>
        </aside>
      `;
      return div;
    },
  },
  {
    id: "wallpaper-tour-sync",
    tourNameId: "wallpaper.tour-sync",
    getNotificationStrings(bundle) {
      return {
        title: bundle.GetStringFromName("wallpaper.notification.wallpaper-tour-sync.title"),
        message: bundle.GetStringFromName("wallpaper.notification.wallpaper-tour-sync.message"),
        button: bundle.GetStringFromName("wallpaper.button.learnMore"),
      };
    },
    getPage(win, bundle) {
      let div = win.document.createElement("div");
      div.classList.add("wallpaper-no-button");
      div.innerHTML = `
        <section class="wallpaper-tour-description">
          <h1 data-l10n-id="wallpaper.tour-sync.title"></h1>
          <p data-l10n-id="wallpaper.tour-sync.description"></p>
        </section>
        <section class="wallpaper-tour-content">
          <form>
            <h3 data-l10n-id="wallpaper.tour-sync.form.title"></h3>
            <p data-l10n-id="wallpaper.tour-sync.form.description"></p>
            <input id="wallpaper-tour-sync-email-input" type="text"></input><br />
            <button id="wallpaper-tour-sync-button" class="wallpaper-tour-action-button" data-l10n-id="wallpaper.tour-sync.button"></button>
          </form>
          <img src="resource://wallpaper/img/figure_sync.svg" />
        </section>
      `;
      div.querySelector("#wallpaper-tour-sync-email-input").placeholder =
        bundle.GetStringFromName("wallpaper.tour-sync.email-input.placeholder");
      return div;
    },
  },
];

/**
 * The script won't be initialized if we turned off wallpaper by
 * setting "browser.wallpaper.enabled" to false.
 */
class Wallpaper {
  constructor(contentWindow) {
    this.init(contentWindow);
  }

  async init(contentWindow) {
    this._window = contentWindow;
    this._tourItems = [];
    this._tourPages = [];

    var nsIFilePicker = Ci.nsIFilePicker;
    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.appendFilter("Animated", "*.webm");
    fp.appendFilter("Still", "*.jpg");
    fp.init(this._window, "Select a wallpaper", nsIFilePicker.modeOpen);

    // we only support the new user tour at this moment
    if (Services.prefs.getStringPref("browser.wallpaper.tour-type", "update") !== "new") {
      return;
    }

    // We want to create and append elements after CSS is loaded so
    // no flash of style changes and no additional reflow.
    await this._loadCSS();
    this._bundle = Services.strings.createBundle(BUNDLE_URI);
    let url = "file:///C:/Users/marku/Desktop/opera.webm";
    let type = "animated";

    // let url = "file:///C:/Users/marku/Desktop/photo-1471068139873-46abd34a24b7.jpg";
    // let type = "still";

    var container = this._window.document.getElementById("newtab-customize-overlay");

    this._option = this._renderOption();
    this._wallpaperView = test2.renderWallpaperView(this._window);
    container.insertAdjacentElement("beforebegin", this._wallpaperView);
    this._wallpaper = test2.renderWallpaper(this._window, { url, type });

    var container = this._window.document.getElementById("newtab-customize-overlay");
    var container2 = this._window.document.getElementById("newtab-customize-panel-inner-wrapper");
    var wallpaperContainer = this._window.document.getElementById("wallpaper");

    // this._window.document.body.insertAdjacentElement("beforebegin", this._wallpaperView);
    container.insertAdjacentElement("beforebegin", this._wallpaperView);
    // wallpaperContainer.innerHTML(this._wallpaper);
    // container.insertAdjacentElement("beforebegin", this._wallpaper);
    container2.appendChild(this._option)

    this._loadJS(UITOUR_JS_URI);
    this._loadJS(TOUR_AGENT_JS_URI);

    // Destroy on unload. This is to ensure we remove all the stuff we left.
    // No any leak out there.
    this._window.addEventListener("unload", () => this.destroy());

    this._window.document.getElementById("newtab-customize-wallpaper").addEventListener("click", fp.show);

    this._initPrefObserver();
  }

  _initPrefObserver() {
    if (this._prefsObserved) {
      return;
    }

    this._prefsObserved = new Map();
    this._prefsObserved.set("browser.wallpaper.hidden", prefValue => {
      if (prefValue) {
        this.destroy();
      }
    });
    wallpaperTours.forEach(tour => {
      let tourId = tour.id;
      this._prefsObserved.set(`browser.wallpaper.tour.${tourId}.completed`, () => {
      });
    });
    for (let [name, callback] of this._prefsObserved) {
      Preferences.observe(name, callback);
    }
  }

  _clearPrefObserver() {
    if (this._prefsObserved) {
      for (let [name, callback] of this._prefsObserved) {
        Preferences.ignore(name, callback);
      }
      this._prefsObserved = null;
    }
  }

    _openWallpaper() {
    fp.show()
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

  handleEvent(evt) {
    switch (evt.target.id) {
      case "wallpaper-overlay-icon":
      case "wallpaper-overlay-close-btn":
      // If the clicking target is directly on the outer-most overlay,
      // that means clicking outside the tour content area.
      // Let's toggle the overlay.
      case "wallpaper-overlay":
        this.toggleOverlay();
        break;

      case "wallpaper-notification-action-btn":
        let tourId = this._notificationBar.dataset.targetTourId;
        this.toggleOverlay();
        break;
    }
    let classList = evt.target.classList;
    if (classList.contains("wallpaper-tour-item")) {
    } else if (classList.contains("wallpaper-tour-action-button")) {
      let activeItem = this._tourItems.find(item => item.classList.contains("wallpaper-active"));
    }
  }

  destroy() {
    this._clearPrefObserver();
    if (this._notificationBar) {
      this._notificationBar.remove();
    }
  }

  isTourCompleted(tourId) {
    return Preferences.get(`browser.wallpaper.tour.${tourId}.completed`, false);
  }

  hide() {
    this.sendMessageToChrome("set-prefs", [
      {
        name: "browser.wallpaper.hidden",
        value: true
      },
      {
        name: "browser.wallpaper.notification.finished",
        value: true
      }
    ]);
  }

  _renderWallpaper() {
    let url = "file:///C:/Users/marku/Desktop/opera.webm"
    let div = this._window.document.createElement("div");
    div.id = "wallpaper-overlay";
    div.innerHTML = `
       <div xmlns="http://www.w3.org/1999/xhtml" id="wallpaper" style="position: fixed; top: 0px; left: 0px; height: 100%; width: 100%; overflow: hidden;">
       <video style="height: 100%; width: 100%; object-fit: cover; object-position: center center;" 
       src="${url}" loop="true" autoplay="true"></video></div>
       `;
    return div;
  }

  _renderOption() {
    let div = this._window.document.createElement("div");
    div.id = "newtab-customize-wallpaper";
    div.className = "newtab-customize-panel-item newtab-customize-blank";
    // let onclick = this._openWallpaper();
    div.innerHTML = `
            <label for="wallpaper.wallpaper.title"></label>
            `;

    div.querySelector("label[for='wallpaper.wallpaper.title']").textContent =
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

  _loadJS(uri) {
    let doc = this._window.document;
    let script = doc.createElement("script");
    script.type = "text/javascript";
    script.src = uri;
    doc.head.appendChild(script);
  }
}

  addEventListener("load", function onLoad(evt) {
    if (!content || evt.target != content.document) {
      return;
    }
    removeEventListener("load", onLoad);

    let window = evt.target.defaultView;
    let location = window.location.href;
    if (location == ABOUT_NEWTAB_URL || location == ABOUT_HOME_URL) {
      window.requestIdleCallback(() => {
        new Wallpaper(window);
      });
    }
  }, true);