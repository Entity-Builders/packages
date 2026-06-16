import {
  forwardRef,
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
