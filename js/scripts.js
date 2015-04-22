var OPTIONS_KEY = 'options';
var EVENTS_KEY = 'events';
var DB = new PouchDB('events');
var INTERVAL = -1;

// Default options
var OPTIONS = {
	'_id': 'options',
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

// Options storage
var options = {};

// Events storage
var events = {};

$(document).ready(function() {
	var saveOptionsLink = $('#saveOptionsLink');
	var gymTimeInput = $('#gymTimeInput');
	var drinkTimeInput = $('#drinkTimeInput');
	var saveSuccessPopup = $('.save.success.popup');
	var saveFailPopup = $('.save.fail.popup');
	var timersPopup = $('.timers.popup');

	var gymTimer = $('#main .gym.timer');
	var drinkTimer = $('#main .drink.timer');

	var eventName = $('#main .event.name');
	var eventTimer = $('#main .event.timer');

	// Events
	var toEvent = function() {
		if (events.length) {

		} else {
			eventName.find('.text').html('Nothing is scheduled yet ...');
			eventTimer.find('.time').html('--:--:--');
		}
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

		if (nextGym.isBefore(current)) {
			// Add additional day if current is less than next one
			nextGym.add(moment.duration({
				'days' : 1
			}));
		}

		if (nextDrink.isBefore(current)) {
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

		gymTimer.find('.time').html(moment.utc(diffGym).format('HH:mm:ss'));
		drinkTimer.find('.time').html(moment.utc(diffDrink).format('HH:mm:ss'));

		if (timersPopupMessage.html().length > 0) {
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

			// Start timers
			count();
		}
	});

	// Check if options is already in database
	DB.get(EVENTS_KEY, function(err, doc) {
		if (err) {
			console.log('There is errors getting events from PouchDB ...');
		} else {
			events = doc;
		}
	});

	// Save entered data on click
	saveOptionsLink.on('click', function() {
		if (!moment(gymTimeInput.val(), 'HH:mm:ss', true).isValid()) {
			saveFailPopup.find('span').html('Gym time format is incorrect ...');
			saveFailPopup.popup('open', {});
			return;
		}

		if (!moment(drinkTimeInput.val(), 'mm', true).isValid()) {
			saveFailPopup.find('span').html('Drink time format is incorrect ...');
			saveFailPopup.popup('open', {});
			return;
		}

		var gymVal = moment(gymTimeInput.val(), 'HH:mm:ss');
		options.gym.next = {
			'hour': gymVal.hour(),
			'minute': gymVal.minute(),
			'second': gymVal.second()
		};
		var drinkVal = moment(drinkTimeInput.val(), 'mm');
		options.drink.next = {
			'minute': drinkVal.minute()
		};

		// Save options
		DB.put(options, function callback(err, doc) {
			if (err) {
				saveFailPopup.find('span').html('Error when store options ...');
				saveFailPopup.popup('open', {});
			}

			// Update document revision
			options._rev = doc.rev;
			saveSuccessPopup.popup('open', {});
		});
	});

	// Trigger options update on page change
	$(document).on('pagecontainerchange', function(event, ui) {
		updateOptions();
	});

	// Resume count on popup close
	$(document).find('.timers').on('popupafterclose', function() {
		count();
	});
});
