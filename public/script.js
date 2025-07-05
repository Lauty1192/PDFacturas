// Variables globales
let invoiceData = {};
let itemsData = [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Establecer fecha actual
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoice-date').value = today;
    
    // Establecer fecha de vencimiento (30 días después)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    document.getElementById('due-date').value = dueDate.toISOString().split('T')[0];
    
    // Generar número de factura automático
    window.generatedInvoiceNumber = generateInvoiceNumber();
    
    // Añadir event listeners para cálculos automáticos
    addCalculationListeners();
});

// Generar número de factura automático de 7 dígitos
function generateInvoiceNumber() {
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
        <input type="text" class="item-description" placeholder="Descripción del producto/servicio">
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
        alert('Debe haber al menos un artículo en la factura.');
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
    let subtotal = 0;
    
    itemRows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        subtotal += quantity * price;
    });
    
    const discountRate = parseFloat(document.getElementById('discount').value) || 0;
    const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
    
    const discountAmount = (subtotal * discountRate) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = (subtotalAfterDiscount * taxRate) / 100;
    const total = subtotalAfterDiscount + taxAmount;
    
    return {
        subtotal,
        discountAmount,
        subtotalAfterDiscount,
        taxAmount,
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
                <input type="text" class="item-description" placeholder="Descripción del producto/servicio">
                <input type="number" class="item-quantity" value="1" min="1">
                <input type="number" class="item-price" step="0.01" min="0" placeholder="0.00">
                <span class="item-total">$ 0,00</span>
                <button type="button" class="remove-item" onclick="removeItem(this)">×</button>
            </div>
        `;
        
        // Generar nuevo número de factura
        window.generatedInvoiceNumber = generateInvoiceNumber();
        
        // Ocultar vista previa
        const previewSection = document.getElementById('preview-section');
        if (previewSection) {
            previewSection.style.display = 'none';
        }
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
    
    return {
        company: {
            name: document.getElementById('company-name').value,
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
            number: window.generatedInvoiceNumber,
            date: document.getElementById('invoice-date').value,
            dueDate: document.getElementById('due-date').value,
            currency: 'ARS'
        },
        items: items,
        calculations: calculations,
        taxRate: parseFloat(document.getElementById('tax-rate').value) || 0,
        discountRate: parseFloat(document.getElementById('discount').value) || 0,
        notes: document.getElementById('notes').value
    };
}

// Validar datos requeridos
function validateRequiredFields() {
    const requiredFields = [
        'company-name',
        'client-name'
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
function openPreviewPopup() {
    const errors = validateRequiredFields();
    if (errors.length > 0) {
        alert('Por favor, complete los siguientes campos requeridos:\n\n' + errors.join('\n'));
        return;
    }
    invoiceData = collectFormData();
    const previewHtml = generateInvoiceHTML(invoiceData, true); // true = responsivo para vista previa
    document.getElementById('invoice-preview-modal').innerHTML = previewHtml;
    document.getElementById('modal-preview').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Cerrar modal de vista previa
function closePreviewModal() {
    document.getElementById('modal-preview').style.display = 'none';
    document.body.style.overflow = '';
}

// Generar HTML de la factura
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
        "width: 800px; height: 1131px; margin: 0 auto; padding: 0; font-family: 'Arial', sans-serif; color: #333; background: white; box-sizing: border-box; position: relative;";
    
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
    
    return `
        <div style="${containerStyle}">
            <!-- Header profesional -->
            <div style="${headerStyle}">
                <div>
                    <div style="${titleStyle}">FACTURA</div>
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
                    <div style="font-size: 0.85rem; color: #666; line-height: 1.4;">
                        ${data.company.email ? `${data.company.email}<br>` : ''}
                        ${data.company.phone ? `${data.company.phone}<br>` : ''}
                        ${data.company.taxId ? `<strong>CUIT:</strong> ${data.company.taxId}<br>` : ''}
                        ${data.company.address ? `${data.company.address.replace(/\n/g, '<br>')}` : ''}
                    </div>
                </div>
            </div>
            
            <!-- Información del cliente -->
            <div style="margin: 0 40px 30px 40px;">
                <div style="background-color: #f8f9fc; padding: ${isMobile ? '12px' : '25px'}; border-radius: 10px; border-left: 6px solid #2c5aa0;">
                    <h3 style="margin: 0 0 18px 0; color: #2c5aa0; font-size: ${isMobile ? '0.9rem' : '1.3rem'};">FACTURAR A:</h3>
                    <div style="font-size: ${isMobile ? '0.85rem' : '1.1rem'}; line-height: 1.6;">
                        <div style="font-weight: bold; font-size: ${isMobile ? '0.95rem' : '1.3rem'}; margin-bottom: 10px;">${data.client.name}</div>
                        ${data.client.email ? `<div style="margin-bottom: 5px;"><strong>Email:</strong> ${data.client.email}</div>` : ''}
                        ${data.client.phone ? `<div style="margin-bottom: 5px;"><strong>Teléfono:</strong> ${data.client.phone}</div>` : ''}
                        ${data.client.taxId ? `<div style="margin-bottom: 5px;"><strong>CUIT/CUIL/DNI:</strong> ${data.client.taxId}</div>` : ''}
                        ${data.client.address ? `<div style="margin-bottom: 5px;"><strong>Dirección:</strong> ${data.client.address.replace(/\n/g, '<br>')}</div>` : ''}
                    </div>
                </div>
            </div>
            
            <!-- Tabla de artículos -->
            <table style="${tableStyle}">
                <thead>
                    <tr style="background: linear-gradient(135deg, #2c5aa0 0%, #1e3d6c 100%); color: white;">
                        <th style="${thStyle}">Descripción</th>
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
                        <span>Subtotal:</span>
                        <span style="font-weight: 500;">${formatCurrency(data.calculations.subtotal, currency)}</span>
                    </div>
                    ${data.discountRate > 0 ? `
                        <div style="display: flex; justify-content: space-between; padding: ${isMobile ? '6px 0' : '12px 0'}; border-bottom: 1px solid #e1e8ed; color: #e74c3c; font-size: ${isMobile ? '0.8rem' : '1.1rem'};">
                            <span>Descuento (${data.discountRate}%):</span>
                            <span style="font-weight: 500;">-${formatCurrency(data.calculations.discountAmount, currency)}</span>
                        </div>
                    ` : ''}
                    ${data.taxRate > 0 ? `
                        <div style="display: flex; justify-content: space-between; padding: ${isMobile ? '6px 0' : '12px 0'}; border-bottom: 1px solid #e1e8ed; font-size: ${isMobile ? '0.8rem' : '1.1rem'};">
                            <span>IVA (${data.taxRate}%):</span>
                            <span style="font-weight: 500;">${formatCurrency(data.calculations.taxAmount, currency)}</span>
                        </div>
                    ` : ''}
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
            <div style="position: ${isMobile ? 'static' : 'absolute'}; bottom: ${isMobile ? 'auto' : '40px'}; left: ${isMobile ? 'auto' : '40px'}; right: ${isMobile ? 'auto' : '40px'}; margin-top: ${isMobile ? '25px' : '0'}; padding-top: ${isMobile ? '15px' : '30px'}; border-top: 2px solid #e1e8ed; text-align: center; color: #888; font-size: ${isMobile ? '0.65rem' : '0.9rem'};">
                <p style="margin: ${isMobile ? '3px 0' : '10px 0'};">Factura generada el ${new Date().toLocaleDateString('es-AR')}</p>
                <p style="margin: ${isMobile ? '3px 0' : '10px 0'};">Este documento es válido como comprobante de venta</p>
            </div>
        </div>
    `;
}

// Descargar PDF
async function downloadPDF(fromModal = false) {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        alert('Error: No se pudo cargar la librería PDF. Por favor, recarga la página.');
        return;
    }
    try {
        const downloadBtn = fromModal
            ? document.querySelector('#modal-preview .btn-success')
            : document.querySelector('.btn-success');
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = 'Generando PDF...';
        downloadBtn.disabled = true;
        
        // Crear un elemento temporal para generar el PDF con formato de escritorio
        const tempElement = document.createElement('div');
        tempElement.innerHTML = generateInvoiceHTML(invoiceData, false); // false = formato de escritorio
        tempElement.style.position = 'absolute';
        tempElement.style.left = '-9999px';
        tempElement.style.top = '0';
        document.body.appendChild(tempElement);
        
        const canvas = await html2canvas(tempElement, {
            scale: 2, // Reducir escala para optimizar tamaño
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            allowTaint: false,
            removeContainer: true,
            letterRendering: true,
            height: null, // Permitir altura automática
            width: 800   // Ancho fijo para mantener proporciones
        });
        
        // Eliminar el elemento temporal
        document.body.removeChild(tempElement);
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });
        
        const pageWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        
        // Sin márgenes - ocupar toda la página
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Si el contenido es más alto que la página, escalarlo para que quepa exactamente
        let finalWidth, finalHeight, xOffset, yOffset;
        
        if (imgHeight > pageHeight) {
            // Escalar para que quepa exactamente en la altura de la página
            finalHeight = pageHeight;
            finalWidth = (canvas.width * finalHeight) / canvas.height;
            xOffset = (pageWidth - finalWidth) / 2;
            yOffset = 0;
        } else {
            // Escalar para que ocupe toda la página (puede ser más grande que el contenido original)
            finalWidth = pageWidth;
            finalHeight = pageHeight;
            xOffset = 0;
            yOffset = 0;
        }
        
        pdf.addImage(
            canvas.toDataURL('image/png', 1.0),
            'PNG',
            xOffset,
            yOffset,
            finalWidth,
            finalHeight,
            undefined,
            'FAST'
        );
        pdf.setProperties({
            title: `Factura ${invoiceData.invoice.number}`,
            subject: `Factura para ${invoiceData.client.name}`,
            author: invoiceData.company.name,
            creator: 'Generador de Facturas Argentina',
            producer: 'Generador de Facturas Argentina'
        });
        const fileName = `Factura_${invoiceData.invoice.number}_${invoiceData.client.name.replace(/\s+/g, '_')}.pdf`;
        
        // Detectar si es móvil para manejar la descarga de manera diferente
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobileDevice) {
            // Usar la función auxiliar para manejar descargas en móviles
            const downloadSuccess = handleMobileDownload(pdf, fileName);
            if (!downloadSuccess) {
                // Si todos los métodos fallan, mostrar error
                downloadBtn.textContent = 'Error en descarga';
                setTimeout(() => {
                    downloadBtn.textContent = originalText;
                }, 3000);
                return;
            }
        } else {
            // En escritorio, usar el método normal de jsPDF
            pdf.save(fileName);
        }
        
        downloadBtn.textContent = originalText;
        downloadBtn.disabled = false;
    } catch (error) {
        console.error('Error al generar PDF:', error);
        alert('Error al generar el PDF. Por favor, intenta de nuevo.');
        const downloadBtn = fromModal
            ? document.querySelector('#modal-preview .btn-success')
            : document.querySelector('.btn-success');
        downloadBtn.textContent = 'Descargar PDF';
        downloadBtn.disabled = false;
    }
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
                                        <h2>📄 Factura Generada</h2>
                                        <p>Tu factura ${fileName.replace(/\.pdf$/, '')} está lista</p>
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
