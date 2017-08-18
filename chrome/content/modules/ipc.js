/* Copyright (c) 2017, Mark "Happy-Ferret" Bauermeister
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */

const {Ci} = require("chrome");

class IPC {
  /**
   * @param {String} action the action to ask the chrome to do
   * @param {Array} params the parameters for the action
   */
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