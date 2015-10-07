var Yugglr;
(function (Yugglr) {
    var Video;
    (function (Video) {
        var youtubeRegexp = new RegExp('^\\s*http[s]?://(?:www\\.)?youtu\\.?be(?:\\.com)?/(?:watch\\?v=)?([a-zA-Z0-9\\-_]+)(?:\\?t=(\\d+m)?(\\d+s))?\\s*$', 'i');
        var vimeoRegexp = new RegExp('^\\s*http[s]?://(?:www\\.)?vimeo\\.com/(?:channels/[^/]+/)?(\\d+)(?:#t=(\\d+s))?\\s*$', 'i');
        var videoRegexps = {
            Youtube: youtubeRegexp,
            Vimeo: vimeoRegexp
        };
        (function (VideoProvider) {
            VideoProvider[VideoProvider["Youtube"] = 0] = "Youtube";
            VideoProvider[VideoProvider["Vimeo"] = 1] = "Vimeo";
        })(Video.VideoProvider || (Video.VideoProvider = {}));
        var VideoProvider = Video.VideoProvider;
        function GetTime(m) {
            if (m.length <= 1) {
                return 0;
            }
            var minR = /^(\d+)m$/i;
            var secR = /^(\d+)s$/i;
            var index = 2;
            var time = 0;
            if (minR.test(m[index])) {
                time += parseFloat(m[index].match(minR)[1]) * 60;
                index++;
            }
            if (secR.test(m[index])) {
                time += parseFloat(m[index].match(secR)[1]);
            }
            return time;
        }
        function ValidateVideo(input) {
            for (var provider in videoRegexps) {
                var r = videoRegexps[provider];
                if (r.test(input)) {
                    return true;
                }
            }
            return false;
        }
        Video.ValidateVideo = ValidateVideo;
        function ParseVideo(input) {
            for (var provider in videoRegexps) {
                var r = videoRegexps[provider];
                var m = input.match(r);
                if (m != null && m.length > 1) {
                    var x = Yugglr.Video.VideoProvider;
                    var video = {
                        Provider: x[provider],
                        VideoId: m[1],
                        Time: GetTime(m)
                    };
                    return video;
                }
            }
            return null;
        }
        Video.ParseVideo = ParseVideo;
        function EmbedVideo(video, options) {
            if (video.Provider == Yugglr.Video.VideoProvider.Vimeo) {
                return BuildVimeoVideo(video, options);
            }
            else if (video.Provider == Yugglr.Video.VideoProvider.Youtube) {
                return BuildYoutubeVideo(video, options);
            }
            return null;
        }
        Video.EmbedVideo = EmbedVideo;
        function BuildVimeoVideo(video, options) {
            return '<iframe src="//player.vimeo.com/video/' + video.VideoId +
                '?title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;color=ffffff" width="' + options.Width +
                '" height="' + options.Height +
                '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
        }
        function BuildYoutubeVideo(video, options) {
            return '<iframe width="' + options.Width +
                '" height="' + options.Height +
                '" src="//www.youtube.com/embed/' + video.VideoId +
                '" frameborder="0" allowfullscreen></iframe>';
        }
    })(Video = Yugglr.Video || (Yugglr.Video = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=Video.js.map