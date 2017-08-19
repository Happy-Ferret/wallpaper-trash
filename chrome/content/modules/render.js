/* Copyright (c) 2017, Mark "Happy-Ferret" Bauermeister
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */

"use strict";

class Render {
  renderWallpaperView(win) {
    let div = win.window.document.createElement("div");
    div.id = "wallpaper";
    div.style = "position: fixed; top: 0px; left: 0px; height: 100%; width: 100%; overflow: hidden;";

    return div;
  }

  renderWallpaper(win, struct) {
    if (struct.type == "video/webm" || struct.type == "video/mp4" ) {
      let div = win.window.document.getElementById("wallpaper");
      div.innerHTML = `
       <video style="height: 100%; width: 100%; object-fit: cover; object-position: center center;" 
       src="${struct.url}" loop="true" autoplay="true"></video>
       `;
      return div;
    }
    else if (struct.type == "image/jpeg" || struct.type == "image/png") {
      let div = win.window.document.getElementById("wallpaper");
      div.innerHTML = `
       <img style="height: 100%; width: 100%; object-fit: cover; object-position: center center;" 
       src="${struct.url}"></img>
       `;
      return div;
    }
    else {
      return;
    }
  }
}

module.exports = new Render();