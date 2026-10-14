# 👟 Flow PM Store - Tienda de Zapatillas

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Motion](https://img.shields.io/badge/Motion-000000?style=for-the-badge&logo=framer&logoColor=white)

> Tienda online moderna y responsiva para **Flow PM Store**, con catálogo de zapatillas, carro de compras, pedidos por WhatsApp y un panel de administración para que los dueños gestionen su propio stock.

Este proyecto ofrece una experiencia de compra rápida y profesional para los clientes: pueden explorar el catálogo, filtrar por categoría, elegir su talla y enviar el pedido directo por WhatsApp. Los dueños, por su parte, administran todo desde un panel privado, sin tocar código.

---

## 🌟 Características Principales

- **Catálogo Dinámico:** Los productos se leen en tiempo real desde una base de datos en la nube.
- **Filtros y Búsqueda:** Por categoría (Hombre, Mujer, Niño), ofertas, orden por precio y búsqueda por nombre.
- **Carro de Compras:** Selección de talla, cantidades y total, con el pedido listo para enviarse por WhatsApp.
- **Panel de Administración:** Los dueños pueden agregar, editar, ocultar y eliminar zapatillas con foto, precio, tallas y etiquetas.
- **Control de Stock:** Las zapatillas sin tallas disponibles se muestran como "Agotado", con acceso directo para consultar reposición.
- **Fotos Optimizadas:** Cada imagen se reduce y se convierte a WebP al subirla, para una carga más rápida.
- **Diseño Responsivo:** Adaptable a celulares, tablets y computadores.
- **Animaciones Fluidas:** Efectos suaves en los botones y transiciones, respetando la preferencia de "reducir movimiento" del usuario.
- **Identidad de Marca:** Paleta de colores (turquesa, negro y blanco) tomada directamente del logo de la tienda.

---

## 🧰 Tecnologías Utilizadas

| Tecnología | Uso |
| --- | --- |
| **React + Vite** | Interfaz y entorno de desarrollo |
| **Tailwind CSS** | Estilos y diseño responsivo |
| **Supabase** | Base de datos (PostgreSQL), autenticación y almacenamiento de fotos |
| **Motion** | Animaciones |
| **Vercel** | Publicación del sitio |

---

## 📁 Estructura del Proyecto

```text
FlowPM-Store/
└── flowpm-app/
    ├── public/                 # Logo e imágenes estáticas
    ├── src/
    │   ├── App.jsx             # Tienda: catálogo, carro y rutas
    │   ├── Admin.jsx           # Panel de administración
    │   ├── lib/
    │   │   └── supabase.js     # Conexión con la base de datos
    │   ├── main.jsx
    │   └── index.css
    ├── supabase-setup.sql      # Script que crea tablas, seguridad y almacenamiento
    ├── .env                    # Variables privadas (NO se sube a GitHub)
    └── package.json
```

---

## 🛠️ Requisitos Previos

Para ejecutar este proyecto de manera local en tu computador, necesitas tener instalado:

*   [Node.js](https://nodejs.org/) (incluye el gestor de paquetes npm)
*   [Git](https://git-scm.com/)
*   Una cuenta gratuita en [Supabase](https://supabase.com/)

---

## 🚀 Instalación y Despliegue Local

Sigue estos pasos en tu terminal para correr la tienda en tu máquina:

**1. Clonar el repositorio y entrar a la carpeta del proyecto:**
```bash
git clone https://github.com/OrionRV6/FlowPM_Store.git
cd FlowPM-Store/flowpm-app
```

**2. Instalar las dependencias de Node:**
```bash
npm install
```

**3. Configurar la base de datos en Supabase:**

1. Crea un proyecto nuevo en [supabase.com](https://supabase.com/).
2. Abre **SQL Editor**, pega el contenido de `supabase-setup.sql` y presiona **Run**. Esto crea la tabla de productos, las reglas de seguridad y la carpeta de fotos.
3. Ve a **Authentication > Users > Add user** y crea el usuario administrador (correo y contraseña). Marca la opción de confirmar el correo automáticamente.
4. En **Authentication > Sign In / Providers**, desactiva *Allow new users to sign up* para que nadie más pueda crear cuentas.

**4. Crear el archivo de variables de entorno:**

En la carpeta `flowpm-app`, crea un archivo llamado `.env` con los datos de **Project Settings > API**:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publica
```

> ⚠️ El archivo `.env` está en `.gitignore` y nunca debe subirse a GitHub.

**5. Iniciar el servidor de desarrollo:**
```bash
npm run dev
```

🌐 **¡Listo!** La tienda estará disponible abriendo `http://localhost:5173` en tu navegador.

---

## 🔐 Panel de Administración

El panel está disponible en la siguiente dirección:

```text
http://localhost:5173/#/admin
```

En el sitio publicado, es la misma dirección de la tienda con `/#/admin` al final. Desde ahí, iniciando sesión con el usuario administrador, se puede:

- ➕ Agregar zapatillas con foto, modelo, marca, categoría, precio, precio anterior (ofertas), tallas y etiqueta.
- ✏️ Editar cualquier producto existente.
- 👁️ Ocultar o mostrar productos sin eliminarlos.
- 🗑️ Eliminar productos que ya no se venden.

La seguridad está resuelta en la base de datos: cualquier visitante puede **ver** el catálogo, pero solo el usuario administrador puede **modificarlo**.

---

## ☁️ Publicación en Vercel

1. Sube el proyecto a GitHub.
2. Entra a [vercel.com](https://vercel.com/) con tu cuenta de GitHub y presiona **Add New > Project**.
3. Importa este repositorio y, en **Root Directory**, selecciona `flowpm-app`.
4. En **Environment Variables**, agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los mismos valores de tu `.env`.
5. Presiona **Deploy**. En un par de minutos tendrás tu tienda en línea con una dirección `.vercel.app`, y podrás conectarle un dominio propio.

---

## ⚙️ Personalización Rápida

Al inicio de `src/App.jsx` se encuentran los datos de la tienda, fáciles de editar:

- `STORE`: nombre, cuenta de Instagram y número de WhatsApp.
- `WA_DEFAULT_MESSAGE`: mensaje inicial que se envía al escribir por WhatsApp.
- `BENEFITS`: información de entregas, envíos y cambios.
