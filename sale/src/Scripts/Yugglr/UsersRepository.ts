module Yugglr {
	export class UsersRepository {
		public static FindUser(callback: Ajax.AjaxCallback, term: string, maxItems?: number): void {
			var url = 'nfsale2.azurewebsites.net/api/social/user/search/' + encodeURIComponent(term);
			if (maxItems) {
				url += '/' + maxItems;
			}

			Ajax.Get(callback, url);
		}
	}
}