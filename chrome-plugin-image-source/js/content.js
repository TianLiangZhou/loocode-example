
/**
 * 绑定页面载入后将sheets信息发送给background
 */
window.onload = function(e) {
    var content = document.body.innerHTML;
    var sheet = document.styleSheets;
    var href = [];
    for (var key in sheet) {
        if (sheet[key].href != null) {
            href.push(sheet[key].href);
        }
    }
    chrome.runtime.sendMessage({
        type: "content",
        sheet: href,
        url: location.href
    });
}