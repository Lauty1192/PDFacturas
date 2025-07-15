// Variables globales
let quoteData = {};
let itemsData = [];

// Previsualización y almacenamiento del logo en base64
function previewLogo(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('logo-preview').innerHTML = `<img src="${e.target.result}" style="max-width:180px; max-height:80px; object-fit:contain; border-radius:8px; box-shadow:0 2px 8px #0001;">`;
        // Guardar en localStorage para persistencia temporal
        localStorage.setItem('companyLogo', e.target.result);
        // Actualizar el valor en el input hidden para que collectFormData lo tome
        let hiddenLogo = document.getElementById('company-logo-base64');
        if (!hiddenLogo) {
            hiddenLogo = document.createElement('input');
            hiddenLogo.type = 'hidden';
            hiddenLogo.id = 'company-logo-base64';
            document.body.appendChild(hiddenLogo);
        }
        hiddenLogo.value = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Establecer fecha actual
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoice-date').value = today;
    
    // Establecer fecha de validez (30 días después)
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);
    document.getElementById('due-date').value = validUntil.toISOString().split('T')[0];
    
    // Generar número de presupuesto automático
    window.generatedQuoteNumber = generateQuoteNumber();
    
    // Añadir event listeners para cálculos automáticos
    addCalculationListeners();
    
    // Restaurar logo si existe
    const logo = localStorage.getItem('companyLogo');
    if (logo) {
        document.getElementById('logo-preview').innerHTML = `<img src="${logo}" style="max-width:180px; max-height:80px; object-fit:contain; border-radius:8px; box-shadow:0 2px 8px #0001;">`;
    }
    
    // Esperar a que el DOM esté completamente listo antes de agregar el event listener al input de logo
    function addLogoInputListener() {
        const logoInput = document.getElementById('company-logo');
        if (logoInput) {
            logoInput.addEventListener('change', previewLogo);
        } else {
            console.error('No se encontró el input company-logo (timeout)');
        }
    }
    setTimeout(addLogoInputListener, 500);
    
    // Asegurar que al cargar la página, si no hay logo en localStorage, tampoco se muestre en preview
    const logoPreview = document.getElementById('logo-preview');
    if (logoPreview) {
        logoPreview.innerHTML = '';
    }
});

// Generar número de presupuesto automático de 7 dígitos
function generateQuoteNumber() {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
}

// Añadir event listeners para cálculos
function addCalculationListeners() {
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('item-quantity') || 
            e.target.classList.contains('item-price')) {
            calculateItemTotal(e.target.closest('.item-row'));
        }
        
        if (e.target.id === 'tax-rate' || e.target.id === 'discount') {
            updateAllCalculations();
        }
    });
}

// Agregar nuevo artículo
function addItem() {
    const container = document.getElementById('items-container');
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    
    itemRow.innerHTML = `
        <input type="text" class="item-description" placeholder="Artículo">
        <input type="number" class="item-quantity" value="1" min="1">
        <input type="number" class="item-price" step="0.01" min="0" placeholder="0.00">
        <span class="item-total">$ 0,00</span>
        <button type="button" class="remove-item" onclick="removeItem(this)">×</button>
    `;
    
    container.appendChild(itemRow);
    
    // Añadir event listeners para el nuevo item
    const quantityInput = itemRow.querySelector('.item-quantity');
    const priceInput = itemRow.querySelector('.item-price');
    
    quantityInput.addEventListener('input', () => calculateItemTotal(itemRow));
    priceInput.addEventListener('input', () => calculateItemTotal(itemRow));
}

// Eliminar artículo
function removeItem(button) {
    const itemRow = button.closest('.item-row');
    const container = document.getElementById('items-container');
    
    // No permitir eliminar si es el único item
    if (container.children.length > 1) {
        itemRow.remove();
        updateAllCalculations();
    } else {
        alert('Debe haber al menos un artículo en el presupuesto.');
    }
}

// Calcular total de un artículo
function calculateItemTotal(itemRow) {
    const quantity = parseFloat(itemRow.querySelector('.item-quantity').value) || 0;
    const price = parseFloat(itemRow.querySelector('.item-price').value) || 0;
    const total = quantity * price;
    
    itemRow.querySelector('.item-total').textContent = formatCurrency(total, 'ARS');
    updateAllCalculations();
}

