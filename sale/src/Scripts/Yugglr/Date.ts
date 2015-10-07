interface Date {
	toFriendlyString(): string;
}

Date.prototype.toFriendlyString = function () {
	var date = <Date>this;
	return date.toLocaleString();
}
