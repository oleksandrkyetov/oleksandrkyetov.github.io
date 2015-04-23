var OPTIONS_KEY = 'options';
var EVENTS_KEY = 'events';
var DB = new PouchDB('events');
var INTERVAL = -1;

// Default options
var OPTIONS = {
	'_id': OPTIONS_KEY,
	'gym': {
		'next': {
			'hour': 19,
			'minute': 0,
			'second': 0
		}
	},
	'drink': {
		'next': {
			'minute': 30,
			'second': 0
		}
	}
};

// Default events
var EVENTS = {
	'_id': EVENTS_KEY,
	'items': []
};

// Options
var options = {};

// Events
var events = [];

$(document).ready(function() {
	var saveOptionsLink = $('#saveOptionsLink');
	var gymTimeInput = $('#gymTimeInput');
	var drinkTimeInput = $('#drinkTimeInput');

	var saveSuccessPopup = $('.save.success.popup');
	var saveFailPopup = $('.save.fail.popup');

	var addEventLink = $('#addEventLink');
	var eventNameInput = $('#eventNameInput');
	var eventDateInput = $('#eventDateInput');

	var addSuccessPopup = $('.add.success.popup');
	var addFailPopup = $('.add.fail.popup');

	var gymTimer = $('#main .gym.timer');
	var drinkTimer = $('#main .drink.timer');
	var timersPopup = $('.timers.popup');

	var eventName = $('#main .event.name');
	var eventTimer = $('#main .event.timer');

	var eventsHolder = $('#eventsHolder');
	var eventTemplate = $('#eventTemplate');

	var toEvent = function() {
		/*
		if (events.items && events.items.length) {
			eventName.find('.name').html(events.items[0].name);
			eventTimer.find('.date').html(moment(events.items[0].date).format('MM-DD-YYYY HH:mm:ss'));
		} else {
			eventName.find('.name').html('Nothing is scheduled yet ...');
			eventTimer.find('.date').html('--:--:--');
		}
		*/
	};

	var toDo = function() {
		var timersPopupMessage = timersPopup.find('span');
		timersPopupMessage.html('');

		var current = moment();
		var nextGym = moment().hour(options.gym.next.hour)
			.minute(options.gym.next.minute)
			.second(options.gym.next.second);
		var nextDrink = moment()
			.minute(options.drink.next.minute)
			.second(options.gym.next.second);

		while (nextGym.isBefore(current)) {
			// Add additional day if current is less than next one
			nextGym.add(moment.duration({
				'days' : 1
			}));
		}

		while (nextDrink.isBefore(current)) {
			// Add additional period if current is less than next one
			nextDrink.add(moment.duration({
				'minutes': options.drink.next.minute
			}));
		}

		var diffGym = nextGym.diff(current);
		if (diffGym < 100) {
			timersPopupMessage.html(timersPopupMessage.html() + '<div>It is time to go to the Gym</div>');
		}

		var diffDrink = nextDrink.diff(current);
		if (diffDrink < 100) {
			timersPopupMessage.html(timersPopupMessage.html() + '<div>It is time to drink</div>');
		}

		if (events.items && events.items.length) {
			var nextEvent = moment(events.items[0].date);
			var diffEventDays = nextEvent.diff(current, 'days');

			eventName.find('.name').html(events.items[0].name + ' in');

			if (diffEventDays) {
				eventTimer.find('.date').html(diffEventDays + ' Days');
			} else {
				var diffEvent = nextEvent.diff(current);
				if (diffEvent < 100) {
					timersPopupMessage.html(timersPopupMessage.html() + '<div>It is time for ' + events.items[0].name + '</div>');

					// Filter events (remove events in the past)
					events.items = events.items.filter(function(event) {
						return moment(event.date).isAfter(moment());
					});
				}

				eventTimer.find('.date').html(moment.utc(diffEvent).format('HH:mm:ss'));
			}
		} else {
			eventName.find('.name').html('Nothing is scheduled yet ...');
			eventTimer.find('.date').html('--:--:--');
		}

		gymTimer.find('.time').html(moment.utc(diffGym).format('HH:mm:ss'));
		drinkTimer.find('.time').html(moment.utc(diffDrink).format('HH:mm:ss'));

		if (timersPopupMessage.html().length) {
			timersPopup.popup('open', {});
			clearInterval(INTERVAL);
		}
	};

	var count = function() {
		// Counters
		INTERVAL = setInterval(function() {
			toDo();
			toEvent();
		}, 1000);
	};

	var updateOptions = function() {
		gymTimeInput.val(moment().hour(options.gym.next.hour)
			.minute(options.gym.next.minute)
			.second(options.gym.next.second).format('HH:mm:ss'));
		drinkTimeInput.val(options.drink.next.minute);
	};

	var updateEvens = function() {
		// Clear children
		eventsHolder.children().remove();

		// Add children
		if (events.items && events.items.length) {
			events.items.forEach(function(item) {
				var event = eventTemplate.children().clone();
				event.find('.name').html(item.name);
				event.find('.date').html(moment(item.date).format('MM-DD-YYYY HH:mm:ss'));
				event.appendTo(eventsHolder);
			});
		} else {
			var event = eventTemplate.children().clone();
			event.find('.name').html('Nothing is scheduled yet ...');
			event.find('.date').html('MM-DD-YYYY HH:mm:ss');
			event.appendTo(eventsHolder);
		}
	};

	// Check if options is already in database
	DB.get(OPTIONS_KEY, function(err, doc) {
		if (err) {
			console.log('There is errors getting options from PouchDB ...');

			// Put default options in database
			DB.put(OPTIONS, function callback(err, doc) {
				if (err) {
					console.log('There is errors storing options to PouchDB ...');
				}
				options = OPTIONS;
			});
		} else {
			options = doc;

			// Trigger options update
			updateOptions();

			// Trigger options update on page change
			$(document).on('pagecontainerchange', function(event, ui) {
				updateOptions();
			});

			// Start timers
			count();
		}
	});

	// Check if options is already in database
	DB.get(EVENTS_KEY, function(err, doc) {
		if (err) {
			console.log('There is errors getting events from PouchDB ...');

			// Put default options in database
			DB.put(EVENTS, function callback(err, doc) {
				if (err) {
					console.log('There is errors storing options to PouchDB ...');
				}
				events = EVENTS;
			});
		} else {
			events = doc;

			// Filter events (remove events in the past)
			events.items = events.items.filter(function(event) {
				return moment(event.date).isAfter(moment());
			});

			// Sort events
			events.items.sort(function(event1, event2) {
				return moment(event1.date).isAfter(moment(event2.date));
			});

			// Trigger events update
			updateEvens();

			// Trigger events update on page change
			$(document).on('pagecontainerchange', function(event, ui) {
				updateEvens();
			});
		}
	});

	// Save entered data on click
	saveOptionsLink.on('click', function() {
		if (!moment(gymTimeInput.val(), 'HH:mm:ss', true).isValid()) {
			saveFailPopup.find('span').html('Gym time format is incorrect ...');
			saveFailPopup.popup('open', {});
			return;
		}

		if (!moment(drinkTimeInput.val(), 'mm', true).isValid() && !moment(drinkTimeInput.val(), 'm', true).isValid()) {
			saveFailPopup.find('span').html('Drink time format is incorrect ...');
			saveFailPopup.popup('open', {});
			return;
		}

		var gymTimeVal = moment(gymTimeInput.val(), 'HH:mm:ss');
		options.gym.next = {
			'hour': gymTimeVal.hour(),
			'minute': gymTimeVal.minute(),
			'second': gymTimeVal.second()
		};
		var drinkMinuteVal = moment(drinkTimeInput.val(), 'mm');
		options.drink.next = {
			'minute': drinkMinuteVal.minute()
		};

		// Update options
		DB.put(options, function callback(err, doc) {
			if (err) {
				saveFailPopup.find('span').html('Error when store options ...');
				saveFailPopup.popup('open', {});
			} else {
				// Update document revision
				options._rev = doc.rev;

				saveSuccessPopup.popup('open', {});
			}
		});
	});

	addEventLink.on('click', function() {
		if (!eventNameInput.val().length) {
			addFailPopup.find('span').html('Event name cannot be blank ...');
			addFailPopup.popup('open', {});
			return;
		}

		if (!moment(eventDateInput.val(), 'MM-DD-YYYY HH:mm:ss', true).isValid()) {
			addFailPopup.find('span').html('Event date format is incorrect ...');
			addFailPopup.popup('open', {});
			return;
		}

		if (moment(eventDateInput.val(), 'MM-DD-YYYY HH:mm:ss').isBefore(moment())) {
			addFailPopup.find('span').html('Event date cannot be in the past ...');
			addFailPopup.popup('open', {});
			return;
		}

		var eventDateVal = moment(eventDateInput.val(), 'MM-DD-YYYY HH:mm:ss');
		// Add event to the list of events
		events.items.push({
			'name': eventNameInput.val(),
			'date': eventDateVal.toDate()
		});

		// Filter events (remove events in the past)
		events.items = events.items.filter(function(event) {
			return moment(event.date).isAfter(moment());
		});

		// Sort events
		events.items.sort(function(event1, event2) {
			return moment(event1.date).isAfter(moment(event2.date));
		});

		// Update events
		DB.put(events, function callback(err, doc) {
			if (err) {
				addFailPopup.find('span').html('Error when store events ...');
				addFailPopup.popup('open', {});
			} else {
				// Update document revision
				events._rev = doc.rev;

				// Clear values
				eventNameInput.val('');
				eventDateInput.val('');

				// Update events list on update
				updateEvens();
				addSuccessPopup.popup('open', {});
			}
		});
	});

	// Resume count on popup close
	$(document).find('.timers').on('popupafterclose', function() {
		count();
	});
});
