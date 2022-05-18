const accountList = document.querySelector(".accountList");
const createNewAccBtn = document.querySelector(".createNewAccBtn");
const createNewAccForm = document.querySelector(".createNewAccForm");

let accounts = [];

//Template för att rita ut bankkonton
const accountTemplate = (account) => `
    <li>
        <p>Namn: ${account.name}</p>
        <p>Kontonummer: ${account._id}</p>
        <p>Saldo: ${account.balance} kr</p>
        <button data-function="addMoney" data-accountid="${account._id}">Sätt in pengar</button>
        <button data-function="takeOutMoney" data-accountid="${account._id}">Ta ut pengar</button>
        <button data-function="deleteAccount" data-accountid=${account._id}>Avsluta konto</button>
    </li>
`;

//Visar formulär om vi klickar på skapa nytt konto 
createNewAccBtn.addEventListener("click", () => {

    createNewAccForm.style.display = "block";

    accountList.style.display = "none";

    createNewAccBtn.style.display = "none";

})

//
createNewAccForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const accountName = document.querySelector("#accountName");
    const accountBalance = document.querySelector("#accountBalance");

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

drawAccounts();

//Funktion som tar bort bankkonto
const deleteAccount = async (e) => {

    await fetch(`/api/accounts/account/${e.target.dataset.accountid}/deleteaccount`, {
        method: 'DELETE'
    });

    drawAccounts();

}

//Funktion som tar ut pengar från konto


//Funktion som sätter in pengar på kontot


//Skapar eventlisterners på knapparna 
const addButtonListeners = () => {

    const deleteBtns = document.querySelectorAll('[data-function="deleteAccount"');
    deleteBtns.forEach( btn => btn.addEventListener('click', deleteAccount));

    console.log(deleteBtns)

    /*
    const takeOutMoneyBtns = document.querySelectorAll('[data-function="takeOutMoney"]');
    takeOutMoneyBtns.forEach( btn => btn.addEventListener('click', withdrawalAccount));

    const addMoneyBtns = document.querySelectorAll('data-function="addMoney"]');
    addMoneyBtns.forEach( btn => btn.addEventListener('click', depositAccount));
    */
}


