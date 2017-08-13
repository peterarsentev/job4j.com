function initForum() {
    if (user.username !== undefined) {
        $("[data-auth]").each(function (index, el) {
            $.each($(el).attr("data-auth").split(" "), function (index, auth) {
                if ((auth === "admin" && user.hasRole("ROLE_ADMIN")) ||
                    auth === "authenticated" || parseInt(auth, 10) === user.id) {
                    $(el).show();
                }
            });
        });
        $('#edit-subject-description').summernote({height:300});
        $('#edit-message-text').summernote({height:300});
    }
}

function addCategoryForm() {
    var editForm = $("#edit-category-form").hide().validator('reset');
    $('#edit-category-button').hide();
    $('#edit-category-caption').text('Новая категория');
    $('#edit-category-error').text('').hide();
    $('#edit-category-id').val('');
    $('#edit-category-name').val('');
    $('#edit-category-description').val('');
    $('#edit-category-position').val('0');
    editForm.show();
}

function editCategoryForm(el) {
    var editForm = $("#edit-category-form").hide().validator('reset');
    $('#edit-category-button').hide();
    $('#edit-category-caption').text('Изменить категорию');
    $('#edit-category-error').text('').hide();
    $('#edit-category-id').val(el.find('[data-id]').attr('data-id'));
    $('#edit-category-name').val(el.find('[data-is-name]').text());
    $('#edit-category-description').val(el.find("[data-is-description]").text());
    $('#edit-category-position').val(el.find('[data-position]').attr('data-position'));
    editForm.show();
}

function cancelEditCategory() {
    $('#edit-category-form').hide();
    $('#edit-category-button').show();
}

function editCategory() {
    var editCategoryForm = $('#edit-category-form').validator('validate');
    if (formIsValid('#edit-category-form')) {
        editCategoryForm.find(':input').prop('disabled', true);
        var url, type;
        var subjectId = $('#edit-category-id').val();
        if (subjectId) {
            url = '/forum/category/' + subjectId;
            type = 'PUT'
        } else {
            url = '/forum/category/';
            type = 'POST';
        }
        requestJson(url, type, {
                "name": $('#edit-category-name').val(),
                "description": $('#edit-category-description').val(),
                "position": parseInt($('#edit-category-position').val(), 10)
            }, function (data) {
                if (data.error) {
                    editCategoryForm.find(':input').prop('disabled', false);
                    $('#edit-category-error').html(data.error).show();
                } else {
                    document.location.reload();
                }
            }, function (jqXHR, textStatus, errorThrown) {
                var response = $.parseJSON(jqXHR.responseText);
                editCategoryForm.find(':input').prop('disabled', false);
                $('#edit-category-error').html(response.message || response.error).show();
            }
        );
    }
}

function deleteCategory(el) {
    if (!confirm('Вы уверены?')) {
        return;
    }
    requestDelete('/forum/category/' + el.find('[data-id]').attr('data-id'),
        function () {
            document.location.reload();
        },
        function (jqXHR, textStatus, errorThrown) {
            var response = $.parseJSON(jqXHR.responseText);
            alert(response.message || response.error);
        }
    );
}

function addSubjectForm() {
    if (user.username === undefined) {
        document.location.href = '../login.html?redirectUri=/forum/subjects.html?categoryId=' +
            $('[data-category-id]').attr('data-category-id');
        return;
    }
    var editForm = $("#edit-subject-form").hide().validator('reset');
    $('#edit-subject-button').hide();
    $('#edit-subject-caption').text('Новая тема');
    $('#edit-subject-error').text('').hide();
    $('#edit-subject-id').val('');
    $('#edit-subject-name').val('');
    $('#edit-subject-brief').val('');
    $('#edit-subject-description').summernote('reset');
    editForm.show();
}

function editSubjectForm(el) {
    var editForm = $('#edit-subject-form').hide().validator('reset');
    $('#edit-subject-button').hide();
    $('#edit-subject-caption').text('Изменить тему');
    $('#edit-subject-error').text('').hide();
    $('#edit-subject-id').val($('[data-subject-id]').attr('data-subject-id'));
    $('#edit-subject-name').val($('[data-is-subject-name]').text());
    $('#edit-subject-brief').val($('[data-is-subject-brief]').text());
    $('#edit-subject-description').summernote('code', $('[data-is-subject-description]').html());
    editForm.show();
}

function cancelEditSubject() {
    $('#edit-subject-form').hide();
    $('#edit-subject-button').show();
}

