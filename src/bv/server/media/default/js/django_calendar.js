// basic browser identification & version
var isOpera = (navigator.userAgent.indexOf("Opera")>=0) && parseFloat(navigator.appVersion);
var isIE = ((document.all) && (!isOpera)) && parseFloat(navigator.appVersion.split("MSIE ")[1].split(";")[0]);

// ----------------------------------------------------------------------------
// Get the computed style for and element
// ----------------------------------------------------------------------------
function getStyle(oElm, strCssRule){
    var strValue = "";
    if(document.defaultView && document.defaultView.getComputedStyle){
        strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
    }
    else if(oElm.currentStyle){
        strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
            return p1.toUpperCase();
        });
        strValue = oElm.currentStyle[strCssRule];
    }
    return strValue;
}

// ----------------------------------------------------------------------------
// Find-position functions by PPK
// See http://www.quirksmode.org/js/findpos.html
// ----------------------------------------------------------------------------
function findPosX(obj) {
    var curleft = 0;
    if (obj.offsetParent) {
        while (obj.offsetParent) {
            curleft += obj.offsetLeft - ((isOpera) ? 0 : obj.scrollLeft);
            obj = obj.offsetParent;
        }
        // IE offsetParent does not include the top-level 
        if (isIE && obj.parentElement){
            curleft += obj.offsetLeft - obj.scrollLeft;
        }
    } else if (obj.x) {
        curleft += obj.x;
    }
    return curleft;
}

function findPosY(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        while (obj.offsetParent) {
            curtop += obj.offsetTop - ((isOpera) ? 0 : obj.scrollTop);
            obj = obj.offsetParent;
        }
        // IE offsetParent does not include the top-level 
        if (isIE && obj.parentElement){
            curtop += obj.offsetTop - obj.scrollTop;
        }
    } else if (obj.y) {
        curtop += obj.y;
    }
    return curtop;
}

//-----------------------------------------------------------------------------
// Date object extensions
// ----------------------------------------------------------------------------
Date.prototype.getCorrectYear = function() {
    // Date.getYear() is unreliable --
    // see http://www.quirksmode.org/js/introdate.html#year
    var y = this.getYear() % 100;
    return (y < 38) ? y + 2000 : y + 1900;
}

Date.prototype.getTwoDigitMonth = function() {
    return (this.getMonth() < 9) ? '0' + (this.getMonth()+1) : (this.getMonth()+1);
}

Date.prototype.getTwoDigitDate = function() {
    return (this.getDate() < 10) ? '0' + this.getDate() : this.getDate();
}

Date.prototype.getTwoDigitHour = function() {
    return (this.getHours() < 10) ? '0' + this.getHours() : this.getHours();
}

Date.prototype.getTwoDigitMinute = function() {
    return (this.getMinutes() < 10) ? '0' + this.getMinutes() : this.getMinutes();
}

Date.prototype.getTwoDigitSecond = function() {
    return (this.getSeconds() < 10) ? '0' + this.getSeconds() : this.getSeconds();
}

Date.prototype.getISODate = function() {
    return this.getCorrectYear() + '-' + this.getTwoDigitMonth() + '-' + this.getTwoDigitDate();
}

Date.prototype.getHourMinute = function() {
    return this.getTwoDigitHour() + ':' + this.getTwoDigitMinute();
}

Date.prototype.getHourMinuteSecond = function() {
    return this.getTwoDigitHour() + ':' + this.getTwoDigitMinute() + ':' + this.getTwoDigitSecond();
}

Date.prototype.getFrenchDate = function() {
    return this.getTwoDigitDate() + '/' + this.getTwoDigitMonth() + '/' + this.getCorrectYear();
}


/*
calendar.js - Calendar functions by Adrian Holovaty
*/

function removeChildren(a) { // "a" is reference to an object
    while (a.hasChildNodes()) a.removeChild(a.lastChild);
}

// quickElement(tagType, parentReference, textInChildNode, [, attribute, attributeValue ...]);
function quickElement() {
    var obj = document.createElement(arguments[0]);
    if (arguments[2] != '' && arguments[2] != null) {
        var textNode = document.createTextNode(arguments[2]);
        obj.appendChild(textNode);
    }
    var len = arguments.length;
    for (var i = 3; i < len; i += 2) {
        obj.setAttribute(arguments[i], arguments[i+1]);
    }
    arguments[1].appendChild(obj);
    return obj;
}

