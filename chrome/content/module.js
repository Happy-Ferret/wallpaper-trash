class Foo {
  test() {
    console.log("TEST");
  }

  renderWallpaperView(win) {
    let div = win.window.document.createElement("div");
    div.id = "wallpaper";
    div.style = "position: fixed; top: 0px; left: 0px; height: 100%; width: 100%; overflow: hidden;";

    return div;
  }

  renderWallpaper(win, struct) {
    // let url = "file:///C:/Users/marku/Desktop/opera.webm"
    if (struct.type == "animated") {
      let div = win.window.document.getElementById("wallpaper");
      div.innerHTML = `
       <video style="height: 100%; width: 100%; object-fit: cover; object-position: center center;" 
       src="${struct.url}" loop="true" autoplay="true"></video>
       `;
      return div;
    }
    else {
      let div = win.window.document.getElementById("wallpaper");
      div.innerHTML = `
       <img style="height: 100%; width: 100%; object-fit: cover; object-position: center center;" 
       src="${struct.url}"></img>
       `;
      return div;
    }
  }
}

module.exports = Foo;