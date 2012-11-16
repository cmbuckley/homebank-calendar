$(document).ready(function() {
    var calendar = $('#calendar');

    var colors = [
        '#9a9cff',
        '#f83a22',
        '#16a765',
        '#7bd148',
        '#a47ae2',
        '#ffad46',
        '#4986e7'
    ];

    var assignedColors = {};

    var epoch = new Date(1, 0, 1);
    epoch.setFullYear(1);
    epoch = epoch.getTime();

    function getEvent(operation) {
        var account = operation.attr('account');

        if (!(account in assignedColors)) {
            assignedColors[account] = colors.pop();
        }

        return {
            title: getAmount(operation.attr('amount')) + ' ' + operation.attr('wording'),
            allDay: true,
            start: getDate(operation.attr('date')),
            color: assignedColors[account]
        };
    }

    function getAmount(amount) {
        return '£' + parseFloat(amount).toFixed(2).replace('-', '−');
    }

    function getDate(date) {
        return (epoch + ((date - 1) * 86400000)) / 1000;
    }

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
        var reader = new FileReader();

        var load = function (file) {
            return function (event) {
                var doc = $($.parseXML(event.target.result));
                doc.find('ope').each(function (i, operation) {
                    var operation = $(operation);
                    if (operation.attr('date') > 734700) {
                        calendar.fullCalendar('renderEvent', getEvent(operation), true);
                    }
                });

                var list = '<ul>';

                doc.find('account').each(function (i, account) {
                    var account = $(account);
                    if (assignedColors.hasOwnProperty(account.attr('key'))) {
                        list += '<li class=cat><i class=icon style="background-color: '
                            + assignedColors[account.attr('key')] + '" /> '
                            + account.attr('name') + '</li>';
                    }
                });

                list += '</ul>';

                console.log(list);
                $('#nav').append(list);
            };
        };

        $.each(input[0].files, function (i, file) {
            if (file.type === 'application/x-homebank') {
                reader.onload = load(file);
                reader.readAsText(file, 'utf8');
            }
        });
    });
});
