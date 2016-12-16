var playlists = [];
var artists_ids = [];
var artists_info = [];
var image_default = "https://static1.squarespace.com/static/55d3912ee4b070510b275f77/t/55de32cae4b0054c3d2c0812/1440625355594/spotify+Logo.jpg"

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
                    'image': !response.items[i].images.length ? image_default : response.items[i].images[0].url
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
                            if(response.items[k].track !== null){
                                if(response.items[k].track.album.artists.length != 0 ) var id = response.items[k].track.album.artists[0].id
                                else break;
                                if (artists_ids.indexOf(id) === -1 &&
                                    id != '0LyfQWJT6nXafLPZqxe9Of' &&
                                    response.items[k].track.album.artists[0].name.indexOf("Various Artists")) {
                                    artists_ids.push(id);
                                }
                            }
                        };

                        playlists_aux.shift();
                        if (playlists_aux.length == 0) getArtistsInfo();
                    }
                });
            };
        },
    });
};

var getArtistsInfo = function () {
    var div = Math.floor(artists_ids.length / 50);
    var rem = artists_ids.length % 50;

    if(rem > 0) div = div + 1;

    for (var i = 0; i < div; i++) {
        $.ajax({
            url: 'https://api.spotify.com/v1/artists?ids=' + artists_ids.slice(0 + (50 * i), 50 + (50 * i)).toString(), //Limit of 50 artists per request
            success: function (response) {
                for (var i = 0; i < response.artists.length; i++) {
                    artists_info.push({
                        'id': response.artists[i].id,
                        'name':response.artists[i].name,
                        'popularity':response.artists[i].popularity,
                        'image': !response.artists[i].images.length ? image_default : response.artists[i].images[0].url,
                        'genres': response.artists[i].genres
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
    for (var i = 0; i < artists_info.length; i++) {
        popularity_sum = popularity_sum + artists_info[i].popularity;
    }

    var score = popularity_sum / artists_info.length;
    getUserScore(score);

    var classification;
    if (score <= 20) {
        classification = "Antiquado!";
    } else if (score > 20 && score <= 35 ) {
        classification = "Underground!";
    } else if (score > 35 && score <= 50 ) {
        classification = "Alternativo!";
    } else if (score > 50 && score <= 55 ) {
        classification = "Descolado!";
    } else if (score > 55 && score <= 60 ) {
        classification = "Você faz seu som!";
    } else if (score > 60 && score <= 65 ) {
        classification = "Original!";
    } else if (score > 65 && score <= 70 ) {
        classification = "Na onda dos amigos!";
    } else if (score > 70 && score <= 80 ) {
        classification = "Mais um na multidão!";
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
    var last = artists_info.length - 1;

    for (var i = 0; i < 3; i++) {
        var img_artist = $($.parseHTML('<img>'));
        img_artist.attr('src', artists_info[last - i].image)
            .addClass('artist-img img-responsive');

        var name_popularity = $($.parseHTML('<h3>' + artists_info[last - i].name + ': ' + artists_info[last - i].popularity + '</h3>'));
        $('#top-3-artists').append(img_artist, name_popularity);
    }

    for (var i = 0; i < 3; i++) {
        var img_artist = $($.parseHTML('<img>'));
        img_artist.attr('src', artists_info[i].image)
            .addClass('artist-img img-responsive');

        var name_popularity = $($.parseHTML('<h3>' + artists_info[i].name + ': ' + artists_info[i].popularity + '</h3>'));
        $('#least-3-artists').append(img_artist, name_popularity);
    }
}

var mountGraphsAnalyses = function () {
    var last = artists_info.length;

    var top_artists = artists_info.slice(last - 15, last);
    var visualization = d3plus.viz()
        .container("#bar-top-artists")
        .data(top_artists)
        .type("bar")
        .id("name")
        .x({"value": "name", "label": false, "grid": false})
        .y({"value": "popularity", "label": false, "range": [0, 100], "grid": { "color": "#333" }})
        .labels({"padding": 30})
        .order({"sort": "asc", "value":"popularity"})
        .color({"scale": ["#1DB954"]})
        .background("#232323")
        .axes({"background": {"color": "#232323"}})
        .title("Top 15 Artistas Mais Populares")
        .title({"font":{ "size": "25px"}})
        .draw()

    var least_artists = artists_info.slice(0, 15);
    var visualization = d3plus.viz()
        .container("#bar-least-artists")
        .data(least_artists)
        .type("bar")
        .id("name")
        .x({"value": "name", "label": false, "grid": false})
        .y({"value": "popularity", "label": false, "range": [0, 100], "grid": {"color": "#333"}})
        .labels({"padding": 30})
        .order({"sort": "asc", "value":"popularity"})
        .color({"scale": ["#828282"]})
        .background("#232323")
        .axes({"background": {"color": "#232323"}})
        .title("Top 15 Artistas Menos Populares")
        .title({"font":{ "size": "25px"}})
        .draw()

    var genres_to_main_genre = {
        "hip hop": "Hip Hop",
        "pop rap": "Pop Rap",
        "dance": "Dance",
        "pagode": "Pagode",
        "samba": "Samba",
        "pop rock": "Pop Rock",
        "pop": "Pop",
        "trap": "Trap",
        "rap": "Rap",
        "punk": "Punk",
        "rock": "Rock",
        "mpb": "MPB",
        "r&b": "R&B",
        "funk": "Funk",
        "axe": "Axe",
        "bossa nova": "Bossa Nova",
        "forro": "Forro",
        "sertanejo": "Sertanejo",
        "grunje": "Grunje",
        "emo": "Emo",
        "house": "House"
    };

    var classifyMainGenre = function (genre_name, dict) {
        for (var i = 0; i < Object.keys(dict).length; i++) {
            if(genre_name.indexOf(Object.keys(dict)[i]) !== -1) return dict[Object.keys(dict)[i]]
        }
        return 'Outro'
    }

    var genres = [];
    for (var i = 0; i < artists_info.length; i++) {
        if (artists_info[i].genres.length){
            for (var j = 0; j < artists_info[i].genres.length; j++) {
                var result = $.grep(genres, function(e){ return e.name == artists_info[i].genres[j];});
                if (result.length == 0) {
                    genres.push({
                        "name": artists_info[i].genres[j],
                        "value": 1,
                        "main_genre": classifyMainGenre(artists_info[i].genres[j], genres_to_main_genre)});
                } else result[0].value++;
            }
        }
    }

    var visualization = d3plus.viz()
        .container("#treemap-genres")
        .data(genres)
        .type("tree_map")
        .id(["main_genre","name"])
        .size("value")
        .color("value")
        .background("#232323")
        .title("Gêneros Musicais e suas Derivações")
        .title({"font": {"size": "25px"}})
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
        artists_info.sort(compare);
        mountMostAndLeastPopularityArtists();
        mountGraphsAnalyses();
    });
});
