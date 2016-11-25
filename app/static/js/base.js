var getUserPlaylist = function (user_id) {
    $.ajax({
        url: 'https://api.spotify.com/v1/users/'+user_id+'/playlists',
        success: function (response) {
            //get from response -> playlists = {owner_id: owner.id, playlist_id: id}
            //for playlists.lenght
                artists_ids.add(getUserPlaylistTracks(playlists[i].owner_id, playlists[i].playlist_id));

            getArtistsPopularity(artists_ids);
        }
    });
};

var getUserPlaylistTracks = function (owner_id, playlist_id) {
    $.ajax({
        url: 'https://api.spotify.com/v1/users/'+owner_id+'/playlists/'+playlist_id+'/tracks?fields=items(track(album(artists)))',
        success: function (response) {
            //track > album > artists > id
            //return artists ids
        }
    });
};

var getArtistsPopularity = function (artists_ids) {
    $.ajax({
        url: 'https://api.spotify.com/v1/artists?ids='+artists_ids.toString(),
        success: function (response) {
            //return id, name, artists_popularity
        }
    });
};

document.getElementById('search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    getUserPlaylist(user_id);
}, false);