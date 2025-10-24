INSTRUCCIONES PASO A PASO PARA EJECUTAR LAS PRUEBAS DE API DEMOBLAZE
=====================================================================

REQUISITOS PREVIOS:
------------------
- Tener Node.js instalado en tu computadora
- Si no lo tienes, descárgalo desde: https://nodejs.org/
- Asegúrate de tener conexión a internet

PASO 1: ABRIR EL TERMINAL
-------------------------
1. Presiona las teclas Windows + R al mismo tiempo
2. Escribe "cmd" y presiona Enter
3. Se abrirá una ventana negra llamada "Símbolo del sistema" o "Terminal"

PASO 2: UBICARSE EN LA CARPETA DEL PROYECTO
------------------------------------------
1. En el terminal, escribe: cd (ubicación de tu carpeta del proyecto)
   Por ejemplo: cd C:\Users\USER-PC\Desktop\demoblaze-API
2. Presiona Enter
3. Verás que el cursor ahora muestra la ruta de tu proyecto

PASO 3: INSTALAR LAS DEPENDENCIAS
---------------------------------
1. Escribe: npm install
2. Presiona Enter
3. Espera a que termine la instalación (puede tomar unos minutos)
4. Verás muchos mensajes de descarga, esto es normal

PASO 4: EJECUTAR LAS PRUEBAS
----------------------------
OPCIÓN A - PRUEBAS AUTOMÁTICAS CON REPORTE DETALLADO:
1. Escribe: npm run test:api:detailed
2. Presiona Enter
3. Verás que se ejecutan las pruebas automáticamente
4. Al finalizar, aparecerá un mensaje de éxito

OPCIÓN B - PRUEBAS VISUALES (INTERFAZ GRÁFICA)(OPCIONAL):
1. Escribe: npm run test:open
2. Presiona Enter
3. Se abrirá una ventana del navegador con Cypress
4. Haz clic en "api-demoblaze.cy.js" para ejecutar las pruebas
5. Podrás ver las pruebas ejecutándose paso a paso
6. Al finalizar, verás los resultados en pantalla

PASO 5: VER EL REPORTE DETALLADO
--------------------------------
1. Navega a la carpeta: (ubicación de tu proyecto)\cypress\reports\
   Por ejemplo: C:\Users\USER-PC\Desktop\demoblaze-API\cypress\reports\
2. Busca el archivo llamado "detailed-report.html"
3. Haz doble clic en el archivo "detailed-report.html"
4. Se abrirá en tu navegador web (Chrome, Firefox, Edge, etc.)

PASO 6: USAR EL REPORTE INTERACTIVO
------------------------------------
En el reporte que se abre en el navegador:
- Haz clic en cualquier prueba para ver los detalles
- Usa los botones en la parte superior para:
  * "Expandir Todas" - Ver todas las pruebas abiertas
  * "Contraer Todas" - Cerrar todas las pruebas
  * "Solo Exitosas" - Ver solo las pruebas que pasaron
  * "Solo Fallidas" - Ver solo las pruebas que fallaron

ATAJOS DE TECLADO EN EL REPORTE:
- Ctrl + A: Expandir todas las pruebas
- Ctrl + C: Contraer todas las pruebas
- Ctrl + P: Mostrar solo pruebas exitosas
- Ctrl + F: Mostrar solo pruebas fallidas

¿QUÉ HACEN LAS PRUEBAS?
----------------------
Las pruebas verifican que la API de Demoblaze funcione correctamente:
1. Crear un nuevo usuario (registro)
2. Intentar crear un usuario que ya existe
3. Hacer login con credenciales correctas
4. Intentar login con credenciales incorrectas

¿QUÉ SIGNIFICA CADA RESULTADO?
- ✅ PASÓ: La prueba funcionó correctamente
- ❌ FALLÓ: La prueba encontró un problema

NOTAS IMPORTANTES:
------------------
- Asegúrate de tener conexión a internet
- No cierres el terminal hasta que terminen las pruebas
- El reporte se guarda automáticamente en la carpeta (tu proyecto)\cypress\reports\
- Puedes ejecutar las pruebas cuantas veces quieras

SOLUCIÓN DE PROBLEMAS:
---------------------
Si algo no funciona:
1. Verifica que estés en la carpeta correcta
2. Asegúrate de que npm install terminó completamente
3. Revisa que tengas conexión a internet
4. Intenta cerrar y abrir el terminal nuevamente

Elaborado por Fernando Noguera
