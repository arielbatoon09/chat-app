document.addEventListener('DOMContentLoaded', async function() {
    const username = document.querySelector('#username');
    const password = document.querySelector('#password');
    const btnRegister = document.querySelector('#btn-register');
    const btnLogin = document.querySelector('#btn-login');
    const btnLogout = document.querySelector('#btn-logout');

    if (btnRegister) {
        btnRegister.addEventListener('click', function(){
            PostRegister(username.value, password.value);
        });
    } else if (btnLogin) {
        btnLogin.addEventListener('click', function(){
            HandleLogin(username.value, password.value);
        });
    } else if (btnLogout) {
        btnLogout.addEventListener('click', function(){
            HandleLogout();
        })
    }

});

const PostRegister = async(username, password) => {
    try {
        let url = 'http://127.0.0.1:3000/api/register';
        const FormData = ({
            username: username,
            password: password,
        });

        let response = await Fetch.post(url, FormData);
        if (response.status == 'success') {
            location.href = "./login";
        }

        alert(response.message);

    } catch (error) {
        console.error('Catch Error: ',  error);
    }
};

const HandleLogin = async(username, password) => {
    try {
        let url = 'http://127.0.0.1:3000/api/login';
        const FormData = ({
            username: username,
            password: password,
        });

        let response = await Fetch.post(url, FormData);
        if (response.status == 'success') {
            location.href = "./chat";
        }
        alert(response.message);

    } catch (error) {
        console.error('Catch Error: ',  error);
    }
};

const HandleLogout = async() => {
    try {
        let url = 'http://127.0.0.1:3000/api/logout';
        const response = await Fetch.get(url);
        
        console.log(response);
        location.href = "./login";

    } catch (error) {
        console.error('Catch error: ', error);
    }
}