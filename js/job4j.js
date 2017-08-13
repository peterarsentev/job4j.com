DOMAIN = document.domain === 'localhost' ? 'localhost' : '136.243.21.15';
OAUTH_URL = 'http://' + DOMAIN + ':9900';
ARTICLE_URL = 'http://' + DOMAIN + ':9901';
ANNOUNCE_URL = 'http://' + DOMAIN + ':9902';
EXAM_URL = 'http://' + DOMAIN + ':9910';
NTF_URL = 'http://' + DOMAIN + ':9920';
INTERVIEW_URL = 'http://' + DOMAIN + ':9950';
FORUM_URL = 'http://' + DOMAIN + ':9960';

user = {};
user.hasRole = function (role) {
    return false;
};

function initHeader() {
    $("#logo").attr("src", CONTEXT + "img/logomini.png");
    ping(OAUTH_URL + '/ping', ['login']);
    ping(EXAM_URL + '/exams/exams/ping', ['exam']);
    ping(INTERVIEW_URL + '/interview/vacancy/ping', ['vacancy']);
    ping(FORUM_URL + '/forum/ping', ['forum']);
};

function ping(service, ids) {
    $.ajax({
        url: service,
        type: "GET",
        crossDomain: true,
        dataType: "json",
        success: function (data) {
            $.each(ids, function( index, value ) {
                $("#" + value).show();
            });
        },
        error: function (xhr, status) {
            $.each(ids, function( index, value ) {
                $("#" + value).hide();
            });
        }
    });
}

function formIsValid(selector) {
    var valid = true;
    $.each(
        $(selector).find("div.help-block"),
        function(index, value) {
            if ($( value ).text().length > 0) {
                valid = false;
            }
        }
    );
    return valid;
}

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
        return null;
    }
    else{
        return results[1] || 0;
    }
}

function forgot(selector) {
    $(selector).validator('validate');
    if (formIsValid(selector)) {
        $(selector + " :input").prop("disabled", true);
        $.ajax({
            url: OAUTH_URL + '/forgot',
            type: 'POST',
            crossDomain: true,
            dataType: "json",
            data: JSON.stringify({
                "username": $('#forgot-username').val(),
                "email": $('#forgot-email').val(),
            }),
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
            },
            success: function (data) {
                if (data.error) {
                    $('#forgot_error').html(data.error);
                    $('#forgot_error').show();
                    $(selector + " :input").prop("disabled", false);
                } else {
                    $('#forgot_success').html("Новый пароль был отправлен на Вам на почту.");
                    $('#forgot_success').show();
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('#reg_error').html(errorThrown);
                $('#reg_error').show();
                $(selector + " :input").prop("disabled", false);
            }
        });
    }
    return false;
}

function login(selector) {
    $(selector).validator('validate');
    if (formIsValid(selector)) {
        $(selector + " :input").prop("disabled", true);
        $.ajax({
            url : OAUTH_URL + '/oauth/token',
            type : 'POST',
            crossDomain: true,
            dataType: "json",
            data : {"grant_type" : "password", "username" : $('#username').val(), "password" : $('#password').val()},
            beforeSend : function( xhr ) {
                xhr.setRequestHeader( "Authorization", "Basic " + btoa("job4j:password"));
                xhr.setRequestHeader( "Content-type", "application/x-www-form-urlencoded; charset=utf-8");
            },
            success : function (data) {
                console.log(data);
                createCookie("token", data.access_token);
                loadUser();
                closeDialog(data);
                var direct = "./index.html";
                if ($.urlParam('redirectUri')) {
                    direct = $.urlParam('redirectUri') + '#' + window.location.hash.substr(1);
                }
                document.location.href = direct;
            },
            error : function (error) {
                var result = JSON.parse(error.responseText);
                if (result.error) {
                    $('#login_error').html(result.error == 'invalid_grant' ? "Логин или пароль не совпадают." : result.error_description);
                    $('#login_error').show();
                    $(selector + " :input").prop("disabled", false);
                } else {
                    closeDialog(result);
                    document.location.href = "./index.html";
                }
            }
        });
    }
    return false;
}

