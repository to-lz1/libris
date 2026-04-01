import './style.css';
import { mergePDFs } from './pdf/merger.ts';
import { renderFileList } from './ui/fileList.ts';
import { showProgress, hideProgress } from './ui/progress.ts';
import { downloadFile } from './ui/download.ts';

let files: File[] = [];

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <header>
      <h1>PDF Merger</h1>
      <p class="subtitle">Combine multiple PDFs with auto-generated title pages</p>
    </header>

    <div id="drop-zone" class="drop-zone">
      <p>Drag &amp; drop PDF files here, or</p>
      <button id="select-btn" type="button" class="btn btn-secondary">Select Files</button>
      <input id="file-input" type="file" accept=".pdf" multiple hidden>
    </div>

    <div id="file-list-container"></div>

    <div id="progress-container" hidden></div>

    <div id="error-container" class="error-container" hidden></div>

    <button id="merge-btn" type="button" class="btn btn-primary" disabled>
      Merge &amp; Download
    </button>
  </div>
`;

const dropZone = document.getElementById('drop-zone')!;
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const selectBtn = document.getElementById('select-btn')!;
const fileListContainer = document.getElementById('file-list-container')!;
const progressContainer = document.getElementById('progress-container')!;
const errorContainer = document.getElementById('error-container')!;
const mergeBtn = document.getElementById('merge-btn') as HTMLButtonElement;

selectBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  if (fileInput.files) addFiles(Array.from(fileInput.files));
  fileInput.value = '';
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-active');
});

dropZone.addEventListener('dragleave', (e) => {
  if (!dropZone.contains(e.relatedTarget as Node)) {
    dropZone.classList.remove('drag-active');
  }
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-active');
  if (e.dataTransfer?.files) {
    const pdfs = Array.from(e.dataTransfer.files).filter(f =>
      f.name.toLowerCase().endsWith('.pdf'),
    );
    addFiles(pdfs);
  }
});

function addFiles(newFiles: File[]): void {
  files = [...files, ...newFiles];
  updateUI();
}

function updateUI(): void {
  renderFileList(fileListContainer, files, {
    onReorder: (reordered) => {
      files = reordered;
      updateUI();
    },
    onRemove: (index) => {
      files = files.filter((_, i) => i !== index);
      updateUI();
    },
  });
  mergeBtn.disabled = files.length === 0;
  clearError();
}

function showError(message: string): void {
  errorContainer.hidden = false;
  errorContainer.textContent = message;
}

function clearError(): void {
  errorContainer.hidden = true;
  errorContainer.textContent = '';
}

mergeBtn.addEventListener('click', async () => {
  if (files.length === 0) return;
  mergeBtn.disabled = true;
  clearError();

  try {
    const result = await mergePDFs(files, (progress) => {
      showProgress(progressContainer, progress.current, progress.total, progress.filename);
    });
    hideProgress(progressContainer);
    downloadFile(result, 'merged.pdf');
  } catch (err) {
    hideProgress(progressContainer);
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    showError(`Error: ${message}`);
  } finally {
    mergeBtn.disabled = files.length === 0;
  }
});
