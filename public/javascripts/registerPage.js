function handleRegisterForm(event) {
    event.preventDefault();

    var email = document.querySelector('input[type="text"]').value;
    var password = document.getElementById('password').value;
    var comfirmPassword = document.getElementById("comfirmPassword").value;
    var phoneNumber = document.getElementById("phoneNumber").value;
    var name = document.getElementById("name").value;
    var role = "user";
    if (document.getElementById("isMerchant").checked) role = "merchant";

    const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,72}$/;

    if (!passwordRequirements.test(password)) {
        alert('密碼需要介於12與72字元且包含「大寫字母 + 小寫字母 + 數字 + 特殊符號」');
        return;
    }

    if (password != comfirmPassword) {
        alert("密碼不一致!");
        return;
    }

    const formData = {
        email: email,
        password: password,
        phoneNumber: phoneNumber,
        name: name,
        role: role
    };

    fetch('/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    }).then(response => {
        if (response.ok) {
            console.log("註冊成功");
            alert("註冊成功");
            password = "";
            comfirmPassword = "";
            window.location.href = "loginPage.html";
        } else {
            alert("使用者已存在");
            console.log("註冊失败");
        }
    }).catch(error => {
        console.error('錯誤:', error);
    });
}

function showPassword() {
    var passwordField = document.getElementById('password');
    var comfirmPasswordField = document.getElementById('comfirmPassword');
    var eyeIcon = document.querySelector('.eye-icon');

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        comfirmPasswordField.type = 'text';
        eyeIcon.classList.remove('bx-hide');
        eyeIcon.classList.add('bx-show');
    } else {
        passwordField.type = 'password';
        comfirmPasswordField.type = 'password';
        eyeIcon.classList.remove('bx-show');
        eyeIcon.classList.add('bx-hide');
    }
}