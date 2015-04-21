var options = {
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

$(document).ready(function() {
	var gymTimer = $('.gym.timer');
	var drinkTimer = $('.drink.timer');

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

		gymTimer.find('.time').html(moment.utc(next.diff(current)).format("HH:mm:ss"));
	};

	// Count time to drink
	var toDrink = function() {
		var next = moment().minute(options.drink.next.minute)
			.second(options.drink.next.second);
		var current = moment();

		if (next.isBefore(current)) {
			// Add additional period if current is less than next one
			next.add(moment.duration({
				'minutes': options.drink.next.minute,
				'seconds': options.drink.next.second
			}));
		}

		drinkTimer.find('.time').html(moment.utc(next.diff(current)).format("HH:mm:ss"));
	};

	// Counters
	setInterval(function() {
		toGym();
		toDrink();
	}, 1000);
});
