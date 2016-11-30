var artists_popularity = {};

var getUserPlaylist = function (user_id, oauth_token) {
    $.ajax({
        url: 'https://api.spotify.com/v1/users/'+user_id+'/playlists',
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Bearer " + oauth_token);
        },
        success: function (response) {

            var playlists = [];
            for (var i = 0; i < response.items.length; i++) {
                playlists.push({'owner_id':response.items[i].uri.split(':')[2], 'playlist_id':response.items[i].uri.split(':')[4]});
            };

            for (var i = 0; i < playlists.length; i++) {
                $.ajax({
                    url: 'https://api.spotify.com/v1/users/'+playlists[i].owner_id+'/playlists/'+playlists[i].playlist_id+'/tracks?fields=items(track(album(artists)))',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader ("Authorization", "Bearer " + oauth_token);
                    },
                    success: function (response) {
                        var artists_ids = [];
                        for (var i = 0; i < response.items.length; i++) {
                            artists_ids.push(response.items[i].track.album.artists[0].id);
                        };

                        $.ajax({
                            url: 'https://api.spotify.com/v1/artists?ids='+artists_ids.toString(),
                            success: function (response) {
                                for (var i = 0; i < response.artists.length; i++) {
                                    artists_popularity[response.artists[i].id] = {'name':response.artists[i].name, 'popularity':response.artists[i].popularity};
                                };
                            }
                        });
                    }
                });
            };
        }
    });
};

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
    var args = window.location.href.split("?")[1];
    var user_id = args.split("&")[0].split('=')[1];
    var oauth_token = args.split("&")[1].split('=')[1];

    getUserPlaylist(user_id, oauth_token);

    $(document).ajaxStop(function () {
        var popularity_sum = 0;
        Object.keys(artists_popularity).forEach(function (key){
           popularity_sum = popularity_sum + artists_popularity[key].popularity;
        });

        var score = popularity_sum / Object.keys(artists_popularity).length;
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
});