// Actualizar todos los cálculos
function updateAllCalculations() {
    const itemRows = document.querySelectorAll('.item-row');
    let total = 0;
    
    itemRows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        total += quantity * price;
    });
    
    return {
        total
    };
}

// Formatear moneda
function formatCurrency(amount, currency = 'ARS') {
    const symbols = {
        'ARS': '$'
    };
    
    return `${symbols[currency] || '$'} ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Limpiar formulario
function clearForm() {
    if (confirm('¿Estás seguro de que quieres limpiar todos los datos?')) {
        document.querySelectorAll('input, select, textarea').forEach(field => {
            if (field.type !== 'date' && field.id !== 'tax-rate' && field.id !== 'discount') {
                field.value = '';
            }
        });
        // Resetear items
        const container = document.getElementById('items-container');
        container.innerHTML = `
            <div class="item-row">
                <input type="text" class="item-description" placeholder="Artículo">
                <input type="number" class="item-quantity" value="1" min="1">
                <input type="number" class="item-price" step="0.01" min="0" placeholder="0.00">
                <span class="item-total">$ 0,00</span>
                <button type="button" class="remove-item" onclick="removeItem(this)">×</button>
            </div>
        `;
        // Generar nuevo número de presupuesto
        window.generatedQuoteNumber = generateQuoteNumber();
        // Ocultar vista previa
        const previewSection = document.getElementById('preview-section');
        if (previewSection) {
            previewSection.style.display = 'none';
        }
        // Limpiar logo
        localStorage.removeItem('companyLogo');
        document.getElementById('logo-preview').innerHTML = '';
        // Limpiar input file
        const logoInput = document.getElementById('company-logo');
        if (logoInput) logoInput.value = '';
        // Limpiar input hidden
        const hiddenLogo = document.getElementById('company-logo-base64');
        if (hiddenLogo) hiddenLogo.value = '';
        // Volver a agregar el event listener al input de logo
        setTimeout(addLogoInputListener, 200);
    }
}

// Recopilar datos del formulario
function collectFormData() {
    const calculations = updateAllCalculations();
    
    // Recopilar items
    const items = [];
    document.querySelectorAll('.item-row').forEach(row => {
        const description = row.querySelector('.item-description').value;
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        
        if (description && quantity > 0 && price >= 0) {
            items.push({
                description,
                quantity,
                price,
                total: quantity * price
            });
        }
    });
    
    // Tomar logo del input hidden si existe, si no de localStorage
    let logo = '';
    const hiddenLogo = document.getElementById('company-logo-base64');
    if (hiddenLogo && hiddenLogo.value) {
        logo = hiddenLogo.value;
    } else {
        logo = localStorage.getItem('companyLogo') || '';
    }
    
    return {
        company: {
            name: document.getElementById('company-name').value,
            slogan: document.getElementById('company-slogan').value,
            logo: logo,
            email: document.getElementById('company-email').value,
            phone: document.getElementById('company-phone').value,
            taxId: document.getElementById('company-tax-id').value,
            address: document.getElementById('company-address').value
        },
        client: {
            name: document.getElementById('client-name').value,
            email: document.getElementById('client-email').value,
            phone: document.getElementById('client-phone').value,
            taxId: document.getElementById('client-tax-id').value,
            address: document.getElementById('client-address').value
        },
        invoice: {
            number: window.generatedQuoteNumber,
            date: document.getElementById('invoice-date').value,
            dueDate: document.getElementById('due-date').value,
            currency: 'ARS'
        },
        items: items,
        calculations: calculations,
        notes: document.getElementById('notes').value
    };
}

// Validar datos requeridos
function validateRequiredFields() {
    const requiredFields = [
        'company-name'
    ];
    
    const errors = [];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            errors.push(field.previousElementSibling.textContent.replace(' *', ''));
        }
    });
    
    // Validar que haya al menos un item con datos válidos
    const items = collectFormData().items;
    if (items.length === 0) {
        errors.push('Debe agregar al menos un artículo válido');
    }
    
    return errors;
}

// Abrir vista previa en ventana emergente
// Vista previa en PDF real usando jsPDF + autoTable
function openPreviewPopup() {
    const errors = validateRequiredFields();
    if (errors.length > 0) {
        alert('Por favor, complete los siguientes campos requeridos:\n\n' + errors.join('\n'));
        return;
    }
    quoteData = collectFormData();
    if (!window.jsPDF || !window.jsPDF.API || !window.jsPDF.API.autoTable) {
        alert('Error: Falta la librería autoTable de jsPDF.');
        return;
    }
    // Generar el PDF en memoria (misma lógica que downloadPDF)
    const doc = new window.jsPDF({ unit: 'mm', format: 'a4' });
    // --- Copia aquí la lógica de generación de PDF igual a downloadPDF ---
    // Logo
    let y = 20;
    if (quoteData.company.logo) {
        try {
            const imgProps = doc.getImageProperties(quoteData.company.logo);
            const imgWidth = 50;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
            doc.addImage(quoteData.company.logo, 'PNG', 20, y, imgWidth, imgHeight);
            y += imgHeight + 2;
        } catch (e) { y += 2; }
    }
    doc.setFontSize(18);
    doc.setTextColor('#2c5aa0');
    doc.text('PRESUPUESTO', 80, 20, { align: 'left' });
    doc.setFontSize(10);
    doc.setTextColor('#333');
    doc.text(`#${quoteData.invoice.number}`, 80, 27);
    doc.text(`Fecha de Emisión: ${quoteData.invoice.date}`, 80, 33);
    if (quoteData.invoice.dueDate) doc.text(`Fecha de Vencimiento: ${quoteData.invoice.dueDate}`, 80, 39);
    y = Math.max(y, 45);
    // Empresa (izquierda)
    let empresaY = y;
    let clienteY = y;
    doc.setFontSize(12);
    doc.setTextColor('#2c5aa0');
    doc.text(quoteData.company.name, 20, empresaY);
    empresaY += 6;
    if (quoteData.company.slogan) {
        doc.setFontSize(10);
        doc.setTextColor('#888');
        doc.text(quoteData.company.slogan, 20, empresaY);
        empresaY += 5;
    }
    doc.setFontSize(10);
    doc.setTextColor('#333');
    if (quoteData.company.email) { doc.text(`Email: ${quoteData.company.email}`, 20, empresaY); empresaY += 5; }
    if (quoteData.company.phone) { doc.text(`Tel: ${quoteData.company.phone}`, 20, empresaY); empresaY += 5; }
    if (quoteData.company.taxId) { doc.text(`CUIT: ${quoteData.company.taxId}`, 20, empresaY); empresaY += 5; }
    if (quoteData.company.address) { doc.text(`Dirección: ${quoteData.company.address}`, 20, empresaY); empresaY += 5; }
    // Cliente (derecha)
    if (quoteData.client.name || quoteData.client.email || quoteData.client.phone || quoteData.client.taxId || quoteData.client.address) {
        doc.setFontSize(11);
        doc.setTextColor('#2c5aa0');
        doc.text('PRESUPUESTAR A:', 120, y);
        clienteY = y + 6;
        doc.setFontSize(10);
        doc.setTextColor('#333');
        if (quoteData.client.name) { doc.text(quoteData.client.name, 120, clienteY); clienteY += 5; }
        if (quoteData.client.email) { doc.text(`Email: ${quoteData.client.email}`, 120, clienteY); clienteY += 5; }
        if (quoteData.client.phone) { doc.text(`Tel: ${quoteData.client.phone}`, 120, clienteY); clienteY += 5; }
        if (quoteData.client.taxId) { doc.text(`CUIT/CUIL/DNI: ${quoteData.client.taxId}`, 120, clienteY); clienteY += 5; }
        if (quoteData.client.address) { doc.text(`Dirección: ${quoteData.client.address}`, 120, clienteY); clienteY += 5; }
    }
    y = Math.max(empresaY, clienteY) + 2;
    const columns = [
        { header: 'Artículo', dataKey: 'description' },
        { header: 'Cant.', dataKey: 'quantity' },
        { header: 'Precio', dataKey: 'price' },
        { header: 'Total', dataKey: 'total' }
    ];
    const rows = quoteData.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        price: item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 }),
        total: item.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })
    }));
    doc.autoTable({
        startY: y,
        head: [columns.map(col => col.header)],
        body: rows.map(row => columns.map(col => row[col.dataKey])),
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [44, 90, 160], textColor: 255 },
        theme: 'grid',
        margin: { left: 20, right: 20 },
        didDrawPage: function (data) {
            const pageHeight = doc.internal.pageSize.height;
            doc.setDrawColor(225, 232, 237);
            doc.setLineWidth(0.5);
            doc.line(20, pageHeight - 30, 190, pageHeight - 30);
            doc.setFontSize(9);
            doc.setTextColor('#888');
            doc.text(`Presupuesto generado el ${new Date().toLocaleDateString('es-AR')}`, 105, pageHeight - 22, { align: 'center' });
            doc.text('Este documento es válido como presupuesto', 105, pageHeight - 15, { align: 'center' });
        }
    });
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor('#2c5aa0');
    doc.text('TOTAL:', 140, finalY, { align: 'left' });
    doc.setFontSize(12);
    doc.setTextColor('#333');
    doc.text(`${formatCurrency(quoteData.calculations.total, 'ARS')}`, 190, finalY, { align: 'right' });
    if (quoteData.notes) {
        doc.setFontSize(10);
        doc.setTextColor('#2c5aa0');
        doc.text('Notas y Términos:', 20, finalY + 10);
        doc.setFontSize(9);
        doc.setTextColor('#555');
        doc.text(quoteData.notes, 20, finalY + 15, { maxWidth: 170 });
    }
    // Mostrar PDF en vista previa
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    document.getElementById('invoice-preview-modal').innerHTML = `<iframe src="${pdfUrl}" style="width:100%;height:80vh;border:none;"></iframe>`;
    document.getElementById('modal-preview').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Cerrar modal de vista previa
