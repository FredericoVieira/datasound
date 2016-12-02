var playlists = [];
var artists_ids = [];
var artists_popularity = [];

var getPlaylists = function (user_id, oauth_token) {
    $.ajax({
        url: 'https://api.spotify.com/v1/users/'+user_id+'/playlists', //limit = 20
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Bearer " + oauth_token);
        },
        success: function (response) {
            for (var i = 0; i < response.items.length; i++) {
                playlists.push({'id':response.items[i].uri.split(':')[4], 'name':response.items[i].name, 'owner_id':response.items[i].uri.split(':')[2]});
            };
        },
        complete: function () {
            for (var i = 0; i < playlists.length; i++) {
                $.ajax({
                    url: 'https://api.spotify.com/v1/users/'+playlists[i].owner_id+'/playlists/'+playlists[i].id+'/tracks?fields=items(track(album(artists)))',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader ("Authorization", "Bearer " + oauth_token);
                    },
                    success: function (response) {
                        for (var i = 0; i < response.items.length; i++) {
                            id = response.items[i].track.album.artists[0].id;
                            if (artists_ids.indexOf(id) === -1) {
                                artists_ids.push(id);
                            }
                        };
                    }
                });
            };
            //after this for with ajaxs, execute getArtistsPopularity()
        }
    });
};


var getArtistsPopularity = function () {

    var artists_slice = artists_ids.length / 50;
    var artists_ids_sliced = artists_ids.slice(0,50)
    
    for (var i = 0; i < 1; i++) {
        $.ajax({
            url: 'https://api.spotify.com/v1/artists?ids='+artists_ids_sliced.toString(), //limit = 50
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
    var args = window.location.href.split("?")[1];
    var user_id = args.split("&")[0].split('=')[1];
    var oauth_token = args.split("&")[1].split('=')[1];

    getPlaylists(user_id, oauth_token);

    $(document).ajaxStop(function () {

        for (var i = 0; i < playlists.length; i++) {
            $('.testing').append(playlists[i].name + "<br>");
        }


        $('.testing').append("artists_ids.length = " + artists_ids.length + "<br>");
        for (var i = 0; i < artists_ids.length; i++) {   
            $('.testing').append(artists_ids[i] + "<br>");
        }

        var popularity_sum = 0;

        $('.testing').append("artists_popularity.length = " + artists_popularity.length + "<br>");
        for (var i = 0; i < artists_popularity.length; i++) {
            $('.testing').append(artists_popularity[i].name + ":" + artists_popularity[i].popularity + "<br>");
            popularity_sum = popularity_sum + artists_popularity[i].popularity;
        }
        

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
