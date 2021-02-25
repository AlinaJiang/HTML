function FilterGroup(datas) {
    var settings = {
        resource: { sortAscResx: '', sortDescResx: '', filterMsgResx: '', btnResx: '', nullResx: '' },
        sort: { columnName: '', isAsc: false },
        selectionChangedCallback: $.noop,
        sortDescCallback: $.noop,
        sortAscCallback: $.noop,
        width: 237,
        isHasSort: true,
        isHasSearchBox: true,
        dataGroup: [{
            columnName: '',
            element: '',
            onlySort: false,
            onlyFilter: false,
            checkedOptions: [],
            unCheckedOptions: []
        }]
    };

    if (datas) $.extend(settings, datas);

    var arrowTmpl = [
		'<div class="filter-dropdown-arrow">',
            '<span class="apps-icon-arrow-down"></span>',
        '</div>'
    ].join("");

    var filterTmpl = [
        '<div class="filter-icon" data-bind="visible: selectedItems().length > 0"><span class="apps-icon-filter"></span></div>'
    ].join("");

    var sortTmpl = [
        '<!-- ko if: isSort -->',
            '<!-- ko if: isSortAsc -->',
                '<div class="asc-icon"><span class="apps-icon-ascending"></span></div>',
            '<!-- /ko -->',
            '<!-- ko ifnot: isSortAsc -->',
                '<div class="desc-icon"><span class="apps-icon-descending"></span></div>',
            '<!-- /ko -->',
        '<!-- /ko -->'
    ].join("");

    var html = [
		'<div class="filter-dropdown-popup">',
        '<!-- ko if: isHasSort -->',
            '<!-- ko ifnot: isSort -->',
                '<div class="sort-letter-container">',
                    '<div class="filter-sortasc-letter" data-bind="click: sortAsc"><span class="apps-icon-a-z"></span>&nbsp;&nbsp;' + settings.resource.sortAscResx + '</div>',
                    '<div class="filter-sortdesc-letter" data-bind="click: sortDesc"><span class="apps-icon-z-a"></span>&nbsp;&nbsp;' + settings.resource.sortDescResx + '</div>',
                '</div>',
            '<!-- /ko -->',
            '<!-- ko if: isSort -->',
                '<!-- ko ifnot: isSortAsc -->',
                    '<div class="sort-letter-container">',
                        '<div class="filter-sortasc-letter" data-bind="click: sortAsc"><span class="apps-icon-a-z"></span>&nbsp;&nbsp;' + settings.resource.sortAscResx + '</div>',
                        '<div class="filter-sortdesc-letter disabled" style="color: #aeaeae"><span class="apps-icon-z-a"></span>&nbsp;&nbsp;' + settings.resource.sortDescResx + '</div>',
                    '</div>',
                '<!-- /ko -->',
                '<!-- ko if: isSortAsc -->',
                    '<div class="sort-letter-container">',
                        '<div class="filter-sortasc-letter disabled"  style="color: #aeaeae;"><span class="apps-icon-a-z"></span>&nbsp;&nbsp;' + settings.resource.sortAscResx + '</div>',
                        '<div class="filter-sortdesc-letter"  data-bind="click: sortDesc"><span class="apps-icon-z-a"></span>&nbsp;&nbsp;' + settings.resource.sortDescResx + '</div>',
                    '</div>',
                '<!-- /ko -->',
            '<!-- /ko -->',
        '<!-- /ko -->',
        '<!-- ko if: isHasSearchBox -->',
            '<div><input type="text" class="filter-search-box"></div>',
        '<!-- /ko -->',
            '<div class="line"></div>',
            '<div class="items-container">',
                '<div class="disfilter-container" data-bind="visible: selectedItems().length > 0, click: clearItems">',
                    '<span class="apps-icon-clear-filter"></span>&nbsp;&nbsp;',
                     '<span data-bind="text: clearMsg"></span>',
                '</div>',
                '<div class="disfilter-container-diabled" data-bind="visible: selectedItems().length <= 0">',
                    '<span class="apps-icon-clear-filter"></span>&nbsp;&nbsp;',
                    '<span data-bind="text: clearMsg"></span>',
                '</div>',
                '<div data-bind="foreach: items" class="itemsborder">',
                    '<div class="filter_dropdown_oneline" data-bind="attr: { \'data-isNull\': isnull, id: \'${fieldName}_filter_\' + $index()},click: $parent.selectItem, clickBubble: false">',
                        '<input type="checkbox" data-bind="checked: isChecked"></input>',
					    '<div style="display: inline-block; vertical-align: top; word-wrap: break-word; width:' + (settings.width - 60) + 'px" data-bind="text: value, attr:{ key:key, title: value, id: \'${fieldName}_filter_content_\' + $index() }"></div>',
                    '</div>',
                '</div>',
		        '<div class="cancel_btn">' + settings.resource.btnResx + '</div>',
            '</div>',
		'</div>'
    ].join("");

    var htmlWidthoutSort = [
        '<div class="filter-dropdown-popup">',
            '<div class="items-container">',
                '<div class="disfilter-container" data-bind="visible: selectedItems().length > 0, click: clearItems">',
                    '<span class="apps-icon-clear-filter"></span>&nbsp;&nbsp;',
                        '<span data-bind="text: clearMsg"></span>',
                '</div>',
                '<div class="disfilter-container-diabled" data-bind="visible: selectedItems().length <= 0">',
                    '<span class="apps-icon-clear-filter"></span>&nbsp;&nbsp;',
                    '<span data-bind="text: clearMsg"></span>',
                '</div>',
                '<div data-bind="foreach: items" class="itemsborder">',
                    '<div class="filter_dropdown_oneline" data-bind="attr: { \'data-isNull\': isnull, id: \'${fieldName}_filter_\' + $index()},click: $parent.selectItem, clickBubble: false">',
                        '<input type="checkbox" data-bind="checked: isChecked"></input>',
					    '<div style="display: inline-block; vertical-align: top; word-wrap: break-word; width:' + (settings.width - 60) + 'px" data-bind="text: value, attr:{ key:key, title: value, id: \'${fieldName}_filter_content_\' + $index() }"></div>',
                    '</div>',
                '</div>',
		        '<div class="cancel_btn">' + settings.resource.btnResx + '</div>',
            '</div>',
		'</div>'
    ].join("");

    var container, popup, viewModel = [], selectedModel = [], showModel = [], allModel = [], nullValueCounter = [];
    var vDropDownArrowArray = [], vContainerArray = [], vCancelBtnArray = [], vHrefArray = [];

    function createElement() {
        for (var i = 0; i < settings.dataGroup.length; i++) {
            if (settings.dataGroup[i].onlySort) {
                vContainerArray[i] = $(settings.dataGroup[i].element).attr("data-fieldname", settings.dataGroup[i].columnName);
                vContainerArray[i].wrapInner("<div class='filter_header_onlysort'></div>");
            } else {
                vContainerArray[i] = $(settings.dataGroup[i].element).addClass("filter").attr("data-fieldname", settings.dataGroup[i].columnName);
                vContainerArray[i].wrapInner("<div class='filter_header'></div>");
            }
            if (settings.dataGroup[i].onlyFilter) {
                $.template("html_tmpl", htmlWidthoutSort);
                vContainerArray[i].find(".filter_header").append(filterTmpl).append(arrowTmpl);
            } else {
                $.template("html_tmpl", html);
            }
            var tmplValue = [{ fieldName: settings.dataGroup[i].columnName }];
            var tmpl = $.tmpl("html_tmpl", tmplValue);

            if (settings.isHasSort) {
                if (settings.dataGroup[i].onlySort) {
                    vContainerArray[i].find(".filter_header_onlysort").wrapInner("<a style='margin-right: 5px;' href='#'></a>");
                    vContainerArray[i].find(".filter_header_onlysort").append(sortTmpl);
                } else if (!settings.dataGroup[i].onlyFilter) {
                    vContainerArray[i].find(".filter_header").wrapInner("<a style='margin-right: 5px;' href='#'></a>");
                    vContainerArray[i].find(".filter_header").append(filterTmpl).append(sortTmpl).append(arrowTmpl);
                }
                vHrefArray[i] = vContainerArray[i].find("a");
            } else {
                vContainerArray[i].find(".filter_header").append(filterTmpl).append(arrowTmpl);
            }
            vContainerArray[i].append(tmpl);
            popup = vContainerArray[i].find(".filter-dropdown-popup").attr("data-popup", settings.dataGroup[i].columnName);
            vContainerArray[i].find(".filter-dropdown-popup").find(".itemsborder").attr("data-scroll", settings.dataGroup[i].columnName);
            popup.width(settings.width);

            vCancelBtnArray[i] = vContainerArray[i].find(".cancel_btn");
        }
    }

    function initBindings() {
        for (var i = 0; i < settings.dataGroup.length; i++) {
            viewModel[i] = {
                modelName: ko.observable(''),
                items: ko.observableArray(),
                selectedItems: ko.observableArray([]),
                selectItem: eventHandler.selectItem,
                isHasSort: ko.observable(settings.isHasSort),
                isSort: ko.observable(false),
                isSortAsc: ko.observable(false),
                isHasSearchBox: ko.observable(settings.isHasSearchBox),
                sortAsc: eventHandler.sortAsc,
                sortDesc: eventHandler.sortDesc,
                clearItems: eventHandler.clearItems,
                clearMsg: ko.observable('')
            };
            ko.applyBindings(viewModel[i], $(settings.dataGroup[i].element)[0]);
        }
    }

    function initData() {
        for (var i = 0; i < settings.dataGroup.length; i++) {
            viewModel[i].items.removeAll();
            viewModel[i].selectedItems.removeAll();
            viewModel[i].modelName(settings.dataGroup[i].columnName);
            viewModel[i].clearMsg(settings.resource.filterMsgResx.replace(/\^/, $(settings.dataGroup[i].element).find('.filter_header').text()));
            if (settings.isHasSort && settings.sort.columnName == settings.dataGroup[i].columnName) {
                viewModel[i].isSort(true);
                viewModel[i].isSortAsc(settings.sort.isAsc);
            }
            nullValueCounter[i] = 0;
            if (settings.dataGroup[i].checkedOptions != undefined) {
                for (var j = 0, datalen = settings.dataGroup[i].checkedOptions.length; j < datalen; j++) {
                    var currentData = settings.dataGroup[i].checkedOptions;
                    if (currentData[j]) {
                        // for Saga bulletin overview department filter
                        var keyTemp = currentData[j].lastIndexOf("^") > 0 ? currentData[j] : null;
                        var valueTemp = keyTemp ? (currentData[j].split('^')[1] + " " + currentData[j].split('^')[2]) : currentData[j];

                        var data = { isChecked: ko.observable(true), key: keyTemp, value: valueTemp, isnull: false };
                        viewModel[i].items.push(data);
                        viewModel[i].selectedItems.push(currentData[j]);
                    } else {
                        currentData[j] = settings.resource.nullResx;
                        nullValueCounter[i]++;
                        if (nullValueCounter[i] <= 1) {
                            var data = { isChecked: ko.observable(true), key: null, value: currentData[j], isnull: true };
                            viewModel[i].items.push(data);
                            viewModel[i].selectedItems.push(currentData[j]);
                        }
                    }
                }
                var uncoptionlength = settings.dataGroup[i].unCheckedOptions.length > 10 ? 10 : settings.dataGroup[i].unCheckedOptions.length;
                for (var k = 0; k < uncoptionlength; k++) {
                    var currentData = settings.dataGroup[i].unCheckedOptions;
                    if (currentData[k]) {
                        // for Saga bulletin overview department filter
                        var keyTemp = currentData[k].lastIndexOf("^") > 0 ? currentData[k] : null;
                        var valueTemp = keyTemp ? (currentData[k].split('^')[1] + " " + currentData[k].split('^')[2]) : currentData[k];

                        var data = { isChecked: ko.observable(false), key: keyTemp, value: valueTemp, isnull: false };
                        viewModel[i].items.push(data);
                    } else {
                        currentData[k] = settings.resource.nullResx;
                        nullValueCounter[i]++;
                        if (nullValueCounter[i] <= 1) {
                            var data = { isChecked: ko.observable(false), key: null, value: currentData[k], isnull: true };
                            viewModel[i].items.push(data);
                        }
                    }
                }
            }
            var vLines = vContainerArray[i].find(".filter_dropdown_oneline");
            for (var m = 0; m < vLines.length; m++) {
                var id = $(vLines[m]).find("div")[0].id;
                $("#" + id).ellipsis({ maxWidth: 150, maxLine: 2 });
            }
            if (!settings.dataGroup[i].onlySort) {
                allModel[i] = {
                    columnName: settings.dataGroup[i].columnName,
                    dLength: settings.dataGroup[i].checkedOptions.length + settings.dataGroup[i].unCheckedOptions.length
                }
                selectedModel[i] = {//Store item to interact with the background, containing only the selected item
                    columnName: settings.dataGroup[i].columnName,
                    checkedOptions: viewModel[i].selectedItems()
                }
                showModel[i] = {//Store the displayed item
                    columnName: settings.dataGroup[i].columnName,
                    options: viewModel[i].items()
                }
            }
        }
    }

    function initEventHandler() {
        $(document).click(eventHandler.clickToClosePop);
        for (var i = 0; i < vContainerArray.length; i++) {
            if (vContainerArray[i].hasClass("filter")) {
                vContainerArray[i].click(eventHandler.clickToShowPop);
            }
            vContainerArray[i].find(".cancel_btn").click(function () {
                $(this).parent().parent().hide();
                $(this).parent().parent().parent().removeClass("filter-selected").find(".filter-dropdown-arrow").hide();
                return false;
            });
            if (settings.isHasSort) {
                vHrefArray[i].click(eventHandler.headerSort);
            }
            vContainerArray[i].find(".itemsborder").scroll(function () {
                var scrollTop = $(this).scrollTop();
                var clientHeight = this.clientHeight;
                var scrollHeight = this.scrollHeight;
                var scrollName = $(this).attr("data-scroll");
                if (scrollHeight <= clientHeight + scrollTop) {
                    for (var j = 0; j < allModel.length; j++) {
                        if (allModel[j] != undefined) {
                            var allLength = allModel[j].dLength;
                            if (allModel[j].columnName == scrollName && showModel[j].options.length < allLength) {
                                var checkedLength = settings.dataGroup[j].checkedOptions.length;
                                var showLength = showModel[j].options.length;
                                var dlength = allLength - showLength > 10 ? 10 : allLength - showLength;
                                var counter = (showLength - checkedLength) / 10;
                                LazyLoadData(counter * 10, dlength, settings.dataGroup[j].unCheckedOptions, scrollName);
                                var vLines = $(this).find(".filter_dropdown_oneline");
                                for (var k = counter * 10; k < counter * 10 + dlength; k++) {
                                    var id = $(vLines[k]).find("div")[0].id;
                                    $("#" + id).ellipsis({ maxWidth: 150, maxLine: 2 });
                                }
                            }
                        }
                    }
                }
            });
        }
        if (eventHandler.IsPC()) {
            $(".filter").hover(function () {
                $(this).find(".filter-dropdown-arrow").show();
            },
           function () {
               if (!$(this).hasClass("filter-selected")) {
                   $(this).find(".filter-dropdown-arrow").hide();
               }
           });
        }
    }

    var eventHandler = {
        selectItem: function (item, e) {
            var targetElement = $(e.target)[0].nodeName.toLowerCase();
            var popupname = $(e.target).parent().parent().parent().parent().attr("data-popup");
            var isNull = $(e.target).parent().attr("data-isNull");
            if (isNull) {
                this.value = "";
            }
            if (targetElement == "div" && popupname) {
                item.isChecked(!item.isChecked());
            }
            for (var i = 0; i < viewModel.length; i++) {
                if (viewModel[i].modelName() == popupname) {
                    var trueValue = this.key ? this.key : this.value;
                    if (this.isChecked()) {
                        viewModel[i].selectedItems.push(trueValue);
                    } else {
                        viewModel[i].selectedItems.remove(trueValue);
                    }
                    break;
                }
            }
            invokeSelectionChanged(popupname);
            return true;
        },
        clickToShowPop: function (e) {
            $(".filter-dropdown-popup").hide();
            $('.filter').removeClass('filter-selected');
            $('.filter-dropdown-arrow').hide();
            $(this).addClass("filter-selected").find('.filter-dropdown-arrow').show();
            $(this).find(".filter-dropdown-popup").show();
            return false;
        },
        clickToClosePop: function (e) {
            var id = $(e.target)[0].id;
            if (id) {
                if ($('#' + id).closest($('.filter-dropdown-popup')).length <= 0 && $('#' + id).closest($('.filter')).length <= 0) {
                    $('.filter-dropdown-popup').hide();
                    $('.filter').removeClass('filter-selected').find(".filter-dropdown-arrow").hide();
                }
            } else {
                if ($(e.target).closest($('.filter-dropdown-popup')).length <= 0 && $(e.target).closest($('.filter')).length <= 0) {
                    $('.filter-dropdown-popup').hide();
                    $('.filter').removeClass('filter-selected').find(".filter-dropdown-arrow").hide();
                }
            }
        },
        sortAsc: function (name) {
            clearSort();
            var currentSortCoulmn;
            if (typeof (name) == "string") {
                for (var i = 0; i < viewModel.length; i++) {
                    if (name == viewModel[i].modelName()) {
                        viewModel[i].isSort(true);
                        viewModel[i].isSortAsc(!viewModel[i].isSortAsc());
                    }
                }
                currentSortCoulmn = name;
            } else {
                this.isSort(true);
                this.isSortAsc(true);
                currentSortCoulmn = this.modelName();
            }
            invokeSortAsc(currentSortCoulmn);
        },
        sortDesc: function (name) {
            clearSort();
            var currentSortCoulmn;
            if (typeof (name) == "string") {
                for (var i = 0; i < viewModel.length; i++) {
                    if (name == viewModel[i].modelName()) {
                        viewModel[i].isSort(true);
                        viewModel[i].isSortAsc(!viewModel[i].isSortAsc());
                    }
                }
                currentSortCoulmn = name;
            } else {
                this.isSort(true);
                this.isSortAsc(false);
                currentSortCoulmn = this.modelName();
            }
            invokeSortDesc(currentSortCoulmn);
        },
        headerSort: function (e) {
            var vTarget = $(this).parent().parent();
            var fieldname = vTarget.attr("data-fieldname");
            if (vTarget.find(".asc-icon .apps-icon-ascending").length > 0) {
                for (var i = 0; i < viewModel.length; i++) {
                    if (viewModel[i].modelName() == fieldname) {
                        viewModel[i].isSortAsc(true);
                        break;
                    }
                }
                eventHandler.sortDesc(fieldname);
            } else {
                for (var i = 0; i < viewModel.length; i++) {
                    if (viewModel[i].modelName() == fieldname) {
                        viewModel[i].isSortAsc(false);
                        break;
                    }
                }
                eventHandler.sortAsc(fieldname);
            }
            eventHandler.clickTitleClosePopup(e);
            return false;
        },
        clickTitleClosePopup: function (e) {
            if ($(e.target).closest($('.filter')).length == 0 ||
                $(e.target).closest($('.filter')).find('.filter-dropdown-popup').css('display') == 'none'
                ) {
                $('.filter-dropdown-popup').hide();
                $('.filter').removeClass('filter-selected').find(".filter-dropdown-arrow").hide();
            }
        },
        clearItems: function () {
            this.selectedItems.removeAll();
            for (var i = 0; i < this.items().length; i++) {
                this.items()[i].isChecked(false);
            }
            invokeSelectionChanged(this.modelName());
        },
        IsPC: function () {
            var userAgentInfo = navigator.userAgent;
            var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
            var flag = true;
            for (var v = 0; v < Agents.length; v++) {
                if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
            }
            return flag;
        }
    };

    function invokeSelectionChanged(activeColumnName) {
        var isAsc;
        for (var i = 0; i < viewModel.length; i++) {
            if (settings.sort.columnName == viewModel[i].modelName()) {
                isAsc = viewModel[i].isSortAsc();
                break;
            }
        }
        var data = {
            sortColumnName: settings.sort.columnName,
            sourceData: selectedModel,
            isAsc: isAsc,
            activeColumnName: activeColumnName
        }

        if (settings.selectionChangedCallback) {
            settings.selectionChangedCallback(data);
        }
    }

    function invokeSortDesc(name) {
        settings.sort.isAsc = false;
        settings.sort.columnName = name;
        var data = {
            sortColumnName: name,
            sourceData: selectedModel
        }
        if (settings.sortDescCallback) {
            settings.sortDescCallback(data);
        }
    }

    function invokeSortAsc(name) {
        settings.sort.isAsc = true;
        settings.sort.columnName = name;
        var data = {
            sortColumnName: name,
            sourceData: selectedModel
        }
        if (settings.sortAscCallback) {
            settings.sortAscCallback(data);
        }
    }

    function clearSort() {
        for (var i = 0; i < viewModel.length; i++) {
            viewModel[i].isSort(false);
        }
    }

    function LazyLoadData(from, to, data, scrollName) {
        for (var i = 0; i < viewModel.length; i++) {
            if (viewModel[i].modelName() == scrollName) {
                for (var j = from; j < from + to; j++) {
                    if (data[j]) {
                        // for Saga bulletin overview department filter
                        var keyTemp = data[j].lastIndexOf("^") > 0 ? data[j] : null;
                        var valueTemp = keyTemp ? (data[j].split('^')[1] + " " + data[j].split('^')[2]) : data[j];

                        var tempdata = { isChecked: ko.observable(false), key: keyTemp, value: valueTemp, isnull: false };
                        viewModel[i].items.push(tempdata);
                        showModel[i].options = viewModel[i].items();
                    } else {
                        data[j] = settings.resource.nullResx;
                        nullValueCounter[i]++;
                        if (nullValueCounter[i] <= 1) {
                            var tempdata = { isChecked: ko.observable(false), key: null, value: data[j], isnull: true };
                            viewModel[i].items.push(tempdata);
                            showModel[i].options = viewModel[i].items();
                        }
                    }
                }
            }
        }
    }

    this.setAllItems = function (allItems) {
        clearSort();
        if (settings.isHasSort) {
            settings.sort.columnName = allItems.sort.columnName;
        }
        for (var i = 0; i < allItems.dataGroup.length; i++) {
            if (allModel[i] != undefined && allItems.dataGroup[i] != null
                && allItems.dataGroup[i].unCheckedOptions != undefined && allItems.dataGroup[i].checkedOptions != undefined) {
                allModel[i].dLength = allItems.dataGroup[i].unCheckedOptions.length + allItems.dataGroup[i].checkedOptions.length;
                for (var k = 0; k < viewModel.length; k++) {
                    if (settings.isHasSort) {
                        if (viewModel[k].modelName() == allItems.sort.columnName) {
                            viewModel[k].isSort(true);
                            viewModel[k].isSortAsc(allItems.sort.isAsc);
                            settings.sort.isAsc = allItems.sort.isAsc;
                        } else {
                            viewModel[k].isSort(false);
                        }
                    }
                    if (allItems.dataGroup[i].columnName == viewModel[k].modelName()) {
                        viewModel[k].items.removeAll();
                        viewModel[k].selectedItems.removeAll();
                        settings.dataGroup[k].unCheckedOptions = [];
                        nullValueCounter[k] = 0;
                        if (allItems.dataGroup[i].checkedOptions) {
                            for (var j = 0, datalen = allItems.dataGroup[i].checkedOptions.length; j < datalen; j++) {
                                var currentData = allItems.dataGroup[i].checkedOptions;
                                if (currentData[j]) {
                                    // for Saga bulletin overview department filter
                                    var keyTemp = currentData[j].lastIndexOf("^") > 0 ? currentData[j] : null;
                                    var valueTemp = keyTemp ? (currentData[j].split('^')[1] + " " + currentData[j].split('^')[2]) : currentData[j];

                                    var data = { isChecked: ko.observable(true), key: keyTemp, value: valueTemp, isnull: false };
                                    viewModel[k].items.push(data);
                                    viewModel[k].selectedItems.push(currentData[j]);
                                } else {
                                    currentData[j] = settings.resource.nullResx;
                                    nullValueCounter[k]++;
                                    if (nullValueCounter[k] <= 1) {
                                        var data = { isChecked: ko.observable(true), key: null, value: currentData[j], isnull: true };
                                        viewModel[k].items.push(data);
                                    }
                                }
                            }
                            var uncoptionlength = allItems.dataGroup[i].unCheckedOptions.length > 10 ? 10 : allItems.dataGroup[i].unCheckedOptions.length;
                            for (var j = 0; j < uncoptionlength; j++) {
                                settings.dataGroup[k].unCheckedOptions = allItems.dataGroup[i].unCheckedOptions
                                var currentData = allItems.dataGroup[i].unCheckedOptions;
                                if (currentData[j]) {
                                    // for Saga bulletin overview department filter
                                    var keyTemp = currentData[j].lastIndexOf("^") > 0 ? currentData[j] : null;
                                    var valueTemp = keyTemp ? (currentData[j].split('^')[1] + " " + currentData[j].split('^')[2]) : currentData[j];

                                    var data = { isChecked: ko.observable(false), key: keyTemp, value: valueTemp, isnull: false };
                                    viewModel[k].items.push(data);
                                } else {
                                    currentData[j] = settings.resource.nullResx;
                                    nullValueCounter[k]++;
                                    if (nullValueCounter[k] <= 1) {
                                        var data = { isChecked: ko.observable(false), key: null, value: currentData[j], isnull: true };
                                        viewModel[k].items.push(data);
                                    }
                                }
                            }
                        }
                    }
                }
                var vLines = vContainerArray[i].find(".filter_dropdown_oneline");
                for (var j = 0; j < vLines.length; j++) {
                    var id = $(vLines[j]).find("div")[0].id;
                    $("#" + id).ellipsis({ maxWidth: 150, maxLine: 2 });
                }
            }
        }
    }

    this.getAllItems = function () {
        var data = {
            isAsc: settings.sort.isAsc,
            sortColumnName: settings.sort.columnName,
            sourceData: selectedModel
        }
        return data;
    }

    this.init = function () {
        createElement();
        initBindings();
        initData();
        initEventHandler();
    }
}
