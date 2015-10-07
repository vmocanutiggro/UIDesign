declare var RequestMessages: Yugglr.Requests.LocalizationMessages;

module Yugglr {
	export module Requests {
		export class RequestRepository {
			public static AcceptRequest(callback: Ajax.AjaxCallback, requestId: string, param?: string): void {
				RequestRepository.RequestAction(callback, requestId, 'accept');
			}

			public static DeclineRequest(callback: Ajax.AjaxCallback, requestId: string, param?: string): void {
				RequestRepository.RequestAction(callback, requestId, 'decline');
			}

			private static RequestAction(callback: Ajax.AjaxCallback, requestId: string, action: string, param?: string): void {
				var url = 'nfsale2.azurewebsites.net/api/social/user/request/' + requestId + '/' + action;
				if (param) {
					url += '/' + param;
				}

				Ajax.Post(callback, url);
			}

			public static GetRequests(callback: Ajax.AjaxCallbackT<Request[]>, userId: string): void {
				var url = 'nfsale2.azurewebsites.net/api/social/user/' + userId + '/requests';

				Ajax.Get(callback, url);
			}

			public static CreateRequest(callback: Ajax.AjaxCallback, userId: string, newRequest: NewRequest): void {
				var url = 'nfsale2.azurewebsites.net/api/social/user/' + userId + '/request';

				Ajax.Post(callback, url, newRequest);
			}
		}

		export interface LocalizationMessages {
			JoinGroup: string;
			InviteGroup: string;
			InviteEvent: string;
		}

		export enum RequestType {
			JoinGroup = 1,
			InviteGroup = 20,
			InviteEvent = 21
		}

		class RequestsManager {
			private _userId: string;
			private _applicationId: string;

			public Requests: KnockoutObservableArray<RequestModel>;

			constructor(userId: string, applicationId: string) {
				this._userId = userId;
				this._applicationId = applicationId;

				this.Requests = ko.observableArray([]);

				ko.applyBindings(this, $('#requests')[0]);

				this.GetRequests((result: Ajax.AjaxResultT<Request[]>) => {
					this.Requests(result.data.map((r, i) => new RequestModel(r)));
				});
			}

			public AcceptRequest(request: RequestModel): void {
				RequestRepository.AcceptRequest((result: Ajax.AjaxResult) => {
					if (result.success) {
						this.Requests.remove((item) => item.Id == request.Id);
					}
				}, request.Id, 'yes');
			}

			public DeclineRequest(request: RequestModel): void {
				RequestRepository.DeclineRequest((result: Ajax.AjaxResult) => {
					if (result.success) {
						this.Requests.remove((item) => item.Id == request.Id);
					}
				}, request.Id, 'yes');
			}

			public GetRequests(callback: Ajax.AjaxCallbackT<Request[]>): void {
				RequestRepository.GetRequests(callback, this._userId);
			}

			public static CreateRequest(callback: Ajax.AjaxCallback, userId: string, newRequest: NewRequest): void {
				RequestRepository.CreateRequest(callback, userId, newRequest);
			}
		}

		export interface Request {
			Id: string;
			ApplicationId: string;
			Heading: string;
			Body: string;
			RequestType: RequestType;
			TimeCreated: Date;
			To: Viewable;
			From: Viewable;
			Target: Viewable;
		}

		export interface NewRequest {
			LinkId: string;
			RequestType: RequestType;
			Heading: string;
			Body: string;
		}

		class RequestModel {
			private _requestType: RequestType;

			constructor(request: Request) {
				var _self = this;

				this.Id = request.Id;
				this.From = new ViewableModel(request.From);
				this.Target = new ViewableModel(request.Target);
				this.RequestMessage = ko.computed(() => {
					var property: string = '';
					switch (request.RequestType) {
						case RequestType.InviteGroup:
							property += 'Invite';
							break;

						case RequestType.JoinGroup:
						case RequestType.InviteEvent:
							property += 'Join';
							break;

						default:
							return null;
					}

					switch (_self.Target.Type.toLowerCase()) {
						case 'group':
							property += 'Group';
							break;

						case 'family':
							property += 'Family';
							break;

						case 'event':
							property += 'Event';
							break;

						default:
							return null;
					}

					return RequestMessages[property];
				});
			}

			public Decline(): void {
				_manager.DeclineRequest(this);
			}

			public Accept(): void {
				_manager.AcceptRequest(this);
			}

			public Id: string;
			public RequestMessage: KnockoutComputed<string>;
			public From: ViewableModel;
			public Target: ViewableModel;
		}

		var _manager: RequestsManager;

		export function Init(userId: string, applicationId: string) {
			_manager = new RequestsManager(userId, applicationId);
		}

		export function CreateRequest(callback: Ajax.AjaxCallback, userId: string, newRequest: NewRequest): void {
			RequestsManager.CreateRequest(callback, userId, newRequest);
		}
	}
} 