import React, { useMemo } from 'react';

const THEME_PRESETS = [
  {
    id: 'romantic',
    name: 'Romántico',
    description: 'Tonos rosa, beige y café suave.',
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
    description: 'Negro, dorado y fondo marfil.',
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
    description: 'Verdes suaves y tonos tierra.',
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
    description: 'Azules frescos y fondo claro.',
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
    description: 'Borgoña profundo y rosa empolvado.',
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
    description: 'Morados suaves y estilo delicado.',
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

function normalizeHexColor(value, fallback) {
  if (
    typeof value === 'string' &&
    /^#[0-9a-fA-F]{6}$/.test(value)
  ) {
    return value;
  }

  return fallback;
}

function getContrastColor(hexColor) {
  const normalizedColor = hexColor.replace('#', '');

  const red = parseInt(
    normalizedColor.substring(0, 2),
    16
  );

  const green = parseInt(
    normalizedColor.substring(2, 4),
    16
  );

  const blue = parseInt(
    normalizedColor.substring(4, 6),
    16
  );

  const brightness =
    (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 145
    ? '#1f1f1f'
    : '#ffffff';
}

function ColorField({
  id,
  label,
  description,
  value,
  onChange
}) {
  return (
    <div className="form-field color-field">
      <label htmlFor={id}>
        {label}
      </label>

      <div className="color-input-row">
        <input
          id={id}
          type="color"
          name={id}
          value={value}
          onChange={onChange}
          aria-label={`Seleccionar ${label.toLowerCase()}`}
        />

        <input
          type="text"
          name={id}
          value={value}
          onChange={onChange}
          placeholder="#000000"
          maxLength="7"
          spellCheck="false"
          autoComplete="off"
          aria-label={`Código hexadecimal de ${label.toLowerCase()}`}
        />

        <span
          className="color-swatch"
          style={{
            backgroundColor: value
          }}
          aria-hidden="true"
        />
      </div>

      {description && (
        <small>
          {description}
        </small>
      )}
    </div>
  );
}

function ThemePreset({
  preset,
  active,
  onSelect
}) {
  return (
    <button
      type="button"
      className={`theme-preset-card ${
        active ? 'active' : ''
      }`}
      onClick={() => onSelect(preset)}
      aria-pressed={active}
    >
      <div className="theme-preset-colors">
        {Object.values(preset.colors).map(
          (color, index) => (
            <span
              key={`${preset.id}-${index}`}
              style={{
                backgroundColor: color
              }}
            />
          )
        )}
      </div>

      <div className="theme-preset-information">
        <strong>
          {preset.name}
        </strong>

        <p>
          {preset.description}
        </p>
      </div>

      <span
        className="theme-preset-check"
        aria-hidden="true"
      >
        {active ? '✓' : ''}
      </span>
    </button>
  );
}

export default function DesignTab({
  formData,
  handleThemeChange
}) {
  const rawTheme =
    formData?.theme || {};

  const theme = {
    primaryColor: normalizeHexColor(
      rawTheme.primaryColor,
      DEFAULT_THEME.primaryColor
    ),

    secondaryColor: normalizeHexColor(
      rawTheme.secondaryColor,
      DEFAULT_THEME.secondaryColor
    ),

    backgroundColor: normalizeHexColor(
      rawTheme.backgroundColor,
      DEFAULT_THEME.backgroundColor
    ),

    textColor: normalizeHexColor(
      rawTheme.textColor,
      DEFAULT_THEME.textColor
    )
  };

  const coupleNames = useMemo(() => {
    const groomName =
      formData?.groomName?.trim() ||
      'Nombre del novio';

    const brideName =
      formData?.brideName?.trim() ||
      'Nombre de la novia';

    return `${groomName} & ${brideName}`;
  }, [
    formData?.groomName,
    formData?.brideName
  ]);

  const activePresetId = useMemo(() => {
    const matchingPreset =
      THEME_PRESETS.find((preset) => {
        return Object.entries(
          preset.colors
        ).every(([key, value]) => {
          return (
            value.toLowerCase() ===
            theme[key].toLowerCase()
          );
        });
      });

    return matchingPreset?.id || '';
  }, [
    theme.primaryColor,
    theme.secondaryColor,
    theme.backgroundColor,
    theme.textColor
  ]);

  const primaryButtonTextColor =
    getContrastColor(
      theme.primaryColor
    );

  function updateThemeField(name, value) {
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

  function handleColorChange(event) {
    const {
      name,
      value
    } = event.target;

    updateThemeField(name, value);
  }

  function applyPreset(preset) {
    if (!preset?.colors) {
      return;
    }

    Object.entries(
      preset.colors
    ).forEach(([name, value]) => {
      updateThemeField(
        name,
        value
      );
    });
  }

  function restoreDefaultTheme() {
    Object.entries(
      DEFAULT_THEME
    ).forEach(([name, value]) => {
      updateThemeField(
        name,
        value
      );
    });
  }

  return (
    <div className="builder-tab design-tab">
      <div className="tab-heading section-header-row">
        <div>
          <span className="section-eyebrow">
            Apariencia visual
          </span>

          <h2>
            Diseño de la invitación
          </h2>

          <p>
            Selecciona una combinación predeterminada
            o personaliza los colores para adaptar la
            invitación al estilo de cada pareja.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button compact-button"
          onClick={restoreDefaultTheme}
        >
          Restaurar colores
        </button>
      </div>

      <section className="builder-subsection">
        <div className="subsection-header">
          <div>
            <span className="section-eyebrow">
              Estilos rápidos
            </span>

            <h3>
              Combinaciones predeterminadas
            </h3>

            <p>
              Selecciona un estilo y después modifica
              cualquier color de forma individual.
            </p>
          </div>

          {activePresetId && (
            <span className="status-badge enabled">
              Estilo seleccionado
            </span>
          )}
        </div>

        <div className="theme-presets-grid">
          {THEME_PRESETS.map(
            (preset) => (
              <ThemePreset
                key={preset.id}
                preset={preset}
                active={
                  activePresetId ===
                  preset.id
                }
                onSelect={applyPreset}
              />
            )
          )}
        </div>
      </section>

      <div className="builder-divider" />

      <section className="builder-subsection">
        <div className="subsection-header">
          <div>
            <span className="section-eyebrow">
              Personalización
            </span>

            <h3>
              Colores individuales
            </h3>

            <p>
              Puedes utilizar el selector visual o
              escribir directamente un código
              hexadecimal.
            </p>
          </div>
        </div>

        <div className="form-grid">
          <ColorField
            id="primaryColor"
            label="Color principal"
            description="Se utilizará en botones, títulos destacados y elementos principales."
            value={theme.primaryColor}
            onChange={handleColorChange}
          />

          <ColorField
            id="secondaryColor"
            label="Color secundario"
            description="Se utilizará en bordes, fondos decorativos y detalles."
            value={
              theme.secondaryColor
            }
            onChange={handleColorChange}
          />

          <ColorField
            id="backgroundColor"
            label="Color de fondo"
            description="Será el fondo general de las secciones de la invitación."
            value={
              theme.backgroundColor
            }
            onChange={handleColorChange}
          />

          <ColorField
            id="textColor"
            label="Color del texto"
            description="Se aplicará a párrafos, descripciones e información general."
            value={theme.textColor}
            onChange={handleColorChange}
          />
        </div>
      </section>

      <div className="builder-divider" />

      <section className="builder-subsection">
        <div className="subsection-header">
          <div>
            <span className="section-eyebrow">
              Vista rápida
            </span>

            <h3>
              Resultado de la combinación
            </h3>

            <p>
              Comprueba que los textos y botones sean
              fáciles de leer antes de guardar.
            </p>
          </div>
        </div>

        <div
          className="palette-preview"
          style={{
            backgroundColor:
              theme.backgroundColor,

            color:
              theme.textColor,

            borderColor:
              theme.secondaryColor,

            '--theme-primary':
              theme.primaryColor,

            '--theme-secondary':
              theme.secondaryColor,

            '--theme-background':
              theme.backgroundColor,

            '--theme-text':
              theme.textColor
          }}
        >
          <div
            className="palette-preview-decoration"
            style={{
              backgroundColor:
                theme.secondaryColor
            }}
          />

          <div className="palette-preview-header">
            <span
              style={{
                color:
                  theme.primaryColor
              }}
            >
              Nuestra boda
            </span>

            <h3>
              {coupleNames}
            </h3>

            <p>
              {formData?.welcomeMessage ||
                'Nos llena de alegría compartir este momento contigo.'}
            </p>
          </div>

          <div className="palette-preview-details">
            <article
              style={{
                borderColor:
                  theme.secondaryColor
              }}
            >
              <span>
                Fecha
              </span>

              <strong
                style={{
                  color:
                    theme.primaryColor
                }}
              >
                Próximamente
              </strong>
            </article>

            <article
              style={{
                borderColor:
                  theme.secondaryColor
              }}
            >
              <span>
                Lugar
              </span>

              <strong
                style={{
                  color:
                    theme.primaryColor
                }}
              >
                {formData?.venueName ||
                  'Lugar del evento'}
              </strong>
            </article>
          </div>

          <div className="palette-preview-actions">
            <button
              type="button"
              style={{
                backgroundColor:
                  theme.primaryColor,

                color:
                  primaryButtonTextColor
              }}
            >
              Confirmar asistencia
            </button>

            <button
              type="button"
              style={{
                backgroundColor:
                  'transparent',

                color:
                  theme.primaryColor,

                borderColor:
                  theme.primaryColor
              }}
            >
              Ver ubicación
            </button>
          </div>

          <div className="palette-preview-palette">
            <div>
              <span
                style={{
                  backgroundColor:
                    theme.primaryColor
                }}
              />

              <small>
                Principal
              </small>
            </div>

            <div>
              <span
                style={{
                  backgroundColor:
                    theme.secondaryColor
                }}
              />

              <small>
                Secundario
              </small>
            </div>

            <div>
              <span
                style={{
                  backgroundColor:
                    theme.backgroundColor,

                  border:
                    '1px solid #d5d5d5'
                }}
              />

              <small>
                Fondo
              </small>
            </div>

            <div>
              <span
                style={{
                  backgroundColor:
                    theme.textColor
                }}
              />

              <small>
                Texto
              </small>
            </div>
          </div>
        </div>
      </section>

      <div className="sections-help-card">
        <div
          className="sections-help-icon"
          aria-hidden="true"
        >
          i
        </div>

        <div>
          <strong>
            Recomendación de accesibilidad
          </strong>

          <p>
            Utiliza suficiente contraste entre el
            fondo y el texto. Evita combinar colores
            demasiado claros entre sí porque podrían
            dificultar la lectura en celulares.
          </p>
        </div>
      </div>
    </div>
  );
}