# Wallpaper

System addon to provide user-pickable wallpapers for "about:newtab".

## Architecture

Whenever `about:newtab` is opened, the extension's DIV contents are injected into that page.

The wallpaper type and URL are saved/received to/from the browser's preferences
(`about:config` => `shell.wallpaper.URL` and `shell.wallpaper.type` respectively).