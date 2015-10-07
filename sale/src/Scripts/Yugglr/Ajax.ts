interface ModernizrStatic {
	formdata: boolean;
}

Modernizr.addTest('FormData', () => typeof FormData !== 'undefined');

module Yugglr.Ajax {
	$.ajaxSetup({ cache: false });

	export interface AjaxResult {
		success: boolean;
		error: string;
		status: string;
		data: any;
	}

	export interface AjaxResultT<T> extends AjaxResult {
		success: boolean;
		error: string;
		status: string;
		data: T;
	}

	export interface AjaxCallback {
		(result: AjaxResult): void;
	}

	export interface AjaxCallbackT<T> extends AjaxCallback {
		(result: AjaxResultT<T>): void;
	}

	function AjaxHelper(callback: AjaxCallback, method: string, url: string, data?: any): void {
		$.ajax({
			type: method,
			url: url,
			data: data,
			traditional: true,
			error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
				callback({
					success: false,
					error: errorThrown,
					status: textStatus,
					data: jqXHR.responseJSON
				});
			},
			success: (data: any, textStatus: string, jqXHR: JQueryXHR) => {
				callback({
					success: true,
					error: null,
					status: textStatus,
					data: data
				});
			},
			beforeSend: function (jqXHR: JQueryXHR, settings: JQueryAjaxSettings) {
				jqXHR.setRequestHeader('Accept-Language', language);
			}
		});
	}

	export function Get(callback: AjaxCallback, url: string): void {
		AjaxHelper(callback, 'GET', url);
	}

	export function Delete(callback: AjaxCallback, url: string): void {
		AjaxHelper(callback, 'DELETE', url);
	}

	export function Post(callback: AjaxCallback, url: string, data?: any) {
		AjaxHelper(callback, 'POST', url, data);
	}

	export function Patch(callback: AjaxCallback, url: string, data?: any) {
		AjaxHelper(callback, 'PATCH', url, data);
	}

    export function PostForm(callback: AjaxCallback,  url: string, form: any): void {
        PostBackForm(callback, "POST", url, form);
    }

    export function PatchForm(callback: AjaxCallback, url: string, form: any): void {
        PostBackForm(callback, "PATCH", url, form);
    }

    function PostBackForm(callback: AjaxCallback, method: string, url: string, form: any): void {
		var formElement: HTMLFormElement;
		if (typeof form === "object") {
			formElement = <HTMLFormElement>form.get(0);
		} else if (typeof form === "string") {
			formElement = <HTMLFormElement>$(form).get(0);
		}

		var formData = <FormData>(new (<any>FormData)(formElement));

		if (Modernizr.formdata) {
			$.ajax({
				url: url,
                type: method,
				data: formData,
				cache: false,
				contentType: false,
				processData: false,
				error: function (jqXHR, textStatus, errorThrown) {
					callback({
						success: false,
						error: errorThrown,
						status: textStatus,
						data: jqXHR.responseJSON
					});
				},
				success: function (data, textStatus, jqXHR) {
					callback({
						success: true,
						error: null,
						status: textStatus,
						data: data
					});
				}
			});
		} else {
			$.ajax({
				url: url + '/true',
				files: $(':file', formElement),
				data: $(':text', formElement),
				iframe: true,
				type: 'POST',
				error: function (jqXHR, textStatus, errorThrown) {
					callback({
						success: false,
						error: errorThrown,
						status: textStatus,
						data: jqXHR.responseJSON
					});
				},
				success: function (data, textStatus, jqXHR) {
					callback({
						success: true,
						error: null,
						status: textStatus,
						data: data
					});
				}
			});
		}
	}

	var language = $('html').attr('lang');
} 