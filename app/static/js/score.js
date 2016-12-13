var playlists = [];
var artists_ids = [];
var artists_popularity = [];

var getPlaylists = function (user_id, oauth_token) {
    $.ajax({
        url: 'https://api.spotify.com/v1/users/'+user_id+'/playlists', //Limit 20 playlists per request
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Bearer " + oauth_token);
        },
        success: function (response) {
            for (var i = 0; i < response.items.length; i++) {
                playlists.push({
                    'id':response.items[i].uri.split(':')[4],
                    'name':response.items[i].name,
                    'owner_id':response.items[i].uri.split(':')[2],
                    'image': !response.items[i].images.length ? 'https://static1.squarespace.com/static/55d3912ee4b070510b275f77/t/55de32cae4b0054c3d2c0812/1440625355594/spotify+Logo.jpg' : response.items[i].images[0].url
                });
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
                            if (artists_ids.indexOf(id) === -1 && id != '0LyfQWJT6nXafLPZqxe9Of') { //Various Artists id case
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
                    artists_popularity.push({
                        'id': response.artists[i].id,
                        'name':response.artists[i].name,
                        'popularity':response.artists[i].popularity,
                        'image': !response.artists[i].images.length ? 'https://static1.squarespace.com/static/55d3912ee4b070510b275f77/t/55de32cae4b0054c3d2c0812/1440625355594/spotify+Logo.jpg' : response.artists[i].images[0].url
                    });
                };
            }
        });
    }
}

var getUserScore = function (score) {
    var options = {
      useEasing : false,
      useGrouping : false,
      separator : '',
      decimal : '.',
      prefix : '',
      suffix : ''
    };

    var countUp = new CountUp($('#counter')[0], 0, score, 0, 2.5, options);
    countUp.start();
}

var mountScoreAndClassification = function () {
    var popularity_sum = 0;
    for (var i = 0; i < artists_popularity.length; i++) {
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

    setTimeout(function() {
            $('.classification').text(classification);
            $('#more-info-anchor').show();
    }, 2700);
}

var mountPlaylists = function () {
    var playlists_name = [];
    for (var i = 0; i < playlists.length; i++) {
        var playlist = $($.parseHTML('<div></div>'));
        var img = $($.parseHTML('<img>'));
        var p = $($.parseHTML('<p></p>'));

        img.attr('src', playlists[i].image)
            .addClass('playlist-img img-responsive');
        p.html(playlists[i].name.substring(0, 60))
            .attr('title', playlists[i].name);

        playlist.addClass('playlist')
            .addClass('col-xs-6 col-sm-4 col-md-3 col-lg-2')
            .append(img)
            .append(p);
        $('#playlists').append(playlist);
    }
}

var mountMostAndLeastPopularityArtists = function () {
    var last = artists_popularity.length - 1;

    var most_popular_artist = $($.parseHTML('<div></div>'));
    var img_mp = $($.parseHTML('<img>'));
    img_mp.attr('src', artists_popularity[last].image)
            .addClass('artist-img img-responsive');

    most_popular_artist.append(img_mp);
    $('#most-popular-artist').append(most_popular_artist);

    var p = $($.parseHTML('<h2></h2>'));
    $('#most-popular-artist').append(p.clone().html(artists_popularity[last].name + ': ' + artists_popularity[last].popularity));

    var least_popular_artist = $($.parseHTML('<div></div>'));
    var img_lp = $($.parseHTML('<img>'));
    img_lp.attr('src', artists_popularity[0].image)
            .addClass('artist-img img-responsive');

    least_popular_artist.append(img_lp);
    $('#least-popular-artist').append(least_popular_artist);

    $('#least-popular-artist').append(p.clone().html(artists_popularity[0].name + ': ' + artists_popularity[0].popularity));
}

var mountGraphsAnalyses = function () {

    var last = artists_popularity.length;

    var top_artists = artists_popularity.slice(last - 15, last);
    var least_artists = artists_popularity.slice(0, 15);

    var top_least_artists = [];
    var top_least_artists = top_least_artists.concat(top_artists, least_artists);

    var visualization = d3plus.viz()
        .container("#bar-top-artists")
        .data(top_artists)
        .type("bar")
        .id("name")
        .x("name")
        .x({"label": false})
        .y("popularity")
        .y({"label": false})
        .labels({"padding": 30})
        .order({"sort": "asc", "value":"popularity"})
        .color({"scale": ["#1DB954"]})
        .draw()

    var visualization = d3plus.viz()
        .container("#bar-least-artists")
        .data(least_artists)
        .type("bar")
        .id("name")
        .x("name")
        .x({"label": false})
        .y("popularity")
        .y({"label": false})
        .labels({"padding": 30})
        .order({"sort": "asc", "value":"popularity"})
        .labels({"padding": 15})
        .color({"scale": ["#828282"]})
        .draw()
}

var compare = function (a, b) {
    if (a.popularity < b.popularity)
        return -1;
    if (a.popularity > b.popularity)
        return 1;
    return 0;
}

$(document).ready(function() {

    $.localScroll({
        offset: 0,
        duration: 1200
    });

    var args = window.location.href.split("?")[1];
    var user_id = args.split("&")[0].split('=')[1];
    var oauth_token = args.split("&")[1].split('=')[1];

    getPlaylists(user_id, oauth_token);

    $(document).ajaxStop(function () {

        mountScoreAndClassification();
        mountPlaylists();
        artists_popularity.sort(compare);
        mountMostAndLeastPopularityArtists();
        mountGraphsAnalyses();

        //for (var i = 0; i < artists_popularity.length; i++) {
        //    $('#more-info').append(artists_popularity[i].name + ": " + artists_popularity[i].popularity + "<br>");
        //}
    });
});
