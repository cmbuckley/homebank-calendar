$(document).ready(function() {
    function HomeBank(file, calendar) {
        var reader = new FileReader();
        reader.onload = this.onload.bind(this);
        reader.readAsText(file, 'utf8');

        this.calendar = calendar;
        this.events = {};
        this.colors = {};
    }

    HomeBank.prototype.onload = function (event) {
        var doc = $($.parseXML(event.target.result));

        var list = '<ul>';
        var accounts = doc.find('account');
        accounts.each(function (i, account) {
            var account = $(account);
            list += '<li class=cat><i class=icon style="background-color: '
                + this.assignColor(accounts.length, i + 1, account.attr('key')) + '" /> '
                + account.attr('name') + '</li>';
        }.bind(this));

        list += '</ul>';
        $('#nav').append(list);

        doc.find('ope').each(this.parseOperation.bind(this));
        this.calendar.fullCalendar('addEventSource', this.getEvents.bind(this));
    };

    // Adapted from http://stackoverflow.com/a/7419630/283078
    HomeBank.prototype.assignColor = function (total, current, key) {
        var r, g, b;
        var h = current / total;
        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var q = 1 - f;

        switch (i % 6) {
            case 0: r = 1, g = f, b = 0; break;
            case 1: r = q, g = 1, b = 0; break;
            case 2: r = 0, g = 1, b = f; break;
            case 3: r = 0, g = q, b = 1; break;
            case 4: r = f, g = 0, b = 1; break;
            case 5: r = 1, g = 0, b = q; break;
        }

        var color = '#' + ('00' + (Math.floor(r * 175) + 80).toString(16)).slice(-2)
                        + ('00' + (Math.floor(g * 175) + 80).toString(16)).slice(-2)
                        + ('00' + (Math.floor(b * 175) + 80).toString(16)).slice(-2);

        this.colors[key] = color;
        return color;
    };

    HomeBank.prototype.parseOperation = function (i, operation) {
        var operation = $(operation);
        var date = operation.attr('date');

        if (!(date in this.events)) {
            this.events[date] = [];
        }

        this.events[date].push({
            title:     this.getAmount(operation.attr('amount')) + ' ' + operation.attr('wording'),
            start:     this.getDate(operation.attr('date')) / 1000,
            color:     this.colors[operation.attr('account')],
            textColor: 'black'
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

    HomeBank.prototype.getEvents = function (start, end, callback) {
        var events = [];

        $.each(this.events, function (key, dayEvents) {
            if (this.showDay(key, start, end)) {
                events = $.merge(events, dayEvents);
            }
        }.bind(this));

        callback(events);
    };

    HomeBank.prototype.showDay = function (key, start, end) {
        var date = this.getDate(key);
        return (date >= start.getTime() && date <= end.getTime());
    };

    var calendar = $('#calendar');

    calendar.fullCalendar({
        header: {
            left: 'today prev,next',
            center: 'title',
            right: ''
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
