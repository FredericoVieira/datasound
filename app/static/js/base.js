var artists_popularity = {};

var getUserPlaylist = function (user_id) {
    $.ajax({
        url: 'https://api.spotify.com/v1/users/'+user_id+'/playlists',
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Bearer " + "BQCiM0XvmMdzemrc7B1pKU17rQUri0yIDIPd4-Y7bEcErezbgnGNVrX9AJZwPYdWs7OmCB0oaOor037UsNquXMh8lVzMSkZr_g3y7aUgcGq43rHG8dO3d5cft1ODupOZ-xhy9eCfwB6wfXIIs3jeEn_tjzNMRja0PC_4");
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
                        xhr.setRequestHeader ("Authorization", "Bearer " + "BQCiM0XvmMdzemrc7B1pKU17rQUri0yIDIPd4-Y7bEcErezbgnGNVrX9AJZwPYdWs7OmCB0oaOor037UsNquXMh8lVzMSkZr_g3y7aUgcGq43rHG8dO3d5cft1ODupOZ-xhy9eCfwB6wfXIIs3jeEn_tjzNMRja0PC_4");
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

getUserPlaylist('freddvieira');

$(document).ajaxStop(function () {
    Object.keys(artists_popularity).forEach(function (key){
        $('.controls').append(artists_popularity[key].name + ": " + artists_popularity[key].popularity + "<br><br>" );
    });
});
