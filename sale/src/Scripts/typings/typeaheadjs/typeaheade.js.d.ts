interface TypeaheadeOptions {
	highlight?: boolean;
	hint?: boolean;
	minLength?: number;
}

interface TypeaheadDataset {
	source(query: string, cb: (result: any[]) => any);
	name?: string;
	displayKey?: any;
	templates?: any;
}

interface JQuery {
	typeahead(options?: TypeaheadeOptions, ...datasets: TypeaheadDataset[]);
	typeahead(command: string, arg: any);
}