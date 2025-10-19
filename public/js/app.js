// public/js/app.js
$(document).ready(function() {
    // Handle add member modal
    $('#addMemberBtn').click(function() {
        $('#addMemberModal').modal('show');
    });

    // Save member form
    $('#saveMemberBtn').click(function() {
        const formData = {
            name: $('#name').val(),
            email: $('#email').val(),
            phone: $('#phone').val(),
            address: $('#address').val()
        };

        $.ajax({
            url: '/members',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(response) {
                $('#addMemberModal').modal('hide');
                $('#addMemberForm')[0].reset();
                // Reload page to show new member
                location.reload();
            },
            error: function(error) {
                console.error('Error adding member:', error);
                alert('Error menambahkan anggota');
            }
        });
    });

    // DataTable initialization (if using DataTables)
    if ($.fn.DataTable) {
        $('#membersTable').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/id.json'
            }
        });
    }
});