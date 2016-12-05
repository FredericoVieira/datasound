function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

$(document).ready(function() {
    $.backstretch("static/img/backgrounds/" + getRandomInt(0, 5) + ".jpg");
});
