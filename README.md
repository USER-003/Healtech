# Healteach

## Descripción

El proyecto HealTech se ha diseñado con el objetivo de transformar la manera en que los pacientes gestionan sus recetas médicas, proporcionando una solución digital tanto en plataformas web como móviles.

Para más información, visita nuestra [landing page](https://healtech.codes).

## Stack

- **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- **React Native**: Framework para desarrollo de aplicaciones móviles multiplataforma.
- **Firebase**: Base de datos para el desarrollo de aplicaciones móviles y web de Google.
- **Expo**: Expo es una plataforma y un conjunto de herramientas para el desarrollo de aplicaciones móviles con React Native.
- **Expo Go**: Aplicación móvil que puedes instalar en tu dispositivo Android para probar aplicaciones creadas con Expo.

## Requisitos Previos

Asegúrate de tener instaladas las siguientes herramientas en tu sistema antes de empezar:

- [Node.js](https://nodejs.org/) (Incluye npm)

## Configuración de Firebase

Antes de ejecutar el proyecto, es necesario contar con una cuenta de Firebase y las llaves de configuración del proyecto. Sigue estos pasos:

1. **Crear una cuenta en Firebase**

   - Accede a [https://firebase.google.com/](https://firebase.google.com/) y crea una cuenta o inicia sesión con tu cuenta de Google.
   - Una vez en el panel de Firebase, haz clic en "Agregar proyecto".
   - Sigue las instrucciones para asignar un nombre a tu proyecto y completar la configuración inicial.

2. **Obtener las llaves de configuración**

   - Dentro de tu proyecto de Firebase, ve a la sección "Project settings" (Configuración del proyecto).
   - En la pestaña "General", encontrarás tus claves del proyecto:

     - `apiKey`
     - `authDomain`
     - `databaseURL`
     - `projectId`
     - `storageBucket`
     - `messagingSenderId`
     - `appId`

   - Copia estos valores.

3. **Configurar variables de entorno**

   - En el archivo `.env` del proyecto, pega las llaves obtenidas de Firebase en las variables correspondientes.

   Ejemplo de `.env` (utilizando tus propios valores):

   ```env
   API_KEY=TU_API_KEY
   AUTH_DOMAIN=TU_AUTH_DOMAIN
   DATABASE_URL=TU_DATABASE_URL
   PROJECT_ID=TU_PROJECT_ID
   STORAGE_BUCKET=TU_STORAGE_BUCKET
   MESSAGING_SENDER_ID=TU_MESSAGING_SENDER_ID
   APP_ID=TU_APP_ID
   ```

## Cómo empezar

Sigue estos pasos para clonar el repositorio, instalar las dependencias y ejecutar el proyecto:

1. **Clonar el repositorio**

   ```sh
   git clone https://github.com/tu-usuario/healtech.git
   cd healtech
   ```

2. **Instalar las dependencias**

   ```sh
   npm install
   ```

3. **Ejecutar el proyecto**

   ```sh
   npx expo start
   ```

Esto abrirá Expo Developer Tools en tu navegador. Desde allí, puedes escanear el código QR con la aplicación Expo Go en tu dispositivo móvil para ver la aplicación en acción.
