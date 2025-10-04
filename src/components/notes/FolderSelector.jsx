import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNotesStore } from '../../store/notesStore';

export default function FolderSelector() {
  const { folders, selectedFolderId, selectFolder, createFolder, deleteFolder } = useNotesStore();
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    await createFolder(newFolderName.trim());
    setNewFolderName('');
    setShowNewFolder(false);
  };

  const handleDeleteFolder = async (id, e) => {
    e.stopPropagation();

    toast((t) => (
      <div className="flex items-center gap-3">
        <span>Delete folder and all notes?</span>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              await deleteFolder(id);
              toast.dismiss(t.id);
              toast.success('Folder deleted');
            }}
            className="px-3 py-1 bg-accent-red text-white rounded-button text-sm hover:bg-accent-red/80 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-bg-elevated text-text-primary rounded-button text-sm hover:bg-bg-hover transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  return (
    <div className="px-3 py-2 border-b border-border">
      {/* Folder Dropdown */}
      <div className="mb-2">
        <select
          aria-label="Select folder to filter notes"
          value={selectedFolderId || ''}
          onChange={(e) => selectFolder(e.target.value)}
          className="w-full bg-bg-elevated text-text-primary text-sm rounded-input px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-border-focus"
        >
          <option value="">All Notes</option>
          {folders.map(folder => (
            <option key={folder.id} value={folder.id}>
              📁 {folder.name} ({folder.noteCount})
            </option>
          ))}
        </select>
      </div>

      {/* New Folder Button */}
      {!showNewFolder ? (
        <button
          onClick={() => setShowNewFolder(true)}
          className="w-full text-xs text-text-tertiary hover:text-text-secondary text-left py-1"
        >
          + New Folder
        </button>
      ) : (
        <form onSubmit={handleCreateFolder} className="flex gap-1">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            autoFocus
            className="flex-1 bg-bg-elevated text-text-primary text-xs rounded-input px-2 py-1 focus:outline-none focus:ring-1 focus:ring-border-focus placeholder:text-text-tertiary"
          />
          <button
            type="submit"
            className="px-2 py-1 bg-accent-blue text-white text-xs rounded-button hover:bg-accent-blue/80"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowNewFolder(false);
              setNewFolderName('');
            }}
            className="px-2 py-1 bg-bg-elevated text-text-primary border border-border text-xs rounded-button hover:bg-bg-hover"
          >
            ✕
          </button>
        </form>
      )}
    </div>
  );
}
