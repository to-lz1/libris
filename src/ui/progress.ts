function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function showProgress(
  container: HTMLElement,
  current: number,
  total: number,
  filename: string,
): void {
  container.hidden = false;
  const percent = Math.round((current / total) * 100);
  container.innerHTML = `
    <div class="progress-bar-container">
      <div class="progress-bar" style="width: ${percent}%"></div>
    </div>
    <p class="progress-text">Processing ${current}/${total}: ${escapeHtml(filename)}</p>
  `;
}

export function hideProgress(container: HTMLElement): void {
  container.hidden = true;
  container.innerHTML = '';
}
