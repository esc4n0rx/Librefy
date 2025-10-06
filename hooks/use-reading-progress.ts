// hooks/use-reading-progress.ts

import { useAuth } from '@/contexts/auth.context';
import { ReadingService } from '@/services/reading.service';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseReadingProgressOptions {
  bookId: string;
  chapterId: string;
  enabled?: boolean;
}

export function useReadingProgress({ bookId, chapterId, enabled = true }: UseReadingProgressOptions) {
  const { user } = useAuth();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carregar progresso salvo ao montar
  useEffect(() => {
    if (!user || !enabled) return;

    loadProgress();
  }, [user, bookId, enabled]);

  const loadProgress = async () => {
    if (!user) return;

    try {
      const progress = await ReadingService.getProgress(user.id, bookId);
      
      if (progress && progress.chapter_id === chapterId) {
        setScrollPosition(progress.scroll_position);
        return progress.scroll_position;
      }
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
    
    return 0;
  };

  const updateProgress = useCallback(
    (position: number) => {
      if (!user || !enabled) return;

      setScrollPosition(position);

      // Debounce: salvar após 2 segundos de inatividade
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          await ReadingService.saveProgress(user.id, bookId, chapterId, position);
          await ReadingService.updateCurrentChapter(user.id, bookId, chapterId);
        } catch (error) {
          console.error('Erro ao salvar progresso:', error);
        } finally {
          setIsSaving(false);
        }
      }, 2000);
    },
    [user, bookId, chapterId, enabled]
  );

  const saveNow = useCallback(async () => {
    if (!user || !enabled) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsSaving(true);
    try {
      await ReadingService.saveProgress(user.id, bookId, chapterId, scrollPosition);
      await ReadingService.updateCurrentChapter(user.id, bookId, chapterId);
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user, bookId, chapterId, scrollPosition, enabled]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    scrollPosition,
    updateProgress,
    saveNow,
    isSaving,
    loadProgress,
  };
}