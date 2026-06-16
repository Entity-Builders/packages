import { EbButton, EbModalShell, EbNotice, EbStatusBanner, EbTextField } from './primitives';

export const SharedWebUiGallery = () => (
  <main className="eb-gallery">
    <section className="eb-gallery__hero">
      <p className="eb-gallery__eyebrow">Entity Builders UI Web</p>
      <h1>Shared components for fast web/PWA slices</h1>
      <p>
        React-first primitives with code-owned tokens. Product apps keep copy,
        routing, analytics, and data ownership.
      </p>
    </section>

    <section className="eb-gallery__section">
      <h2>Buttons</h2>
      <div className="eb-gallery__row">
        <EbButton variant="primary">Primary action</EbButton>
        <EbButton>Secondary action</EbButton>
        <EbButton variant="ghost">Ghost action</EbButton>
        <EbButton variant="danger">Danger action</EbButton>
        <EbButton disabled>Disabled</EbButton>
      </div>
    </section>

    <section className="eb-gallery__section">
      <h2>Notices</h2>
      <div className="eb-gallery__grid">
        <EbNotice tone="neutral" title="Neutral">
          Reviewing account status.
        </EbNotice>
        <EbNotice tone="info" title="Info">
          This widget can be reused by another app.
        </EbNotice>
        <EbNotice tone="success" title="Success">
          The checkout event was captured.
        </EbNotice>
        <EbNotice tone="warning" title="Warning">
          Figma ideas need review before code.
        </EbNotice>
        <EbNotice tone="danger" title="Error">
          The request failed and can be retried.
        </EbNotice>
      </div>
    </section>

    <section className="eb-gallery__section">
      <h2>Fields</h2>
      <div className="eb-gallery__grid">
        <EbTextField label="Email" placeholder="you@example.com" />
        <EbTextField
          error="Use a valid email address."
          label="Email with error"
          placeholder="you@example.com"
        />
        <EbTextField
          disabled
          hint="Disabled while the account is loading."
          label="Disabled field"
          placeholder="Waiting"
        />
      </div>
    </section>

    <section className="eb-gallery__section">
      <h2>Common States</h2>
      <div className="eb-gallery__grid">
        <EbNotice tone="neutral" title="Loading">
          Preparing the shared surface.
        </EbNotice>
        <EbNotice tone="info" title="Empty">
          No reusable examples have been added yet.
        </EbNotice>
        <EbNotice tone="danger" title="Error">
          The action failed. Try again.
        </EbNotice>
      </div>
    </section>

    <section className="eb-gallery__section">
      <h2>Status Banner</h2>
      <EbStatusBanner
        actions={
          <>
            <EbButton size="sm" variant="primary">Continue</EbButton>
            <EbButton aria-label="Dismiss banner" size="icon" variant="ghost">x</EbButton>
          </>
        }
        body="A product-owned message can explain billing, account, or diagnostic state."
        title="Reusable status banner"
        tone="success"
      />
    </section>

    <section className="eb-gallery__section">
      <h2>Modal Shell</h2>
      <div className="eb-gallery__modal-preview">
        <EbModalShell onClose={() => undefined} title="Account">
          <EbNotice tone="info" title="Preview mode">
            The shell owns spacing, title, and close affordance. The app owns the
            content.
          </EbNotice>
        </EbModalShell>
      </div>
    </section>
  </main>
);
