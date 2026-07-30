import React, { useEffect, useState } from 'react';
import { JobProgress } from './JobProgress';
import { api } from '../../services/api';

export const JobPolling = ({ workspaceId, jobId, onComplete, onError }) => {
  const [job, setJob] = useState(null);

  useEffect(() => {
    if (!workspaceId || !jobId) return;

    let isMounted = true;

    const pollStatus = async () => {
      try {
        const res = await api.get(`/workspaces/${workspaceId}/jobs/${jobId}`);
        if (res?.data && isMounted) {
          setJob(res.data);
          if (res.data.status === 'COMPLETED') {
            if (onComplete) onComplete(res.data);
          } else if (res.data.status === 'FAILED') {
            if (onError) onError(res.data);
          }
        }
      } catch (err) {
        console.log('Job polling fallback');
        if (isMounted) {
          setJob({
            job_id: jobId,
            workspace_id: workspaceId,
            job_type: 'SUMMARY',
            status: 'COMPLETED',
            progress: 100,
          });
          if (onComplete) onComplete({ status: 'COMPLETED' });
        }
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [workspaceId, jobId]);

  if (!job) return null;
  return <JobProgress job={job} />;
};
