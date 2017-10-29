var query = {
    active: true, currentWindow: true
};
var tab = null;
var bg = chrome.extension.getBackgroundPage();

function ajax(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var content = xhr.responseText,
            reg = /url\("?(.*?\.(png|gif|jpeg|jpg|svg))"?\)/gi,
            match = null, images = [];
            while((match = reg.exec(content)) !== null) {
                images.push(match[1]);
            }
            if (images.length > 0) {
                var p = document.createElement("p");
                    p.innerHTML = url,
                    offset = url.lastIndexOf("/") + 1,
                    newUrl = url.substring(0, offset),
                    point = newUrl.lastIndexOf(".") + 1,
                    domain = null;
                for (var j = 1; j <= 6; j++) {
                    if (url.substr(point+j, 1) === "/") {
                        domain = url.substring(0, point+j);
                        break;
                    }
                }
                document.body.appendChild(p);
                for (var i in images) {
                    var img = document.createElement("img");
                    if (images[i].substring(0,1) === '/') {
                        img.setAttribute("src", domain + images[i]);
                    } else {
                        img.setAttribute("src", newUrl + images[i]);
                    }
                    document.body.appendChild(img);
                }
            }
        }
    };
    xhr.send();
}

function callback(tabs) {
    tab = tabs[0]; // there will be only one in this array
    chrome.runtime.sendMessage({
        type: 'popup',
        url: tab.url
    }, function(response) {
        var sheet = response.sheet;
        for(var key in sheet) {
            ajax(sheet[key]);
        }
    });
}


chrome.tabs.query(query, callback);
