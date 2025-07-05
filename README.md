# PDFacturas Argentina

Generador de facturas profesionales en PDF para Argentina 🇦🇷

---

## 🚀 ¿Qué es esto?
Una aplicación web moderna para crear, previsualizar y descargar facturas profesionales en formato PDF, adaptada a la normativa y estética argentina (CUIT, ARS, IVA, etc). El diseño es profesional, compacto y 100% responsivo para usar tanto en PC como en celular.

## ✨ Características principales
- **Formulario simple y profesional** para cargar datos de empresa, cliente y productos/servicios.
- **Vista previa en modal**: revisá tu factura antes de descargarla.
- **Descarga en PDF**: PDF formato A4, con formato profesional.
- **Soporte ARS**: moneda fija en pesos argentinos.
- **IVA configurable** (por defecto 21%).
- **Generación automática de número de factura**.
- **Diseño responsivo**: usable y legible en cualquier dispositivo.
- **Compatibilidad con navegadores modernos**: Chrome, Firefox, Edge, Safari.

## 🖥️ ¿Cómo lo uso?

1. **Cloná el repositorio**
   ```bash
   git clone https://github.com/tuusuario/PDFacturas.git
   cd PDFacturas
   ```
2. **Instalá las dependencias**
   ```bash
   npm install
   ```
3. **Iniciá el servidor**
   ```bash
   npm start
   ```
4. **Abrí tu navegador** y entrá a [http://localhost:3000](http://localhost:3000)

## 📱 Modo de uso
- Completá los datos de tu empresa y cliente.
- Agregá los productos o servicios.
- Previsualizá la factura en el modal.
- Descargá el PDF (ocupa toda la hoja A4, listo para imprimir o enviar).

## 🛠️ Tecnologías
- Node.js + Express
- EJS (plantillas)
- HTML5, CSS3, JavaScript
- [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://github.com/niklasvh/html2canvas)

## 📦 Estructura
- `/public` → JS, CSS y favicon
- `/views` → Plantillas EJS
- `server.js` → Servidor Express

## 📝 Licencia
MIT

---

¡Hecho con ❤️ en Argentina!