function closePreviewModal() {
    document.getElementById('modal-preview').style.display = 'none';
    document.body.style.overflow = '';
}

// Generar HTML del presupuesto
function generateInvoiceHTML(data, isPreview = false) {
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-AR');
    };
    
    const currency = 'ARS';
    
    // Solo aplicar responsividad si es vista previa Y es móvil
    const isMobile = isPreview && window.innerWidth <= 600;
    const containerStyle = isMobile ? 
        "max-width: 100vw; margin: 0; padding: 15px; font-family: 'Arial', sans-serif; color: #333; background: white;" :
        // Quitar height fijo y agregar padding-bottom para evitar superposición
        "width: 800px; margin: 0 auto; padding: 0 0 120px 0; font-family: 'Arial', sans-serif; color: #333; background: white; box-sizing: border-box; position: relative; min-height: 1131px;";
    
    const headerStyle = isMobile ?
        "display: block; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 3px solid #2c5aa0;" :
        "display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding: 40px 40px 20px 40px; border-bottom: 3px solid #2c5aa0;";
    
    const titleStyle = isMobile ?
        "font-size: 1.8rem; font-weight: bold; color: #2c5aa0; margin-bottom: 5px; text-align: center;" :
        "font-size: 3.5rem; font-weight: bold; color: #2c5aa0; margin-bottom: 8px;";
    
    const companyStyle = isMobile ?
        "text-align: center; margin-top: 15px;" :
        "text-align: right;";
    
    const tableStyle = isMobile ?
        "width: 100%; border-collapse: collapse; margin: 15px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 0.85rem;" :
        "width: calc(100% - 80px); border-collapse: collapse; margin: 30px 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 1.1rem;";
    
    const thStyle = isMobile ?
        "padding: 10px 5px; text-align: left; font-weight: 600; font-size: 0.8rem;" :
        "padding: 20px 15px; text-align: left; font-weight: 600; font-size: 1.1rem;";
    
    const tdStyle = isMobile ?
        "padding: 8px 5px; border-bottom: 1px solid #e1e8ed; font-size: 0.8rem;" :
        "padding: 16px 15px; border-bottom: 1px solid #e1e8ed; font-size: 1rem;";
    
    const totalsStyle = isMobile ?
        "width: 100%; margin-top: 15px;" :
        "margin-left: auto; width: 450px; margin-top: 30px; margin-right: 40px;";
    
    let itemsHtml = '';
    data.items.forEach(item => {
        itemsHtml += `
            <tr>
                <td style="${tdStyle}">${item.description}</td>
                <td style="${tdStyle} text-align: center;">${item.quantity}</td>
                <td style="${tdStyle} text-align: right;">${formatCurrency(item.price, currency)}</td>
                <td style="${tdStyle} text-align: right; font-weight: bold;">${formatCurrency(item.total, currency)}</td>
            </tr>
        `;
    });
    
    // Información del cliente solo si hay algún dato
    let clientInfoHtml = '';
    if (
        data.client.name ||
        data.client.email ||
        data.client.phone ||
        data.client.taxId ||
        data.client.address
    ) {
        clientInfoHtml = `
            <div style="margin: 0 40px 30px 40px;">
                <div style="background-color: #f8f9fc; padding: ${isMobile ? '12px' : '25px'}; border-radius: 10px; border-left: 6px solid #2c5aa0;">
                    <h3 style="margin: 0 0 18px 0; color: #2c5aa0; font-size: ${isMobile ? '0.9rem' : '1.3rem'};">PRESUPUESTAR A:</h3>
                    <div style="font-size: ${isMobile ? '0.85rem' : '1.1rem'}; line-height: 1.6;">
                        <div style="font-weight: bold; font-size: ${isMobile ? '0.95rem' : '1.3rem'}; margin-bottom: 10px;">${data.client.name}</div>
                        ${data.client.email ? `<div style="margin-bottom: 5px;"><strong>Email:</strong> ${data.client.email}</div>` : ''}
                        ${data.client.phone ? `<div style="margin-bottom: 5px;"><strong>Teléfono:</strong> ${data.client.phone}</div>` : ''}
                        ${data.client.taxId ? `<div style="margin-bottom: 5px;"><strong>CUIT/CUIL/DNI:</strong> ${data.client.taxId}</div>` : ''}
                        ${data.client.address ? `<div style="margin-bottom: 5px;"><strong>Dirección:</strong> ${data.client.address.replace(/\n/g, '<br>')}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    const logoHtml = data.company.logo ? `<img src="${data.company.logo}" style="max-width:220px; max-height:90px; object-fit:contain; display:block; margin-bottom:10px;">` : `<div style="font-size: 3.5rem; font-weight: bold; color: #2c5aa0; margin-bottom: 8px;">PRESUPUESTO</div>`;
    
    return `
        <div style="${containerStyle}">
            <!-- Header profesional -->
            <div style="${headerStyle}">
                <div>
                    ${logoHtml}
                    <div style="font-size: 1rem; color: #666; margin-bottom: 10px; ${isMobile ? 'text-align: center;' : ''}">#${data.invoice.number}</div>
                    <div style="font-size: 0.85rem; color: #666; ${isMobile ? 'text-align: center;' : ''}">
                        <strong>Fecha de Emisión:</strong> ${formatDate(data.invoice.date)}<br>
                        ${data.invoice.dueDate ? `<strong>Fecha de Vencimiento:</strong> ${formatDate(data.invoice.dueDate)}` : ''}
                    </div>
                </div>
                <div style="${companyStyle}">
                    <div style="font-size: 1.2rem; font-weight: bold; color: #2c5aa0; margin-bottom: 5px;">
                        ${data.company.name}
                    </div>
                    ${data.company.slogan ? `<div style="font-size: 1rem; color: #888; margin-bottom: 8px; font-style: italic;">${data.company.slogan}</div>` : ''}
                    <div style="font-size: 0.85rem; color: #666; line-height: 1.4;">
                        ${data.company.email ? `${data.company.email}<br>` : ''}
                        ${data.company.phone ? `${data.company.phone}<br>` : ''}
                        ${data.company.taxId ? `<strong>CUIT:</strong> ${data.company.taxId}<br>` : ''}
                        ${data.company.address ? `${data.company.address.replace(/\n/g, '<br>')}` : ''}
                    </div>
                </div>
            </div>
            ${clientInfoHtml}
            <!-- Tabla de artículos -->
            <table style="${tableStyle}">
                <thead>
                    <tr style="background: linear-gradient(135deg, #2c5aa0 0%, #1e3d6c 100%); color: white;">
                        <th style="${thStyle}">Artículo</th>
                        <th style="${thStyle} text-align: center; ${isMobile ? 'width: 50px;' : 'width: 80px;'}">Cant.</th>
                        <th style="${thStyle} text-align: right; ${isMobile ? 'width: 70px;' : 'width: 120px;'}">Precio</th>
                        <th style="${thStyle} text-align: right; ${isMobile ? 'width: 70px;' : 'width: 120px;'}">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            <!-- Totales -->
            <div style="${totalsStyle}">
                <div style="background-color: #f8f9fc; padding: ${isMobile ? '12px' : '25px'}; border-radius: 10px; border: 2px solid #e1e8ed;">
                    <div style="display: flex; justify-content: space-between; padding: ${isMobile ? '6px 0' : '12px 0'}; border-bottom: 1px solid #e1e8ed; font-size: ${isMobile ? '0.8rem' : '1.1rem'};">
                        <span>Total:</span>
                        <span style="font-weight: 500;">${formatCurrency(data.calculations.total, currency)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: ${isMobile ? '10px 0 3px 0' : '18px 0 8px 0'}; border-top: 3px solid #2c5aa0; margin-top: ${isMobile ? '8px' : '15px'}; font-weight: bold; font-size: ${isMobile ? '1rem' : '1.5rem'}; color: #2c5aa0;">
                        <span>TOTAL:</span>
                        <span>${formatCurrency(data.calculations.total, currency)}</span>
                    </div>
                </div>
            </div>
            
            ${data.notes ? `
                <div style="margin: ${isMobile ? '20px 0 0 0' : '40px 40px 0 40px'};">
                    <div style="background-color: #f8f9fc; padding: ${isMobile ? '12px' : '25px'}; border-radius: 10px; border-left: 6px solid #2c5aa0;">
                        <h4 style="margin: 0 0 ${isMobile ? '10px' : '18px'} 0; color: #2c5aa0; font-size: ${isMobile ? '0.85rem' : '1.2rem'};">Notas y Términos:</h4>
                        <p style="margin: 0; font-size: ${isMobile ? '0.75rem' : '1rem'}; line-height: 1.6; color: #555;">${data.notes.replace(/\n/g, '<br>')}</p>
                    </div>
                </div>
            ` : ''}
            
            <!-- Footer profesional -->
            <div style="position: ${isMobile ? 'static' : 'absolute'}; bottom: ${isMobile ? 'auto' : '40px'}; left: ${isMobile ? 'auto' : '40px'}; right: ${isMobile ? 'auto' : '40px'}; margin-top: ${isMobile ? '25px' : '0'}; padding-top: ${isMobile ? '15px' : '30px'}; border-top: 2px solid #e1e8ed; text-align: center; color: #888; font-size: ${isMobile ? '0.65rem' : '0.9rem'}; background: white; z-index: 2;">
                <p style="margin: ${isMobile ? '3px 0' : '10px 0'};">Presupuesto generado el ${new Date().toLocaleDateString('es-AR')}</p>
                <p style="margin: ${isMobile ? '3px 0' : '10px 0'};">Este documento es válido como presupuesto</p>
            </div>
        </div>
    `;
}

