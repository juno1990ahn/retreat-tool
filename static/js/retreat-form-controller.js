// TODO make config for all rows, format, callbacks
// sort rows
// edit rows
// fix alerts not showing up second time
// handle client side empty fields
// for deleting, give a are u sure dialog

var refreshTable = function() {
	$('.rt-form-table-row').remove();
	$.ajax({
		type: "GET",
		url: "/v0.1/retreat/registrants",
		success: function(data) {
			for (var index in data) {
				var row = data[index];
				var newRow = $('.rt-row-template').clone(true);
				newRow.removeClass('rt-row-template');
				newRow.addClass('rt-form-table-row');
				newRow.find('.ln').html(row.lastname);
				newRow.find('.fn').html(row.firstname);
				newRow.find('.ad').html(row.address);
				newRow.find('.pn').html('(' + row.phonenumber.substring(0,3) + ') ' + row.phonenumber.substring(3,6) + ' - ' + row.phonenumber.substring(6));
				newRow.find('.ap').html('$' + (row.amountpaid / 100).toFixed(2));
				newRow.find('.ena').html(row.emergencycontactname);
				newRow.find('.enu').html(row.emergencycontactnumber?'(' + row.emergencycontactnumber.substring(0,3) + ') ' + row.emergencycontactnumber.substring(3,6) + ' - ' + row.emergencycontactnumber.substring(6):"");
				newRow.find('.le').html(row.legalsignaturerequired? 'Yes':'No');
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

	/* Clear form button */
	$('.rt-form-clear').click(clearFields);

	/* Remove row in database */
	$('.rt-row-remove').click(function() {
		var parent = $($($(this).parent()).parent());
		var data = {
			firstName : parent.find('.fn').html(),
			lastName : parent.find('.ln').html()
		};
		$.ajax({
			type: "GET",
			url: "/v0.1/retreat/registrants/delete",
			data: data,
			error: function() {
				$('.rt-alert-delete-error').slideDown();
			}
		});
		parent.slideUp();

	});

	/* Export database to csv */
	$('.rt-export-button').click(function() {
		$.ajax({
			type: "GET",
			url: "/v0.1/retreat/registrants/export",
			success: function(data) {
				document.location.href = '/download/' + data.fileName;
			}
		});
	}); 

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