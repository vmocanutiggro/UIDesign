module Yugglr.Video {
	var youtubeRegexp: RegExp = new RegExp('^\\s*http[s]?://(?:www\\.)?youtu\\.?be(?:\\.com)?/(?:watch\\?v=)?([a-zA-Z0-9\\-_]+)(?:\\?t=(\\d+m)?(\\d+s))?\\s*$', 'i');
	var vimeoRegexp: RegExp = new RegExp('^\\s*http[s]?://(?:www\\.)?vimeo\\.com/(?:channels/[^/]+/)?(\\d+)(?:#t=(\\d+s))?\\s*$', 'i');

	var videoRegexps = {
		Youtube: youtubeRegexp,
		Vimeo: vimeoRegexp
	};

	export enum VideoProvider {
		Youtube,
		Vimeo
	}

	export interface IVideo {
		Provider: VideoProvider;
		VideoId: string;
		Time?: number;
	}

	function GetTime(m: string[]): number {
		if (m.length <= 1) {
			return 0;
		}

		var minR = /^(\d+)m$/i;
		var secR = /^(\d+)s$/i;

		var index: number = 2;

		var time: number = 0;
		if (minR.test(m[index])) {
			time += parseFloat(m[index].match(minR)[1]) * 60;
			index++;
		}

		if (secR.test(m[index])) {
			time += parseFloat(m[index].match(secR)[1]);
		}

		return time;
	}

	export function ValidateVideo(input: string): boolean {
		for (var provider in videoRegexps) {
			var r = <RegExp>videoRegexps[provider];
			if (r.test(input)) {
				return true;
			}
		}

		return false;
	}

	export function ParseVideo(input: string): IVideo {
		for (var provider in videoRegexps) {
			var r = <RegExp>videoRegexps[provider];
			var m = input.match(r);
			if (m != null && m.length > 1) {
				var x: any = Yugglr.Video.VideoProvider;
				var video: IVideo = {
					Provider: x[provider],
					VideoId: m[1],
					Time: GetTime(m)
				};

				return video;
			}
		}

		return null;
	}

	export interface IEmbedOptions {
		Width: number;
		Height: number;
	}

	export function EmbedVideo(video: IVideo, options: IEmbedOptions): string {
		if (video.Provider == Yugglr.Video.VideoProvider.Vimeo) {
			return BuildVimeoVideo(video, options);
		} else if (video.Provider == Yugglr.Video.VideoProvider.Youtube) {
			return BuildYoutubeVideo(video, options);
		}

		return null;
	}

	function BuildVimeoVideo(video: IVideo, options: IEmbedOptions): string {
		return '<iframe src="//player.vimeo.com/video/' + video.VideoId +
			'?title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;color=ffffff" width="' + options.Width +
			'" height="' + options.Height +
			'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
	}

	function BuildYoutubeVideo(video: IVideo, options: IEmbedOptions): string {
		return '<iframe width="' + options.Width +
			'" height="' + options.Height +
			'" src="//www.youtube.com/embed/' + video.VideoId +
			'" frameborder="0" allowfullscreen></iframe>'
	}
} 