// Descargar PDF con paginación usando jsPDF y autoTable
async function downloadPDF(fromModal = false) {
    if (!window.jsPDF || !window.jsPDF.API || !window.jsPDF.API.autoTable) {
        alert('Error: Falta la librería autoTable de jsPDF. Asegúrate de que la conexión a internet esté activa y que el CDN no esté bloqueado.');
        return;
    }
    const doc = new window.jsPDF({ unit: 'mm', format: 'a4' });
    let y = 20;

    // Logo
    if (quoteData.company.logo) {
        const imgProps = doc.getImageProperties(quoteData.company.logo);
        const imgWidth = 50;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        doc.addImage(quoteData.company.logo, 'PNG', 20, y, imgWidth, imgHeight);
        y += imgHeight + 2;
    }

    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor('#2c5aa0');
    doc.text('PRESUPUESTO', 80, 20, { align: 'left' });
    doc.setFontSize(10);
    doc.setTextColor('#333');
    doc.text(`#${quoteData.invoice.number}`, 80, 27);
    doc.text(`Fecha de Emisión: ${quoteData.invoice.date}`, 80, 33);
    if (quoteData.invoice.dueDate) doc.text(`Fecha de Vencimiento: ${quoteData.invoice.dueDate}`, 80, 39);
    y = Math.max(y, 45);

    // Empresa (izquierda)
    let empresaY = y;
    let clienteY = y;
    doc.setFontSize(12);
    doc.setTextColor('#2c5aa0');
    doc.text(quoteData.company.name, 20, empresaY);
    empresaY += 6;
    if (quoteData.company.slogan) {
        doc.setFontSize(10);
        doc.setTextColor('#888');
        doc.text(quoteData.company.slogan, 20, empresaY);
        empresaY += 5;
    }
    doc.setFontSize(10);
    doc.setTextColor('#333');
    if (quoteData.company.email) { doc.text(`Email: ${quoteData.company.email}`, 20, empresaY); empresaY += 5; }
    if (quoteData.company.phone) { doc.text(`Tel: ${quoteData.company.phone}`, 20, empresaY); empresaY += 5; }
    if (quoteData.company.taxId) { doc.text(`CUIT: ${quoteData.company.taxId}`, 20, empresaY); empresaY += 5; }
    if (quoteData.company.address) { doc.text(`Dirección: ${quoteData.company.address}`, 20, empresaY); empresaY += 5; }
    // Cliente (derecha)
    if (quoteData.client.name || quoteData.client.email || quoteData.client.phone || quoteData.client.taxId || quoteData.client.address) {
        doc.setFontSize(11);
        doc.setTextColor('#2c5aa0');
        doc.text('PRESUPUESTAR A:', 120, y);
        clienteY = y + 6;
        doc.setFontSize(10);
        doc.setTextColor('#333');
        if (quoteData.client.name) { doc.text(quoteData.client.name, 120, clienteY); clienteY += 5; }
        if (quoteData.client.email) { doc.text(`Email: ${quoteData.client.email}`, 120, clienteY); clienteY += 5; }
        if (quoteData.client.phone) { doc.text(`Tel: ${quoteData.client.phone}`, 120, clienteY); clienteY += 5; }
        if (quoteData.client.taxId) { doc.text(`CUIT/CUIL/DNI: ${quoteData.client.taxId}`, 120, clienteY); clienteY += 5; }
        if (quoteData.client.address) { doc.text(`Dirección: ${quoteData.client.address}`, 120, clienteY); clienteY += 5; }
    }
    y = Math.max(empresaY, clienteY) + 2;

    // Tabla de artículos con autoTable
    const columns = [
        { header: 'Artículo', dataKey: 'description' },
        { header: 'Cant.', dataKey: 'quantity' },
        { header: 'Precio', dataKey: 'price' },
        { header: 'Total', dataKey: 'total' }
    ];
    const rows = quoteData.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        price: item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 }),
        total: item.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })
    }));
    doc.autoTable({
        startY: y,
        head: [columns.map(col => col.header)],
        body: rows.map(row => columns.map(col => row[col.dataKey])),
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [44, 90, 160], textColor: 255 },
        theme: 'grid',
        margin: { left: 20, right: 20 },
        didDrawPage: function (data) {
            // Footer en cada página
            const pageHeight = doc.internal.pageSize.height;
            doc.setDrawColor(225, 232, 237);
            doc.setLineWidth(0.5);
            doc.line(20, pageHeight - 30, 190, pageHeight - 30);
            doc.setFontSize(9);
            doc.setTextColor('#888');
            doc.text(`Presupuesto generado el ${new Date().toLocaleDateString('es-AR')}`, 105, pageHeight - 22, { align: 'center' });
            doc.text('Este documento es válido como presupuesto', 105, pageHeight - 15, { align: 'center' });
        }
    });

    // Totales
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor('#2c5aa0');
    doc.text('TOTAL:', 140, finalY, { align: 'left' });
    doc.setFontSize(12);
    doc.setTextColor('#333');
    doc.text(`${formatCurrency(quoteData.calculations.total, 'ARS')}`, 190, finalY, { align: 'right' });

    // Notas
    if (quoteData.notes) {
        doc.setFontSize(10);
        doc.setTextColor('#2c5aa0');
        doc.text('Notas y Términos:', 20, finalY + 10);
        doc.setFontSize(9);
        doc.setTextColor('#555');
        doc.text(quoteData.notes, 20, finalY + 15, { maxWidth: 170 });
    }

    doc.setProperties({
        title: `Presupuesto ${quoteData.invoice.number}`,
        subject: `Presupuesto para ${quoteData.client.name}`,
        author: quoteData.company.name,
        creator: 'Generador de Presupuestos Argentina',
        producer: 'Generador de Presupuestos Argentina'
    });
    const fileName = `Presupuesto_${quoteData.invoice.number}_${quoteData.client.name.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
}

// Función auxiliar para manejar descargas en dispositivos móviles
function handleMobileDownload(pdf, fileName) {
    try {
        // Método 1: Intentar descarga con blob
        const pdfOutput = pdf.output('blob');
        const url = URL.createObjectURL(pdfOutput);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
        
        return true;
    } catch (error) {
        console.warn('Descarga con blob falló:', error);
        
        try {
            // Método 2: Usar data URI
            const pdfDataUri = pdf.output('datauristring');
            
            // Intentar crear enlace con data URI
            const link = document.createElement('a');
            link.href = pdfDataUri;
            link.download = fileName;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            return true;
        } catch (dataUriError) {
            console.warn('Descarga con data URI falló:', dataUriError);
            
            // Método 3: Abrir en nueva ventana con opciones de descarga
            try {
                const pdfDataUri = pdf.output('datauristring');
                const newWindow = window.open('', '_blank');
                
                if (newWindow) {
                    newWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                            <head>
                                <title>${fileName}</title>
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <style>
                                    body { 
                                        margin: 0; 
                                        padding: 15px; 
                                        font-family: Arial, sans-serif; 
                                        background: #f5f5f5;
                                    }
                                    .container {
                                        max-width: 100%;
                                        background: white;
                                        border-radius: 8px;
                                        padding: 20px;
                                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                    }
                                    .download-header { 
                                        text-align: center; 
                                        margin-bottom: 20px; 
                                        color: #2c5aa0;
                                    }
                                    .download-btn { 
                                        background: #2c5aa0; 
                                        color: white; 
                                        padding: 15px 30px; 
                                        border: none; 
                                        border-radius: 8px; 
                                        font-size: 16px; 
                                        cursor: pointer; 
                                        text-decoration: none; 
                                        display: inline-block; 
                                        margin: 10px;
                                        min-width: 200px;
                                    }
                                    .download-btn:hover {
                                        background: #1e3d6c;
                                    }
                                    .instructions {
                                        background: #e8f4f8;
                                        padding: 15px;
                                        border-radius: 6px;
                                        margin: 20px 0;
                                        font-size: 14px;
                                        line-height: 1.5;
                                    }
                                    iframe { 
                                        width: 100%; 
                                        height: 60vh; 
                                        border: 1px solid #ddd; 
                                        border-radius: 6px;
                                        margin-top: 20px;
                                    }
                                    @media (max-width: 600px) {
                                        .container { padding: 15px; margin: 10px; }
                                        iframe { height: 50vh; }
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    <div class="download-header">
                                        <h2>📄 Presupuesto Generado</h2>
                                        <p>Tu presupuesto ${fileName.replace(/\.pdf$/, '')} está listo</p>
                                    </div>
                                    
                                    <div style="text-align: center;">
                                        <a href="${pdfDataUri}" download="${fileName}" class="download-btn">
                                            📥 Descargar PDF
                                        </a>
                                    </div>
                                    
                                    <div class="instructions">
                                        <strong>💡 Instrucciones para descargar:</strong><br>
                                        • <strong>Android:</strong> Toca "Descargar PDF" y busca el archivo en tu carpeta de Descargas<br>
                                        • <strong>iPhone/iPad:</strong> Toca "Descargar PDF", luego "Compartir" y elige "Guardar en Archivos"<br>
                                        • Si no funciona, mantén presionado el botón y selecciona "Descargar enlace"
                                    </div>
                                    
                                    <iframe src="${pdfDataUri}" type="application/pdf"></iframe>
                                </div>
                            </body>
                        </html>
                    `);
                    newWindow.document.close();
                    return true;
                } else {
                    throw new Error('No se pudo abrir ventana emergente');
                }
            } catch (windowError) {
                console.error('Todos los métodos de descarga fallaron:', windowError);
                alert('Error al descargar el PDF. Tu navegador puede estar bloqueando las descargas. Por favor, permite ventanas emergentes y descargas, luego intenta de nuevo.');
                return false;
            }
        }
    }
}

// Botón para quitar el logo manualmente
function removeLogo() {
    localStorage.removeItem('companyLogo');
    const logoPreview = document.getElementById('logo-preview');
    if (logoPreview) logoPreview.innerHTML = '';
    const logoInput = document.getElementById('company-logo');
    if (logoInput) logoInput.value = '';
    const hiddenLogo = document.getElementById('company-logo-base64');
    if (hiddenLogo) hiddenLogo.value = '';
}
