// Let's wrap everything inside a function so variables are not defined as globals 
(function () {
    // This is gonna our percent buckets ( 25%-75% ) 
    var divisor = 1;
    // We're going to save our players status on this object. 
    var videos_status = {};
    // This is the funcion that is gonna handle the event sent by the player listeners 
    function eventHandler(e) {
        switch (e.type) {
            // This event type is sent everytime the player updated it's current time, 
            // We're using for the % of the video played. 
            case 'timeupdate':
                // Let's set the save the current player's video time in our status object 
                videos_status[e.target.id].current = Math.round(e.target.currentTime);
                // We just want to send the percent events once 
                var pct = Math.floor(100 * videos_status[e.target.id].current / e.target.duration);
                for (var j in videos_status[e.target.id]._progress_markers) {
                    j=Number(j);
                    if (pct >= j && j > videos_status[e.target.id].greatest_marker) {
                        videos_status[e.target.id].greatest_marker = j;
                    }
                }
                // current bucket hasn't been already sent?, let's push it
                if (videos_status[e.target.id].greatest_marker && !videos_status[e.target.id]._progress_markers[videos_status[e.target.id].greatest_marker]) {
                    videos_status[e.target.id]._progress_markers[videos_status[e.target.id].greatest_marker] = true;
                    VideoDataLayer.send({
                        'event': 'video',
                        'video_status': 'progress',
                        'video_provider': 'html5 video player',
                        'video_percent': videos_status[e.target.id].greatest_marker,
                        // We are sanitizing the current video src string, and getting just the video name part
                        'video_title': decodeURIComponent(e.target.currentSrc.split('/')[e.target.currentSrc.split('/').length - 1])
                    });
                }
                break;
            // This event is fired when user's click on the play button
            case 'play':
                VideoDataLayer.send({
                    'event': 'video',
                    'video_status': 'play',
                    'video_provider': 'html5 video player',
                    'video_percent': videos_status[e.target.id].greatest_marker,
                    'video_title': decodeURIComponent(e.target.currentSrc.split('/')[e.target.currentSrc.split('/').length - 1])
                });
                break;
            // This event is fied when user's click on the pause button
            case 'pause':
                //if (videos_status[e.target.id].greatest_marker < '75') {
                    VideoDataLayer.send({
                        'event': 'video',
                        'video_status': 'pause',
                        'video_provider': 'html5 video player',
                        'video_percent': videos_status[e.target.id].greatest_marker,
                        'video_title': decodeURIComponent(e.target.currentSrc.split('/')[e.target.currentSrc.split('/').length - 1])
                    });
                //}
                break;
            // If the user ends playing the video, an Finish video will be pushed ( This equals to % played = 100 )  
            case 'ended':
                VideoDataLayer.send({
                    'event': 'video',
                    'video_status': 'complete',
                    'video_provider': 'html5 video player',
                    'video_percent': 100,
                    'video_title': decodeURIComponent(e.target.currentSrc.split('/')[e.target.currentSrc.split('/').length - 1])
                });
                break;
            default:
                break;
        }
    }
    // We need to configure the listeners
    // Let's grab all the the "video" objects on the current page     
    var videos = document.getElementsByTagName('video');
    for (var i = 0; i < videos.length; i++) {
        // In order to have some id to reference in our status object, we are adding an id to the video objects
        // that don't have an id attribute. 
        var videoTagId;
        if (!videos[i].getAttribute('id')) {
            // Generate a random alphanumeric string to use is as the id
            videoTagId = 'html5_video_' + Math.random().toString(36).slice(2);
            videos[i].setAttribute('id', videoTagId);
        }// Current video has alredy a id attribute, then let's use it <img draggable="false" class="emoji" alt="?" src="https://s.w.org/images/core/emoji/2/svg/1f642.svg">
        else {
            videoTagId = videos[i].getAttribute('id');
        }
        // Video Status Object declaration  
        videos_status[videoTagId] = {};
        // We'll save the highest percent mark played by the user in the current video.
        videos_status[videoTagId].greatest_marker = 0;
        // Let's set the progress markers, so we can know afterwards which ones have been already sent.
        videos_status[videoTagId]._progress_markers = {};
        for (j = 0; j < 100; j++) {
            videos_status[videoTagId].progress_point = divisor * Math.floor(j / divisor);
            videos_status[videoTagId]._progress_markers[videos_status[videoTagId].progress_point] = false;
        }
        // On page DOM, all players currentTime is 0 
        videos_status[videoTagId].current = 0;
        // Now we're setting the event listeners. 
        videos[i].addEventListener("play", eventHandler, false);
        videos[i].addEventListener("pause", eventHandler, false);
        videos[i].addEventListener("ended", eventHandler, false);
        videos[i].addEventListener("timeupdate", eventHandler, false);
        videos[i].addEventListener("ended", eventHandler, false);
    }
})();


var VideoDataLayer = (function () {
    var dataLayer = [];
    return {
        send: function (dataObject) {
            console.log(dataObject);
            dataLayer.push(dataObject);
        }
    }
})();

/*

const video = document.getElementById("video1");

let totalTime = 0;
let watchPoint = 0;
video.addEventListener("play", (event) => {
  console.log(
    "The Boolean paused property is now false. Either the play() method was called or the autoplay attribute was toggled."
  );
});

video.addEventListener("pause", (event) => {
  console.log(
    "The Boolean paused property is now true. The pause() method was called."
  );
});

video.addEventListener("ended", (event) => {
  console.log("The video playback has ended.");
});

video.addEventListener("loadedmetadata", function () {
  totalTime = this.duration;
});

$("#video1").bind("timeupdate", function () {
  watchPoint = Math.floor((this.currentTime / totalTime) * 100);
  console.log("Play Percentage " + watchPoint + "%");
});
*/