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
      d="M12.04 4.2a7.72 7.72 0 0 0-6.68 11.58l.18.3-.74 2.72 2.78-.73.29.17A7.72 7.72 0 1 0 12.04 4.2Zm0 1.46a6.26 6.26 0 1 1-3.4 11.51l-.48-.31-1.25.33.33-1.22-.32-.5a6.26 6.26 0 0 1 5.12-9.81Zm-2.66 3.1c-.15 0-.38.05-.58.27-.2.22-.77.75-.77 1.84s.79 2.14.9 2.29c.11.14 1.54 2.35 3.74 3.29.52.23.93.36 1.25.46.52.17 1 .14 1.38.09.42-.06 1.29-.53 1.47-1.04.18-.51.18-.95.13-1.04-.05-.09-.2-.15-.42-.26-.22-.11-1.29-.64-1.49-.71-.2-.07-.35-.11-.5.11-.15.22-.57.71-.7.86-.13.15-.26.16-.48.05-.22-.11-.94-.35-1.79-1.1-.66-.59-1.11-1.32-1.24-1.54-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.05-.11-.5-1.2-.68-1.64-.18-.43-.36-.37-.5-.38h-.42Z"
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
