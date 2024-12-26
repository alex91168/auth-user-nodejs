const loginEmail = document.querySelector('#login-user');
const loginPassword = document.querySelector('#login-password');
const loginEntry = document.querySelector('#login-entry');

const url = 'http://127.0.0.1:5000';

loginEntry.addEventListener('click', () => {
    try {
        requestLogin();
    } catch (err) {
        console.log('Erro ao logar', err);
    }
});

const requestLogin = async () => {
    const response = await fetch(`${url}/login-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user: loginEmail.value,
            password: loginPassword.value,
        }),
        credentials: 'include'
    });

    const data = await response.json();
    console.log(data);
    if (response.ok){
        window.location.href = './welcome.html';
    }
}