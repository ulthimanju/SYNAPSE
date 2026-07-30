import React, { useState } from 'react';
import { Dialog } from '../common/Dialog';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';

export const CreateWorkspaceDialog = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState('private');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name, visibility });
    setName('');
    setVisibility('private');
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Create New Workspace">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
        <Input
          label="Workspace Name"
          placeholder="e.g. CSE Capstone Project"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Select
          label="Visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          options={[
            { label: 'Private (Only Me)', value: 'private' },
            { label: 'Shared (Workspace Members)', value: 'shared' },
          ]}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Workspace'}</Button>
        </div>
      </form>
    </Dialog>
  );
};
