const imdb_apikey = "Set Your IMDb Apikey";
const title_map_cache_key = "netflix_title_map";

var map = get_title_map();
if ($request.headers) {
    let url = $request.url;
    var video_id = decodeURIComponent(url).match(/"videos","(\d+)"/)[1];
    let title = map[video_id];
    if (!title) {
        let is_en = url.match(/languages=en/) ? true : false;
        if (!is_en) {
            url = url.replace(/&languages=(.*?)&/, "&languages=en-US&");
        }
        $done({ url });
    } else {
        $done({});
    }
} else {
    var body = $response.body;
    var obj = JSON.parse(body);
    let video_id = obj.paths[0][1];
    let title = map[video_id];
    if (!title) {
        title = obj.value.videos[video_id].summary.title;
        set_title_map(video_id, title, map);
    }
    request_IMDb_rating(title, null, function (rating) {
        if (rating) {
            let imdbRating = rating.imdbRating;
            let imdbVotes = rating.imdbVotes;
            let rating_message = "IMDb: ⭐️ " + imdbRating + "/10  " + imdbVotes;
            let summary = obj.value.videos[video_id].summary;
            if (summary && summary.supplementalMessage) {
                summary.supplementalMessage =
                    rating_message + "\n\n" + summary.supplementalMessage;
            } else {
                summary["supplementalMessage"] = rating_message;
            }
            body = JSON.stringify(obj);
            $done({ body });
        } else {
            $done({});
        }
    });
}

function get_title_map() {
    var map = $persistentStore.read(title_map_cache_key);
    console.log("Netflix Title Map:\n" + map);
    if (!map) {
        map = {};
    } else {
        map = JSON.parse(map);
    }
    return map;
}

function set_title_map(id, title, map) {
    map[id] = title;
    $persistentStore.write(JSON.stringify(map), title_map_cache_key);
}

function request_IMDb_rating(title, season, callback) {
    let url =
        "https://www.omdbapi.com/?apikey=" + imdb_apikey + "&t=" + encodeURI(title);
    if (season) url += "&Season=" + season;
    $httpClient.get(url, function (error, response, data) {
        if (!error && response.status == 200) {
            console.log("Netflix IMDb Rating Data:\n" + data);
            let obj = JSON.parse(data);
            if (obj.Response == "False") {
                callback(null);
            } else {
                callback(obj);
            }
        } else {
            callback(null);
        }
    });
}
