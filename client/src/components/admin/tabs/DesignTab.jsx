import React, { useEffect, useMemo, useState } from 'react';

const THEME_PRESETS = [
  {
    id: 'romantic',
    name: 'Romántico',
    description: 'Rosa, beige y café suave.',
    colors: {
      primaryColor: '#9b6f78',
      secondaryColor: '#d8b4a0',
      backgroundColor: '#fff9f6',
      textColor: '#302727'
    }
  },
  {
    id: 'elegant',
    name: 'Elegante',
    description: 'Negro, dorado y marfil.',
    colors: {
      primaryColor: '#1f1b18',
      secondaryColor: '#b5965a',
      backgroundColor: '#fffdf8',
      textColor: '#241f1a'
    }
  },
  {
    id: 'nature',
    name: 'Natural',
    description: 'Verdes suaves y tierra.',
    colors: {
      primaryColor: '#516356',
      secondaryColor: '#a9b79f',
      backgroundColor: '#f8faf5',
      textColor: '#29332c'
    }
  },
  {
    id: 'ocean',
    name: 'Océano',
    description: 'Azules frescos y claros.',
    colors: {
      primaryColor: '#365f73',
      secondaryColor: '#9ab8c5',
      backgroundColor: '#f5fafc',
      textColor: '#24343c'
    }
  },
  {
    id: 'burgundy',
    name: 'Borgoña',
    description: 'Borgoña y rosa empolvado.',
    colors: {
      primaryColor: '#702f3b',
      secondaryColor: '#c5969f',
      backgroundColor: '#fff8f8',
      textColor: '#342327'
    }
  },
  {
    id: 'lavender',
    name: 'Lavanda',
    description: 'Morados suaves y delicados.',
    colors: {
      primaryColor: '#75617c',
      secondaryColor: '#c7b5ce',
      backgroundColor: '#fcf9fd',
      textColor: '#302833'
    }
  }
];

const DEFAULT_THEME = {
  primaryColor: '#9b7b6b',
  secondaryColor: '#d6b89c',
  backgroundColor: '#fffaf6',
  textColor: '#2f2925'
};

const COLOR_FIELDS = [
  {
    id: 'primaryColor',
    label: 'Principal',
    description: 'Botones, títulos y elementos destacados.'
  },
  {
    id: 'secondaryColor',
    label: 'Secundario',
    description: 'Bordes, ornamentos y detalles decorativos.'
  },
  {
    id: 'backgroundColor',
    label: 'Fondo',
    description: 'Superficie principal de la invitación.'
  },
  {
    id: 'textColor',
    label: 'Texto',
    description: 'Párrafos, nombres e información general.'
  }
];

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function normalizeHexColor(value, fallback) {
  if (
    typeof value === 'string' &&
    /^#[0-9a-fA-F]{6}$/.test(value)
  ) {
    return value;
  }

  return fallback;
}

function hexToRgba(hex, alpha) {
  const normalized = normalizeHexColor(
    hex,
    '#000000'
  ).replace('#', '');

  const red = parseInt(
    normalized.substring(0, 2),
    16
  );

  const green = parseInt(
    normalized.substring(2, 4),
    16
  );

  const blue = parseInt(
    normalized.substring(4, 6),
    16
  );

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getContrastColor(hexColor) {
  const normalized = normalizeHexColor(
    hexColor,
    '#000000'
  ).replace('#', '');

  const red = parseInt(
    normalized.substring(0, 2),
    16
  );

  const green = parseInt(
    normalized.substring(2, 4),
    16
  );

  const blue = parseInt(
    normalized.substring(4, 6),
    16
  );

  const brightness =
    (red * 299 +
      green * 587 +
      blue * 114) /
    1000;

  return brightness > 145
    ? '#171717'
    : '#ffffff';
}

function formatEventDate(value) {
  const rawValue = cleanText(value);

  if (!rawValue) {
    return 'Próximamente';
  }

  const date = new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    return rawValue;
  }

  try {
    return new Intl.DateTimeFormat(
      'es-MX',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
    ).format(date);
  } catch {
    return rawValue;
  }
}

function ResetIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width="15"
      height="15"
    >
      <path d="M4 4v6h6" />
      <path d="M5.6 15.5A8 8 0 1 0 6 7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width="13"
      height="13"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ThemePreset({
  preset,
  active,
  onSelect
}) {
  const colors = [
    preset.colors.primaryColor,
    preset.colors.secondaryColor,
    preset.colors.backgroundColor,
    preset.colors.textColor
  ];

  return (
    <button
      type="button"
      onClick={() => onSelect(preset)}
      aria-pressed={active}
      style={{
        position: 'relative',
        display: 'grid',
        minWidth: 0,
        gap: '14px',
        overflow: 'hidden',
        border: active
          ? '1px solid var(--admin-accent)'
          : '1px solid var(--admin-border)',
        borderRadius: '16px',
        padding: '15px',
        background: active
          ? 'linear-gradient(145deg, var(--admin-accent-faint), var(--admin-surface))'
          : 'var(--admin-surface)',
        color: 'var(--admin-text)',
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: active
          ? '0 12px 32px rgba(15, 23, 42, .08)'
          : 'none',
        transition:
          'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease'
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform =
          'translateY(-2px)';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform =
          'translateY(0)';
      }}
    >
      {active && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'grid',
            width: '25px',
            height: '25px',
            placeItems: 'center',
            borderRadius: '50%',
            background: 'var(--admin-accent)',
            color: '#ffffff'
          }}
        >
          <CheckIcon />
        </span>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(4, 1fr)',
          overflow: 'hidden',
          height: '54px',
          border:
            '1px solid var(--admin-border)',
          borderRadius: '11px'
        }}
      >
        {colors.map((color, index) => (
          <span
            key={`${preset.id}-${index}`}
            style={{
              backgroundColor: color
            }}
          />
        ))}
      </div>

      <div>
        <strong
          style={{
            display: 'block',
            color: 'var(--admin-text)',
            fontSize: '10px',
            fontWeight: 780
          }}
        >
          {preset.name}
        </strong>

        <p
          style={{
            margin: '4px 0 0',
            color: 'var(--admin-text-muted)',
            fontSize: '7px',
            lineHeight: 1.5
          }}
        >
          {preset.description}
        </p>
      </div>
    </button>
  );
}

