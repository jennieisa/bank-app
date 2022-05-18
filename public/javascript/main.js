const accountList = document.querySelector(".accountList");
const createNewAccBtn = document.querySelector(".createNewAccBtn");
const createNewAccForm = document.querySelector(".createNewAccForm");

let accounts = [ ];

//Template för att rita ut bankkonton
const accountTemplate = (account) => `
    <li>
        <p>Namn: ${account.name}</p>
        <p>Kontonummer: ${account._id}</p>
        <p>Saldo: ${account.balance} kr</p>
        <button data-function="addMoney" data-postid="${account._id}">Sätt in pengar</button>
        <button data-function="takeOutMoney" data-postid="${account._id}">Ta ut pengar</button>
        <button data-function="deleteAccount" data-postid=${account._id}>Avsluta konto</button>
    </li>
`;

//Hämtar alla bankkonton och ritar ut 
const drawAccounts = async () => {

    const res = await fetch('/api/accounts');
    accounts = await res.json();

    accountList.innerHTML = accounts.map(accountTemplate).join('');

}

drawAccounts();

//Visar formulär om vi klickar på skapa nytt konto 
createNewAccBtn.addEventListener("click", () => {

    createNewAccForm.style.display = "block";

    accountList.style.display = "none";

    createNewAccBtn.style.display = "none";

})

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