# samp-monitor-bot

¡Hola! Soy **MarquitosApz**, desarrollador venezolano 🇻🇪.

Este bot fue creado desde cero para monitorear servidores SA-MP de forma global, permitiendo que múltiples servidores de Discord lo usen simultáneamente.

## Características

- Guarda una IP y puerto SA-MP por cada servidor de Discord.
- Comandos para consultar información del servidor y cantidad de jugadores.
- Comando para mostrar skins de GTA Underground.
- Diseñado para ser un bot global y escalable.

## Requisitos

- Node.js
- Hosting privado o VPS (no recomendado en Replit u otros hostings gratuitos que bloquean conexiones salientes)

## Instalación

1. Clona este repositorio.
2. Instala dependencias con `npm install`.
3. Configura tu token y client ID en `index.js`.
4. Crea un archivo `config.json` vacío en la raíz del proyecto:
   ```json
   {}
   ```
5. Ejecuta el bot con `node index.js`.

## Uso

- Usa `/establecerip` para guardar la IP y puerto de tu servidor SA-MP en tu servidor de Discord.
- Usa `/servidor` para ver información del servidor.
- Usa `/jugadores` para ver la cantidad de jugadores conectados.
- Usa `/skin` para mostrar skins de GTA Underground por ID.

## Nota importante

Este bot **no funciona en Replit u otros hostings gratuitos** que bloquean las conexiones salientes necesarias para consultar servidores SA-MP.  
Se recomienda usar un hosting privado o VPS donde el bot pueda abrir conexiones externas libremente.

---

## Apoyo al proyecto

Si te gusta este bot y quieres apoyar mi trabajo, puedes hacer una donación voluntaria a través de PayPal:  
**marquitoszamparo@gmail.com**

> _Tu aporte no es obligatorio, pero lo agradezco mucho y me ayuda a seguir creando más proyectos._

---

¡Gracias por usar samp-monitor-bot!  
Creado con ❤️ por MarquitosApz
