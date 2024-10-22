// إضافة مستمعين للأحداث
document.getElementById('fileInput').addEventListener('change', handleFile, false);
document.getElementById('sendMessages').addEventListener('click', sendMessages);
document.getElementById('selectAll').addEventListener('change', selectAllCustomers);
document.getElementById('governorateFilter').addEventListener('change', filterByGovernorate);

let customerData = [];

// معالجة تحميل الملف
function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, {defval: ""});
        displayData(jsonData);
    };
    reader.readAsArrayBuffer(file);
}

// عرض البيانات في الجدول
function displayData(data) {
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = ''; // مسح الجدول
    customerData = data;

    const purchaseCounts = {};
    
    // حساب عدد مرات الشراء لكل عميل
    data.forEach(row => {
        const phone = row['phone']; // استخدام رقم الهاتف كمعرف للعميل
        if (phone) {
            if (purchaseCounts[phone]) {
                purchaseCounts[phone].count++;
            } else {
                purchaseCounts[phone] = {
                    name: row['name'] || 'غير معروف',
                    address: row['address'] || 'غير معروف',
                    count: 1
                };
            }
        }
    });

    // إنشاء صفوف الجدول
    Object.keys(purchaseCounts).forEach(phone => {
        const purchaseCount = purchaseCounts[phone].count;
        const purchaseProbability = calculatePurchaseProbability(purchaseCount);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="selectCustomer"></td>
            <td>${purchaseCounts[phone].name}</td>
            <td>${phone}</td>
            <td>${purchaseCounts[phone].address}</td>
            <td>${purchaseProbability}%</td>
            <td>${purchaseCount}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function calculatePurchaseProbability(count) {
    const maxCount = 10;
    return Math.min((count / maxCount) * 100, 100).toFixed(2);
}

function selectAllCustomers(event) {
    const isChecked = event.target.checked;
    const customerCheckboxes = document.querySelectorAll('.selectCustomer');
    customerCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
}

// إرسال الرسائل دفعة واحدة
function sendMessages() {
    const customMessage = document.getElementById('customMessage').value || '';
    const selectedCustomers = document.querySelectorAll('.selectCustomer:checked');
    const phoneNumbers = [];

    if (selectedCustomers.length === 0) {
        alert('يرجى اختيار عميل واحد على الأقل.');
        return;
    }

    selectedCustomers.forEach((checkbox) => {
        const row = checkbox.closest('tr');
        const customerPhone = row.cells[2].innerText;

        // تنظيف رقم الهاتف وإضافته إلى المصفوفة
        let phoneNumber = customerPhone.replace(/\D/g, '');
        if (!phoneNumber.startsWith('20')) {
            phoneNumber = '20' + phoneNumber; // افتراض أن الأرقام المصرية تبدأ بـ 20
        }
        phoneNumbers.push(phoneNumber);
    });

    // إنشاء رابط WhatsApp لكل العملاء المحددين
    const message = `أهلا بيك ${customMessage}`; // الرسالة العامة
    const url = `https://wa.me/?phone=${phoneNumbers.join(',')}&text=${encodeURIComponent(message)}`;

    // فتح الرابط في نافذة جديدة
    window.open(url, '_blank');
}

// وظيفة لتصفية العملاء حسب المحافظة
function filterByGovernorate() {
    const selectedGovernorate = document.getElementById('governorateFilter').value;
    const tableBody = document.querySelector('#dataTable tbody');

    if (!selectedGovernorate) {
        displayData(customerData);
        return;
    }

    const filteredData = customerData.filter(customer => {
        const address = customer['address'] || '';
        return address.includes(selectedGovernorate);
    });

    displayData(filteredData);
}

// لعرض رسالة تأكيد عند تحميل ملف
document.getElementById('fileInput').addEventListener('change', function() {
    const fileMessage = document.getElementById('fileMessage');
    if (this.files.length > 0) {
        fileMessage.textContent = 'تم إضافة ملف.';
    } else {
        fileMessage.textContent = '';
    }
});

document.getElementById('mediaFile').addEventListener('change', function() {
    const mediaMessage = document.getElementById('mediaMessage');
    if (this.files.length > 0) {
        mediaMessage.textContent = 'تم إلضافة.';
    } else {
        mediaMessage.textContent = '';
    }
});
