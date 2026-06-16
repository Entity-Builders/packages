import type { EbNoticeTone } from './primitives';

const TONES: EbNoticeTone[] = ['neutral', 'info', 'success', 'warning', 'danger'];

const getTone = (value: string | null): EbNoticeTone =>
  TONES.includes(value as EbNoticeTone) ? (value as EbNoticeTone) : 'neutral';

const createTextElement = (
  tagName: keyof HTMLElementTagNameMap,
  className: string,
  text: string,
) => {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
};

const dispatchElementEvent = (
  element: HTMLElement,
  type: string,
  detail: Record<string, string>,
) => {
  element.dispatchEvent(
    new CustomEvent(type, {
      bubbles: true,
      composed: true,
      detail,
    }),
  );
};

export class EbStatusBannerElement extends HTMLElement {
  static observedAttributes = [
    'action-label',
    'action-value',
    'body',
    'dismiss-label',
    'dismissible',
    'title',
    'tone',
  ];

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  private render() {
    const tone = getTone(this.getAttribute('tone'));
    const title = this.getAttribute('title') || '';
    const body = this.getAttribute('body') || '';
    const actionLabel = this.getAttribute('action-label') || '';
    const actionValue = this.getAttribute('action-value') || actionLabel;
    const dismissLabel = this.getAttribute('dismiss-label') || 'Dismiss';
    const dismissible = this.hasAttribute('dismissible');

    const section = document.createElement('section');
    section.className = 'eb-status-banner';
    section.dataset.tone = tone;
    section.setAttribute('role', tone === 'danger' ? 'alert' : 'status');

    const inner = document.createElement('div');
    inner.className = 'eb-status-banner__inner';

    const message = document.createElement('div');
    message.className = 'eb-status-banner__message';

    const copy = document.createElement('div');
    copy.className = 'eb-status-banner__copy';
    copy.append(createTextElement('p', 'eb-status-banner__title', title));

    if (body) {
      copy.append(createTextElement('p', 'eb-status-banner__body', body));
    }

    message.append(copy);
    inner.append(message);

    if (actionLabel || dismissible) {
      const actions = document.createElement('div');
      actions.className = 'eb-status-banner__actions';

      if (actionLabel) {
        const action = document.createElement('button');
        action.className = 'eb-button';
        action.dataset.variant = 'primary';
        action.dataset.size = 'sm';
        action.type = 'button';
        action.textContent = actionLabel;
        action.addEventListener('click', () => {
          dispatchElementEvent(this, 'eb-action', {
            label: actionLabel,
            value: actionValue,
          });
        });
        actions.append(action);
      }

      if (dismissible) {
        const dismiss = document.createElement('button');
        dismiss.className = 'eb-button';
        dismiss.dataset.variant = 'ghost';
        dismiss.dataset.size = 'icon';
        dismiss.type = 'button';
        dismiss.title = dismissLabel;
        dismiss.setAttribute('aria-label', dismissLabel);
        dismiss.textContent = 'x';
        dismiss.addEventListener('click', () => {
          dispatchElementEvent(this, 'eb-dismiss', { title, tone });
        });
        actions.append(dismiss);
      }

      inner.append(actions);
    }

    section.append(inner);
    this.replaceChildren(section);
  }
}

export const defineEbStatusBannerElement = (
  tagName = 'eb-status-banner',
  registry: CustomElementRegistry = window.customElements,
) => {
  if (!registry.get(tagName)) {
    registry.define(tagName, EbStatusBannerElement);
  }

  return registry.get(tagName);
};
