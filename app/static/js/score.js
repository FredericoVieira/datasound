var playlists = [];
var artists_ids = [];
var artists_popularity = [];

var getPlaylists = function (user_id, oauth_token) {
    $.ajax({
        url: 'https://api.spotify.com/v1/users/'+user_id+'/playlists', //Test user case over 20 playlists
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Bearer " + oauth_token);
        },
        success: function (response) {
            for (var i = 0; i < response.items.length; i++) {
                playlists.push({'id':response.items[i].uri.split(':')[4], 'name':response.items[i].name, 'owner_id':response.items[i].uri.split(':')[2]});
            };

            var playlists_aux = playlists.slice();

            for (var j = 0; j < playlists.length; j++) {
                $.ajax({
                    //Try to simplify the request url by passing the sporitfy parameters
                    url: 'https://api.spotify.com/v1/users/'+playlists[j].owner_id+'/playlists/'+playlists[j].id+'/tracks?fields=items(track(album(artists)))',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader ("Authorization", "Bearer " + oauth_token);
                    },
                    success: function (response) {
                        for (var k = 0; k < response.items.length; k++) {
                            id = response.items[k].track.album.artists[0].id;
                            if (artists_ids.indexOf(id) === -1) {
                                artists_ids.push(id);
                            }
                        };
                        
                        playlists_aux.shift();
                        if (playlists_aux.length == 0) getArtistsPopularity();
                    }
                });
            };
        },
    });
};

var getArtistsPopularity = function () {
    var div = Math.floor(artists_ids.length / 50);
    var rem = artists_ids.length % 50;

    if(rem > 0) div = div + 1;

    for (var i = 0; i < div; i++) {
        $.ajax({
            url: 'https://api.spotify.com/v1/artists?ids=' + artists_ids.slice(0 + (50 * i), 50 + (50 * i)).toString(), //Limit of 50 artists per request
            success: function (response) {
                for (var i = 0; i < response.artists.length; i++) {
                    artists_popularity.push({'name':response.artists[i].name, 'popularity':response.artists[i].popularity});
                };
            }
        });
    }
}

var getUserScore = function (score) {
    var format = d3.format(",d");

    d3.select("#counter")
      .transition()
        .duration(2500)
        .on("start", function repeat() {
          d3.active(this)
              .tween("text", function() {
                var that = d3.select(this),
                    i = d3.interpolateNumber(that.text().replace(/,/g, ""), score);
                return function(t) { that.text(format(i(t))); };
              })
        });
}

$(document).ready(function() {

    $('.more-info').hide();

    var args = window.location.href.split("?")[1];
    var user_id = args.split("&")[0].split('=')[1];
    var oauth_token = args.split("&")[1].split('=')[1];

    getPlaylists(user_id, oauth_token);

    $(document).ajaxStop(function () {

        var playlists_name = [];
        for (var i = 0; i < playlists.length; i++) {
            playlists_name.push(playlists[i].name);
        }
        $('.more-info').append("Playlists: " + playlists_name.join(", ") + "<br>");

        var popularity_sum = 0;

        for (var i = 0; i < artists_popularity.length; i++) {
            $('.more-info').append(artists_popularity[i].name + ": " + artists_popularity[i].popularity + "<br>");
            popularity_sum = popularity_sum + artists_popularity[i].popularity;
        }

        var score = popularity_sum / artists_popularity.length;
        getUserScore(score);

        var classification;
        if (score <= 20) {
            classification = "Antiquado!";
        } else if (score > 20 && score <= 35 ) {
            classification = "Alternativo!";
        } else if (score > 35 && score <=50 ) {
            classification = "Descolado!";
        } else if (score > 50 && score <= 75 ) {
            classification = "Mais um no meio do multidão!";
        } else {
            classification = "Modinha Total!"
        }
        $('.classification').text(classification);
    });

    $('#more-info').click(function() {
        $('#more-info').hide();
        $('.more-info').show();
    });
});
