---
---

// Explanations for items
var itemExplanations = {
  'national-debt': 'This is the tax revenue allocated to servicing South Africa\'s national debt. It is also the fastest growing item of expenditure in the 2017 budget.',
  'basic-education': 'This department develops, maintains and supports the South African school education system.',
  'local-government-and-housing': 'This department works to facilitate the creation of sustainable human settlements and the improvement to household quality of life.',
  'health': 'This department provides leadership and coordination of health services to promote the health of all people in South Africa.',
  'social-grants': 'This department aims to reduce poverty by providing income support to those in need.',
  'police-services': 'The Police Department works to prevent, combat and investigate crime, maintain public order, and uphold and enforce the law.',
  'economic-infrastructure': 'This department\'s goal is to create income generating opportunities through improved physical infrastructure.',
  'general-public-services': 'This includes expenditure on the Presidency, Parliament, Dept of Home Affairs, Communications, International Relations, Public Service and Administration, and National Treasury.',
  'employment-labour-affairs': 'This department works for you to reduce unemployment, poverty and inequality through pursuing the objectives of productive employment and decent work for all.',
  'higher-education-training': 'This department develops and supports a quality higher education and vocational education sector.',
  'defence-state-security': 'This department defends and protects the Republic of South Africa, its territorial integrity and its people.',
  'law-courts-prisons': 'The focus of this department is to contribute to a just, peaceful and safer South Africa',
  'trade-industry': 'This department works to facilitate access to sustainable economic activity and employment.',
  'agriculture-rural-development-land-reform': 'This category involves the promotion of agricultural, forestry and fisheries resource management, and the creation of equitable and sustainable land dispensation.',
  'science-technology-and-environment': 'This category focuses on realising the full potential of science and technology in social and economic development, and leads South Africa\'s environmental sector to achieve sustainable development.',
  'home-affairs': 'Birth certificates, marriage certificates, ID books, passports, etc',
  'arts-sports-recreation-and-culture': 'This category is for creating an enabling environment in which the arts, culture and sport can play a significant role in nation building and socio-economic development',
  'unallocated-reserves': 'This is the contingency reserve - an amount set aside to accommodate changes in the economic environment as well as unforeseeable expenditure'
}

var cal = null;

function Slugify(str) {
  var $slug = '';
  var trimmed = $.trim(str);
  $slug = trimmed.replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return $slug.toLowerCase();
}

function GetHours(mins) {
  var hours = Math.floor(mins / 60);
  return hours;
}

function GetMinutes(mins) {
  var minutes = Math.floor(mins % 60);
  return minutes;
}

function GetSeconds(mins) {
  var seconds = Math.floor((mins * 60) % 60);
  return seconds;
}

function workingOn(now, items, calc) {
  // of the items in items, what is being worked on now?
  var current = 0,
      next;

  // sort by end time
  items = _.sortBy(items, function(x) {
    return x.valueOf();
  });

  for (var i = 0; i < items.length; i++) {
    if (now.isBefore(items[i].finish_time)) {
      current = i;
      break;
    }
  }

  if (current < items.length) {
    next = items[current + 1];
  }
  current = items[current];

  if (now.isBefore(calc.START_OF_DAY) || now.isAfter(calc.END_OF_DAY)) {
    next = current;
    current = null;
  }

  return [current, next];
}

function checkEmbedLink() {
  if (window.location.search.indexOf('embed-link') > -1) {
    allowEmbedLink();
  }
}

function allowEmbedLink() {
  $('.embed-link').addClass('allowed');
}

function createICS(breakdown) {
  var num_slots = breakdown.length;
  var secondlast_slot_start = breakdown[num_slots - 2].finish_time;
  var end_day = breakdown[num_slots - 1].finish_time;
  cal = icsFormatter();
  cal.addEvent('Working for yourself', 'Every minute from now on, you\'re working for yourself', 'Work', secondlast_slot_start, end_day, 'RRULE:FREQ=DAILY;INTERVAL=1');

  return cal;
}