// CalendarNamespace -- Provides a collection of HTML calendar-related helper functions
var CalendarNamespace = {
    monthsOfYear: gettext('January February March April May June July August September October November December').split(' '),
    daysOfWeek: gettext('S M T W T F S').split(' '),
    isLeapYear: function(year) {
        return (((year % 4)==0) && ((year % 100)!=0) || ((year % 400)==0));
    },
    getDaysInMonth: function(month,year) {
        var days;
        if (month==1 || month==3 || month==5 || month==7 || month==8 || month==10 || month==12) {
            days = 31;
        }
        else if (month==4 || month==6 || month==9 || month==11) {
            days = 30;
        }
        else if (month==2 && CalendarNamespace.isLeapYear(year)) {
            days = 29;
        }
        else {
            days = 28;
        }
        return days;
    },
    draw: function(month, year, div_id, callback) { // month = 1-12, year = 1-9999
        month = parseInt(month);
        year = parseInt(year);
        var calDiv = document.getElementById(div_id);
        removeChildren(calDiv);
        var calTable = document.createElement('table');
        quickElement('caption', calTable, CalendarNamespace.monthsOfYear[month-1] + ' ' + year);
        var tableBody = quickElement('tbody', calTable);

        // Draw days-of-week header
        var tableRow = quickElement('tr', tableBody);
        for (var i = 0; i < 7; i++) {
            quickElement('th', tableRow, CalendarNamespace.daysOfWeek[i]);
        }

        var startingPos = new Date(year, month-1, 1).getDay();
        var days = CalendarNamespace.getDaysInMonth(month, year);

        // Draw blanks before first of month
        tableRow = quickElement('tr', tableBody);
        for (var i = 0; i < startingPos; i++) {
            var _cell = quickElement('td', tableRow, ' ', 'class', 'emptyday');
        }

        // Draw days of month
        var currentDay = 1;
        dayOfMonth = new Date().getDate();
        realMonth = new Date().getMonth();
        realYear = new Date().getFullYear();
        for (var i = startingPos; currentDay <= days; i++) {
            if (i%7 == 0 && currentDay != 1) {
                tableRow = quickElement('tr', tableBody);
            }
            if (currentDay == dayOfMonth && realMonth + 1 == month && realYear == year) {
                var cellOfDay = quickElement('td', tableRow, '', 'id', 'today');
                quickElement('a', cellOfDay, currentDay, 'href', 'javascript:void(' + callback + '('+year+','+month+','+currentDay+'));');
            } else {
                var cell = quickElement('td', tableRow, '');
                quickElement('a', cell, currentDay, 'href', 'javascript:void(' + callback + '('+year+','+month+','+currentDay+'));');
            }
            currentDay++;
        }

        // Draw blanks after end of month (optional, but makes for valid code)
        while (tableRow.childNodes.length < 7) {
            var _cell = quickElement('td', tableRow, ' ', 'class', 'emptyday');
        }

        calDiv.appendChild(calTable);
    }
}

// Calendar -- A calendar instance
function Calendar(div_id, callback) {
    // div_id (string) is the ID of the element in which the calendar will
    //     be displayed
    // callback (string) is the name of a JavaScript function that will be
    //     called with the parameters (year, month, day) when a day in the
    //     calendar is clicked
    this.div_id = div_id;
    this.callback = callback;
    this.today = new Date();
    this.currentMonth = this.today.getMonth() + 1;
    this.currentYear = this.today.getFullYear();
}
Calendar.prototype = {
    drawCurrent: function() {
        CalendarNamespace.draw(this.currentMonth, this.currentYear, this.div_id, this.callback);
    },
    drawDate: function(month, year) {
        this.currentMonth = month;
        this.currentYear = year;
        this.drawCurrent();
    },
    drawPreviousMonth: function() {
        if (this.currentMonth == 1) {
            this.currentMonth = 12;
            this.currentYear--;
        }
        else {
            this.currentMonth--;
        }
        this.drawCurrent();
    },
    drawNextMonth: function() {
        if (this.currentMonth == 12) {
            this.currentMonth = 1;
            this.currentYear++;
        }
        else {
            this.currentMonth++;
        }
        this.drawCurrent();
    },
    drawPreviousYear: function() {
        this.currentYear--;
        this.drawCurrent();
    },
    drawNextYear: function() {
        this.currentYear++;
        this.drawCurrent();
    }
}

