var userLoginModal = {
    open: function() {
        $(".login-modal").show();
        $(".login-overlay").on('click', function() {
            userLoginModal.close();
        });
    },
    close: function() {
        $('.login-modal').hide();
    }
};

$("#user-login").click(function() {
    userLoginModal.open();
});

$('#login').click(function() {
    $('#register').removeClass("switch_btn_focus");
    $('#login').addClass('switch_btn_focus');
    $('#web_qr_register').css('display', 'none');
    $('#web_qr_login').css('display', 'block');
});

$('#register').click(function() {
    $('#login').removeClass("switch_btn_focus");
    $('#register').addClass('switch_btn_focus');
    $('#web_qr_register').css('display', 'block');
    $('#web_qr_login').css('display', 'none');
});

function registerTxt(a, b) {
    $('#register-tip').html('<font class=' + a + '>' + b + '</font>')
}

function loginTxt(a, b) {
    $('#login-tip').html('<font class=' + a + '>' + b + '</font>')
}

function sendCaptcha() {
    var tel = $('#register-tel').val();
    if (tel == "") {
        registerTxt('red', "号码不能为空!");
        return;
    }
    if (!verifyTel(tel)) {
        registerTxt('red', "号码格式不对!");
        return;
    }
    $.ajax({
        type: "POST",
        url: "/send_sms",
        data: {
            tel: tel
        },
        dataType: "json",
        timeout: 7000,
        success: function(data) {
            if (data.errcode == 0) {
                $("#send-captcha").off('click');
                countDown(60);
                registerTxt('green', "请填写验证码！")
            } else {
                registerTxt('red', data.errmsg);
            }
        },
        error: function() {
            logErr('网络出错！');
        }
    });
};

// 登录表单
$('#login-form').submit(function() {
    var tel = $('#login-tel').val();
    var password = $('#login-password').val();
    if (!tel || !password) {
        logErr("请填写完整");
        return false;
    }
    if (!verifyTel(tel)) {
        logErr("手机号格式错误");
        return false;
    }
    if (!verifyPass(password)) {
        logErr("密码格式错误");
        return false;
    }
    $.ajax({
        type: "POST",
        url: "/user/verify_login",
        data: {
            tel: tel,
            password: password
        },
        dataType: "json",
        timeout: 5000,
        beforeSend: function(XMLHttpRequest) {
            //alert('远程调用开始...');
            $("#register-tip").addClass("loading");
        },
        success: function(data) {
            $("#register-tip").removeClass("loading");
            if (data.errcode == 0) {
                userLoginModal.close();
                window.location.reload();
            } else {
                logErr(data.errmsg);
            }
        },
        error: function() {
            logErr('网络出错！');
        }
    });
    return false;

    // 显示错误
    function logErr(err) {
        $('#login-tip').html("<font class='red'>" + err + "</font>");
    }
});

// 注册表单
$('#register-form').submit(function() {
    var tel = $('#register-tel').val();
    var password = $('#register-password').val();
    var captcha = $('#captcha').val();
    if (!tel || !password || !captcha) {
        logErr("请填写完整");
        return false;
    }
    if (!verifyTel(tel)) {
        logErr("手机号格式错误");
        return false;
    }
    if (!verifyPass(password)) {
        logErr("密码长度为6~14个字符");
        return false;
    }
    if (captcha.length != 4) {
        logErr("验证码长度错误");
        return false;
    }
    $.ajax({
        type: "POST",
        url: "/user/verify_register",
        data: {
            tel: tel,
            password: password,
            captcha: captcha
        },
        dataType: "json",
        timeout: 5000,
        success: function(data) {
            if (data.errcode == 0) {
                $('#captcha').val("");
                $('#register-password').val("");
                clearInterval(time);
                $('#send-captcha').text('获取验证码');
                registerTxt('green', "注册成功！");
                loginTxt('green', "注册成功！请登录！")
                    // 切换
                $('#login').click();
            } else {
                logErr(data.errmsg);
            }
        },
        error: function() {
            logErr('网络出错！');
        }
    });
    return false;

    // 显示错误
    function logErr(err) {
        $('#register-tip').html("<font class='red'>" + err + "</font>");
    }
});

$("#send-captcha").on('click', sendCaptcha);

/*  倒计时 */
function countDown(seconds) {
    if (seconds == 0) {
        var send = $('#send-captcha');
        send.text('获取验证码');
        send.on('click', sendCaptcha);
    } else {
        $('#send-captcha').css('background-color', '#eee');
        $('#send-captcha').css('color', '#000');
        $('#send-captcha').text('重新获取' + '(' + seconds + ')');
        time = setTimeout(function() {
            countDown(--seconds);
        }, 1000);
    }
};

// 验证手机号
function verifyTel(tel) {
    return tel.match(/^1[34578]\d{9}$/);
};
// 验证密码
function verifyPass(pass) {
    return pass.match(/^[a-zA-Z0-9]{6,10}$/)
};
