import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
} from 'react';

type ClassValue = string | false | null | undefined;

const cx = (...values: ClassValue[]) => values.filter(Boolean).join(' ');

export type EbButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type EbButtonSize = 'sm' | 'md' | 'icon';

export type EbButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  size?: EbButtonSize;
  trailingIcon?: ReactNode;
  variant?: EbButtonVariant;
};

export const EbButton = forwardRef<HTMLButtonElement, EbButtonProps>(
  (
    {
      children,
      className,
      fullWidth = false,
      leadingIcon,
      size = 'md',
      trailingIcon,
      type = 'button',
      variant = 'secondary',
      ...props
    },
    ref,
  ) => (
    <button
      {...props}
      ref={ref}
      type={type}
      data-eb-button
      data-full-width={fullWidth ? 'true' : undefined}
      data-size={size}
      data-variant={variant}
      className={cx('eb-button', className)}
    >
      {leadingIcon ? <span className="eb-button__icon">{leadingIcon}</span> : null}
      {children ? <span className="eb-button__label">{children}</span> : null}
      {trailingIcon ? <span className="eb-button__icon">{trailingIcon}</span> : null}
    </button>
  ),
);

EbButton.displayName = 'EbButton';

export type EbWhatsAppButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  fullWidth?: boolean;
  showIcon?: boolean;
};

const EbWhatsAppIcon = () => (
  <svg
    aria-hidden="true"
    className="eb-whatsapp-button__icon"
    focusable="false"
    viewBox="0 0 24 24"
  >
    <path
      d="M20.46 3.49A11.81 11.81 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.15 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.23-6.16-3.48-8.41Zm-8.41 18.3h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.27c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.43 9.89-9.88 9.89Zm5.42-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z"
      fill="currentColor"
    />
  </svg>
);

export const EbWhatsAppButton = forwardRef<
  HTMLAnchorElement,
  EbWhatsAppButtonProps
>(
  (
    {
      children = 'WhatsApp',
      className,
      fullWidth = false,
      rel,
      showIcon = true,
      target = '_blank',
      ...props
    },
    ref,
  ) => {
    const safeRel = target === '_blank' ? rel ?? 'noopener noreferrer' : rel;

    return (
      <a
        {...props}
        ref={ref}
        data-eb-whatsapp-button
        data-full-width={fullWidth ? 'true' : undefined}
        rel={safeRel}
        target={target}
        className={cx('eb-whatsapp-button', className)}
      >
        {showIcon ? <EbWhatsAppIcon /> : null}
        <span className="eb-whatsapp-button__label">{children}</span>
      </a>
    );
  },
);

EbWhatsAppButton.displayName = 'EbWhatsAppButton';

export type EbNoticeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export type EbNoticeProps = {
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  icon?: ReactNode;
  role?: 'alert' | 'status' | 'note';
  title?: ReactNode;
  tone?: EbNoticeTone;
};

export const EbNotice = ({
  actions,
  children,
  className,
  icon,
  role,
  title,
  tone = 'neutral',
}: EbNoticeProps) => (
  <div
    className={cx('eb-notice', className)}
    data-tone={tone}
    role={role ?? (tone === 'danger' ? 'alert' : 'status')}
  >
    {icon ? <div className="eb-notice__icon">{icon}</div> : null}
    <div className="eb-notice__content">
      {title ? <div className="eb-notice__title">{title}</div> : null}
      {children ? <div className="eb-notice__body">{children}</div> : null}
    </div>
    {actions ? <div className="eb-notice__actions">{actions}</div> : null}
  </div>
);

export type EbTextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: ReactNode;
  hint?: ReactNode;
  inputClassName?: string;
  label: ReactNode;
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
};

export const EbTextField = forwardRef<HTMLInputElement, EbTextFieldProps>(
  (
    {
      className,
      error,
      hint,
      inputClassName,
      label,
      labelProps,
      ...props
    },
    ref,
  ) => {
    const fieldId = props.id;
    const describedBy =
      props['aria-describedby'] ||
      (fieldId && (error || hint) ? `${fieldId}-description` : undefined);

    return (
      <label
        {...labelProps}
        className={cx('eb-field', className, labelProps?.className)}
      >
        <span className="eb-field__label">{label}</span>
        <input
          {...props}
          ref={ref}
          aria-describedby={describedBy}
          aria-invalid={error ? true : props['aria-invalid']}
          className={cx('eb-field__input', inputClassName)}
        />
        {error || hint ? (
          <span
            className="eb-field__description"
            data-tone={error ? 'danger' : 'neutral'}
            id={fieldId ? `${fieldId}-description` : undefined}
          >
            {error || hint}
          </span>
        ) : null}
      </label>
    );
  },
);

EbTextField.displayName = 'EbTextField';

export type EbModalShellProps = {
  children: ReactNode;
  className?: string;
  closeLabel?: string;
  onClose: () => void;
  title: ReactNode;
};

export const EbModalShell = ({
  children,
  className,
  closeLabel = 'Close',
  onClose,
  title,
}: EbModalShellProps) => (
  <div className="eb-modal" role="presentation">
    <div
      aria-modal="true"
      className={cx('eb-modal__panel', className)}
      role="dialog"
    >
      <div className="eb-modal__header">
        <h2 className="eb-modal__title">{title}</h2>
        <EbButton
          aria-label={closeLabel}
          className="eb-modal__close"
          onClick={onClose}
          size="icon"
          title={closeLabel}
          variant="ghost"
        >
          x
        </EbButton>
      </div>
      {children}
    </div>
  </div>
);

export type EbStatusBannerProps = {
  actions?: ReactNode;
  body?: ReactNode;
  children?: ReactNode;
  className?: string;
  icon?: ReactNode;
  role?: 'alert' | 'status';
  title: ReactNode;
  tone?: EbNoticeTone;
};

export const EbStatusBanner = ({
  actions,
  body,
  children,
  className,
  icon,
  role,
  title,
  tone = 'neutral',
}: EbStatusBannerProps) => (
  <section
    className={cx('eb-status-banner', className)}
    data-tone={tone}
    role={role ?? (tone === 'danger' ? 'alert' : 'status')}
  >
    <div className="eb-status-banner__inner">
      <div className="eb-status-banner__message">
        {icon ? <div className="eb-status-banner__icon">{icon}</div> : null}
        <div className="eb-status-banner__copy">
          <p className="eb-status-banner__title">{title}</p>
          {body ? <p className="eb-status-banner__body">{body}</p> : null}
          {children}
        </div>
      </div>
      {actions ? <div className="eb-status-banner__actions">{actions}</div> : null}
    </div>
  </section>
);
