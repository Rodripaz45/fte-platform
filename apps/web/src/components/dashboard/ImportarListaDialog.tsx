'use client';

import ImportarListaView from './ImportarListaView';
import { type Taller } from '@/lib/api/talleres';

interface ImportarListaDialogProps {
  tallerId: string;
  taller?: Taller; // Pasar el taller completo para mostrar su nombre
  onImportComplete?: () => void;
  onClose?: () => void;
}

export default function ImportarListaDialog({ tallerId, taller, onImportComplete, onClose }: ImportarListaDialogProps) {
  return (
    <ImportarListaView
      tallerId={tallerId}
      taller={taller}
      onImportComplete={onImportComplete}
      onClose={onClose}
      showHeader={false}
    />
  );
}

