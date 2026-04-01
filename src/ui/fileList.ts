export interface FileListCallbacks {
  onReorder: (files: File[]) => void;
  onRemove: (index: number) => void;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function setupDragAndDrop(
  list: HTMLUListElement,
  files: File[],
  onReorder: (files: File[]) => void,
): void {
  let dragSrcIndex: number | null = null;

  list.addEventListener('dragstart', (e) => {
    const item = (e.target as HTMLElement).closest('.file-item') as HTMLLIElement | null;
    if (!item) return;
    dragSrcIndex = parseInt(item.dataset['index'] ?? '0');
    item.classList.add('dragging');
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  });

  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    const item = (e.target as HTMLElement).closest('.file-item') as HTMLLIElement | null;
    if (!item) return;
    list.querySelectorAll('.file-item').forEach(el => el.classList.remove('drag-over'));
    item.classList.add('drag-over');
  });

  list.addEventListener('dragleave', (e) => {
    const related = e.relatedTarget as HTMLElement | null;
    if (!related || !list.contains(related)) {
      list.querySelectorAll('.file-item').forEach(el => el.classList.remove('drag-over'));
    }
  });

  list.addEventListener('drop', (e) => {
    e.preventDefault();
    const item = (e.target as HTMLElement).closest('.file-item') as HTMLLIElement | null;
    if (!item || dragSrcIndex === null) return;
    const destIndex = parseInt(item.dataset['index'] ?? '0');
    if (dragSrcIndex === destIndex) return;
    const newFiles = [...files];
    const [moved] = newFiles.splice(dragSrcIndex, 1);
    newFiles.splice(destIndex, 0, moved);
    onReorder(newFiles);
  });

  list.addEventListener('dragend', () => {
    list.querySelectorAll('.file-item').forEach(el => {
      el.classList.remove('dragging', 'drag-over');
    });
    dragSrcIndex = null;
  });
}

export function renderFileList(
  container: HTMLElement,
  files: File[],
  callbacks: FileListCallbacks,
): void {
  container.innerHTML = '';

  if (files.length === 0) return;

  const list = document.createElement('ul');
  list.className = 'file-list';

  files.forEach((file, index) => {
    const item = document.createElement('li');
    item.className = 'file-item';
    item.draggable = true;
    item.dataset['index'] = String(index);
    item.innerHTML = `
      <span class="drag-handle" aria-hidden="true">⠿</span>
      <span class="file-name">${escapeHtml(file.name)}</span>
      <span class="file-size">${formatFileSize(file.size)}</span>
      <button class="remove-btn" type="button" aria-label="Remove ${escapeHtml(file.name)}">✕</button>
    `;
    item.querySelector('.remove-btn')!.addEventListener('click', () => {
      callbacks.onRemove(index);
    });
    list.appendChild(item);
  });

  setupDragAndDrop(list, files, callbacks.onReorder);
  container.appendChild(list);
}
