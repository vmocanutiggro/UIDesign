Modernizr.addTest('FormData', function () { return typeof FormData !== 'undefined'; });
var Yugglr;
(function (Yugglr) {
    var Ajax;
    (function (Ajax) {
        $.ajaxSetup({ cache: false });
        function AjaxHelper(callback, method, url, data) {
            $.ajax({
                type: method,
                url: url,
                data: data,
                traditional: true,
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
                },
                beforeSend: function (jqXHR, settings) {
                    jqXHR.setRequestHeader('Accept-Language', language);
                }
            });
        }
        function Get(callback, url) {
            AjaxHelper(callback, 'GET', url);
        }
        Ajax.Get = Get;
        function Delete(callback, url) {
            AjaxHelper(callback, 'DELETE', url);
        }
        Ajax.Delete = Delete;
        function Post(callback, url, data) {
            AjaxHelper(callback, 'POST', url, data);
        }
        Ajax.Post = Post;
        function Patch(callback, url, data) {
            AjaxHelper(callback, 'PATCH', url, data);
        }
        Ajax.Patch = Patch;
        function PostForm(callback, url, form) {
            PostBackForm(callback, "POST", url, form);
        }
        Ajax.PostForm = PostForm;
        function PatchForm(callback, url, form) {
            PostBackForm(callback, "PATCH", url, form);
        }
        Ajax.PatchForm = PatchForm;
        function PostBackForm(callback, method, url, form) {
            var formElement;
            if (typeof form === "object") {
                formElement = form.get(0);
            }
            else if (typeof form === "string") {
                formElement = $(form).get(0);
            }
            var formData = (new FormData(formElement));
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
            }
            else {
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
    })(Ajax = Yugglr.Ajax || (Yugglr.Ajax = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=Ajax.js.map