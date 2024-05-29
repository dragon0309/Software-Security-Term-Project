const storeName = new URLSearchParams(window.location.search).get('storeName');
const url = '/db/items/' + storeName;
fetch(url, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
}).then(response => {
    if (response.ok) {
        console.log("成功");
        return response.json();
    } else {
        console.log("錯誤");
        throw new Error('錯誤');
    }
}).then(data => {
    console.log(data);
    displayData(data);
}).catch(error => {
    console.error('錯誤:', error);
});

function displayData(data) {
    const dataDisplay = document.getElementById('dataDisplay');
    dataDisplay.innerHTML = '';

    const rowDiv = document.createElement('div');
    rowDiv.className = 'row row-cols-md-2 row-cols-lg-5 row-cols-sm-1 g-2 g-lg-3 m-4';

    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.innerHTML = `
        <div class='card mb-3 text-center' style='width: 300px;' onclick="redirectToDetail()">
            <div>
                <img src=${displayImg(item.groceryName)} class='food-img' style='max-width: 64px;' alt='...'/>
            </div>
            <div class='item'>
                <p id='${item.storeName}'>商店名稱: ${item.storeName}</p>
                <p>商店地址: 台北市XX區XX路</p>
                <p>商品名: ${item.groceryName}</p>
                <p>折扣價: ${item.discountedPrice}</p>
                <p>過期日期: ${item.expirationDate}</p>
            </div>
        </div>
        `;
        itemDiv.className = 'col'
        rowDiv.appendChild(itemDiv);
        dataDisplay.appendChild(rowDiv);
    });
}

function redirectToDetail() {
    window.location.href = "detailPage.html";
}

function displayImg(groceryName) {
    if (groceryName == '飯糰') { return 'images/onigiri.png'; }
    else if (groceryName == '麵包') { return 'images/bread.png'; }
    else if (groceryName == '漢堡') { return 'images/burger.png'; }
    else if (groceryName == '三明治') { return 'images/sandwich.png' }
    else if (groceryName == '便當') { return 'images/bread.png'; }
}

document.getElementById('search').addEventListener('input', function (event) {
    var searchValue = event.target.value.trim().toLowerCase();
    var storeElements = document.querySelectorAll('.col');

    storeElements.forEach(function (element) {
        var info = element.textContent;
        element.style.display = info.includes(searchValue) ? '' : 'none';
    });
});