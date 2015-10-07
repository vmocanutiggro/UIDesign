interface JASNYBS_Options {
	name: string;
}

interface JQuery {
	fileinput(options: JASNYBS_Options): JQuery;
	fileinput(command: string): JQuery;
}