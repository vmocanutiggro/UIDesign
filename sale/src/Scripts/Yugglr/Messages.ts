module Yugglr {
	export module Messages {
		export class MessageRepository {
			
			public static DeleteMessage(callback: Ajax.AjaxCallback, requestId: string, param?: string): void {
				MessageRepository.MessageAction(callback, requestId, 'delete');
			}

			private static MessageAction(callback: Ajax.AjaxCallback, messageId: string, action: string, param?: string): void {
				var url = 'nfsale2.azurewebsites.net/api/social/user/message/' + messageId + '/' + action;
				if (param) {
					url += '/' + param;
				}

				Ajax.Delete(callback, url);
			}

			public static GetMessages(callback: Ajax.AjaxCallbackT<Message[]>, userId: string): void {
                var url = 'nfsale2.azurewebsites.net/api/social/user/' + userId + '/messages';

				Ajax.Get(callback, url);
			}
		}


		class MessagesManager {
			private _userId: string;

			public Messages: KnockoutObservableArray<MessageModel>;

			constructor(userId: string) {
				this._userId = userId;
				this.Messages = ko.observableArray([]);

				ko.applyBindings(this, $('#messages')[0]);

				this.GetMessages((result: Ajax.AjaxResultT<Message[]>) => {
					this.Messages(result.data.map((r, i) => new MessageModel(r)));
				});
			}


			public DeleteMessage(message: MessageModel): void {
				MessageRepository.DeleteMessage((result: Ajax.AjaxResult) => {
					if (result.success) {
						this.Messages.remove((item) => item.Id == message.Id);
					}
				}, message.Id, 'yes');
			}

			public GetMessages(callback: Ajax.AjaxCallbackT<Message[]>): void {
				MessageRepository.GetMessages(callback, this._userId);
			}

		}

		export interface Message {
			Id: string;
			Heading: string;
			Body: string;
			Created: Date;
			To: Viewable;
            From: Viewable;
            Read: boolean;
            AttachUrl: string;
		}

		

		class MessageModel {

			constructor(message: Message) {
				var _self = this;
				this.Id = message.Id;
                this.From = new ViewableModel(message.From);
			    this.Heading = ko.observable(message.Heading);
                this.Body = ko.observable(message.Body);
                this.Created = ko.observable(message.Created);
                this.Read = ko.observable(message.Read);
                this.AttachUrl = ko.observable(message.AttachUrl);
                this.From = message.From!=null?new ViewableModel(message.From):null;
			}

            public Delete(): void {
				_manager.DeleteMessage(this);
			}

			public Id: string;
            public Heading: KnockoutObservable<string>;
            public Body: KnockoutObservable<string>;
            public Created: KnockoutObservable<Date>;
            public Read: KnockoutObservable<boolean>;
            public AttachUrl: KnockoutObservable<string>;
			public From: ViewableModel;

		}

		var _manager: MessagesManager;

		export function Init(userId: string) {
			_manager = new MessagesManager(userId);
		}
	}
} 