import { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PdfUploaderProps {
  onUpload: (file: File) => Promise<void>;
  label?: string;
}

export function PdfUploader({ onUpload, label = 'Subir PDF' }: PdfUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') setFile(f);
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card
      className={`border-2 border-dashed p-8 text-center transition-colors ${dragging ? 'border-voit-mint bg-voit-light' : 'border-border'}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {file ? (
        <div className="flex flex-col items-center gap-3">
          <FileText className="h-10 w-10 text-voit-mint" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{file.name}</span>
            <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={handleUpload} disabled={uploading} className="bg-voit-forest hover:bg-voit-forest/90">
            {uploading ? 'Procesando...' : 'Confirmar y procesar'}
          </Button>
        </div>
      ) : (
        <label className="cursor-pointer flex flex-col items-center gap-3">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground mt-1">Arrastrá el archivo acá o hacé click para seleccionar</p>
          </div>
          <input type="file" accept=".pdf" className="hidden" onChange={handleSelect} />
        </label>
      )}
    </Card>
  );
}
