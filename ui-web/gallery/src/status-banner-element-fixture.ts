import { defineEbStatusBannerElement } from '../../src/elements';
import '../../src/styles.css';
import './gallery.css';
import './status-banner-element-fixture.css';

defineEbStatusBannerElement();

const log = document.getElementById('event-log');

const writeLog = (message: string) => {
  if (!log) return;
  log.replaceChildren();
  const item = document.createElement('li');
  item.textContent = message;
  log.append(item);
};

document.addEventListener('eb-action', (event) => {
  const detail = (event as CustomEvent<{ value: string; label: string }>).detail;
  writeLog(`Action: ${detail.label} (${detail.value})`);
});

document.addEventListener('eb-dismiss', (event) => {
  const detail = (event as CustomEvent<{ tone: string; title: string }>).detail;
  writeLog(`Dismiss: ${detail.title} [${detail.tone}]`);
});
