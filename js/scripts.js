var OPTIONS_KEY = 'options';
var EVENTS_KEY = 'events';
var DB = new PouchDB('events');

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
			'minute': 30
		}
	}
};

// Options storage
var options = {};

// Events storage
var events = {};

$(document).ready(function() {
	var gymTimer = $('#main .gym.timer');
	var drinkTimer = $('#main .drink.timer');

	var eventName = $('#main .event.name');
	var eventTimer = $('#main .event.timer');

	// Count time to gym
	var toGym = function() {
		var next = moment().hour(options.gym.next.hour)
			.minute(options.gym.next.minute)
			.second(options.gym.next.second);
		var current = moment();

		if (next.isBefore(current)) {
			// Add additional day if current is less than next one
			next.add(moment.duration({
				'days' : 1
			}));
		}

		var diff = next.diff(current);
		if (diff < 100) {
			$('.gym.popup').popup('open', {});
		}

		gymTimer.find('.time').html(moment.utc(diff).format('HH:mm:ss'));
	};

	// Count time to drink
	var toDrink = function() {
		var next = moment().minute(options.drink.next.minute);
		var current = moment();

		if (next.isBefore(current)) {
			// Add additional period if current is less than next one
			next.add(moment.duration({
				'minutes': options.drink.next.minute
			}));
		}

		var diff = next.diff(current);
		if (diff < 100) {
			$('.drink.popup').popup('open', {});
		}

		drinkTimer.find('.time').html(moment.utc(diff).format('HH:mm:ss'));
	};

	// Events
	var toEvent = function() {
		if (events.length) {

		} else {
			eventName.find('.text').html('Nothing is scheduled');
			eventTimer.find('.time').html('--:--:--');
		}
	};

	var updateOptions = function() {
		$('#gymTimeInput').val(moment().hour(options.gym.next.hour)
			.minute(options.gym.next.minute)
			.second(options.gym.next.second).format('HH:mm:ss'));
		$('#drinkTimeInput').val(options.drink.next.minute);
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

			// Counters
			setInterval(function() {
				toGym();
				toDrink();
				toEvent();
			}, 1000);
		}
	});

	// Check if options is already in database
	DB.get(EVENTS_KEY, function(err, doc) {
		if (err) {
			console.log('There is errors getting events from PouchDB ...');
		} else {
			options = doc;
		}
	});

	// Trigger options update on page change
	$(document).on('pagecontainerchange', function(event, ui) {
		updateOptions();
	});
});
