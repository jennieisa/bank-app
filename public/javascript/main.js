const accountList = document.querySelector('.accountList');
const createNewAccBtn = document.querySelector('.createNewAccBtn');
const createNewAccSection = document.querySelector('.createNewAccSection');
const createNewAccForm = document.querySelector('.createNewAccForm');
const loginForm = document.querySelector('.loginForm');
const username = document.querySelector('#username');
const pass = document.querySelector('#pass');
const logoutForm = document.querySelector('.logoutForm');
const regsiterUserBtn = document.querySelector('.regsiterUserBtn');
const registerForm = document.querySelector('.registerForm');
const registerUsername = document.querySelector('#registerUsername');
const registerPass = document.querySelector('#registerPass');
const welcomeUser = document.querySelector('.welcomeUser');

/*ANVÄNDARE*/

//LOGGA IN
loginForm.addEventListener('submit', async (e) => {

    e.preventDefault();

    console.log(username.value, pass.value)

    await fetch('/api/login', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({
            user: username.value,
            pass: pass.value
        })
    })

    location.reload();

})

//RITA UT REGISTRERA FORMULÄRET
regsiterUserBtn.addEventListener('click', () => {
    registerForm.classList.remove('hidden');
    regsiterUserBtn.classList.add('hidden');
})

//LOGGA UT
logoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    await fetch('api/loggedout', {
        method: 'POST'
    });

    location.reload();
})

//REGISTRERA ANVÄNDARE
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: registerUsername.value,
            pass: registerPass.value
        })
    })

    const data = await res.json();

    location.reload();

    alert(`Tack för att du registrerat dig ${data.user}`)
})

//KOLLA OM ANVÄNDARE ÄR INLOGGAD
const checkLogedin = async () => {
    const res = await fetch('/api/loggedin');
    const data = await res.json();

    if (data.user) {
        loginForm.classList.add('hidden');
        logoutForm.classList.add('show');
        regsiterUserBtn.classList.add('hidden');
        welcomeUser.innerText = 'Användare: ' + data.user;
        drawAccounts();
    } else {
        logoutForm.classList.add('hidden');
        createNewAccSection.classList.add('hidden');
    }
}

checkLogedin();

/*KONTON*/

let changeAccountBalanceItem = null;

let accounts = [];

//Template för att rita ut bankkonton
const accountTemplate = (account) => `
    <li>
        <p>Namn: ${account.name}</p>
        <p>Kontonummer: ${account._id}</p>
        <p>Saldo: ${account.balance} kr</p>
        <button data-function="addMoney" data-accountid="${account._id}">Sätt in pengar</button>
        <button data-function="takeOutMoney" data-accountid="${account._id}">Ta ut pengar</button>
        <button data-function="deleteAccount" data-accountid="${account._id}">Avsluta konto</button>
        <form data-accountid="${account._id}" class="changeAmountForm hidden">
            <label for="amount">Belopp:</label>
            <input type="number" id="amount" data-accountid="${account._id}">
            <button data-function="updateBalance" data-accountid="${account._id}" class="updateBalanceBtn"></button>
        </form>
    </li>
`;

//Visar formulär om vi klickar på skapa nytt konto 
createNewAccBtn.addEventListener('click', () => {

    createNewAccForm.classList.add('show');

    accountList.classList.add('hidden');

    createNewAccBtn.classList.add('hidden');

})

//Eventlisterner för att skapa nytt konto
createNewAccForm.addEventListener('submit', async (e) => {

    e.preventDefault();

    const accountName = document.querySelector('#accountName');
    const accountBalance = document.querySelector('#accountBalance');

    await fetch('/api/createnewaccount', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({
            name: accountName.value,
            balance: accountBalance.value
        })
    })

})

//Hämtar alla bankkonton och ritar ut 
const drawAccounts = async () => {

    const res = await fetch('/api/accounts');
    accounts = await res.json();

    accountList.innerHTML = accounts.map(accountTemplate).join('');

    addButtonListeners();

}

