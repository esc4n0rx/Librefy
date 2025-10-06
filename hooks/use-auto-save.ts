// hooks/use-auto-save.ts

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAutoSaveOptions {
  onSave: (data: any) => Promise<void>;
  delay?: number; // ms
}

export function useAutoSave({ onSave, delay = 3000 }: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef<any>(null);

  const triggerSave = useCallback(
    (data: any) => {
      dataRef.current = data;
      setHasUnsavedChanges(true);

      // Limpar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Agendar novo save
      timeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          await onSave(dataRef.current);
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error('Erro ao salvar:', error);
        } finally {
          setIsSaving(false);
        }
      }, delay);
    },
    [onSave, delay]
  );

  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (dataRef.current && hasUnsavedChanges) {
      setIsSaving(true);
      try {
        await onSave(dataRef.current);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Erro ao salvar:', error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    }
  }, [onSave, hasUnsavedChanges]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    triggerSave,
    saveNow,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
  };
}