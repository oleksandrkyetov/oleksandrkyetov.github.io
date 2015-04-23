var OPTIONS_KEY = 'options';
var LOGGED_KEY = 'logged';
var FOOD_KEY = 'food';
var DB = new PouchDB('calculator');
//DB.destroy();

// Default options
var OPTIONS = {
	'_id': OPTIONS_KEY,
	'???': {}
};

// Default logged food
var LOGGED = {
	'_id': LOGGED_KEY,
	'items': []
};

// Default food database
var FOOD = {
	'_id': FOOD_KEY,
	'items': []
};

// Options
var options = {};

// Logged food
var logged = [];

// Database food
var food = [];

$(document).ready(function() {
	var logsHolder = $('#logsHolder');
	var logTemplate = $('#logTemplate');
	var logTemplateFailure = $('#logTemplateFailure');
	var logAddLink = $('#logAddLink');
	var logFoodNameSelect = $('#logFoodNameSelect');
	var logFoodNameSpan = $('#logFoodNameSpan');
	var logFoodDateInput = $('#logFoodDateInput');
	var logFoodTimeInput = $('#logFoodTimeInput');
	var foodLogPopupSuccess = $('.food.log.popup.success');
	var foodLogPopupFail = $('.food.log.popup.fail');

	var foodHolder = $('#foodHolder');
	var foodTemplate = $('#foodTemplate');
	var foodTemplateFailure = $('#foodTemplateFailure');
	var foodAddLink = $('#foodAddLink');
	var foodNameInput = $('#foodNameInput');
	var foodCaloriesInput = $('#foodCaloriesInput');
	var foodAddPopupSuccess = $('.food.add.popup.success');
	var foodAddPopupFail = $('.food.add.popup.fail');

	var weightInput = $('#weightInput');
	var heightInput = $('#heightInput');
	var calculateLink = $('#calculateLink');
	var bmiPopupSuccess = $('.bmi.popup.success');
	var bmiPopupFail = $('.bmi.popup.fail');
	var bmiSpan = $('#bmiSpan');

	var updateLogSelect = function() {
		logFoodNameSelect.children().remove();

		if (food.items && food.items.length) {
			logFoodNameSelect.closest('.ui-select').removeClass('hidden');
			logFoodNameSpan.addClass('hidden');

			logFoodNameSelect.append('<option class="readonly">Select food from list ...</option>', {});
			food.items.forEach(function(item) {
				logFoodNameSelect.append('<option>' + item.name + '</option>', {});
			});

			logFoodNameSelect.trigger('change');
		} else {
			logFoodNameSelect.closest('.ui-select').addClass('hidden');
			logFoodNameSpan.removeClass('hidden');
		}
	};

	var updateLogItems = function() {
		// Clear children
		logsHolder.children().remove();

		// Add children
		if (logged.items && logged.items.length) {
			logged.items.forEach(function(item) {
				var logItem = logTemplate.children().clone();
				logItem.find('.name').html(item.name);
				logItem.find('.dateTime').html(moment(item.dateTime).format('MM-DD-YYYY HH:mm'));
				logItem.appendTo(logsHolder);
			});
		} else {
			var logItem = logTemplateFailure.children().clone();
			logItem.html('Nothing is logged yet ...');
			logItem.appendTo(logsHolder);
		}
	};

	var updateFoodItems = function() {
		// Clear children
		foodHolder.children().remove();

		// Add children
		if (food.items && food.items.length) {
			food.items.forEach(function(item) {
				var foodItem = foodTemplate.children().clone();
				foodItem.find('.name').html(item.name);
				foodItem.find('.calories').html(item.calories);
				foodItem.appendTo(foodHolder);
			});
		} else {
			var foodItem = foodTemplateFailure.children().clone();
			foodItem.html('Nothing is added yet ...');
			foodItem.appendTo(foodHolder);
		}
	};

	logAddLink.on('click', function() {
		if (!logFoodNameSelect.find('option:selected').index()) {
			foodLogPopupFail.find('span').html('Select food please ...');
			foodLogPopupFail.popup('open', {});
			return;
		}

		if (!logFoodDateInput.val().length && !moment(logFoodDateInput.val(), 'MM-DD-YYY', true).isValid()) {
			foodLogPopupFail.find('span').html('Date format is invalid ...');
			foodLogPopupFail.popup('open', {});
			return;
		}

		if (!logFoodTimeInput.val().length && !moment(logFoodTimeInput.val(), 'HH:mm', true).isValid()) {
			foodLogPopupFail.find('span').html('Food name cannot be blank ...');
			foodLogPopupFail.popup('open', {});
			return;
		}

		// Get dates
		var logFoodDateTimeVal = moment(logFoodDateInput.val() + ' ' + logFoodTimeInput.val(), 'MM-DD-YYYY HH:mm');
		// Update logged food object
		logged.items.push({
			'name': logFoodNameSelect.val(),
			'dateTime': logFoodDateTimeVal.toDate()
		});

		// Update food
		DB.put(logged, function callback(err, doc) {
			if (err) {
				foodLogPopupFail.find('span').html('Error when log food ...');
				foodLogPopupFail.popup('open', {});
			} else {
				// Update document revision
				logged._rev = doc.rev;

				// Sort logged food
				logged.items.sort(function(logged1, logged2) {
					return moment(logged1.dateTime).isBefore(moment(logged2.dateTime));
				});

				// Clear values
				logFoodNameSelect.find('option:selected').prop('selected', false);
				logFoodNameSelect.find('option:first').prop('selected', 'selected');
				logFoodNameSelect.trigger('change');

				logFoodDateInput.trigger('datebox', {'method':'set', 'value': moment().toDate()});
				logFoodTimeInput.trigger('datebox', {'method':'set', 'value': moment().toDate()});

				// Update corresponding data on success
				updateLogItems();

				// Success popup
				foodLogPopupSuccess.popup('open', {});
			}
		});
	});

	foodAddLink.on('click', function() {
		if (!foodNameInput.val().length) {
			foodAddPopupFail.find('span').html('Food name cannot be blank ...');
			foodAddPopupFail.popup('open', {});
			return;
		}

		if (!foodCaloriesInput.val().length) {
			foodAddPopupFail.find('span').html('Food calories cannot be blank ...');
			foodAddPopupFail.popup('open', {});
			return;
		}

		// Update food object
		food.items.push({
			'name': foodNameInput.val(),
			'calories': foodCaloriesInput.val()
		});

		// Update food
		DB.put(food, function callback(err, doc) {
			if (err) {
				foodAddPopupFail.find('span').html('Error when store food ...');
				foodAddPopupFail.popup('open', {});
			} else {
				// Update document revision
				food._rev = doc.rev;

				// Sort food
				food.items.sort(function(food1, food2) {
					return food1.name > food2.name;
				});

				// Clear values
				foodNameInput.val('');
				foodCaloriesInput.val('');

				// Update corresponding data on success
				updateLogSelect();
				updateFoodItems();

				// Success popup
				foodAddPopupSuccess.popup('open', {});
			}
		});
	});

	calculateLink.on('click', function() {
		if (!weightInput.val().length || !$.isNumeric(weightInput.val()) || weightInput.val() < 0) {
			bmiPopupFail.find('span').html('Weight should be greater than 0 ...');
			bmiPopupFail.popup('open', {});
			return;
		}

		if (!heightInput.val().length || !$.isNumeric(heightInput.val()) || heightInput.val() < 0) {
			bmiPopupFail.find('span').html('Height should be greater than 0 ...');
			bmiPopupFail.popup('open', {});
			return;
		}

		var result = {};
		var weight = weightInput.val();
		var height = heightInput.val();

		result.index = weight / (height / 100 * height / 100);
		if(result.index < 18.5){
			result.message = 'You are too thin';
			result.conclusion = false;
		}
		if(result.index > 18.5 && result.index < 25){
			result.message = "You are healthy";
			result.conclusion = true;
		}
		if(result.index > 25){
			result.message = "You are overweight";
			result.conclusion = false;
		}

		bmiSpan.html('Your BMI index is ' + result.index.toFixed(5));
		bmiSpan.parent().removeClass('hidden');

		if (result.conclusion) {
			bmiPopupSuccess.find('span').html(result.message);
			bmiPopupSuccess.popup('open', {});
		} else {
			bmiPopupFail.find('span').html(result.message);
			bmiPopupFail.popup('open', {});
		}
	});

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
			//options = doc;
		}
	});

	// Check if logged food is already in database
	DB.get(LOGGED_KEY, function(err, doc) {
		if (err) {
			console.log('There is errors getting events from PouchDB ...');

			// Put default options in database
			DB.put(LOGGED, function callback(err, doc) {
				if (err) {
					console.log('There is errors storing options to PouchDB ...');
				}
				logged = LOGGED;
			});
		} else {
			logged = doc;

			// Sort logged food
			logged.items.sort(function(logged1, logged2) {
				return moment(logged1.dateTime).isBefore(moment(logged2.dateTime));
			});

			updateLogItems();
		}
	});

	// Check if database food is already in database
	DB.get(FOOD_KEY, function(err, doc) {
		if (err) {
			console.log('There is errors getting events from PouchDB ...');

			// Put default options in database
			DB.put(FOOD, function callback(err, doc) {
				if (err) {
					console.log('There is errors storing options to PouchDB ...');
				}
				food = FOOD;
			});
		} else {
			food = doc;

			// Sort food
			food.items.sort(function(food1, food2) {
				return food1.name > food2.name;
			});

			updateLogSelect();
			updateFoodItems();
		}
	});

	/*
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
	*/
});
