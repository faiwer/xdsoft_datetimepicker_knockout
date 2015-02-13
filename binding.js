var isMobile = false;
var lang = 'ru';
var i18n = {kz:
	{
		months: ['Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Май', 'Маусым', 'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан'],
		dayOfWeek: ['Жек', 'Дүй', 'Сей', 'Сәр', 'Бей', 'Жұм', 'Сен', 'Жек']
	}};
var parseDate = function(value) // example
{
	if(_.isDate(value))
		return value;
	if(_.isEmpty(value))
		return;
	if(!_.isString(value))
		return NaN;

	if(value[value.length - 1] === 'Z')
		return new Date(value); // UTC

	if(value.match(/^\d\d\.\d\d\.\d\d\d\d$/))
	{
		var p = value.split('.');
		return new Date(p[2], p[1]-1, p[0]);
	}

	if(value.match(/^\d\d\d\d-\d\d\-\d\d(?:T.*)?$/))
	{
		p = value.substr(0,10).split('-');
		return new Date(p[0], p[1]-1, p[2]);
	}

	return NaN;
};

/**
 * @author Faiwer
 * @description xdsoft DateTimePicker knockout.js binding
 */
(function() // date binding xdSoft
{
	ko.bindingHandlers.date =
	{
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext)
		{
			var $el = $(element);
			var params = ko.unwrap(valueAccessor());
			if(!_.isObject(params))
				params = {value: valueAccessor};

			if(isMobile)
			{
				if(element.type !== 'date')
					element.type = 'date';
				ko.bindingHandlers.value.init(element, _.constant(params.value), allBindingsAccessor, viewModel, bindingContext);
				return;
			}

			var time = !!params.time;
			var date = ('date' in params) ? params.date : true;
			var format = params.format || (date && time ? 'd.m.Y H:i' : (date ? 'd.m.Y' : 'H:i'));

			var cfg =
			{
				lang:           lang,
				timepicker:     time,
				datepicker:     date,
				format:         format,
				inline:         !!params.inline,
				mask:           !!params.mask,
				defaultSelect:  !!params.defaultSelect,
				allowBlank:     'allowBlank' in params ? params.allowBlank : true,
				value:          ko.unwrap(params.value),
				dayOfWeekStart: params.dayOfWeekStart || 1, // monday
				i18n:           i18n,
				scrollMonth:    !params.inline
			}
			$el.datetimepicker(cfg);

			if(ko.isObservable(params.value))
				var valueUpdate = params.value.subscribe(function(newValue)
				{
					if(!newValue)
						$el.datetimepicker('reset');
					newValue = parseDate(newValue);
					$el.datetimepicker({value: newValue});
				});

			$el.change(function()
				{
					var v = parseDate($el.val());
					params.value(v);
				});

			ko.utils.domNodeDisposal.addDisposeCallback(element, function()
			{
				$el.datetimepicker('destroy');
				if(valueUpdate)
				{
					valueUpdate.dispose();
					valueUpdate = null;
				}
			});

			if(ko.bindingHandlers.validationCore) // ko-validation
				ko.bindingHandlers.validationCore.init(element, _.constant(params.value), allBindingsAccessor,
					viewModel, bindingContext);
		}
	};
})();