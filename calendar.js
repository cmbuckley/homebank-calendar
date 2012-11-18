$(document).ready(function() {
    function HomeBank(file, calendar) {
        var reader = new FileReader();
        reader.onload = this.onload.bind(this);
        reader.readAsText(file, 'utf8');

        this.calendar = calendar;
        this.events = {};
        this.assignedColors = {};
        this.eventColors = [
            '#fbe983', '#92e1c0', '#9fe1e7', '#cabdbf', '#fad165',
            '#7bd148', '#b3dc6c', '#d06b64', '#fa573c', '#ff7537',
            '#ffad46', '#9fc6e7', '#b99aff', '#cca6ac', '#42d692',
            '#9fc6e7', '#f691b2', '#cd74e6', '#16a765', '#a47ae2',
            '#9a9cff', '#f83a22', '#4986e7'
        ];
    }

    HomeBank.prototype.onload = function (event) {
        var doc = $($.parseXML(event.target.result));
        doc.find('ope').each(this.parseOperation.bind(this));
        console.log('yep');
        this.calendar.fullCalendar('addEventSource', this.getEvents.bind(this));

        var list = '<ul>';

        doc.find('account').each(function (i, account) {
            var account = $(account);
            if (!(account.attr('flags') & 2) && this.assignedColors.hasOwnProperty(account.attr('key'))) {
                list += '<li class=cat><i class=icon style="background-color: '
                    + this.assignedColors[account.attr('key')] + '" /> '
                    + account.attr('name') + '</li>';
            }
        }.bind(this));

        list += '</ul>';
        $('#nav').append(list);
    };

    HomeBank.prototype.parseOperation = function (i, operation) {
        var operation = $(operation);
        var date = operation.attr('date');

        if (!(date in this.events)) {
            this.events[date] = [];
        }

        this.events[date].push({
            title: this.getAmount(operation.attr('amount')) + ' ' + operation.attr('wording'),
            start: this.getDate(operation.attr('date')) / 1000,
            color: this.getColor(operation)
        });
    };

    HomeBank.prototype.getAmount = function (amount) {
        return '£' + parseFloat(amount).toFixed(2).replace('-', '−');
    };

    HomeBank.prototype.getDate = function (key) {
        if (!this.epoch) {
            var epoch = new Date(1, 0, 1);
            epoch.setFullYear(1);
            this.epoch = epoch.getTime();
        }

        return (this.epoch + ((key - 1) * 86400000));
    };

    HomeBank.prototype.getColor = function (operation) {
        var account = operation.attr('account');

        if (!(account in this.assignedColors)) {
            this.assignedColors[account] = this.eventColors.pop();
            console.log(account, this.assignedColors[account]);
        }

        return this.assignedColors[account];
    };

    HomeBank.prototype.getEvents = function (start, end, callback) {
        var events = [];

        $.each(this.events, function (key, dayEvents) {
            if (this.showDay(key, start, end)) {
                events = $.merge(events, dayEvents);
            }
        }.bind(this));

        console.log(events);
        callback(events);
    };

    HomeBank.prototype.showDay = function (key, start, end) {
        var date = this.getDate(key);
        return (date >= start.getTime() && date <= end.getTime());
    };

    var calendar = $('#calendar');

    calendar.fullCalendar({
        theme: true,
        header: {
            left: 'today prev,next',
            center: 'title',
            right: 'agendaDay,agendaWeek,month'
        },
        editable: false,
        firstDay: 1,
        windowResize: function (view) {
            var header = view.element.parents('.fc').find('.fc-header');
            calendar.fullCalendar('option', 'height', $(window).height() - header.height());
        },
        height: 900
    });

    $('#file button').file().choose(function (e, input) {
        $.each(input[0].files, function (i, file) {
            if (/.xhb$/.test(file.name)) {
                new HomeBank(file, calendar);
            }
        });
    });
});
