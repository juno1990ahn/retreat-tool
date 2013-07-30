//TODO make config for all rows, format, callbacks

var refreshTable = function() {
	$.ajax({
		type: "GET",
		url: "/v0.1/retreat/registrants",
		success: function(data) {
			console.log(data);
			for (var index in data) {
				var row = data[index];
				var newRow = $('.rt-row-template').clone(true);
				newRow.removeClass('rt-row-template');
				newRow.find('.ln').html(row.LastName);
				newRow.find('.fn').html(row.FirstName);
				newRow.find('.ad').html(row.Address);
				newRow.find('.pn').html('(' + row.PhoneNumber.substring(0,3) + ') ' + row.PhoneNumber.substring(3,6) + ' - ' + row.PhoneNumber.substring(6));
				newRow.find('.ap').html('$' + (row.AmountPaid / 100).toFixed(2));
				newRow.find('.ena').html(row.EmergencyContactName);
				newRow.find('.enu').html('(' + row.EmergencyContactNumber.substring(0,3) + ') ' + row.EmergencyContactNumber.substring(3,6) + ' - ' + row.EmergencyContactNumber.substring(6));
				newRow.find('.le').html(row.LegalSignatureRequired? 'Yes':'No');
				$('.rt-form-table-body').append(newRow);
			}
		},
		error: function(err) {
			$('.rt-alert-retrieve-server-error').slideDown();
		}
	});
};

var clearFields = function() {
	$(':input','.rt-form-add')
		.not(':button, :submit, :reset, :hidden')
		.val('')
		.removeAttr('checked')
		.removeAttr('selected');
};

(function() {
	refreshTable();

	/* Controls nav switches */
	$('.nav li').click(function() {
		var activeTab = $($(this).parent()).children('.nav .active');
		var currentTab = $(this);

		activeTab.removeClass('active');
		currentTab.addClass('active');
	});

	/* Controls for tab body switches */
	$('.rt-nav-data').click(function() {
		$('.rt-form-data').show();
		$('.rt-form-add').hide();
		refreshTable();
	});

	$('.rt-nav-add').click(function() {
		$('.rt-form-data').hide();
		$('.rt-form-add').show();
	});

	$('.rt-form-clear').click(clearFields);

	/* ajax submit for new registrant */
	// TODO: add client side form validation
	$('.rt-form-add-btn').click(function() {
		$('.rt-form-add-btn').button('loading');
		var data = {
			firstName 	: 	$('#first-name').val().trim(),
			lastName	: 	$('#last-name').val().trim(),
			address		: 	$('#address').val().trim(), 
			phoneNumber	: 	$('#phone-number').val().trim(),
			amountPaid	: 	$('#amount-paid').val() * 100,
			emName		: 	$('#em-contact-name').val().trim(),
			emNumber 	: 	$('#em-contact-number').val().trim(),
			under18		: 	$('#under18').is(':checked')?1:0
		};

		$.ajax({
			type: "POST",
			url: "/v0.1/retreat/registrants",
			data: data,
			success: function() {
				$('.rt-alert-add-success').slideDown();
				$('.rt-form-add-btn').button('reset');
				clearFields();
			},
			error: function() {
				$('.rt-alert-add-success').slideDown();
				$('.rt-form-add-btn').button('reset');
			}
		});
	});
})();