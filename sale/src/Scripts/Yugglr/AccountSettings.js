var Yugglr;
(function (Yugglr) {
    var AccountSettings;
    (function (AccountSettings) {
        ko.bindingHandlers['datetimepicker'] = {
            init: function (element, valueAccessor, allBindingsAccessor) {
                //initialize datepicker with some optional options
                var options = allBindingsAccessor().dateTimePickerOptions || {};
                $(element).datetimepicker(options);
                //when a user changes the date, update the view model
                ko.utils.registerEventHandler(element, "dp.change", function (event) {
                    var value = valueAccessor();
                    if (ko.isObservable(value)) {
                        value(event.date);
                    }
                });
            },
            update: function (element, valueAccessor) {
                var widget = $(element).data("DateTimePicker");
                //when the view model is updated, update the widget
                if (widget) {
                    widget.date(ko.utils.unwrapObservable(valueAccessor()));
                }
            }
        };
        function Init() {
            _manager = new Manager();
        }
        AccountSettings.Init = Init;
        (function (Gender) {
            Gender[Gender["male"] = 0] = "male";
            Gender[Gender["female"] = 1] = "female";
        })(AccountSettings.Gender || (AccountSettings.Gender = {}));
        var Gender = AccountSettings.Gender;
        ;
        var Repository = (function () {
            function Repository() {
            }
            Repository.GetBasicSettings = function (callback) {
                var url = 'http://nfsale2.azurewebsites.net/api/social/account/settings/basic';
                Yugglr.Ajax.Get(callback, url);
            };
            Repository.UpdateBasicSettings = function (callback, settings) {
                var url = 'http://nfsale2.azurewebsites.net/api/social/account/settings/basic';
                Yugglr.Ajax.Patch(callback, url, settings);
            };
            Repository.GetProfilePicture = function (callback) {
                var url = 'http://nfsale2.azurewebsites.net/api/social/user/me/profilepicture';
                Yugglr.Ajax.Get(callback, url);
            };
            Repository.GetPrivacySettings = function (callback) {
                var url = 'http://nfsale2.azurewebsites.net/api/social/account/settings/privacy';
                Yugglr.Ajax.Get(callback, url);
            };
            Repository.UpdatePrivacySettings = function (callback, settings) {
                var url = 'http://nfsale2.azurewebsites.net/api/social/account/settings/privacy';
                Yugglr.Ajax.Patch(callback, url, settings);
            };
            Repository.GetContactInformation = function (callback) {
                var url = 'http://nfsale2.azurewebsites.net/api/social/account/settings/contactinfo';
                Yugglr.Ajax.Get(callback, url);
            };
            Repository.UpdateContactInformation = function (callback, contactInfo) {
                var url = 'http://nfsale2.azurewebsites.net/api/social/account/settings/contactinfo';
                Yugglr.Ajax.Patch(callback, url, contactInfo);
            };
            return Repository;
        })();
        var BasicSettingsModel = (function () {
            function BasicSettingsModel(settings) {
                settings = settings || this.GetDefaultSettings();
                this._default = settings;
                this.FirstName = ko.observable(settings.FirstName);
                this.LastName = ko.observable(settings.LastName);
                this.Gender = ko.observable(settings.Gender);
                this.CountryId = ko.observable(settings.CountryId);
                this.Language = ko.observable(settings.Language);
                this.About = ko.observable(settings.About);
                this.BirthDate = ko.observable(settings.BirthDate != null ? moment(settings.BirthDate) : null);
                this.DisplayBirthDateInCalendar = ko.observable(settings.DisplayBirthDateInCalendar);
                this.DisplayGenderInProfile = ko.observable(settings.DisplayGenderInProfile);
                this.DisplayLanguageInProfile = ko.observable(settings.DisplayLanguageInProfile);
            }
            BasicSettingsModel.prototype.GetDefaultSettings = function () {
                return {
                    About: null,
                    BirthDate: null,
                    FirstName: null,
                    Gender: null,
                    CountryId: null,
                    Language: null,
                    LastName: null,
                    DisplayBirthDateInCalendar: false,
                    DisplayGenderInProfile: false,
                    DisplayLanguageInProfile: false
                };
            };
            BasicSettingsModel.prototype.Reset = function () {
                this.SetSettings(this._default || this.GetDefaultSettings());
            };
            BasicSettingsModel.prototype.SetSettings = function (settings) {
                if (settings == null) {
                    return;
                }
                this._default = settings;
                this.FirstName(settings.FirstName);
                this.LastName(settings.LastName);
                this.Gender(settings.Gender);
                this.CountryId(settings.CountryId);
                this.Language(settings.Language);
                this.About(settings.About);
                this.BirthDate(settings.BirthDate != null ? moment(settings.BirthDate) : null);
                this.DisplayBirthDateInCalendar(settings.DisplayBirthDateInCalendar);
                this.DisplayGenderInProfile(settings.DisplayGenderInProfile);
                this.DisplayLanguageInProfile(settings.DisplayLanguageInProfile);
            };
            BasicSettingsModel.prototype.GetInterface = function () {
                var momentDate = this.BirthDate();
                return {
                    About: this.About(),
                    BirthDate: momentDate.toISOString(),
                    FirstName: this.FirstName(),
                    Gender: this.Gender(),
                    CountryId: this.CountryId(),
                    Language: this.Language(),
                    LastName: this.LastName(),
                    DisplayBirthDateInCalendar: this.DisplayBirthDateInCalendar(),
                    DisplayGenderInProfile: this.DisplayGenderInProfile(),
                    DisplayLanguageInProfile: this.DisplayLanguageInProfile()
                };
            };
            return BasicSettingsModel;
        })();
        var PrivacySettingsModel = (function () {
            function PrivacySettingsModel(settings) {
                settings = settings || this.GetDefaultSettings();
                this._default = settings;
                this.CommentOnPosts = ko.observable(settings.CommentOnPosts);
                this.PostOnWall = ko.observable(settings.PostOnWall);
                this.SeeAlbums = ko.observable(settings.SeeAlbums);
                this.SeeBasicInfo = ko.observable(settings.SeeBasicInfo);
                this.SeeBirthDay = ko.observable(settings.SeeBirthDay);
                this.SeeBirthYear = ko.observable(settings.SeeBirthYear);
                this.SeeComments = ko.observable(settings.SeeComments);
                this.SeeDocLibs = ko.observable(settings.SeeDocLibs);
                this.SeeEmail = ko.observable(settings.SeeEmail);
                this.SeeEvents = ko.observable(settings.SeeEvents);
                this.SeeGroups = ko.observable(settings.SeeGroups);
                this.SeePosts = ko.observable(settings.SeePosts);
                this.SeeProfile = ko.observable(settings.SeeProfile);
                this.SeeProfilePicture = ko.observable(settings.SeeProfilePicture);
                this.SeeWall = ko.observable(settings.SeeWall);
                this.SendMessage = ko.observable(settings.SendMessage);
            }
            PrivacySettingsModel.prototype.GetDefaultSettings = function () {
                return {
                    CommentOnPosts: null,
                    PostOnWall: null,
                    SeeAlbums: null,
                    SeeBasicInfo: null,
                    SeeBirthDay: null,
                    SeeBirthYear: null,
                    SeeComments: null,
                    SeeDocLibs: null,
                    SeeEmail: null,
                    SeeEvents: null,
                    SeeGroups: null,
                    SeePosts: null,
                    SeeProfile: null,
                    SeeProfilePicture: null,
                    SeeWall: null,
                    SendMessage: null
                };
            };
            PrivacySettingsModel.prototype.Reset = function () {
                this.SetSettings(this._default || this.GetDefaultSettings());
            };
            PrivacySettingsModel.prototype.SetSettings = function (settings) {
                if (settings == null) {
                    return;
                }
                this._default = settings;
                this.CommentOnPosts(settings.CommentOnPosts);
                this.PostOnWall(settings.PostOnWall);
                this.SeeAlbums(settings.SeeAlbums);
                this.SeeBasicInfo(settings.SeeBasicInfo);
                this.SeeBirthDay(settings.SeeBirthDay);
                this.SeeBirthYear(settings.SeeBirthYear);
                this.SeeComments(settings.SeeComments);
                this.SeeDocLibs(settings.SeeDocLibs);
                this.SeeEmail(settings.SeeEmail);
                this.SeeEvents(settings.SeeEvents);
                this.SeeGroups(settings.SeeGroups);
                this.SeePosts(settings.SeePosts);
                this.SeeProfile(settings.SeeProfile);
                this.SeeProfilePicture(settings.SeeProfilePicture);
                this.SeeWall(settings.SeeWall);
                this.SendMessage(settings.SendMessage);
            };
            PrivacySettingsModel.prototype.GetInterface = function () {
                return {
                    CommentOnPosts: this.CommentOnPosts(),
                    PostOnWall: this.PostOnWall(),
                    SeeAlbums: this.SeeAlbums(),
                    SeeBasicInfo: this.SeeBasicInfo(),
                    SeeBirthDay: this.SeeBirthDay(),
                    SeeBirthYear: this.SeeBirthYear(),
                    SeeComments: this.SeeComments(),
                    SeeDocLibs: this.SeeDocLibs(),
                    SeeEmail: this.SeeEmail(),
                    SeeEvents: this.SeeEvents(),
                    SeeGroups: this.SeeGroups(),
                    SeePosts: this.SeePosts(),
                    SeeProfile: this.SeeProfile(),
                    SeeProfilePicture: this.SeeProfilePicture(),
                    SeeWall: this.SeeWall(),
                    SendMessage: this.SendMessage()
                };
            };
            return PrivacySettingsModel;
        })();
        var ContactInformationModel = (function () {
            function ContactInformationModel(contactInfo) {
                contactInfo = contactInfo || this.GetDefault();
                this._default = contactInfo;
                this.AddressCountry = ko.observable(contactInfo.AddressCountry);
                this.AddressCity = ko.observable(contactInfo.AddressCity);
                this.AddressZip = ko.observable(contactInfo.AddressZip);
                this.AddressStreet = ko.observable(contactInfo.AddressStreet);
                this.AddressExtra = ko.observable(contactInfo.AddressExtra);
                this.HomePhone = ko.observable(contactInfo.HomePhone);
                this.MobilePhone = ko.observable(contactInfo.MobilePhone);
                this.YahooIM = ko.observable(contactInfo.YahooIM);
                this.SkypeIM = ko.observable(contactInfo.SkypeIM);
                this.Twitter = ko.observable(contactInfo.Twitter);
                this.Facebook = ko.observable(contactInfo.Facebook);
                this.LinkedIn = ko.observable(contactInfo.LinkedIn);
            }
            ContactInformationModel.prototype.GetDefault = function () {
                return {
                    AddressCountry: null,
                    AddressCity: null,
                    AddressZip: null,
                    AddressStreet: null,
                    AddressExtra: null,
                    HomePhone: null,
                    MobilePhone: null,
                    YahooIM: null,
                    SkypeIM: null,
                    Twitter: null,
                    Facebook: null,
                    LinkedIn: null,
                };
            };
            ContactInformationModel.prototype.Reset = function () {
                this.SetContactInfo(this._default || this.GetDefault());
            };
            ContactInformationModel.prototype.SetContactInfo = function (contactInfo) {
                if (contactInfo == null) {
                    return;
                }
                this._default = contactInfo;
                this.AddressCountry(contactInfo.AddressCountry);
                this.AddressCity(contactInfo.AddressCity);
                this.AddressZip(contactInfo.AddressZip);
                this.AddressStreet(contactInfo.AddressStreet);
                this.AddressExtra(contactInfo.AddressExtra);
                this.HomePhone(contactInfo.HomePhone);
                this.MobilePhone(contactInfo.MobilePhone);
                this.YahooIM(contactInfo.YahooIM);
                this.SkypeIM(contactInfo.SkypeIM);
                this.Twitter(contactInfo.Twitter);
                this.Facebook(contactInfo.Facebook);
                this.LinkedIn(contactInfo.LinkedIn);
            };
            ContactInformationModel.prototype.GetInterface = function () {
                return {
                    AddressCountry: this.AddressCountry(),
                    AddressCity: this.AddressCity(),
                    AddressZip: this.AddressZip(),
                    AddressStreet: this.AddressStreet(),
                    AddressExtra: this.AddressExtra(),
                    HomePhone: this.HomePhone(),
                    MobilePhone: this.MobilePhone(),
                    YahooIM: this.YahooIM(),
                    SkypeIM: this.SkypeIM(),
                    Twitter: this.Twitter(),
                    Facebook: this.Facebook(),
                    LinkedIn: this.LinkedIn()
                };
            };
            return ContactInformationModel;
        })();
        var _manager;
        var Manager = (function () {
            function Manager() {
                this.language = $('html').attr('lang');
                this.BasicSettings = new BasicSettingsModel();
                this.PrivacySettings = new PrivacySettingsModel();
                this.ContactInformation = new ContactInformationModel();
                var _self = this;
                Repository.GetBasicSettings(function (result) {
                    if (result.success) {
                        _self.BasicSettings.SetSettings(result.data);
                        ko.applyBindings(_self.BasicSettings, $('#tab_basic_information')[0]);
                    }
                });
                Repository.GetPrivacySettings(function (result) {
                    if (result.success) {
                        _self.PrivacySettings.SetSettings(result.data);
                        var tabPrivacySettings = $('#tab_privacy_settings')[0];
                        if (tabPrivacySettings) {
                            ko.applyBindings(_self.PrivacySettings, tabPrivacySettings);
                        }
                    }
                });
                Repository.GetProfilePicture(function (result) {
                    if (result.success && result.data) {
                        $('#profile-picture').attr('src', Yugglr.Url.BuildImageUrl(result.data, { Height: 150, Width: 150 }, '/Images/elements/default_userpicture.png'));
                        $('.profile-picture').attr('src', Yugglr.Url.BuildImageUrl(result.data, '/Images/elements/default_userpicture.png'));
                    }
                    else {
                        $('#profile-picture').attr('src', '/Images/elements/default_userpicture.png');
                        $('.profile-picture').attr('src', '/Images/elements/default_userpicture.png');
                    }
                });
                Repository.GetContactInformation(function (result) {
                    if (result.success) {
                        _self.ContactInformation.SetContactInfo(result.data);
                        ko.applyBindings(_self.ContactInformation, $('#tab_contact_information')[0]);
                    }
                });
                $('#tab_basic_information [data-action=save]').on('click', function (e) {
                    e.preventDefault();
                    var $t = $(this);
                    if ($t.closest('form').valid()) {
                        Repository.UpdateBasicSettings(function (result) {
                            if (result.success) {
                                _self.BasicSettings.SetSettings(result.data);
                                Yugglr.Alert('#notification-area', $t.data('success-message'), 'success');
                            }
                            else {
                                Yugglr.Alert('#notification-area', $t.data('error-message'), 'danger');
                            }
                        }, _self.BasicSettings.GetInterface());
                    }
                });
                $('#tab_profile_picture [data-action=save]').on('click', function (e) {
                    e.preventDefault();
                    var $t = $(this);
                    var $form = $t.closest('form');
                    Yugglr.Ajax.PostForm(function (result) {
                        if (result.success && result.data) {
                            $('#profile-picture').attr('src', Yugglr.Url.BuildImageUrl(result.data, { Height: 150, Width: 150 }, '/Images/elements/default_userpicture.png'));
                            Yugglr.Alert('#notification-area', $t.data('success-message'), 'success');
                        }
                        else {
                            if (result.success) {
                                $('#profile-picture').attr('src', '/Images/elements/default_userpicture.png');
                                Yugglr.Alert('#notification-area', $t.data('success-message'), 'success');
                            }
                            else {
                                Yugglr.Alert('#notification-area', $t.data('error-message'), 'danger');
                            }
                        }
                        $('#tab_profile_picture .fileinput').fileinput('reset');
                    }, 'http://nfsale2.azurewebsites.net/api/social/account/settings/profilepicture', $form);
                });
                $('#tab_profile_picture [data-action=remove-my-picture]').on('click', function (e) {
                    e.preventDefault();
                    var $t = $(this);
                    Yugglr.Ajax.Delete(function (result) {
                        if (result.success) {
                            $('#profile-picture').attr('src', '/Images/elements/default_userpicture.png');
                            Yugglr.Alert('#notification-area', $t.data('success-message'), 'success');
                        }
                        else {
                            Yugglr.Alert('#notification-area', $t.data('error-message'), 'danger');
                        }
                    }, 'http://nfsale2.azurewebsites.net/api/social/account/settings/profilepicture');
                });
                $('#tab_change_password [data-action=save]').on('click', function (e) {
                    e.preventDefault();
                    var $t = $(this);
                    var $form = $t.closest('form');
                    if ($form.valid()) {
                        Yugglr.Ajax.PostForm(function (result) {
                            if (result.success) {
                                Yugglr.Alert('#notification-area', $t.data('success-message'), 'success');
                                $form.resetValidation();
                                $form[0].reset();
                            }
                            else {
                                Yugglr.Alert('#notification-area', $t.data('error-message'), 'danger');
                            }
                        }, 'http://nfsale2.azurewebsites.net/api/social/account/settings/changepassword', $form);
                    }
                });
                $('#tab_privacy_settings [data-action=save]').on('click', function (e) {
                    e.preventDefault();
                    var $t = $(this);
                    var $form = $t.closest('form');
                    if ($form.valid()) {
                        Repository.UpdatePrivacySettings(function (result) {
                            if (result.success) {
                                Yugglr.Alert('#notification-area', $t.data('success-message'), 'success');
                                $form.resetValidation();
                                _self.PrivacySettings.SetSettings(result.data);
                            }
                            else {
                                Yugglr.Alert('#notification-area', $t.data('error-message'), 'danger');
                            }
                        }, _self.PrivacySettings.GetInterface());
                    }
                });
                $('#tab_contact_information [data-action=save]').on('click', function (e) {
                    e.preventDefault();
                    var $t = $(this);
                    if ($t.closest('form').valid()) {
                        Repository.UpdateContactInformation(function (result) {
                            if (result.success) {
                                _self.ContactInformation.SetContactInfo(result.data);
                                Yugglr.Alert('#notification-area', $t.data('success-message'), 'success');
                            }
                            else {
                                Yugglr.Alert('#notification-area', $t.data('error-message'), 'danger');
                            }
                        }, _self.ContactInformation.GetInterface());
                    }
                });
                $('#tab_privacy_settings [data-action=cancel]').on('click', function (e) {
                    e.preventDefault();
                    _self.PrivacySettings.Reset();
                    var $t = $(this);
                    var $form = $t.closest('form');
                    $form.resetValidation();
                });
                $('#tab_basic_information [data-action=cancel]').on('click', function (e) {
                    e.preventDefault();
                    _self.BasicSettings.Reset();
                    var $t = $(this);
                    var $form = $t.closest('form');
                    $form.resetValidation();
                });
                $('#tab_change_password [data-action=cancel]').on('click', function (e) {
                    e.preventDefault();
                    var $t = $(this);
                    var $form = $t.closest('form');
                    var form = $form.get(0);
                    form.reset();
                    $form.resetValidation();
                });
                $('#tab_contact_information [data-action=cancel]').on('click', function (e) {
                    e.preventDefault();
                    _self.ContactInformation.Reset();
                    var $t = $(this);
                    var $form = $t.closest('form');
                    $form.resetValidation();
                });
            }
            return Manager;
        })();
    })(AccountSettings = Yugglr.AccountSettings || (Yugglr.AccountSettings = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=AccountSettings.js.map