var DateTimeShortcuts = {
    calendars: [],
    calendarInputs: [],
    calendarOnTop: [],
    calendarDivName1: 'calendarbox', // name of calendar <div> that gets toggled
    calendarDivName2: 'calendarin',  // name of <div> that contains calendar
    calendarLinkName: 'calendarlink',// name of the link that is used to toggle

    openCalendar: function(num) {
        var cal_box = document.getElementById(DateTimeShortcuts.calendarDivName1+num)
        var cal_link = document.getElementById(DateTimeShortcuts.calendarLinkName+num)
    
        // Recalculate the clockbox position
        // is it left-to-right or right-to-left layout ?
        if (getStyle(document.body,'direction')!='rtl') {
            if (this.calendarOnTop[num] === true) {
                cal_box.style.left = '17px';
            } else {
                cal_box.style.left = findPosX(cal_link) + 17 + 'px';
            }
        }
        else {
            // since style's width is in em, it'd be tough to calculate
            // px value of it. let's use an estimated px for now
            // TODO: IE returns wrong value for findPosX when in rtl mode
            //       (it returns as it was left aligned), needs to be fixed.
            cal_box.style.left = findPosX(cal_link) - 180 + 'px';
        }
        if (this.calendarOnTop[num] === true) {
            cal_box.style.top = '0px';
        } else {
            cal_box.style.top = findPosY(cal_link) - 75 + 'px';
        }
    
        cal_box.style.display = 'block';
        addEvent(window, 'click', function() { DateTimeShortcuts.dismissCalendar(num); return true; });
    },
    dismissCalendar: function(num) {
        document.getElementById(DateTimeShortcuts.calendarDivName1+num).style.display = 'none';
    },
    drawPrev: function(num) {
        DateTimeShortcuts.calendars[num].drawPreviousMonth();
    },
    drawNext: function(num) {
        DateTimeShortcuts.calendars[num].drawNextMonth();
    },
    handleCalendarCallback: function(num, dateFormat) {
        if (dateFormat == 'french')
            return "function(y, m, d) { var date = new Date(y, m-1, d); DateTimeShortcuts.calendarInputs["+num+"].value = date.getFrenchDate(); document.getElementById(DateTimeShortcuts.calendarDivName1+"+num+").style.display='none'; fireChangeEvent(DateTimeShortcuts.calendarInputs["+num+"]);}";
        else
            return "function(y, m, d) { DateTimeShortcuts.calendarInputs["+num+"].value = y+'-'+m+'-'+d; document.getElementById(DateTimeShortcuts.calendarDivName1+"+num+").style.display='none'; fireChangeEvent(DateTimeShortcuts.calendarInputs["+num+"]);}";
    },
    handleCalendarQuickLink: function(num, offset, dateFormat) {
       var d = new Date();
       d.setDate(d.getDate() + offset)
       if (dateFormat == 'french')
            DateTimeShortcuts.calendarInputs[num].value = d.getFrenchDate();
       else
            DateTimeShortcuts.calendarInputs[num].value = d.getISODate();
       DateTimeShortcuts.dismissCalendar(num);
       fireChangeEvent(DateTimeShortcuts.calendarInputs[num]);
    },
    cancelEventPropagation: function(e) {
        if (!e) e = window.event;
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
    }
}

function fireChangeEvent(element) {
    if (document.createEventObject){
        // dispatch for IE
        var evt = document.createEventObject();
        return element.fireEvent('onchange',evt);
    }
    else{
        // dispatch for firefox + others
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent('change', true, true ); // event type,bubbling,cancelable
        return !element.dispatchEvent(evt);
    }
}


