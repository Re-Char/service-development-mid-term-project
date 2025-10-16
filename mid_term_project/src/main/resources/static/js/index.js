$(document).ready(function () {
    // 登录表单提交
    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        const username = $('#loginUsername').val();
        const password = $('#loginPassword').val();

        // 发送登录请求
        $.ajax({
            url: '/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                username: username,
                password: password,
            }),
            success: function (response) {
                if (response.success) {
                    // 登录成功，跳转到游戏页面
                    window.location.href = '/game';
                } else {
                    // 登录失败，显示错误信息
                    $('#loginErrorMessage')
                        .text(response.message || '登录失败，请检查用户名和密码')
                        .show();
                }
            },
            error: function () {
                $('#loginErrorMessage').text('登录失败，请稍后重试').show();
            },
        });
    });

    // 注册表单提交
    $('#registerForm').on('submit', function (e) {
        e.preventDefault();

        const username = $('#registerUsername').val();
        const password = $('#registerPassword').val();
        const confirmPassword = $('#confirmPassword').val();
        const email = $('#email').val();

        // 清空之前的消息
        $('#registerErrorMessage').hide();
        $('#registerSuccessMessage').hide();

        // 验证密码
        if (password !== confirmPassword) {
            $('#registerErrorMessage').text('两次输入的密码不一致').show();
            return;
        }

        // 发送注册请求
        $.ajax({
            url: '/register',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                username: username,
                password: password,
                email: email,
            }),
            success: function (response) {
                if (response.success) {
                    // 注册成功
                    $('#registerSuccessMessage').text('注册成功！3秒后自动跳转到登录页面...').show();
                    // 清空表单
                    $('#registerForm')[0].reset();
                    // 3秒后切换到登录表单
                    setTimeout(function () {
                        $('#showLogin').click();
                        $('#registerSuccessMessage').hide();
                    }, 3000);
                } else {
                    // 注册失败
                    $('#registerErrorMessage').text(response.message || '注册失败，请重试').show();
                }
            },
            error: function () {
                $('#registerErrorMessage').text('注册失败，请稍后重试').show();
            },
        });
    });

    // 切换到注册表单
    $('#showRegister').on('click', function (e) {
        e.preventDefault();
        $('#loginForm').hide();
        $('#registerForm').show();
        $('#loginErrorMessage').hide();
        $('.login-title').html('<i class="fas fa-user-plus"></i> 用户注册');
    });

    // 切换到登录表单
    $('#showLogin').on('click', function (e) {
        e.preventDefault();
        $('#registerForm').hide();
        $('#loginForm').show();
        $('#registerErrorMessage').hide();
        $('#registerSuccessMessage').hide();
        $('.login-title').html('<i class="fas fa-gamepad"></i> 游戏登录');
    });
});
