const user = document.querySelector('#usuario');
const password = document.querySelector('#password');
const passwordReConfirm = document.querySelector('#password-reconfirm');
const createAccount = document.querySelector('#criar-conta-btn');
const errorMessagesDiv = document.getElementById('error-messages');

createAccount.disabled = true; 

const verifyPassword = () => {
    if (password.value.length >= 8) {
        createAccount.disabled = false;
    } else {
        createAccount.disabled = true;
    }
};
password.addEventListener('input', verifyPassword);

createAccount.addEventListener('click', (e) => { 
    e.preventDefault();
    
    const passwordCharacteres = 8;

    while (errorMessagesDiv.firstChild) {
        errorMessagesDiv.removeChild(errorMessagesDiv.firstChild);
    }

    try {
        let userName = user.value;
        let userPassword = password.value;
        let userPasswordReConfirm = passwordReConfirm.value;

        if (userPasswordReConfirm.length < 1 || userPassword.length < 1 || userName.length < 1) {
            const errorMessage = document.createElement('h3');
            errorMessage.textContent = 'Todos os campos devem ser preenchidos!'; 
            errorMessagesDiv.appendChild(errorMessage);
            console.log('Encerrou.')
        } else {
            if (!userValidationCreate){
                if (userPassword.length >= passwordCharacteres) {
                    if (userPassword === userPasswordReConfirm) {
                        createUserAccount();
                    } else {
                        const errorMessage = document.createElement('h3');
                        errorMessage.textContent = 'As senhas devem ser iguais!'; 
                        errorMessagesDiv.appendChild(errorMessage);
                    }
                }
            } else {
                const errorMessage = document.createElement('h3');
                errorMessage.textContent = 'Usuario já existe!'; 
                errorMessagesDiv.appendChild(errorMessage);
            }
        }
    } catch (err){
        console.log('Erro ao criar conta', err);
    } 
});

const createUserAccount = async () => {
    const response = await fetch(`${url}/create-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user: user.value,
            password: password.value,
            passwordReConfirm: passwordReConfirm.value
        })
    })
    const data = await response.json();
    if ( data === 'Usuario criado!' ) {
        const errorMessage = document.createElement('h3');
        errorMessage.textContent = 'Usuário cadastrado com sucesso!'; 
        errorMessagesDiv.appendChild(errorMessage);
    } else {
        const errorMessage = document.createElement('h3');
        errorMessage.textContent = 'Houve um erro, tente mais tarde!'; 
        errorMessagesDiv.appendChild(errorMessage);
    }
}

let requestTimer;
let userValidationCreate = true;

user.addEventListener('input', () => {
    if (user.value.length > 4){
        clearTimeout(requestTimer);
        requestTimer = setTimeout(verifyUser, 1000);
    } else {
        clearTimeout(requestTimer);
        errorMessagesDiv.removeChild(errorMessagesDiv.firstChild);
        userValidationCreate = true;
    }
});

const verifyUser = async () =>  {
    const request = await fetch(`${url}/compare-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user: user.value
        })
    });
    const data = await request.json();
    while (errorMessagesDiv.firstChild) {
        errorMessagesDiv.removeChild(errorMessagesDiv.firstChild);
    }
    if(data.userExists){
        const errorMessage = document.createElement('h3');
        errorMessage.textContent = 'Usuário ja cadastrado!'; 
        errorMessagesDiv.appendChild(errorMessage);
    } else {
        const errorMessage = document.createElement('h3');
        errorMessage.textContent = 'Usuario disponivel!'; 
        errorMessagesDiv.appendChild(errorMessage);
    }
    userValidationCreate = data.userExists;
    return userValidationCreate;
};