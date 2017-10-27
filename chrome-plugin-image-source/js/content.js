window.onload = function(e) {
    var content = document.body.innerHTML;
    var sheet = document.styleSheets;
    chrome.runtime.sendMessage({
        type: "content",
        sheet: sheet,
        url: location.href
    });
}