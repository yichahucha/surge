/*
[Script]
http-response ^https?://ios\.prod\.ftl\.netflix\.com/iosui/user/.+path=%5B%22videos%22%2C%\d+%22%2C%22summary%22%5D script-path=https://raw.githubusercontent.com/yichahucha/surge/master/netflix_imdb.js,requires-body=1
http-request ^https?://ios\.prod\.ftl\.netflix\.com/iosui/user/.+path=%5B%22videos%22%2C%\d+%22%2C%22summary%22%5D script-path=https://raw.githubusercontent.com/yichahucha/surge/master/netflix_imdb.js

[MITM]
hostname = ios.prod.ftl.netflix.com
*/

const imdb_api_key = "PlzBanMe";
const netflix_title_cache_key = "netflix_title_map";

if ($request.headers) {
    let url = $request.url;
    let video_id = decodeURIComponent(url).match(/"videos","(\d+)"/)[1];
    let map = get_title_map();
    let title = map[video_id];
    let is_english = url.match(/languages=en/) ? true : false;
    if (!title && !is_english) {
        url = url.replace(/&languages=(.*?)&/, "&languages=en-US&");
        $done({ url });
    } else {
        $done({});
    }
} else {
    let body = $response.body;
    let obj = JSON.parse(body);
    let video_id = obj.paths[0][1];
    let map = get_title_map();
    let title = map[video_id];
    if (!title) {
        title = obj.value.videos[video_id].summary.title;
        set_title_map(video_id, title, map);
    }
    request_IMDb_rating(title, null, function (data) {
        if (data) {
            let rating_message = get_rating_message(data);
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
    let map = $persistentStore.read(netflix_title_cache_key);
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
    $persistentStore.write(JSON.stringify(map), netflix_title_cache_key);
}

function request_IMDb_rating(title, season, callback) {
    let url =
        "https://www.omdbapi.com/?t=" + encodeURI(title) + "&apikey=" + imdb_api_key;
    console.log("Netflix IMDb Rating URL:\n" + url);
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

function get_rating_message(data) {
    let ratings = data.Ratings;
    let rating_message = "IMDb:  ⭐️ N/A";
    if (ratings.length > 0) {
        let imdb_source = ratings[0]["Source"];
        if (imdb_source == "Internet Movie Database") {
            let imdb_votes = data.imdbVotes;
            let imdb_rating = ratings[0]["Value"];
            rating_message = "IMDb:  ⭐️ " + imdb_rating + "   " + imdb_votes;
            if (data.Type == "movie") {
                if (ratings.length > 1) {
                    let source = ratings[1]["Source"];
                    if (source == "Rotten Tomatoes") {
                        let tomatoes = ratings[1]["Value"];
                        rating_message += ".   Tomatoes:  🍅 " + tomatoes;
                    }
                }
            }
        }
    }
    return rating_message;
}