function ColorControl({
  id,
  label,
  description,
  value,
  onChange
}) {
  const [draftValue, setDraftValue] =
    useState(value);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  function handleTextChange(event) {
    const nextValue =
      event.target.value;

    setDraftValue(nextValue);

    if (
      /^#[0-9a-fA-F]{6}$/.test(
        nextValue
      )
    ) {
      onChange(id, nextValue);
    }
  }

  function handleBlur() {
    if (
      !/^#[0-9a-fA-F]{6}$/.test(
        draftValue
      )
    ) {
      setDraftValue(value);
    }
  }

  function handlePickerChange(event) {
    const nextValue =
      event.target.value;

    setDraftValue(nextValue);
    onChange(id, nextValue);
  }

  return (
    <article
      style={{
        display: 'grid',
        gridTemplateColumns:
          'auto minmax(0, 1fr)',
        alignItems: 'center',
        gap: '14px',
        border:
          '1px solid var(--admin-border)',
        borderRadius: '15px',
        padding: '13px',
        background:
          'var(--admin-surface)'
      }}
    >
      <label
        htmlFor={`${id}-picker`}
        title={`Cambiar ${label.toLowerCase()}`}
        style={{
          position: 'relative',
          display: 'block',
          width: '48px',
          height: '48px',
          flexShrink: 0,
          overflow: 'hidden',
          border:
            '1px solid var(--admin-border-strong)',
          borderRadius: '13px',
          backgroundColor: value,
          cursor: 'pointer',
          boxShadow:
            'inset 0 0 0 4px var(--admin-surface)'
        }}
      >
        <input
          id={`${id}-picker`}
          type="color"
          value={value}
          onChange={handlePickerChange}
          aria-label={`Seleccionar color ${label.toLowerCase()}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer'
          }}
        />
      </label>

      <div
        style={{
          minWidth: 0
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',
            gap: '10px',
            marginBottom: '6px'
          }}
        >
          <label
            htmlFor={`${id}-text`}
            style={{
              color: 'var(--admin-text)',
              fontSize: '9px',
              fontWeight: 800
            }}
          >
            {label}
          </label>

          <span
            style={{
              color:
                'var(--admin-text-muted)',
              fontSize: '6px',
              fontWeight: 800,
              letterSpacing: '.1em',
              textTransform: 'uppercase'
            }}
          >
            HEX
          </span>
        </div>

        <input
          id={`${id}-text`}
          type="text"
          value={draftValue}
          onChange={handleTextChange}
          onBlur={handleBlur}
          maxLength="7"
          spellCheck="false"
          autoComplete="off"
          style={{
            width: '100%',
            minHeight: '36px',
            boxSizing: 'border-box',
            border:
              '1px solid var(--admin-border)',
            borderRadius: '9px',
            padding: '0 10px',
            background:
              'var(--admin-surface-soft)',
            color: 'var(--admin-text)',
            fontSize: '9px',
            fontWeight: 700,
            outline: 'none'
          }}
        />

        <small
          style={{
            display: 'block',
            marginTop: '6px',
            color:
              'var(--admin-text-muted)',
            fontSize: '7px',
            lineHeight: 1.45
          }}
        >
          {description}
        </small>
      </div>
    </article>
  );
}

function PreviewMetric({
  label,
  value,
  theme
}) {
  return (
    <div
      style={{
        border: `1px solid ${hexToRgba(
          theme.secondaryColor,
          0.4
        )}`,
        borderRadius: '12px',
        padding: '12px',
        background: hexToRgba(
          theme.secondaryColor,
          0.07
        )
      }}
    >
      <span
        style={{
          display: 'block',
          marginBottom: '5px',
          color: theme.primaryColor,
          fontSize: '6px',
          fontWeight: 850,
          letterSpacing: '.13em',
          textTransform: 'uppercase'
        }}
      >
        {label}
      </span>

      <strong
        style={{
          display: 'block',
          overflow: 'hidden',
          color: theme.textColor,
          fontFamily:
            'Georgia, "Times New Roman", serif',
          fontSize: '11px',
          fontWeight: 500,
          lineHeight: 1.35,
          textOverflow: 'ellipsis'
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function ThemePreview({
  theme,
  coupleNames,
  welcomeMessage,
  eventDate,
  venueName
}) {
  const buttonTextColor =
    getContrastColor(
      theme.primaryColor
    );

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${hexToRgba(
          theme.secondaryColor,
          0.55
        )}`,
        borderRadius: '22px',
        background:
          theme.backgroundColor,
        color: theme.textColor,
        boxShadow:
          '0 24px 65px rgba(15, 23, 42, .10)'
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-80px',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background:
            theme.secondaryColor,
          opacity: 0.12
        }}
      />

      <header
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'space-between',
          gap: '12px',
          borderBottom: `1px solid ${hexToRgba(
            theme.secondaryColor,
            0.25
          )}`,
          padding: '13px 16px'
        }}
      >
        <span
          style={{
            color:
              theme.primaryColor,
            fontSize: '6px',
            fontWeight: 900,
            letterSpacing: '.17em',
            textTransform: 'uppercase'
          }}
        >
          Vista de la invitación
        </span>

        <div
          style={{
            display: 'flex',
            gap: '5px'
          }}
        >
          {[
            theme.primaryColor,
            theme.secondaryColor,
            theme.backgroundColor,
            theme.textColor
          ].map((color, index) => (
            <span
              key={`${color}-${index}`}
              style={{
                width: '9px',
                height: '9px',
                border:
                  '1px solid rgba(0,0,0,.1)',
                borderRadius: '50%',
                background: color
              }}
            />
          ))}
        </div>
      </header>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '45px 24px 34px',
          textAlign: 'center'
        }}
      >
        <span
          style={{
            color:
              theme.primaryColor,
            fontSize: '7px',
            fontWeight: 850,
            letterSpacing: '.23em',
            textTransform: 'uppercase'
          }}
        >
          Nuestra boda
        </span>

        <h3
          style={{
            margin: '17px 0 0',
            color: theme.textColor,
            fontFamily:
              'Georgia, "Times New Roman", serif',
            fontSize:
              'clamp(30px, 4vw, 46px)',
            fontWeight: 400,
            letterSpacing: '-.035em',
            lineHeight: 1.05
          }}
        >
          {coupleNames}
        </h3>

        <div
          aria-hidden="true"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            margin: '19px 0'
          }}
        >
          <span
            style={{
              width: '30px',
              height: '1px',
              background:
                theme.secondaryColor
            }}
          />

          <span
            style={{
              color:
                theme.primaryColor,
              fontSize: '10px'
            }}
          >
            ◆
          </span>

          <span
            style={{
              width: '30px',
              height: '1px',
              background:
                theme.secondaryColor
            }}
          />
        </div>

        <p
          style={{
            maxWidth: '410px',
            margin: '0 auto',
            color: theme.textColor,
            fontFamily:
              'Georgia, "Times New Roman", serif',
            fontSize: '11px',
            fontStyle: 'italic',
            lineHeight: 1.65,
            opacity: 0.78
          }}
        >
          {welcomeMessage}
        </p>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns:
            'repeat(2, minmax(0, 1fr))',
          gap: '9px',
          padding: '0 16px 16px'
        }}
      >
        <PreviewMetric
          label="Fecha"
          value={eventDate}
          theme={theme}
        />

        <PreviewMetric
          label="Lugar"
          value={venueName}
          theme={theme}
        />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '8px',
          borderTop: `1px solid ${hexToRgba(
            theme.secondaryColor,
            0.22
          )}`,
          padding: '15px'
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            minHeight: '36px',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${theme.primaryColor}`,
            borderRadius: '999px',
            padding: '0 16px',
            background:
              theme.primaryColor,
            color: buttonTextColor,
            fontSize: '7px',
            fontWeight: 800
          }}
        >
          Confirmar asistencia
        </span>

        <span
          style={{
            display: 'inline-flex',
            minHeight: '36px',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${hexToRgba(
              theme.primaryColor,
              0.65
            )}`,
            borderRadius: '999px',
            padding: '0 16px',
            color:
              theme.primaryColor,
            fontSize: '7px',
            fontWeight: 800
          }}
        >
          Ver ubicación
        </span>
      </div>
    </div>
  );
}

