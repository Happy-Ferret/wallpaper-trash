/* Copyright (c) 2017, Mark "Happy-Ferret" Bauermeister
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */

"use strict";

const {Ci} = require("chrome");

class IPC {
  sendMessageToChrome(win, action, params) {
    const contentMessager = win.QueryInterface(Ci.nsIInterfaceRequestor)
                   .getInterface(Ci.nsIDocShell)
                   .QueryInterface(Ci.nsIInterfaceRequestor)
                   .getInterface(Ci.nsIContentFrameMessageManager);
    
    contentMessager.sendAsyncMessage("wallpaper:OnContentMessage", 
    {
      action, params
    });
  }
}

module.exports = new IPC();