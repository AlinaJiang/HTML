var UploadDocumentWidget = {
    listID: "",
    termId: "",
    isHasApproval: "", //for corporate
    destinationFolder: "",
    webID: "",//for get desination folder
    folderCount: 0,//是否显示destinationfolder
    requestResults: {},
    maxFileSize: 0,
    blockedFileExtensions: "",
    contentTypes: [],
    selectedContentTypeIndex: 0,
    libraryUrl: "", //library的url，即rootfolder, eg:/sitename
    changeCT: true,

    init: function (requestResults) {
        UploadDocumentWidget.listID = window.aui.request.queryString.ListId;
        if (window.aui.request.queryString.IsHasApproval != undefined && window.aui.request.queryString.IsHasApproval == "false") {
            $(".button-bottom").css("margin-top", "380px");
            UploadDocumentWidget.isHasApproval = window.aui.request.queryString.IsHasApproval;//this
            UploadDocumentWidget.destinationFolder = window.aui.request.queryString.DestinationFolder;
        }
        if (window.aui.request.queryString.TermId != undefined) {
            UploadDocumentWidget.termId = window.aui.request.queryString.TermId;
        }
        if (requestResults != undefined) {
            UploadDocumentWidget.requestResults = requestResults.CRSContentType;
            UploadDocumentWidget.webID = requestResults.WebID;
            UploadDocumentWidget.folderCount = requestResults.FolderCount;
            this.initDatas();
            this.initEventHandler();
        }
        $('.max-size-msg').text(UploadDocumentWidget.maxFileSizeMsg);
        $('.max-size-err-msg').text(UploadDocumentWidget.maxFileSizeErrorMsg);
        $(document).ready(function () {
            if (navigator.userAgent.toLocaleLowerCase().match(/iPad/i) && window.location.href.indexOf("&IsDlg=1") >= 0) {
                $("#s4-workspace").height("500px");
            }
        });
    },
    initDatas: function () {
        if (UploadDocumentWidget.requestResults.length > 0) {
            UploadDocumentWidget.contentTypes = UploadDocumentWidget.requestResults;
        }
        if (UploadDocumentWidget.folderCount == 0 || UploadDocumentWidget.destinationFolder == "/") {
            $(".destination-div").hide();
        }
        else if (UploadDocumentWidget.isHasApproval == "false") {
            $(".destination-div").hide();
            $("#destination_container").val(UploadDocumentWidget.destinationFolder);
        }
        else {
            $$page.toolkit_gloading('show');
            $(".destination-div").show();
            UploadDocumentWidget.libraryUrl = _spPageContextInfo.webServerRelativeUrl;
            var ctx = new SP.ClientContext(_spPageContextInfo.webAbsoluteUrl);
            var list = ctx.get_web().get_lists().getById(UploadDocumentWidget.listID);
            ctx.load(list, 'RootFolder');
            ctx.executeQueryAsync(
                        function () {
                            var tempurl = list.get_rootFolder().get_serverRelativeUrl(); //print relative url of list  eg: /sitename/Test Document                    
                            UploadDocumentWidget.libraryUrl = tempurl.substring(UploadDocumentWidget.libraryUrl.length);  //eg:/Test Document
                            var url = window.parent.location.href;
                            var fromindex = url.indexOf('RootFolder');
                            var endindex = 0, folderurl = "";
                            if (fromindex >= 0) {
                                if (decodeURI(url).indexOf("Document Set") >= 0) {//document set
                                    if (decodeURI(url).indexOf("?RootFolder") >= 0) {
                                        endindex = url.indexOf("FolderCTID");
                                    } else {//document set inner folder
                                        endindex = url.indexOf("RecSrc");
                                    }
                                } else {
                                    endindex = url.indexOf('FolderCTID');
                                }
                                folderurl = url.substring(fromindex + 11, endindex - 1);
                                $("#destination_container").val(decodeURIComponent(folderurl).replace(tempurl, '') + "/");
                            }
                            $$page.toolkit_gloading('hide');
                        },
                        function (sender, args) {
                            $$page.toolkit_gloading('hide');
                            console.log('Request failed ' + args.get_message() + ':' + args.get_stackTrace());
                        }
                    );
        }

        this.changeContentType($('#contentTypeCtrl').val());
    },
    initEventHandler: function () {
        $("input:radio[name=approval]").change(function () {
            var selectValue = $("input[name=approval]:checked").val();
            if (selectValue == "Yes") {
                $(".approval-content").css("visibility", "visible");
            } else if (selectValue == "No") {
                $(".approval-content").css("visibility", "hidden");
            }
        });
        $("#stages-select-div").change(function () {
            var seleValue = $(this).children('option:selected').val();
            if (seleValue == "Two Stages") {
                $(".approver-two").show();
                $('.approval-onestage').hide();
                $('.approval-twostage').addClass('show-twostage');
            } else {
                $(".approver-two").hide();
                $('.approval-onestage').show();
                $('.approval-twostage').removeClass('show-twostage');
            }
        });
        $("#choose_folder").click(function () {
            UploadDocumentWidget.LaunchTargetPicker();
        });
        $("#next-btn").click(function () {
            if ($("input[name=approval]:checked").val() == "Yes" && UploadDocumentWidget.validateFile() && UploadDocumentWidget.validateApprovers()) {
                $(".after-approval-container").show();
                $(".before-approval-container").hide();
            } else if ($("input[name=approval]:checked").val() == "No" && UploadDocumentWidget.validateFile()) {
                $(".after-approval-container").show();
                $(".before-approval-container").hide();
            } else if (UploadDocumentWidget.isHasApproval == "false" && UploadDocumentWidget.validateFile()) {
                $(".after-approval-container").show();
                $(".before-approval-container").hide();
            }

            var filename = $("input[name$='upload_file']").val();
            $("#crs-field-name").val(filename.substring(filename.lastIndexOf("\\") + 1, filename.lastIndexOf('.')));
        });

        $("input[name$='upload_file']").click(function () {
            $(".file-err-msg").hide();
        });
        $("input[id$='approver1_peoplepicker_TopSpan_EditorInput']").focus(function () {
            $(".empty-approver1-err-msg").hide();
            $(".approver1-err-user-msg").hide();
        });
        $("input[id$='approver2_peoplepicker_TopSpan_EditorInput']").focus(function () {
            $(".empty-approver2-err-msg").hide();
            $(".approver2-err-user-msg").hide();
        });
        $('#contentTypeCtrl').on('change', function () {
            UploadDocumentWidget.changeContentType(this.value);
        });
        $("#save-Btn").click(function (e) {
            var e = e || window.event;
            if (e.preventDefault) {  
                e.preventDefault();
                e.stopPropagation();
            } else {  
                window.event.returnValue = false;
                window.event.cancelBubble = true;
            }
            if (UploadDocumentWidget.validateReFileName() && UploadDocumentWidget.validateTaxnomy()) {
                UploadDocumentWidget.submitDatas();
            }
            return false;
        });
        $("#crs-field-name").click(function () {
            $(".empty-name").hide();
            $(".invalid-filerename-errmsg").hide();
        })
        $("#cancel-btn").click(function () {
            window.top.SP.UI.ModalDialog.commonModalDialogClose(-1, null);
        });
        $("#cancelRequestBtn").click(function () {
            window.top.SP.UI.ModalDialog.commonModalDialogClose(-1, null);
        });

        $("tr.crs-dynamics-row td:nth-child(2)").click(function () {
            $(this).find(".err-msg").hide();
        });
    },
    validateFile: function () {
        var passed = false;
        var regex = new RegExp("[\\\\/:*?\"<>|#{}%~&]");
        var $file = $("input[name$='upload_file']")[0].files[0];
        var filename = $file != undefined ? $file.name : "";
        var filesize = $file != undefined ? $file.size : 0;
        var fileExtensions = $file != undefined ? $file.name.substring($file.name.lastIndexOf(".") + 1) : "";
        if (filename == "") {
            $(".nofile-err-msg").show();
            passed = false;
        } else if (filesize <= 0 || regex.test(filename)) {
            $(".invalid-file-errmsg").show();
            passed = false;
        } else if (filename != "") {
            $(".suffix-txt").text(typeof (filename) != "undefined" && filename.length > 0 ? filename.substring(filename.lastIndexOf('.')) : "");
            passed = true;
        }
        if (passed) {
            var file = $("input[name$='upload_file']")[0].files[0];
            if (file.size / (1024 * 1024) > parseInt(UploadDocumentWidget.maxFileSize)) {
                $(".max-size-err-msg").show();
                passed = false;
            } else if (UploadDocumentWidget.blockedFileExtensions.indexOf(fileExtensions) >= 0) {
                $(".block-file-types-errmsg").show();
                passed = false;
            }
        }
        return passed;
    },
    validateReFileName: function () {
        var filename = $("#crs-field-name").val();
        var regex = new RegExp("[\\\\/:*?\"<>|#{}%~&]");
        if (regex.test(filename)) {
            $(".invalid-filerename-errmsg").show();
            $("#crs-field-name").focus();
            return false;
        } else if (filename == "") {
            $(".empty-name").show();
            $("#crs-field-name").focus();
            return false;
        }
        return true;
    },
    validateApprovers: function () {
        var approver1 = $("input[name$='approver1_peoplepicker']").val();
        var approver2 = $("input[name$='approver2_peoplepicker']").val();
        if (approver1 == "" || approver1 == "[]") {
            $(".empty-approver1-err-msg").show();
            return false;
        } else if (approver1.indexOf("\"IsResolved\":false") >= 0) {
            $(".approver1-err-user-msg").show();
            return false;
        } else if ($("#stages-select-div").children("option:selected").val() == "Two Stages" && (approver2 == "" || approver2 == "[]")) {
            $(".empty-approver2-err-msg").show();
            return false;
        } else if ($("#stages-select-div").children("option:selected").val() == "Two Stages" && approver2.indexOf("\"IsResolved\":false") >= 0) {
            $(".approver2-err-user-msg").show();
            return false;
        }

        return true;
    },
    validateTaxnomy: function () {
        var passed = true;
        var ctID = UploadDocumentWidget.contentTypes[UploadDocumentWidget.selectedContentTypeIndex].Id;
        $('tr[id*="_' + ctID + '_"]').find(".err-msg").hide();
        $.each(UploadDocumentWidget.contentTypes[UploadDocumentWidget.selectedContentTypeIndex].Fields, function (index, item) {
            var itemName = item.Name.replace(/[\s&\|\\\*^%$#@,\/]/g, "");
            var $errorcontainer = $('tr[id*="_' + ctID + '_"]').find(".crs-taxnomy-" + itemName).closest("td");
            if ($errorcontainer.length != 0) {
                if (item.Required) {
                    if ($errorcontainer.find("input").val().indexOf("00000000-0000-0000-0000-000000000000") >= 0) {
                        passed = false;
                        $errorcontainer.find(".err-empty-" + itemName).hide();
                        $('<span class="err-msg"></span>').text(I18N.get("MOF", "MOF_UploadDcoument_TaxnomyInvaildErrorMsg")).addClass("err-invalid-" + itemName).appendTo($errorcontainer);
                        $errorcontainer.find(".ms-taxonomy-writeableregion").focus();
                        return false;
                    } else if ($errorcontainer.find(".valid-text").length == 0) {
                        passed = false;
                        $errorcontainer.find(".err-invalid-" + itemName).hide();
                        $('<span class="err-msg"></span>').text(I18N.get("MOF", "MOF_UploadDcoument_TaxnomyEmptyErrorMsg")).addClass("err-empty-" + itemName).appendTo($errorcontainer);
                        $errorcontainer.find(".ms-taxonomy-writeableregion").focus();
                        return false;
                    }
                } else if ($errorcontainer.find(".invalid-text").length > 0 || $errorcontainer.find("input").val().indexOf("00000000-0000-0000-0000-000000000000") >= 0) {// validate the taxonomy which is not mandatory but illegal
                    passed = false;
                    $errorcontainer.find(".err-empty-" + itemName).hide();
                    $('<span class="err-msg"></span>').text(I18N.get("MOF", "MOF_UploadDcoument_TaxnomyInvaildErrorMsg")).addClass("err-invalid-" + itemName).appendTo($errorcontainer);
                    return false;
                }
            }
        });
        return passed;
    },
    changeContentType: function (ctId) {
        if (!UploadDocumentWidget.changeCT) return;
        $('.crs-dynamics-row').hide();
        $('tr[id*="_' + ctId + '_"]').show();
        UploadDocumentWidget.selectedContentTypeIndex = UploadDocumentWidget.GetSelectedContentType().index;
    },
    SetSelectedContentType: function (currentItemSelectedContentTypeId) {
        UploadDocumentWidget.changeCT = false;
        $('#contentTypeCtrl').val(currentItemSelectedContentTypeId);
        $('.crs-dynamics-row').hide();
        $('tr[id*="_' + currentItemSelectedContentTypeId + '_"]').show();
        UploadDocumentWidget.changeCT = true;
    },
    GetSelectedContentType: function () {
        var index = 0;
        var selectedContentType;
        var selectedContentTypeId = $('#contentTypeCtrl').val();
        for (var i = 0, j = UploadDocumentWidget.contentTypes.length; i < j; i++) {
            if (UploadDocumentWidget.contentTypes[i].Id == selectedContentTypeId) {
                selectedContentType = UploadDocumentWidget.contentTypes[i];
                index = i;
                break;
            }
        }
        if (!selectedContentType) {
            selectedContentType = UploadDocumentWidget.contentTypes[0];
            $('#contentTypeCtrl').val(UploadDocumentWidget.contentTypes[0])
        }
        return { selectedContentType: selectedContentType, index: index };
    },
    GetUserInfo: function (controlId) {
        var peoplePicker;
        var peoplepickers = SPClientPeoplePicker.SPClientPeoplePickerDict;
        $.each(peoplepickers, function (name, value) {
            if (name.indexOf(controlId) >= 0) {
                peoplePicker = value;
            }
        });
        if (!!peoplePicker) {
            var userKeys = peoplePicker.GetAllUserInfo();
            return userKeys;
        } else return [];
    },
    GetAllFieldsValue: function (request, isSubmit) {
        var selectedObj = UploadDocumentWidget.GetSelectedContentType();
        var selectedContentType = selectedObj.selectedContentType;
        var selectedIndex = selectedObj.index;
        var fields = request[selectedIndex].Fields;

        for (var i = 0, j = fields.length; i < j; i++) {
            var controlId = fields[i].InternalName;
            switch (fields[i].Type) {
                case "Text":
                case "DateTime":
                    var $controls = $('tr[id*="_' + selectedContentType.Id + '_"]').find('input[id*="' + controlId + '_' + selectedIndex + '"]');
                    if ($controls.length == 1) {
                        fields[i].Value = $($controls[0]).val();
                    }
                    break;
                case "Note":
                    var $controls = $('tr[id*="_' + selectedContentType.Id + '_"]').find('textarea[id*="' + controlId + '_' + selectedIndex + '"]');
                    if ($controls.length == 1) {
                        fields[i].Value = $($controls[0]).val();
                    }
                    break;
                case "Taxonomy":
                    var $controls = $('tr[id*="_' + selectedContentType.Id + '_"]').find('span[id*="' + controlId + '_' + selectedIndex + '"]').find('input[type="hidden"]');
                    if ($controls.length == 1) {
                        fields[i].Value = $($controls[0]).val();
                    }
                    break;
                case "User":
                    var userInfo = UploadDocumentWidget.GetUserInfo(controlId + '_' + selectedIndex);
                    if (!!isSubmit) {
                        if (!!userInfo && userInfo.length > 0) {
                            fields[i].Value = userInfo[0].Description;
                        } else {
                            fields[i].Value = "";
                        }
                    } else {
                        fields[i].Value = userInfo;
                    }
                    break;
                case "Choice":
                    var $controls = $('tr[id*="_' + selectedContentType.Id + '_"]').find('select[id*="' + controlId + '_' + selectedIndex + '"]');
                    if ($controls.length == 1) {
                        fields[i].Value = $($controls[0]).val();
                    }
                    break;
            }
        }
    },
    submitDatas: function () {
        $$page.toolkit_gloading('show');
        UploadDocumentWidget.GetAllFieldsValue(UploadDocumentWidget.contentTypes, true);
        var param = {
            ListId: UploadDocumentWidget.listID.replace('{', '').replace('}', ''),
            DestinationFolder: $("#destination_container").val(),
            FileName: $("#crs-field-name").val() + $(".suffix-txt").text(),
            RequestApproval: $("input[name=approval]:checked").val() == "Yes" ? true : false
        }
        if (!param.RequestApproval) {
            $.ajax({
                type: 'POST',
                url: _spPageContextInfo.webAbsoluteUrl + '/_vti_bin/CRSRepositorySite/CRSRepositoryService.svc/CheckExistFile',
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify({ dto: param }),
                success: function (result) {
                    $$page.toolkit_gloading('hide');
                    if (result.CheckExistFileResult) {
                        $$page.toolkit_confirm('show', {
                            title: "",
                            type: 'w',
                            content: I18N.get("MOF", "MOF_UploadDcoument_FileExist_ErrorMessage"),
                            clickOK: UploadDocumentWidget.uploadFile,
                            zIndex: 999
                        });
                    } else {
                        UploadDocumentWidget.uploadFile();
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    $$page.toolkit_gloading('hide');
                    $$page.toolkit_alert("show", { type: 'e', content: I18N.get("MOF", "MOF_SubmitRequest_ErrorMessage") });
                }
            });
        }
        else {
            UploadDocumentWidget.uploadFile();
        }
    },
    uploadFile: function () {       
        $$page.toolkit_gloading('show');
        UploadDocumentWidget.GetAllFieldsValue(UploadDocumentWidget.contentTypes, true);

        var approver1 = [], approver2 = [];
        if (UploadDocumentWidget.isHasApproval != "false") {
            var approver1Id = $("div[id$='approver1_peoplepicker']")[0].id + "_TopSpan",
                approver2Id = $("div[id$='approver2_peoplepicker']")[0].id + "_TopSpan";
            var approver1peoplepicker = SPClientPeoplePicker.SPClientPeoplePickerDict[approver1Id],
                approver2peoplepicker = SPClientPeoplePicker.SPClientPeoplePickerDict[approver2Id];
            $.each(approver1peoplepicker.GetAllUserInfo(), function (i, item) {
                approver1.push({ 'LoginName': item.Key, 'DisplayName': item.DisplayText });
            });
            $.each(approver2peoplepicker.GetAllUserInfo(), function (i, item) {
                approver2.push({ 'LoginName': item.Key, 'DisplayName': item.DisplayText });
            });
        }
        var param = {
            ListId: UploadDocumentWidget.listID.replace('{', '').replace('}', ''),
            TermId: UploadDocumentWidget.termId,
            DestinationFolder: $("#destination_container").val(),
            RequestApproval: $("input[name=approval]:checked").val() == "Yes" ? true : false,
            ApprovalStage: $("#stages-select-div").children("option:selected").val() == "One Stage" ? 0 : 1,
            StageOneApprover: approver1,
            StageTwoApprover: approver2,
            Comments: $("#comments").val(),
            FileName: $("#crs-field-name").val() + $(".suffix-txt").text(),
            Title: $("#crs-field-title").val(),
            ManulFinalise: !$("input[name='isManulFinalise']").is(":checked"),
            CRSContentType: UploadDocumentWidget.contentTypes[UploadDocumentWidget.selectedContentTypeIndex]
        }

        var formdata = new FormData();
        formdata.append('myfiles', $("input[name$='upload_file']")[0].files[0]);
        formdata.append('params', JSON.stringify(param));

        $.ajax({
            type: 'POST',
            url: _spPageContextInfo.webAbsoluteUrl + '/_layouts/15/CRSRepositorySite/UploadDocument.aspx',
            headers: { "X-RequestDigest": $("[name='__REQUESTDIGEST']").val() },
            data: formdata,
            contentType: false,
            processData: false,
            cache: false,
            timeout: 600000,
            success: function (result) {
                if (result.Status == 0) {
                    if (window.top.parent.location.href.indexOf('CRSPortal/RepositoryLibrary.aspx') > -1)
                        window.top.SP.UI.ModalDialog.commonModalDialogClose(1, null);
                    else {
                        if (window.top.location.href.indexOf('InitialTabId=Ribbon') > -1) {
                            window.top.location.href = window.top.location.href.substring(0, window.top.location.href.indexOf('InitialTabId=Ribbon') - 1);
                        }
                        else {
                            window.top.location.reload();
                        }
                    }
                } else if (result.Status == 1) {
                    $(".block-error-msg").text(result.Message).show();
                    $$page.toolkit_gloading('hide');
                } else if (result.Status == undefined) {
                    $$page.toolkit_gloading('hide');
                    $$page.toolkit_alert("show", { type: 'e', content: "May be which you upload document is too max." });
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (textStatus == "error") {
                    $$page.toolkit_alert("show", { type: 'e', content: "Status: " + XMLHttpRequest.status + ", readyState: " + XMLHttpRequest.readyState + ", responseText: " + XMLHttpRequest.responseText + ", statusText: " + XMLHttpRequest.statusText + ", timeout: " + XMLHttpRequest.timeout });
                } else if (textStatus == "timeout") {
                    $$page.toolkit_alert("show", { type: 'e', content: "Timeout Error. Sorry, something went wrong when upload the file. Please retry." });
                } else {
                    $$page.toolkit_alert("show", { type: 'e', content: I18N.get("MOF", "MOF_SubmitRequest_ErrorMessage") });
                }
                $$page.toolkit_gloading('hide');
            }
        });
    },
    LaunchTargetPicker: function () {
        var webUrl = _spPageContextInfo.webAbsoluteUrl;
        var currAnchor = 'SPList:' + UploadDocumentWidget.listID.replace('{', '').replace('}', '') + '?SPWeb:' + UploadDocumentWidget.webID + ':';

        var callback = function (dest) {
            if (dest != null && dest != undefined && dest[3] != null) {
                $("#destination_container").val(dest[3]);
                currSelectionId = dest[0];
            }
        };
        libraryRelUrl = $("#destination_container").val();//子folder的路径
        if (libraryRelUrl == null || libraryRelUrl == "" || libraryRelUrl == "/") {
            libraryRelUrl = "";
        }
        else if (libraryRelUrl.charAt(0) != '/') {
            libraryRelUrl = "/" + libraryRelUrl;
        }
        var currSelectionUrl = UploadDocumentWidget.libraryUrl + libraryRelUrl;//library+子folder路径
        var iconUrl = "/_layouts/15/images/smt_icon.gif?rev=40";
        SP.SOD.executeFunc('pickertreedialog.js', 'LaunchPickerTreeDialogSelectUrl', function () {
            LaunchPickerTreeDialogSelectUrl('CbqPickerSelectFolderTitle', 'CbqPickerSelectFolderText', 'websListsFolders', currAnchor, webUrl, currSelectionUrl, '', '', iconUrl, '', callback, 'true', '');
        });
    }
}