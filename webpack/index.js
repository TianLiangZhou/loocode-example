const $ = require("jquery");
const request = require("superagent");
const _ = require("underscore");
require("./body.less");



var url = "https://jsonplaceholder.typicode.com/posts";
window.addEventListener("load", function(e) {
    $('body').css({
        //"background-color": "#f4645f"
    });
    $title = $('<h1/>');
    $title.text("I am Index");
    $title.css({
        "color": "#FFFFFF",
        "text-align": "center"
    });
    $('body').append($title);

    request("GET", url).then(function(response) {
        var result = response.body,
            len = result.length,
            list= ["<ul>"],
            div = $("<div/>");
            div.css({"margin": "0 auto", "width": "960px"});
            for (var i = 0; i < len; i++) {
                if (i === 10) break;
                list.push(
                    "<li style=\"color:#EEEEEE\">"+ result[i].title +"</li>"
                );
            }
            list.push("</ul>");
            div.append(list.join(""));
            $("body").append(div);
    }, function(error) {

    });
});