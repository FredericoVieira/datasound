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

$(document).ready(function() {
    var args = window.location.href.split("?")[1];
    var user_id = args.split("&")[0].split('=')[1];
    var oauth_token = args.split("&")[1].split('=')[1];

    getUserPlaylist(user_id, oauth_token);

    $(document).ajaxStop(function () {
        Object.keys(artists_popularity).forEach(function (key){
            $('#teste').append(artists_popularity[key].name + ": " + artists_popularity[key].popularity + "<br><br>" );
        });
    });
});
