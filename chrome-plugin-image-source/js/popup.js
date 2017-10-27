var query = { active: true, currentWindow: true };
function callback(tabs) {
    var currentTab = tabs[0]; // there will be only one in this array
    chrome.runtime.sendMessage({
        type: 'popup',
        url: currentTab.url
    }, function(response) {
        var sheet = response.sheet;
        for(var key in sheet) {
            
        }
    });
}
chrome.tabs.query(query, callback);