const inputs = document.querySelectorAll('.input');
const text = document.querySelectorAll('.text');
const form = document.getElementById('form');
const infoText = document.querySelector('.info');
const btn = document.querySelector('.btn');

let matchingData = [];
let newData = [];

inputs.forEach((el, idx) => {
    el.addEventListener('change', (e) => {
        text[idx].innerText = e.target.files[0].name.replace('.xlsx', '');
    });
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        btn.innerHTML = '<i class="fa-solid fa-code-compare"></i> Сравнение ...';
        const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs");
    
        const file1 = inputs[0].files[0];
        const file2 = inputs[1].files[0];
        
    
        const data1 = await readFiles(file1, XLSX);
        const data2 = await readFiles(file2, XLSX);
    
        compareFiles(data1, data2);
    
        console.log(matchingData);
        console.log(newData);
        infoText.innerHTML = `Сравнение прошло успешно! <br/> Создан новый файл "New Data.xlsx" <br/> Количество добавленных товаров: ${newData.length}`;
        downloadFile(newData, XLSX);
        btn.innerHTML = '<i class="fa-solid fa-code-compare"></i> Сравнить';
    } catch (error) {
        console.log(error.message);
        btn.innerText = 'Сравнить';
        infoText.style.color = 'red';
        infoText.innerText = 'Ошибка!!! Для сравнение выберите два файла Excel';
        setTimeout(()=> {
            window.location.reload();
        }, 2000);
    }
});

btn.addEventListener('dbclick', () => {
    window.location.reload()
})

function readFiles(file, XLSX) {
    const promise = new Promise((resolve, reject) => {
        const reader = new FileReader();
    
        reader.onload = (event) => {
            const data = event.target.result;
            const content = XLSX.read(data, {type: 'array'});
            const json = XLSX.utils.sheet_to_json(content.Sheets[content.SheetNames[0]]);
            resolve(json)
        }
    
        reader.readAsArrayBuffer(file)
    });
    return promise;
}

function fixProduct(product){
    return product.toUpperCase().replace(/[^\w]/g, '').replace('HIKVISION', '').replace('HIWATCH', '');
}

function compareFiles(data1, data2) {
    matchingData = [];
    newData = [];
    console.log(data1.length, data2.length)
    if (data1.length < data2.length) {
        for (const product1 of data1) {
            if (data2.some(product2 => product2.Model.length > product1.Model.length ? fixProduct(product2.Model).includes(fixProduct(product1.Model)) : fixProduct(product1.Model).includes(fixProduct(product2.Model)))) {
                matchingData.push({Model: product1.Model})
            } else {
                newData.push({Model: product1.Model})
            }
        }
    } else {
       for (const product2 of data2) {
        if (data1.some(product1 => product1.Model.length > product2.Model.length ? fixProduct(product1.Model).includes(fixProduct(product2.Model)) : fixProduct(product2.Model).includes(fixProduct(product1.Model)))) {
            matchingData.push({Model: product2.Model})
        } else {
            newData.push({Model: product2.Model})
        }
       }
    }
}

function downloadFile(data, XLSX) {
    const workBook = XLSX.utils.book_new();
    const workSheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workBook, workSheet, `Sheet1`);
    XLSX.writeFile(workBook, "New Data.xlsx");
}