function editSubject() {
    var editForm = $('#edit-subject-form').validator('validate');
    if (formIsValid('#edit-subject-form')) {
        var categoryId = $('[data-category-id]').attr('data-category-id');
        if (categoryId) {
            editForm.find(':input').prop('disabled', true);
            $('#edit-subject-description').summernote('disable');
            var url, type;
            var subjectId = $('#edit-subject-id').val();
            if (subjectId) {
                url = '/forum/subject/' + subjectId;
                type = 'PUT'
            } else {
                url = '/forum/category/' + categoryId + '/subject/';
                type = 'POST';
            }
            requestJson(url, type, {
                    "name": $('#edit-subject-name').val(),
                    "description": $('#edit-subject-description').summernote('code'),
                    "brief" : $('#edit-subject-brief').val()
                }, function (data) {
                    if (data.error) {
                        editForm.find(':input').prop('disabled', false);
                        $('#edit-subject-description').summernote('enable');
                        $('#edit-subject-error').html(data.error).show();
                    } else {
                        document.location.reload();
                    }
                }, function (jqXHR, textStatus, errorThrown) {
                    var response = $.parseJSON(jqXHR.responseText);
                    editForm.find(':input').prop('disabled', false);
                    $('#edit-subject-description').summernote('enable');
                    $('#edit-subject-error').html(response.message || response.error).show();
                }
            );
        }
    }
}

function deleteSubject(el) {
    if (!confirm('Вы уверены?')) {
        return;
    }
    requestDelete('/forum/subject/' + el.find('[data-id]').attr('data-id'),
        function () {
            document.location.reload();
        },
        function (jqXHR, textStatus, errorThrown) {
            var response = $.parseJSON(jqXHR.responseText);
            alert(response.message || response.error);
        }
    );
}

function addMessageForm() {
    if (user.username === undefined) {
        document.location.href = '../login.html?redirectUri=/forum/messages.html?subjectId=' +
            $('[data-subject-id]').attr('data-subject-id');
        return;
    }
    var editForm = $("#edit-message-form").hide().validator('reset');
    $('#edit-message-button').hide();
    $('#edit-message-caption').text('Новое сообщение');
    $('#edit-message-error').text('').hide();
    $('#edit-message-id').val('');
    $('#edit-message-text').summernote('reset');
    editForm.show();
    $('html,body').scrollTop($(document).height());
}

function editMessageForm(el) {
    var editForm = $('#edit-message-form').hide().validator('reset');
    $('#edit-message-button').hide();
    $('#edit-message-caption').text('Изменить сообщение');
    $('#edit-message-error').text('').hide();
    $('#edit-message-id').val(el.find('[data-id]').attr('data-id'));
    $('#edit-message-text').summernote('code', (el.find('[data-is-text]').html()));
    editForm.show();
    $('html,body').scrollTop($(document).height());
}

function cancelEditMessage() {
    $('#edit-message-form').hide();
    $('#edit-message-button').show();
}

function editMessage() {
    var editForm = $('#edit-message-form').validator('validate');
    if (formIsValid('#edit-message-form')) {
        var subjectId = $('[data-subject-id]').attr('data-subject-id');
        if (subjectId) {
            editForm.find(':input').prop('disabled', true);
            $('#edit-message-text').summernote('disable');
            var url, type;
            var messageId = $('#edit-message-id').val();
            if (messageId) {
                url = '/forum/message/' + messageId;
                type = 'PUT'
            } else {
                url = '/forum/subject/' + subjectId + '/message/';
                type = 'POST';
            }
            requestJson(url, type, {
                    "text": $('#edit-message-text').summernote('code')
                }, function (data) {
                    if (data.error) {
                        editForm.find(':input').prop('disabled', false);
                        $('#edit-message-text').summernote('enable');
                        $('#edit-message-error').html(data.error).show();
                    } else {
                        document.location.reload();
                    }
                }, function (jqXHR, textStatus, errorThrown) {
                    var response = $.parseJSON(jqXHR.responseText);
                    editForm.find(':input').prop('disabled', false);
                    $('#edit-message-text').summernote('enable');
                    $('#edit-message-error').html(response.message || response.error).show();
                }
            );
        }
    }
}

function deleteMessage(el) {
    if (!confirm('Вы уверены?')) {
        return;
    }
    requestDelete('/forum/message/' + el.find('[data-id]').attr('data-id'),
        function () {
            document.location.reload();
        },
        function (jqXHR, textStatus, errorThrown) {
            var response = $.parseJSON(jqXHR.responseText);
            alert(response.message || response.error);
        }
    );
}

function postJson(url, data, success, error) {
    requestJson(url, 'POST', data, success, error);
}

function putJson(url, data, success, error) {
    requestJson(url, 'PUT', data, success, error);
}

function requestDelete(url, success, error) {
    $.ajax({
        url: FORUM_URL + url,
        type: 'DELETE',
        crossDomain: true,
        dataType: "json",
        headers: {
            Authorization: "Bearer " + readCookie("token")
        },
        success: success,
        error: error
    });
}

function requestJson(url, type, data, success, error) {
    $.ajax({
        url: FORUM_URL + url,
        type: type,
        crossDomain: true,
        dataType: "json",
        data: JSON.stringify(data),
        contentType: "application/json; charset=UTF-8",
        headers: {
            Authorization: "Bearer " + readCookie("token")
        },
        success: success,
        error: error
    });
}