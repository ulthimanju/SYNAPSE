import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Link } from 'react-router-dom';
import { FolderKanban, Edit3, Trash2, Globe, Lock } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const WorkspaceCard = ({ workspace, onEdit, onDelete }) => {
  const isShared = workspace.visibility === 'shared';

  return (
    <Card className="editorial-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FolderKanban size={20} style={{ color: 'var(--accent-amber)' }} />
            <h3 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{workspace.name}</h3>
          </div>
          <Badge variant={isShared ? 'amber' : 'outline'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {isShared ? <Globe size={12} /> : <Lock size={12} />}
              <span>{workspace.visibility}</span>
            </div>
          </Badge>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Created: {formatDate(workspace.created_at)}
        </div>
      </div>

      <div>
        <div className="editorial-divider" style={{ margin: '1rem 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <Link to={`/workspaces/${workspace.id}`} style={{ flex: 1 }}>
            <Button variant="outline" size="sm" style={{ width: '100%' }}>Open Workspace</Button>
          </Link>
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(workspace)}>
              <Edit3 size={16} />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(workspace.id)} style={{ color: '#DC2626' }}>
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
