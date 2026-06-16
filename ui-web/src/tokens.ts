export type EbWebTokenCategory =
  | 'color'
  | 'radius'
  | 'shadow'
  | 'focus'
  | 'layout'
  | 'typography';

export type EbWebToken = {
  category: EbWebTokenCategory;
  cssVariable: string;
  description: string;
  value: string;
};

export const ebWebTokens = {
  color: {
    bg: {
      category: 'color',
      cssVariable: '--eb-color-bg',
      description: 'Default component background.',
      value: '#ffffff',
    },
    surface: {
      category: 'color',
      cssVariable: '--eb-color-surface',
      description: 'Subtle component surface and hover background.',
      value: '#f8fafc',
    },
    ink: {
      category: 'color',
      cssVariable: '--eb-color-ink',
      description: 'Primary text and high-emphasis UI foreground.',
      value: '#0f172a',
    },
    muted: {
      category: 'color',
      cssVariable: '--eb-color-muted',
      description: 'Secondary text and low-emphasis UI foreground.',
      value: '#64748b',
    },
    border: {
      category: 'color',
      cssVariable: '--eb-color-border',
      description: 'Default component border.',
      value: '#e2e8f0',
    },
    primary: {
      category: 'color',
      cssVariable: '--eb-color-primary',
      description: 'Primary action background.',
      value: '#0f172a',
    },
    primaryHover: {
      category: 'color',
      cssVariable: '--eb-color-primary-hover',
      description: 'Primary action hover background.',
      value: '#1e293b',
    },
    primaryText: {
      category: 'color',
      cssVariable: '--eb-color-primary-text',
      description: 'Text on primary action backgrounds.',
      value: '#ffffff',
    },
    disabledBg: {
      category: 'color',
      cssVariable: '--eb-color-disabled-bg',
      description: 'Disabled control background.',
      value: '#f1f5f9',
    },
    disabledText: {
      category: 'color',
      cssVariable: '--eb-color-disabled-text',
      description: 'Disabled text and icon foreground.',
      value: '#94a3b8',
    },
    infoBg: {
      category: 'color',
      cssVariable: '--eb-color-info-bg',
      description: 'Informational notice background.',
      value: '#f0f9ff',
    },
    infoBorder: {
      category: 'color',
      cssVariable: '--eb-color-info-border',
      description: 'Informational notice border.',
      value: '#bae6fd',
    },
    infoText: {
      category: 'color',
      cssVariable: '--eb-color-info-text',
      description: 'Informational notice text.',
      value: '#075985',
    },
    successBg: {
      category: 'color',
      cssVariable: '--eb-color-success-bg',
      description: 'Success notice background.',
      value: '#ecfdf5',
    },
    successBorder: {
      category: 'color',
      cssVariable: '--eb-color-success-border',
      description: 'Success notice border.',
      value: '#a7f3d0',
    },
    successText: {
      category: 'color',
      cssVariable: '--eb-color-success-text',
      description: 'Success notice text.',
      value: '#065f46',
    },
    warningBg: {
      category: 'color',
      cssVariable: '--eb-color-warning-bg',
      description: 'Warning notice background.',
      value: '#fffbeb',
    },
    warningBorder: {
      category: 'color',
      cssVariable: '--eb-color-warning-border',
      description: 'Warning notice border.',
      value: '#fde68a',
    },
    warningText: {
      category: 'color',
      cssVariable: '--eb-color-warning-text',
      description: 'Warning notice text.',
      value: '#92400e',
    },
    dangerBg: {
      category: 'color',
      cssVariable: '--eb-color-danger-bg',
      description: 'Danger notice background.',
      value: '#fff1f2',
    },
    dangerBorder: {
      category: 'color',
      cssVariable: '--eb-color-danger-border',
      description: 'Danger notice border.',
      value: '#fecdd3',
    },
    dangerText: {
      category: 'color',
      cssVariable: '--eb-color-danger-text',
      description: 'Danger notice text.',
      value: '#9f1239',
    },
  },
  radius: {
    sm: {
      category: 'radius',
      cssVariable: '--eb-radius-sm',
      description: 'Small control radius.',
      value: '4px',
    },
    md: {
      category: 'radius',
      cssVariable: '--eb-radius-md',
      description: 'Default component radius.',
      value: '6px',
    },
    lg: {
      category: 'radius',
      cssVariable: '--eb-radius-lg',
      description: 'Large framed-surface radius.',
      value: '8px',
    },
  },
  shadow: {
    lg: {
      category: 'shadow',
      cssVariable: '--eb-shadow-lg',
      description: 'Elevated modal or overlay shadow.',
      value: '0 20px 45px rgb(15 23 42 / 18%)',
    },
  },
  focus: {
    ring: {
      category: 'focus',
      cssVariable: '--eb-focus-ring',
      description: 'Default accessible focus ring.',
      value: '0 0 0 3px rgb(14 165 233 / 18%)',
    },
  },
  layout: {
    containerLg: {
      category: 'layout',
      cssVariable: '--eb-container-lg',
      description: 'Large shared content container.',
      value: '64rem',
    },
  },
  typography: {
    sans: {
      category: 'typography',
      cssVariable: '--eb-font-sans',
      description: 'Default shared web UI font stack.',
      value:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
  },
} as const satisfies Record<string, Record<string, EbWebToken>>;

export const ebWebTokenList = Object.values(ebWebTokens).flatMap((tokens) =>
  Object.values(tokens),
);
