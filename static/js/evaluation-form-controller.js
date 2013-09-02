var refreshTable = function() {
	$('.rt-form-table-row').remove();
	$.ajax({
		type: "GET",
		url: "/v0.1/retreat/evaluations",
		success: function(data) {
			for (var index in data) {
				var row = data[index];
				var newRow = $('.rt-row-template').clone(true);
				newRow.removeClass('rt-row-template');
				newRow.addClass('rt-form-table-row');
				newRow.find('.q1').html(row.question1);
				newRow.find('.q2').html(row.question2);
				newRow.find('.q3').html(row.question3);
				$('.rt-form-table-body').append(newRow);
			}
		},
		error: function(err) {
			$('.rt-alert-retrieve-server-error').slideDown();
		}
	});
};

(function() {
	refreshTable();

	/* Export database to csv */
	$('.rt-export-button').click(function() {
		$.ajax({
			type: "GET",
			url: "/v0.1/retreat/evaluations/export",
			success: function(data) {
				document.location.href = '/download/' + data.fileName;
			}
		});
	}); 
})();