function logout() {
    $.ajax({
        url: OAUTH_URL + '/revoke',
        type: 'GET',
        crossDomain: true,
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + readCookie("token"));
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=utf-8");
        },
        success: function (data) {
            createCookie('token', '');
            location.reload();
        },
        error: function (errorThrown) {
            createCookie('token', '');
            location.reload();
        }
    });
}

function loadUser(f) {
    var token = readCookie("token");
    if(token != null) {
        $.ajax({
            url : OAUTH_URL + '/person/current',
            type : 'GET',
            crossDomain: true,
            dataType: "json",
            beforeSend : function( xhr ) {
                xhr.setRequestHeader( "Authorization", "Bearer " + token);
                xhr.setRequestHeader( "Content-type", "application/x-www-form-urlencoded; charset=utf-8");
            },
            success : function (data) {
                user = data;
                user.hasRole = function (role) {
                    return user.roles.some(
                        function (r) {
                            return r.value == role;
                        }
                    );
                }
                closeDialog(data);
                if (f !== undefined) {
                    f();
                }
            },
            error : function (data, errorThrown) {
                console.log("Error in function, which gets data from another domain (using CORS).");
                if (f !== undefined) {
                    f();
                }
            }
        });
    }
}

function closeDialog(data) {
    $('#logout-item').show();
    $('#login-item').hide();
    $('#user-info').html(data.username);
}

function registration(selector) {
    $(selector).validator('validate');
    if (formIsValid(selector)) {
        $(selector + " :input").prop("disabled", true);
        $.ajax({
            url: OAUTH_URL + '/registration',
            type: 'POST',
            crossDomain: true,
            dataType: "json",
            data: JSON.stringify({
                "username": $('#reg-username').val(),
                "email": $('#reg-email').val(),
                "password": $('#reg-password').val(),
                "privacy": $('#reg-privacy').is(':checked')
            }),
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
            },
            success: function (data) {
                if (data.error) {
                    $('#reg_error').html(data.error);
                    $('#reg_error').show();
                    $(selector + " :input").prop("disabled", false);
                } else {
                    document.location.href = "./congratulate.html";
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('#reg_error').html(errorThrown);
                $('#reg_error').show();
                $(selector + " :input").prop("disabled", false);
            }
        });
    }
    return false;
}

function createCookie(name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


function doAction($http, admin, user, error) {
    doGet($http, OAUTH_URL + '/person/current',
        function (data) {
            var isAdmin = $.grep(data.roles, function(role) {
                return role.value == 'ROLE_ADMIN';
            });
            if (isAdmin.length > 0) {
                admin();
            } else {
                user();
            }
        }, error);
}

function doAdmin($http, admin) {
    doAction($http,
        admin,
        function() {
            $location.path("/exams");
        }
    );
}

function doGet($http, url, action, error) {
    doHttp('GET', $http, url, null, action, error);
}

function doPost($http, url, data, action, error) {
    doHttp('POST', $http, url, data, action, error);
}

function doPut($http, url, data, action, error) {
    doHttp('PUT', $http, url, data, action, error);
}

function doDelete($http, url, action) {
    doHttp('DELETE', $http, url, null, action);
}

function doHttp(method, $http, url, data, action, error) {
    $http({
        method: method,
        url : url,
        data : data,
        headers: {
            'Authorization': 'Bearer ' + readCookie("token"),
            'Content-Type': 'application/json'
        },
    }).then(function successCallback(response) {
        action(response.data);
    }, function errorCallback(response) {
        if (error) {
            error(response);
        } else {
            console.log(response);
        }
    });
}

function loadPage(url, anchor) {
    var current = window.location.href;
    if (current.indexOf('#') !== -1) {
        current = current.substr(0, current.indexOf('#'));
    }
    if (!current.indexOf("redirectUri") && current.endsWith(url)) {
        location.hash = anchor;
    } else {
        document.location.href = CONTEXT + url + anchor;
    }
    return false;
}