//Hämtar ett specifikt konto
const getAccount = async (id) => {

    const res = await fetch(`/api/accounts/account/${id}`);

    const account = await res.json();

    return account;

}

//Funktion som ritar ut rätt formulär 
const drawChangeBalanceForm = (account) => {

    const changeAmountForm = document.querySelectorAll('.changeAmountForm');
 
    changeAmountForm.forEach(form => {

        if (account.target.dataset.accountid === form.dataset.accountid) {
        
            form.classList.remove('hidden');

            const updateBalanceBtns = document.querySelectorAll('[data-function="updateBalance"]');

            updateBalanceBtns.forEach(btn => {

                if (account.target.dataset.accountid === btn.dataset.accountid) {

                    if (account.target.dataset.function === 'addMoney') {
                        
                        btn.innerText = 'Lägg till';

                    } else if (account.target.dataset.function === 'takeOutMoney') {

                        btn.innerText = 'Ta ut';

                    } 

                }

            })
        }
    })
}

//Funktion som tar bort bankkonto
const deleteAccount = async (e) => {

    console.log(e.target.dataset.accountid)

    await fetch(`/api/accounts/account/${e.target.dataset.accountid}/deleteaccount`, {
        method: 'DELETE'
    });

    drawAccounts();

}

//Funktion som kollar om det går att ta ut så mycket pengar 
const withdrawalPossible = (balance, amount) => {

    const sum = balance - amount;

    if (sum < 0) {
        return false;
    } else {
        return true;
    }

}

//Funktion som tar bort pengar från kontot 
const withdrawalAccount = async (balance, amount, id) => {

    const sum = parseInt(balance) - parseInt(amount);

    await fetch(`/api/accounts/account/${id}/changebalance`, {

        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            balance: sum
        })

    });

}

//Funktion som lägger till pengar på kontot 
const depositAccount = async (balance, amount, id) => {

    const sum = parseInt(balance) + parseInt(amount); 

    
    await fetch(`/api/accounts/account/${id}/changebalance`, {

        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            balance: sum
        })

    });

}

//Funktion för att ändra saldot på kontot 
const updateBalance = async (e) => {

    e.preventDefault();

    const account = await getAccount(e.target.dataset.accountid);

    changeAccountBalanceItem = account.balance;

    const amounts = document.querySelectorAll("#amount");

    let inputBalance;

    amounts.forEach(input => {

        if (input.dataset.accountid === e.target.dataset.accountid) {

            inputBalance = input.value;
        }

    })

    if (e.target.innerText === 'Ta ut') {

        const result = withdrawalPossible(changeAccountBalanceItem, inputBalance);

        if (result) {

            withdrawalAccount(changeAccountBalanceItem, inputBalance, e.target.dataset.accountid)

            window.location.reload();

        } else {

            window.location.reload();

            alert('Du kan inte ta ut mer pengar än du har på kontot.')
        }

    } else {

        depositAccount(changeAccountBalanceItem, inputBalance, e.target.dataset.accountid);

        window.location.reload();
    }
}

//Skapar eventlisterners på knapparna 
const addButtonListeners = () => {

    const deleteBtns = document.querySelectorAll('[data-function="deleteAccount"]');
    deleteBtns.forEach( btn => btn.addEventListener('click', deleteAccount));

    const addMoneyBtns = document.querySelectorAll('[data-function="addMoney"]');
    addMoneyBtns.forEach( btn => btn.addEventListener('click', drawChangeBalanceForm));

    const takeOutMoneyBtns = document.querySelectorAll('[data-function="takeOutMoney"]');
    takeOutMoneyBtns.forEach( btn => btn.addEventListener('click', drawChangeBalanceForm));

    const updateBalanceBtns = document.querySelectorAll('[data-function="updateBalance"]');
    updateBalanceBtns.forEach( btn => btn.addEventListener('click', updateBalance));

};


