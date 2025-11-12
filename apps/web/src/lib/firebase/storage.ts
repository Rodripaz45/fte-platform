// Servicio para subir archivos a Firebase Storage
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

export interface UploadFileOptions {
  file: File;
  path: string; // Ruta en el storage, ej: 'cvs/participanteId/nombre-archivo.pdf'
  onProgress?: (progress: number) => void; // Callback para el progreso (0-100)
}

/**
 * Sube un archivo a Firebase Storage con progreso
 * @param options Opciones de subida
 * @returns URL de descarga del archivo
 */
export async function uploadFile(options: UploadFileOptions): Promise<string> {
  const { file, path, onProgress } = options;

  try {
    // Crear referencia al archivo en Storage
    const storageRef = ref(storage, path);

    // Crear tarea de subida con progreso
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Retornar una promesa que se resuelve cuando la subida termina
    return new Promise<string>((resolve, reject) => {
      // Monitorear el progreso de la subida
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calcular el progreso
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          
          // Llamar al callback de progreso si existe
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          // Error durante la subida
          console.error('Error subiendo archivo a Firebase Storage:', error);
          reject(new Error('Error al subir el archivo. Por favor, intenta nuevamente.'));
        },
        async () => {
          // Subida completada exitosamente
          try {
            // Obtener la URL de descarga
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) {
              onProgress(100);
            }
            resolve(downloadURL);
          } catch (error) {
            console.error('Error obteniendo URL de descarga:', error);
            reject(new Error('Error al obtener la URL del archivo.'));
          }
        }
      );
    });
  } catch (error) {
    console.error('Error creando tarea de subida:', error);
    throw new Error('Error al iniciar la subida del archivo.');
  }
}

/**
 * Sube un CV a Firebase Storage
 * El archivo se guarda con un nombre fijo basado en el participanteId para reemplazar el anterior
 * @param file Archivo PDF del CV
 * @param participanteId ID del participante
 * @param onProgress Callback para el progreso (opcional)
 * @returns URL de descarga del archivo
 */
export async function uploadCV(
  file: File,
  participanteId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Validar que el archivo sea un PDF
  if (file.type !== 'application/pdf') {
    throw new Error('El archivo debe ser un PDF');
  }

  // Validar tamaño del archivo (máximo 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('El archivo no debe exceder 10MB');
  }

  // Guardar el archivo con un nombre fijo basado en el participanteId
  // Esto reemplazará el archivo anterior si existe
  const fileName = 'cv.pdf';
  const path = `cvs/${participanteId}/${fileName}`;

  // Subir el archivo
  return uploadFile({
    file,
    path,
    onProgress,
  });
}