function addCalendar(inp, cssClass, dateFormat, onTop, path_ext, theme_ext) {
    if (undefined === path_ext) path_ext = '';
    if (undefined === theme_ext) theme_ext = '';
    var num = DateTimeShortcuts.calendars.length;

    DateTimeShortcuts.calendarInputs[num] = inp;
    DateTimeShortcuts.calendarOnTop[num] = onTop;

    // Shortcut links (calendar icon and "Today" link)
    var shortcuts_span = document.createElement('span');
    shortcuts_span.setAttribute('class', 'calendarspan');
    inp.parentNode.insertBefore(shortcuts_span, inp.nextSibling);
    var cal_link = document.createElement('a');
    cal_link.setAttribute('href', 'javascript:DateTimeShortcuts.openCalendar(' + num + ');');
    if (cssClass != null){
        // Assume that prototype is used
        Element.extend(cal_link);
        cal_link.addClassName(cssClass);
    } else{
        cal_link.appendChild(document.createTextNode(gettext('Calendar')));
    }
    cal_link.id = DateTimeShortcuts.calendarLinkName + num;
    cal_link.innerHTML = '<img src="'+media_url+theme_ext+'img/' + path_ext + 'icon_date.png" alt="calendrier" />';
    shortcuts_span.appendChild(document.createTextNode('\240'));
    shortcuts_span.appendChild(cal_link);

    // Create calendarbox div.
    //
    // Markup looks like:
    //
    // <div id="calendarbox3" class="calendarbox module">
    //     <h2>
    //           <a href="#" class="link-previous">&lsaquo;</a>
    //           <a href="#" class="link-next">&rsaquo;</a> February 2003
    //     </h2>
    //     <div class="calendar" id="calendarin3">
    //         <!-- (cal) -->
    //     </div>
    //     <div class="calendar-shortcuts">
    //          <a href="#">Yesterday</a> | <a href="#">Today</a> | <a href="#">Tomorrow</a>
    //     </div>
    //     <p class="calendar-cancel"><a href="#">Cancel</a></p>
    // </div>
    var cal_box = document.createElement('div');
    cal_box.style.display = 'none';
    cal_box.style.position = 'absolute';
    cal_box.className = 'calendarbox module';
    cal_box.setAttribute('id', DateTimeShortcuts.calendarDivName1 + num);
    document.body.appendChild(cal_box);
    addEvent(cal_box, 'click', DateTimeShortcuts.cancelEventPropagation);

    // next-prev links
    var cal_nav = quickElement('div', cal_box, '');
    var cal_nav_prev = quickElement('a', cal_nav, '<', 'href', 'javascript:DateTimeShortcuts.drawPrev('+num+');');
    cal_nav_prev.className = 'calendarnav-previous';
    var cal_nav_next = quickElement('a', cal_nav, '>', 'href', 'javascript:DateTimeShortcuts.drawNext('+num+');');
    cal_nav_next.className = 'calendarnav-next';

    // main box
    var cal_main = quickElement('div', cal_box, '', 'id', DateTimeShortcuts.calendarDivName2 + num);
    cal_main.className = 'calendar';
    DateTimeShortcuts.calendars[num] = new Calendar(DateTimeShortcuts.calendarDivName2 + num,
                                                    DateTimeShortcuts.handleCalendarCallback(num, dateFormat));
    DateTimeShortcuts.calendars[num].drawCurrent();

    // calendar shortcuts
    var shortcuts = quickElement('div', cal_box, '');
    shortcuts.className = 'calendar-shortcuts';
    quickElement('a', shortcuts, gettext('Yesterday'), 'href', 'javascript:DateTimeShortcuts.handleCalendarQuickLink(' + num + ', -1, "' +dateFormat+ '");');
    shortcuts.appendChild(document.createTextNode('\240|\240'));
    quickElement('a', shortcuts, gettext('Today'), 'href', 'javascript:DateTimeShortcuts.handleCalendarQuickLink(' + num + ', 0, "' +dateFormat+ '");');
    shortcuts.appendChild(document.createTextNode('\240|\240'));
    quickElement('a', shortcuts, gettext('Tomorrow'), 'href', 'javascript:DateTimeShortcuts.handleCalendarQuickLink(' + num + ', +1, "' +dateFormat+ '");');

    // cancel bar
    var cancel_p = quickElement('p', cal_box, '');
    cancel_p.className = 'calendar-cancel';
    quickElement('a', cancel_p, gettext('Cancel'), 'href', 'javascript:DateTimeShortcuts.dismissCalendar(' + num + ');');
}


