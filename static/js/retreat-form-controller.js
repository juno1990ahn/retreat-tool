
function refreshTable() {

};

function clearFields() {

};

(function() {
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
	});

	$('.rt-nav-add').click(function() {
		$('.rt-form-data').hide();
		$('.rt-form-add').show();
	});

	// ajax submit for new registrant
	// TODO: add client side form validation
	$('.rt-form-add-btn').click(function() {
		var data = {
				firstName 	: 	$('#first-name').val(),
				lastName	: 	$('#last-name').val(),
				address		: 	$('#address').val(), 
				phoneNumber	: 	$('#phone-number').val(),
				amountPaid	: 	$('#amount-paid').val(),
				emName		: 	$('#em-contact-name').val(),
				emNumber 	: 	$('#em-contact-number').val(),
				under18		: 	$('#under18').is(':checked')
			}; 
		console.log(data);
		
		$.ajax({
			type: "POST",
			url: "/v0.1/retreat/registrants",
			data: data,
			success: function() {
				$('.rt-alert-add-success').slideDown();
				clearFields();
			},
			error: function() {
				$('.rt-alert-add-success').slideDown();
			}
		});
	});
})();