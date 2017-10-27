var url = {},
hashCode = function(){
    var hash = 0;
    for (var i = 0; i < this.length; i++) {
        var character = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
/**
 * @see https://developer.chrome.com/extensions/pageAction
 */
/**
chrome.pageAction.onClicked.addListener(function(tab) {
    // No tabs or host permissions needed!
    var hash = hashCode(tab.url);
    alert(url[hash]);
});
**/

/**
 * @see https://developer.chrome.com/extensions/tabs#on-removed
 */
chrome.tabs.onRemoved.addListener(function(tab) {

});


/** 
chrome.webRequest.onBeforeSendHeaders.addListener(function(request) {
    console.log(request);
});
*/

/**
 * 监听标签页更新事件
 * @see https://developer.chrome.com/extensions/tabs#on-updated
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var url = tab.url;
    var status = changeInfo.status; //loading and complete two state
    if (url !== undefined && status === 'complete' && url.substring(0, 4) === 'http') {
        chrome.pageAction.show(tabId);
    } else {
        //chrome.pageAction.hide(tabId);
    }
});


/**
 * @see https://developer.chrome.com/extensions/runtime#event-onMessage
 */
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    var code = hashCode(message.url);
    if (message.type === 'content') {
        if (url.hasOwnProperty(code) === false) {
            url[code] = message.sheet;
        }
    } else if (message.type === 'popup') {
        sendResponse({sheet: url[code]});  
    }
});