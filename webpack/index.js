const $ = require("jquery");
const request = require("superagent");

const _ = require("underscore");



var url = "https://jsonplaceholder.typicode.com/posts";
window.addEventListener("load", function(e) {
    $('body').css({
        "background-color": "#f4645f"
    });
    $title = $('<h1/>');
    $title.text("I am Index");
    $title.css({
        "color": "#FFFFFF"
    });
    $('body').append($title);

    request("GET", url).then(function(response) {
        
    }, function(error) {

    });
});