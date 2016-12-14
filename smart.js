//js

// Smart Mirror solution developed by Alan Hill (http://www.zetlanddesign.co.uk).

// weather plugin from http://simpleweatherjs.com/

// example calendar API code from: https://developers.google.com/google-apps/calendar/quickstart/js#prerequisites

// date format from: http://blog.stevenlevithan.com/archives/date-time-format


// Set a global debug bool, allowing easy toggle of debug messages throughout code.
// Use Logger() instead of console.log()
var gDebug = true;

// CHANGEME
// these are the variables that need to change depending on your personal settings - brought out into the top for easier reference...

//weather
var thisLoc = "Gijon"; //set this to wherever you are of course
var thisUnit = "c";  // c (celsius) or f (fahrenheit)
var thisNumDays = 4; // the number of days ahead to look, including today.

// CHANGEME
// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '931066495710-pkadbkb1er332h1o3828i5bm5v69tt33.apps.googleusercontent.com';

// This is the ID of the particular calendar - I think "primary" is the default, but you can change it if you have
// multiple calendars in your Google Account.

var CALENDAR_ID = 'nud2atp591fq35t9vqfp0021a0@group.calendar.google.com';


var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

// The date/time and weather widgets are started from the document.ready, but the calendar code is initiated in the html as an "onload"
// querystring event of the Google API script tag

// It could be changed to start in document.ready, but given this is for personal use, I wasn't worried about
// best practise or performance particularly.

// get an object to store events by date
//
var WeatherList = new Object;

// Logging function to print to
function Logger(message){
	if (gDebug) console.log(message);
	}

$(document).ready(function() {

	// Display the date and time at the top
	//
	startTime();

	// The weather feed:
	// - populates the current weather at the top
	// - creates an array of daily weather forecast items, for use in the calendar rows
	  $.simpleWeather({
    location: thisLoc,
    unit: thisUnit,
    success: function(weather) {
    	console.log(weather);
      html = '<h2><i class="icon-'+weather.code+'"></i> '+weather.temp+'&deg;'+weather.units.temp+'</h2>';
      html += '<ul><li>'+weather.city+', '+weather.region+'</li>';

      for(var i=0;i<thisNumDays;i++) {
        html += '<li class="wide"><i class="icon-'+weather.forecast[i].code+'"></i>'+weather.forecast[i].day+': '+weather.forecast[i].high+' &deg;C</li>';
      }
      html += '</ul>';

      $("#currentWeather").html(html);
    },
    error: function(error) {
      $("#currentWeather").html('<p>'+error+'</p>');
    }
  });


});

    function startTime() {
	    var today = new Date();
	    var h = today.getHours();
	    var m = today.getMinutes();
	    var s = today.getSeconds();
	    m = checkTime(m);
	    s = checkTime(s);
	    document.getElementById('nowtime').innerHTML = h + ":" + m;


		var month = today.getUTCMonth() + 1; //months from 1-12
		var day = today.getUTCDate();
		var year = today.getUTCFullYear();

		if(day<10){
        	day='0'+day
    	}
    	if(month<10){
        	month='0'+month
    	}
		newdate = day + "/" + month;


	    document.getElementById('dateDMY').innerHTML = newdate;

	    var t = setTimeout(startTime, 500);
	}
	function checkTime(i) {
    	if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    	return i;
	}

function checkAuth() {
        gapi.auth.authorize(
          {
            'client_id': CLIENT_ID,
            'scope': SCOPES.join(' '),
            'immediate': true
          }, handleAuthResult);
      }

      /**
       * Handle response from authorization server.
       *
       * @param {Object} authResult Authorization result.
       */
      function handleAuthResult(authResult) {
        var authorizeDiv = document.getElementById('authorize-div');
        if (authResult && !authResult.error) {
          // Hide auth UI, then load client library.
          authorizeDiv.style.display = 'none';
          loadCalendarApi();
        } else {
          // Show auth UI, allowing the user to initiate authorization by
          // clicking authorize button.
          authorizeDiv.style.display = 'inline';
        }
      }

      /**
       * Initiate auth flow in response to user clicking authorize button.
       *
       * @param {Event} event Button click event.
       */
      function handleAuthClick(event) {
        gapi.auth.authorize(
          {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
          handleAuthResult);
        return false;
      }

      /**
       * Load Google Calendar client library. List upcoming events
       * once client library is loaded.
       */
      function loadCalendarApi() {
        gapi.client.load('calendar', 'v3', listUpcomingEvents);
      }

      /**
       * Print the summary and start datetime/date of the next ten events in
       * the authorized user's calendar. If no events are found an
       * appropriate message is printed.
       */
      function listUpcomingEvents() {
        var request = gapi.client.calendar.events.list({
          'calendarId': 'primary',
          'timeMin': (new Date()).toISOString(),
          'showDeleted': false,
          'singleEvents': true,
          'maxResults': 10,
          'orderBy': 'startTime'
        });

        request.execute(function(resp) {
          var events = resp.items;
          appendPre('Upcoming events:');

          if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
              var event = events[i];
              var when = event.start.dateTime;
              if (!when) {
                when = event.start.date;
              }
              appendPre(event.summary + ' (' + when + ')')
            }
          } else {
            appendPre('No upcoming events found.');
          }

        });
      }

      /**
       * Append a pre element to the body containing the given message
       * as its text node.
       *
       * @param {string} message Text to be placed in pre element.
       */
      function appendPre(message) {
        var pre = document.getElementById('output');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
      }
