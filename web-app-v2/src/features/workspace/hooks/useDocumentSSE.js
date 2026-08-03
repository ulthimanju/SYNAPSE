import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { workspaceQueryKeys } from '../queries/workspaceQueries';

/**
 * useDocumentSSE — real-time document status streaming via Server-Sent Events.
 *
 * Replaces the polling refetchInterval in workspaceQueries.documents.
 *
 * Behaviour:
 *  - Opens EventSource to /api/v1/workspaces/{id}/documents/stream when the
 *    Documents tab is active and a workspaceId is present.
 *  - On 'snapshot' event: replaces the entire documents list in React Query cache.
 *  - On 'status' event: surgically patches just the changed document in cache
 *    → instant UI update without a round-trip GET.
 *  - Closes SSE connection when tab becomes inactive or component unmounts.
 *  - Auto-reconnects after 3 seconds on connection error.
 */
export const useDocumentSSE = (userId, workspaceId, isActive) => {
  const queryClient = useQueryClient();
  const esRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  useEffect(() => {
    // Clear any pending reconnect timers
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    // Close SSE when tab is inactive or workspace deselected
    if (!workspaceId || !isActive) {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      return;
    }

    // Prevent duplicate connections
    if (esRef.current) return;

    const connect = () => {
      const url = `/api/v1/workspaces/${workspaceId}/documents/stream`;
      const es = new EventSource(url, { withCredentials: true });
      esRef.current = es;

      // Initial snapshot: replace full documents list in cache
      es.addEventListener('snapshot', (e) => {
        try {
          const docs = JSON.parse(e.data);
          queryClient.setQueryData(
            workspaceQueryKeys.documents(userId, workspaceId),
            Array.isArray(docs) ? docs : []
          );
        } catch {
          // malformed snapshot — ignore, cache stays as-is
        }
      });

      // Status update: patch only the changed document in cache (O(n) scan)
      es.addEventListener('status', (e) => {
        try {
          const update = JSON.parse(e.data);
          queryClient.setQueryData(
            workspaceQueryKeys.documents(userId, workspaceId),
            (old = []) =>
              old.map((doc) =>
                (doc.id || doc._id) === update.document_id
                  ? {
                      ...doc,
                      status: update.status,
                      processing_stage: update.processing_stage,
                    }
                  : doc
              )
          );
        } catch {
          // malformed event — ignore
        }
      });

      // On connection error: close and schedule reconnect after 3s
      es.onerror = () => {
        es.close();
        esRef.current = null;
        // Only reconnect if still active and same workspace
        reconnectTimerRef.current = setTimeout(() => {
          if (isActive && workspaceId) {
            connect();
          }
        }, 3000);
      };
    };

    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [workspaceId, isActive, userId, queryClient]);
};
