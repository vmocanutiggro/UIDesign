module Yugglr {
	export class GroupsRepository {
		public static Find(callback: Ajax.AjaxCallback, term: string, maxItems?: number): void {
			var url = 'nfsale2.azurewebsites.net/api/social/group/search/' + encodeURIComponent(term);
			if (maxItems) {
				url += '/' + maxItems;
			}

			Ajax.Get(callback, url);
		}
	}

	export class FamiliesRepository {
		public static Find(callback: Ajax.AjaxCallback, term: string, maxItems?: number): void {
			var url = 'nfsale2.azurewebsites.net/api/social/family/search/' + encodeURIComponent(term);
			if (maxItems) {
				url += '/' + maxItems;
			}

			Ajax.Get(callback, url);
		}
	}
} 