function SectionShell({
  children
}) {
  return (
    <section
      style={{
        border:
          '1px solid var(--admin-border)',
        borderRadius: '20px',
        padding: '22px',
        background:
          'linear-gradient(145deg, var(--admin-surface), var(--admin-surface-soft))',
        boxShadow:
          '0 14px 40px rgba(15, 23, 42, .04)'
      }}
    >
      {children}
    </section>
  );
}

export default function DesignTab({
  formData,
  handleThemeChange
}) {
  const rawTheme =
    formData?.theme || {};

  const theme = {
    primaryColor:
      normalizeHexColor(
        rawTheme.primaryColor,
        DEFAULT_THEME.primaryColor
      ),

    secondaryColor:
      normalizeHexColor(
        rawTheme.secondaryColor,
        DEFAULT_THEME.secondaryColor
      ),

    backgroundColor:
      normalizeHexColor(
        rawTheme.backgroundColor,
        DEFAULT_THEME.backgroundColor
      ),

    textColor:
      normalizeHexColor(
        rawTheme.textColor,
        DEFAULT_THEME.textColor
      )
  };

  const coupleNames = useMemo(() => {
    const groomName =
      cleanText(
        formData?.groomName
      ) || 'Nombre del novio';

    const brideName =
      cleanText(
        formData?.brideName
      ) || 'Nombre de la novia';

    return `${groomName} & ${brideName}`;
  }, [
    formData?.groomName,
    formData?.brideName
  ]);

  const activePresetId =
    useMemo(() => {
      const matchingPreset =
        THEME_PRESETS.find(
          (preset) =>
            Object.entries(
              preset.colors
            ).every(
              ([key, value]) =>
                value.toLowerCase() ===
                theme[
                  key
                ].toLowerCase()
            )
        );

      return (
        matchingPreset?.id || ''
      );
    }, [
      theme.primaryColor,
      theme.secondaryColor,
      theme.backgroundColor,
      theme.textColor
    ]);

  const welcomeMessage =
    cleanText(
      formData?.welcomeMessage
    ) ||
    'Nos llena de alegría compartir este momento contigo.';

  const eventDate =
    formatEventDate(
      formData?.eventDate
    );

  const venueName =
    cleanText(
      formData?.location
        ?.venueName ||
        formData?.venue?.name ||
        formData?.venueName
    ) ||
    'Lugar del evento';

  function updateThemeField(
    name,
    value
  ) {
    if (
      typeof handleThemeChange !==
      'function'
    ) {
      return;
    }

    handleThemeChange({
      target: {
        name,
        value
      }
    });
  }

  function applyPreset(preset) {
    if (!preset?.colors) {
      return;
    }

    Object.entries(
      preset.colors
    ).forEach(
      ([name, value]) => {
        updateThemeField(
          name,
          value
        );
      }
    );
  }

  function restoreDefaultTheme() {
    Object.entries(
      DEFAULT_THEME
    ).forEach(
      ([name, value]) => {
        updateThemeField(
          name,
          value
        );
      }
    );
  }

  return (
    <div
      className="builder-tab design-tab"
      style={{
        display: 'grid',
        gap: '28px'
      }}
    >
      {/*
       * =====================================================
       * CABECERA
       * =====================================================
       */}

      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent:
            'space-between',
          gap: '22px'
        }}
      >
        <div
          style={{
            minWidth: 0,
            flex: '1 1 500px'
          }}
        >
          <span
            className="section-eyebrow"
            style={{
              display: 'block',
              marginBottom: '7px'
            }}
          >
            Apariencia visual
          </span>

          <h2
            style={{
              margin: 0,
              color:
                'var(--admin-text)',
              fontSize: '24px',
              fontWeight: 790,
              letterSpacing:
                '-.035em',
              lineHeight: 1.08
            }}
          >
            Diseño de la invitación
          </h2>

          <p
            style={{
              maxWidth: '700px',
              margin: '9px 0 0',
              color:
                'var(--admin-text-soft)',
              fontSize: '10px',
              lineHeight: 1.65
            }}
          >
            Define la identidad visual
            de la boda. Puedes comenzar
            con una combinación preparada
            y después ajustar cualquier
            color.
          </p>
        </div>

        <button
          type="button"
          onClick={
            restoreDefaultTheme
          }
          style={{
            display: 'inline-flex',
            minHeight: '40px',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            border:
              '1px solid var(--admin-border)',
            borderRadius: '10px',
            padding: '0 14px',
            background:
              'var(--admin-surface)',
            color:
              'var(--admin-text-secondary)',
            fontSize: '8px',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          <ResetIcon />
          Restaurar colores
        </button>
      </header>

      {/*
       * =====================================================
       * PRESETS
       * =====================================================
       */}

      <SectionShell>
        <header
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent:
              'space-between',
            gap: '16px',
            marginBottom: '18px'
          }}
        >
          <div>
            <span
              style={{
                display: 'block',
                marginBottom: '5px',
                color:
                  'var(--admin-accent-strong)',
                fontSize: '7px',
                fontWeight: 900,
                letterSpacing: '.15em',
                textTransform:
                  'uppercase'
              }}
            >
              Estilos rápidos
            </span>

            <h3
              style={{
                margin: 0,
                color:
                  'var(--admin-text)',
                fontSize: '15px',
                fontWeight: 770
              }}
            >
              Combinaciones predeterminadas
            </h3>

            <p
              style={{
                margin: '6px 0 0',
                color:
                  'var(--admin-text-soft)',
                fontSize: '8px',
                lineHeight: 1.55
              }}
            >
              Elige una identidad base y
              personalízala si lo necesitas.
            </p>
          </div>

          {activePresetId && (
            <span
              style={{
                border:
                  '1px solid var(--admin-border)',
                borderRadius: '999px',
                padding: '6px 10px',
                background:
                  'var(--admin-accent-faint)',
                color:
                  'var(--admin-accent-strong)',
                fontSize: '7px',
                fontWeight: 800
              }}
            >
              Preset activo
            </span>
          )}
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '11px'
          }}
        >
          {THEME_PRESETS.map(
            (preset) => (
              <ThemePreset
                key={preset.id}
                preset={preset}
                active={
                  activePresetId ===
                  preset.id
                }
                onSelect={
                  applyPreset
                }
              />
            )
          )}
        </div>
      </SectionShell>

      {/*
       * =====================================================
       * PERSONALIZACIÓN + PREVIEW
       * =====================================================
       */}

      <SectionShell>
        <header
          style={{
            marginBottom: '19px'
          }}
        >
          <span
            style={{
              display: 'block',
              marginBottom: '5px',
              color:
                'var(--admin-accent-strong)',
              fontSize: '7px',
              fontWeight: 900,
              letterSpacing: '.15em',
              textTransform: 'uppercase'
            }}
          >
            Personalización
          </span>

          <h3
            style={{
              margin: 0,
              color:
                'var(--admin-text)',
              fontSize: '15px',
              fontWeight: 770
            }}
          >
            Ajusta tu paleta
          </h3>

          <p
            style={{
              margin: '6px 0 0',
              color:
                'var(--admin-text-soft)',
              fontSize: '8px',
              lineHeight: 1.55
            }}
          >
            Cambia cada color y observa el
            resultado inmediatamente.
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(390px, 100%), 1fr))',
            gap: '20px',
            alignItems: 'start'
          }}
        >
          <div
            style={{
              display: 'grid',
              gap: '10px'
            }}
          >
            {COLOR_FIELDS.map(
              (field) => (
                <ColorControl
                  key={field.id}
                  id={field.id}
                  label={
                    field.label
                  }
                  description={
                    field.description
                  }
                  value={
                    theme[
                      field.id
                    ]
                  }
                  onChange={
                    updateThemeField
                  }
                />
              )
            )}
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                alignItems:
                  'center',
                justifyContent:
                  'space-between',
                gap: '12px',
                marginBottom:
                  '10px'
              }}
            >
              <div>
                <span
                  style={{
                    display:
                      'block',
                    color:
                      'var(--admin-text)',
                    fontSize:
                      '9px',
                    fontWeight:
                      800
                  }}
                >
                  Vista previa
                </span>

                <span
                  style={{
                    display:
                      'block',
                    marginTop:
                      '2px',
                    color:
                      'var(--admin-text-muted)',
                    fontSize:
                      '7px'
                  }}
                >
                  Resultado de la
                  combinación
                </span>
              </div>

              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius:
                    '50%',
                  background:
                    theme.primaryColor,
                  boxShadow: `0 0 0 5px ${hexToRgba(
                    theme.primaryColor,
                    0.12
                  )}`
                }}
              />
            </div>

            <ThemePreview
              theme={theme}
              coupleNames={
                coupleNames
              }
              welcomeMessage={
                welcomeMessage
              }
              eventDate={
                eventDate
              }
              venueName={
                venueName
              }
            />
          </div>
        </div>
      </SectionShell>

      {/*
       * =====================================================
       * NOTA
       * =====================================================
       */}

      <div
        style={{
          border:
            '1px solid var(--admin-border)',
          borderLeft:
            '3px solid var(--admin-accent)',
          borderRadius:
            '0 13px 13px 0',
          padding: '13px 15px',
          background:
            'var(--admin-surface-soft)'
        }}
      >
        <strong
          style={{
            display: 'block',
            color:
              'var(--admin-text)',
            fontSize: '9px',
            fontWeight: 800
          }}
        >
          Contraste y legibilidad
        </strong>

        <p
          style={{
            margin: '4px 0 0',
            color:
              'var(--admin-text-soft)',
            fontSize: '8px',
            lineHeight: 1.6
          }}
        >
          Procura mantener suficiente
          contraste entre el fondo y el
          texto. La vista previa te ayuda a
          comprobar la combinación antes de
          publicar.
        </p>
      </div>
    </div>
  );
}