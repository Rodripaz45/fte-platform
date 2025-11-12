# Instrucciones para Configurar Firebase Storage

## ✅ Configuración Completada

Ya hemos configurado el código para usar Firebase Storage. Ahora necesitas seguir estos pasos:

## 1. Crear el archivo .env.local

Crea un archivo `.env.local` en la carpeta `apps/web/` con el siguiente contenido:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDTpOQbC7kbvcHNTacJr8iwUkX9kd_B-Ss
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mm-inmobiliiaria.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mm-inmobiliiaria
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mm-inmobiliiaria.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1043974357438
NEXT_PUBLIC_FIREBASE_APP_ID=1:1043974357438:web:8658bd927265954283f9ef
```

## 2. Configurar Reglas de Seguridad en Firebase Storage

### Paso 1: Ve a Firebase Console
1. Abre [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **mm-inmobiliiaria**
3. Ve a **Storage** en el menú lateral

### Paso 2: Configurar las Reglas

Ve a la pestaña **Rules** y configura las siguientes reglas:

**Para Desarrollo (Modo Prueba - permite acceso público temporalmente):**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ IMPORTANTE**: Esta regla permite acceso público. Úsala solo para desarrollo.

**Para Producción (Reglas más seguras):**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura de CVs a usuarios autenticados
    match /cvs/{participanteId}/{fileName} {
      allow read: if true; // Por ahora permitimos lectura pública
      // Permitir escritura con validaciones
      allow write: if request.resource.size < 10 * 1024 * 1024 // Máximo 10MB
                   && request.resource.contentType == 'application/pdf';
    }
  }
}
```

**Nota**: Estas reglas permiten lectura pública y escritura de PDFs menores a 10MB. Para mayor seguridad, puedes implementar autenticación de Firebase más adelante.

### Paso 3: Habilitar Firebase Storage

Si aún no has habilitado Firebase Storage:
1. Haz clic en "Comenzar" en la sección Storage
2. Selecciona el modo de seguridad (puedes usar "Modo de prueba" para desarrollo)
3. Selecciona una ubicación para el bucket
4. Haz clic en "Listo"

## 3. Verificar la Configuración

1. Reinicia el servidor de desarrollo:
   ```bash
   cd apps/web
   npm run dev
   ```

2. Intenta subir un CV desde la aplicación
3. Verifica en Firebase Console > Storage que el archivo se haya subido correctamente

## 4. Estructura de Archivos en Firebase Storage

Los CVs se almacenarán en la siguiente estructura:

```
gs://mm-inmobiliiaria.firebasestorage.app/
  └── cvs/
      └── {participanteId}/
          ├── cv-v1-1234567890.pdf
          ├── cv-v2-1234567891.pdf
          └── cv-1234567892.pdf
```

## 5. Solución de Problemas

### Error: "Firebase: Error (auth/configuration-not-found)"
- Verifica que el archivo `.env.local` existe en `apps/web/`
- Verifica que todas las variables de entorno estén configuradas correctamente
- Reinicia el servidor de desarrollo después de crear/modificar `.env.local`

### Error: "Permission denied" al subir archivos
- Verifica las reglas de seguridad en Firebase Storage
- Asegúrate de que las reglas permitan escritura (por ahora, usa las reglas de desarrollo)

### Error: "File too large"
- Verifica que el archivo no exceda 10MB
- Considera comprimir el PDF antes de subirlo

## 6. Próximos Pasos

Una vez configurado:
1. Prueba subir un CV desde la aplicación
2. Verifica que el archivo aparezca en Firebase Storage
3. Verifica que el backend pueda descargar el archivo desde la URL
4. Considera implementar autenticación de Firebase para mayor seguridad en producción

## Notas de Seguridad

- ⚠️ **Nunca commitees el archivo `.env.local`** con credenciales reales
- 🔒 Las reglas de seguridad deben ser más estrictas en producción
- 📝 Considera implementar autenticación de Firebase para validar usuarios
- 🛡️ En producción, limita el acceso a los archivos según el `participanteId`