function downloadICS() {
  ga('send', 'event', 'taxclock', 'ics');
  cal.download();
}

var pymChild = new pym.Child();
checkEmbedLink();

var engaged = false;

var firstLoop = true;
var output;

function incomeChange() {
  var income = parseFloat($('input[name="income"]').val());

  var calc = new IncomeCalculator();

  output = calc.calculateIncomeBreakdown(income);
  cal = createICS(output.breakdown);
  var startTime = calc.START_OF_DAY;

  /* Clear output */
  $('#output-wrapper').hide();

  if (income > 0) {
    $('#output-dayplanner').html('');

    $(output.breakdown).each(function() {
      var breakdown = this;
      $(breakdown).each(function() {

        var name = this.name;
        var slug = Slugify(this.name);
        var finishTime = this.finish_time;
        var taxamount = this.taxpayer_amount;

        var startTimeStr = startTime.format('h:mm a');

        var startHour = startTime.format('H');
        var startMinute = startTime.format('m');
        var startSecond = startTime.format('s');

        var finishHour = finishTime.format('H');
        var finishMinute = finishTime.format('m');
        var finishSecond = finishTime.format('s');

        var mins = this.minutes;
        var hours = GetHours(mins);
        var minutes = GetMinutes(mins);
        var seconds = GetSeconds(mins);

        /* if minutes > 0 and seconds > 30, round up a 1 minute */
        if (minutes > 0 && seconds > 30) {
          minutes = minutes + 1;
          seconds = 0;
        } else if (minutes > 0) {
          seconds = 0;
        }

        var hoursString = "";
        var minutesString = "";
        var secondsString = "";

        if (hours > 0) {
          var hoursString = '<span class="item-hours">' + hours + ' hours </span>';
        }

        if (hours == 1) {
          var hoursString = '<span class="item-hours">' + hours + ' hours </span>';
        }

        if (minutes > 0) {
          var minutesString = '<span class="item-minutes">' + minutes + ' minutes </span>';
        }

        if (minutes == 1) {
          var minutesString = '<span class="item-minutes">' + minutes + ' minute </span>';
        }

        if (seconds > 0) {
          var secondsString = '<span class="item-seconds">' + seconds + ' seconds</span>';
        }

        if (seconds == 1) {
          var secondsString = '<span class="item-seconds">' + seconds + ' seconds</span>';
        }

        var durationDiv = '<div class="item-duration">' + hoursString + minutesString + secondsString + '</div>';

        var rowHeight = Math.floor(mins * 14);
        if (rowHeight > 450) {
          rowHeight = 450;
        }

        'Add a class for small items (under 5 minutes)'
        var smallClass = "";
        if (minutes < 5) {
          smallClass = " item-small";
        }

        $('#output-dayplanner').append('<div class="item planner-item" id="' + slug + '" style="min-height: ' + rowHeight + 'px;" data-starthour="' + startHour + '" data-startminute="' + startMinute + '" data-startsecond="' + startSecond + '" data-finishhour="' + finishHour + '" data-finishminute="' + finishMinute + '" data-finishsecond="' + finishSecond + '"><div class="item-starttime-wrapper"><span class="item-starttime">' + startTimeStr + '</span></div><div class="item-details"><div class="item-name">' + name + '</div><div class="item-duration">' + durationDiv + "</div></div></div>");

        startTime = this.finish_time;
      });
    });

    $('#output-dayplanner').prepend('<div class="item" id="start"><strong>8am</strong> - START OF THE WORK DAY</div>').append('<div class="item" id="end"><strong>5pm</strong> - END OF THE WORK DAY</div>');

    /* update clock */
    function tick() {
      var now = moment();
      $('#clock-now').text(now.format('HH:mm'));

      // draw current-time 'now' line
      $('#output-dayplanner .planner-item').each(function() {

        var startHour = parseInt($(this).attr('data-starthour'));
        var startMinute = parseInt($(this).attr('data-startminute'));
        var startSecond = parseInt($(this).attr('data-startsecond'));

        var startSeconds = (startHour * 60 * 60) + (startMinute * 60) + startSecond;

        var finishHour = parseInt($(this).attr('data-finishhour'));
        var finishMinute = parseInt($(this).attr('data-finishminute'));
        var finishSecond = parseInt($(this).attr('data-finishsecond'));

        var finishSeconds = (finishHour * 60 * 60) + (finishMinute * 60) + finishSecond;

        var nowHour = parseInt(now.format('H'));
        var nowMinute = parseInt(now.format('m'));
        var nowSecond = parseInt(now.format('s'));

        var nowSeconds = (nowHour * 60 * 60) + (nowMinute * 60) + nowSecond;

        if (nowSeconds < finishSeconds && nowSeconds >= startSeconds) {
          elementHeight = $(this).height() - 12;
          topPosition = Math.round((nowSeconds - startSeconds) / (finishSeconds - startSeconds) * elementHeight) + 12;
          $('#now-line').remove();
          $(this).prepend('<div id="now-line" title="' + now.format('hh:mm a') + '" style="top: ' + topPosition + 'px;"><span>Time Now</span></div>');
        }

      });

      // current and next work items
      var pair = workingOn(now, output.breakdown, calc);

      if (pair[0]) {
        $('#clock-next-wrapper, #working-on').show();
        $('#clock-item').show().text(pair[0].name);
      } else {
        $('#clock-next-wrapper, #working-on').hide();
        $('#clock-item').text('Put your feet up, you’ve had a long day working and contributing to the state.');
        // show morning message (after 4 am)

        var nowHour = parseInt(now.format('H'));
        if (nowHour >= 4 && nowHour < 9) {
          $('#clock-item').text('Brace yourself, you have a long day ahead of you.');
        }
      }

      $('#clock-next').text(pair[1] ? pair[1].name : 'End of the workday');

      TC.colors.setSchedule();
    };

    // update it now
    tick();

    if (firstLoop) {
      // update it every 1 second
      setInterval(tick, 1000);
      firstLoop = false;
    }

    // Add explanations
    $('.planner-item').each(function() {
      var itemID = $(this).attr('id');
      var explanation = itemExplanations[itemID];

      var itemHeight = parseInt($(this).css('min-height'));

      if (itemID != 'working-for-yourself') {
        if (itemHeight > 80) {
          $(this).find('.item-details').append('<div class="item-explanation"><span class="what-is-this">?</span> ' + explanation + '</div>');
        } else {
          $(this).find('.item-name').append('<span class="explanation-icon" data-toggle="tooltip" title="' + explanation + '">?</span>');
        }
      }

      // Activate tooltips
      $('[data-toggle="tooltip"]').tooltip();

    });

    /* Show the output */
    $('#output-wrapper').show();
    ga('send', 'event', 'taxclock', 'salary', $('input[name="income"]').val());

    if (!engaged) {
      ga('send', 'event', 'taxclock', 'engaged');
    }
    engaged = true;

    // tell pym to resize
    pymChild.sendHeight();
  } else {
    // TODO: We don't have a footer
    // var footer = $('footer');
    // pymChild.sendMessage("childShrank", footer.offset().top + footer.height());
  }
}

// Check if embedded
if (window != window.top) {
  $('body').addClass('embedded');
} else {
  $('body').addClass('standalone');
}

var pat = new RegExp("embed.html$");

$(function() {

  $('input[name="income"]').on('change keyup', function() {
      incomeChange();
      TC.clock.update();
  });
  
  // If embedded, check change to redirect to website
  $('input[name="income"]').on('change', function() {
    // Check if embedded
    if (pat.test(window.location) || $('body').hasClass("embedded")) {
      var income = $('input[name="income"]').val();
      window.location = "{{ site.url }}/?income=" + income;
    };
  });
  
  
  /* Stupid hack to probably fix size once probably rendered initially */
  // setInterval(function() { pymChild.sendHeight(); }, 1000);
});
