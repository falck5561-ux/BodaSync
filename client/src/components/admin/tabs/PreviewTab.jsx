import React, { useEffect, useMemo, useState } from 'react';

const DARK_PALETTE = {
  primary: '#C5A059',
  secondary: '#FCF6BA',
  background: '#050505',
  text: '#FDFBF7'
};

const LIGHT_PALETTE = {
  primary: '#9E7A32',
  secondary: '#D6B89C',
  background: '#FFF8F6',
  text: '#2F2925'
};

const METRIC_ICONS = {
  sections: '▦',
  activities: '◷',
  media: '◇',
  gallery: '▧'
};

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function firstText(...values) {
  for (const value of values) {
    const cleaned = cleanText(value);

    if (cleaned) {
      return cleaned;
    }
  }

  return '';
}

function getMediaUrl(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    return (
      value.preview ||
      value.previewUrl ||
      value.url ||
      value.secureUrl ||
      value.secure_url ||
      value.fileUrl ||
      value.src ||
      value.path ||
      ''
    );
  }

  return '';
}

function formatDate(value) {
  const rawValue = cleanText(value);

  if (!rawValue) {
    return '';
  }

  const date = new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    return rawValue;
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function getThemeColor(theme, keys, fallback) {
  for (const key of keys) {
    const value = cleanText(theme?.[key]);

    if (value) {
      return value;
    }
  }

  return fallback;
}

function getExplicitSectionValue(formData, key) {
  const sections = formData?.sections;

  if (!sections || typeof sections !== 'object') {
    return undefined;
  }

  if (!Object.prototype.hasOwnProperty.call(sections, key)) {
    return undefined;
  }

  const value = sections[key];

  if (typeof value === 'boolean') {
    return value;
  }

  if (value && typeof value === 'object') {
    if (
      Object.prototype.hasOwnProperty.call(
        value,
        'enabled'
      )
    ) {
      return value.enabled !== false;
    }
  }

  return Boolean(value);
}

function isSectionEnabled(formData, key) {
  const explicitValue = getExplicitSectionValue(
    formData,
    key
  );

  if (typeof explicitValue === 'boolean') {
    return explicitValue;
  }

  const normalizedKey =
    key.charAt(0).toUpperCase() + key.slice(1);

  const possibleKeys = [
    `enable${normalizedKey}`,
    `${key}Enabled`,
    `show${normalizedKey}`
  ];

  for (const possibleKey of possibleKeys) {
    if (
      Object.prototype.hasOwnProperty.call(
        formData || {},
        possibleKey
      )
    ) {
      return formData[possibleKey] !== false;
    }
  }

  return true;
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return undefined;
    }

    const mediaQuery = window.matchMedia(query);

    function handleChange(event) {
      setMatches(event.matches);
    }

    setMatches(mediaQuery.matches);

    mediaQuery.addEventListener?.(
      'change',
      handleChange
    );

    return () => {
      mediaQuery.removeEventListener?.(
        'change',
        handleChange
      );
    };
  }, [query]);

  return matches;
}

function getAdminSurface() {
  return 'var(--admin-surface, #101722)';
}

function getAdminSurfaceSoft() {
  return 'var(--admin-surface-soft, #141d2a)';
}

function getAdminSurfaceMuted() {
  return 'var(--admin-surface-muted, #192332)';
}

function getAdminText() {
  return 'var(--admin-text, #f2efe8)';
}

function getAdminTextSecondary() {
  return 'var(--admin-text-secondary, #a6afbd)';
}

function getAdminTextMuted() {
  return 'var(--admin-text-muted, #707d90)';
}

function getAdminBorder() {
  return 'var(--admin-border, rgba(255,255,255,.08))';
}

function getAdminAccent() {
  return 'var(--admin-accent, #c5a059)';
}

function Metric({
  icon,
  value,
  label
}) {
  return (
    <div
      className="preview-safe-metric"
      style={{
        display: 'flex',
        minWidth: 0,
        alignItems: 'center',
        gap: '10px',
        padding: '13px 0'
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'grid',
          width: '30px',
          height: '30px',
          minWidth: '30px',
          maxWidth: '30px',
          minHeight: '30px',
          maxHeight: '30px',
          placeItems: 'center',
          overflow: 'hidden',
          border: `1px solid ${getAdminBorder()}`,
          borderRadius: '9px',
          background: getAdminSurfaceSoft(),
          color: getAdminAccent(),
          fontSize: '14px',
          lineHeight: 1
        }}
      >
        {METRIC_ICONS[icon] || '•'}
      </span>

      <div
        style={{
          display: 'flex',
          minWidth: 0,
          flexDirection: 'column',
          gap: '3px'
        }}
      >
        <strong
          style={{
            color: getAdminText(),
            fontSize: '14px',
            fontWeight: 800,
            lineHeight: 1
          }}
        >
          {value}
        </strong>

        <span
          style={{
            overflow: 'hidden',
            color: getAdminTextMuted(),
            fontSize: '8px',
            fontWeight: 700,
            letterSpacing: '.06em',
            textOverflow: 'ellipsis',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  secondary = ''
}) {
  if (!value) {
    return null;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '30px minmax(0, 1fr)',
        alignItems: 'start',
        gap: '10px',
        padding: '11px 0'
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'grid',
          width: '30px',
          height: '30px',
          placeItems: 'center',
          borderRadius: '9px',
          background: getAdminSurfaceSoft(),
          color: getAdminAccent(),
          fontSize: '13px'
        }}
      >
        {icon}
      </span>

      <div
        style={{
          display: 'flex',
          minWidth: 0,
          flexDirection: 'column',
          gap: '3px'
        }}
      >
        <span
          style={{
            color: getAdminTextMuted(),
            fontSize: '7px',
            fontWeight: 800,
            letterSpacing: '.11em',
            textTransform: 'uppercase'
          }}
        >
          {label}
        </span>

        <strong
          style={{
            overflowWrap: 'anywhere',
            color: getAdminText(),
            fontSize: '10px',
            fontWeight: 700,
            lineHeight: 1.45
          }}
        >
          {value}
        </strong>

        {secondary && (
          <small
            style={{
              color: getAdminTextMuted(),
              fontSize: '8px',
              lineHeight: 1.5
            }}
          >
            {secondary}
          </small>
        )}
      </div>
    </div>
  );
}

function PaletteRow({
  label,
  color
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '29px minmax(0, 1fr)',
        alignItems: 'center',
        gap: '10px',
        padding: '7px 0'
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'block',
          width: '27px',
          height: '27px',
          border: `1px solid ${getAdminBorder()}`,
          borderRadius: '50%',
          background: color,
          boxShadow: '0 2px 7px rgba(0,0,0,.12)'
        }}
      />

      <div
        style={{
          display: 'flex',
          minWidth: 0,
          flexDirection: 'column',
          gap: '2px'
        }}
      >
        <span
          style={{
            color: getAdminTextMuted(),
            fontSize: '7px',
            fontWeight: 800,
            letterSpacing: '.1em',
            textTransform: 'uppercase'
          }}
        >
          {label}
        </span>

        <strong
          style={{
            color: getAdminTextSecondary(),
            fontSize: '8px',
            fontWeight: 650
          }}
        >
          {color}
        </strong>
      </div>
    </div>
  );
}

function PreviewSection({
  eyebrow,
  title,
  children,
  palette
}) {
  return (
    <section
      style={{
        borderTop: `1px solid ${palette.secondary}33`,
        padding: '44px 32px',
        textAlign: 'center'
      }}
    >
      {eyebrow && (
        <span
          style={{
            display: 'block',
            marginBottom: '10px',
            color: palette.primary,
            fontSize: '8px',
            fontWeight: 800,
            letterSpacing: '.18em',
            textTransform: 'uppercase'
          }}
        >
          {eyebrow}
        </span>
      )}

      {title && (
        <h3
          style={{
            margin: '0 0 20px',
            color: palette.text,
            fontFamily:
              'Georgia, "Times New Roman", serif',
            fontSize: '27px',
            fontWeight: 500,
            lineHeight: 1.2
          }}
        >
          {title}
        </h3>
      )}

      {children}
    </section>
  );
}

export default function PreviewTab({
  formData = {},
  media = {},
  itinerary = [],
  previewDate = '',
  builderSummary = {},
  loading = false,
  onEdit,
  onCreateInvitation
}) {
  const isNarrow = useMediaQuery(
    '(max-width: 1080px)'
  );

  const isPhone = useMediaQuery(
    '(max-width: 620px)'
  );

  const formThemeMode =
    formData?.theme?.mode === 'dark'
      ? 'dark'
      : 'light';

  const [
    previewMode,
    setPreviewMode
  ] = useState(formThemeMode);

  useEffect(() => {
    setPreviewMode(formThemeMode);
  }, [formThemeMode]);

  const groomName = cleanText(
    formData.groomName
  );

  const brideName = cleanText(
    formData.brideName
  );

  const coupleName = useMemo(() => {
    if (groomName && brideName) {
      return `${groomName} & ${brideName}`;
    }

    return (
      groomName ||
      brideName ||
      'Invitación'
    );
  }, [
    brideName,
    groomName
  ]);

  const dateLabel =
    cleanText(previewDate) ||
    formatDate(formData.eventDate);

  const welcomeMessage = firstText(
    formData.welcomeMessage,
    formData.mainMessage,
    formData?.story?.text,
    formData?.story?.description
  );

  const storyTitle = firstText(
    formData?.story?.title
  );

  const venueName = firstText(
    formData?.location?.venueName,
    formData?.location?.name,
    formData?.venue?.name,
    formData.venueName,
    formData.locationName
  );

  const venueAddress = firstText(
    formData?.location?.venueAddress,
    formData?.location?.address,
    formData?.venue?.address,
    formData.venueAddress,
    formData.address
  );

  const mapsUrl = firstText(
    formData?.location?.mapsUrl,
    formData?.location?.googleMapsUrl,
    formData?.venue?.mapsUrl,
    formData?.venue?.googleMapsUrl,
    formData.mapsUrl,
    formData.googleMapsUrl
  );

  const groomFather = firstText(
    formData?.parents?.groom?.father,
    formData?.parents?.groomFather,
    formData.groomFather
  );

  const groomMother = firstText(
    formData?.parents?.groom?.mother,
    formData?.parents?.groomMother,
    formData.groomMother
  );

  const brideFather = firstText(
    formData?.parents?.bride?.father,
    formData?.parents?.brideFather,
    formData.brideFather
  );

  const brideMother = firstText(
    formData?.parents?.bride?.mother,
    formData?.parents?.brideMother,
    formData.brideMother
  );

  const dressTitle = firstText(
    formData?.dressCode?.title
  );

  const dressWomen = firstText(
    formData?.dressCode?.women
  );

  const dressMen = firstText(
    formData?.dressCode?.men
  );

  const dressNotes = firstText(
    formData?.dressCode?.notes,
    formData?.dressCode?.note
  );

  const giftMessage = firstText(
    formData?.gifts?.message
  );

  const bankName = firstText(
    formData?.gifts?.bankName
  );

  const accountHolder = firstText(
    formData?.gifts?.accountHolder
  );

  const accountNumber = firstText(
    formData?.gifts?.accountNumber
  );

  const clabe = firstText(
    formData?.gifts?.clabe
  );

  const coverImage = getMediaUrl(
    media.coverImage ||
      media.cover ||
      formData?.media?.coverImage
  );

  const coupleImage = getMediaUrl(
    media.coupleImage ||
      media.couple ||
      formData?.media?.coupleImage
  );

  const backgroundMusic = getMediaUrl(
    media.backgroundMusic ||
      media.music ||
      formData?.media?.backgroundMusic ||
      formData?.media?.musicUrl
  );

  const gallery = useMemo(() => {
    const source =
      Array.isArray(media.gallery)
        ? media.gallery
        : Array.isArray(
              formData?.media?.gallery
            )
          ? formData.media.gallery
          : [];

    return source
      .map((item) => getMediaUrl(item))
      .filter(Boolean);
  }, [
    formData?.media?.gallery,
    media.gallery
  ]);

  const cleanItinerary = useMemo(() => {
    if (!Array.isArray(itinerary)) {
      return [];
    }

    return itinerary.filter((item) => {
      if (
        !item ||
        typeof item !== 'object'
      ) {
        return false;
      }

      return Boolean(
        firstText(
          item.title,
          item.name,
          item.activity,
          item.time,
          item.hour
        )
      );
    });
  }, [itinerary]);

  const lightPalette = useMemo(() => {
    const theme = formData.theme || {};

    return {
      primary: getThemeColor(
        theme,
        ['primaryColor', 'primary'],
        LIGHT_PALETTE.primary
      ),
      secondary: getThemeColor(
        theme,
        ['secondaryColor', 'secondary'],
        LIGHT_PALETTE.secondary
      ),
      background: getThemeColor(
        theme,
        [
          'backgroundColor',
          'background'
        ],
        LIGHT_PALETTE.background
      ),
      text: getThemeColor(
        theme,
        ['textColor', 'text'],
        LIGHT_PALETTE.text
      )
    };
  }, [formData.theme]);

  const palette =
    previewMode === 'dark'
      ? DARK_PALETTE
      : lightPalette;

  const calculatedMediaCount =
    Number(Boolean(coverImage)) +
    Number(Boolean(coupleImage)) +
    Number(Boolean(backgroundMusic)) +
    gallery.length;

  const summary = {
    sections:
      builderSummary.activeSections ?? 0,
    activities:
      builderSummary.itineraryActivities ??
      cleanItinerary.length,
    media:
      builderSummary.selectedMedia ??
      calculatedMediaCount,
    gallery:
      builderSummary.galleryImages ??
      gallery.length
  };

  const hasMainData = Boolean(
    groomName &&
      brideName &&
      formData.eventDate
  );

  const hasParents = Boolean(
    groomFather ||
      groomMother ||
      brideFather ||
      brideMother
  );

  const hasDressCode = Boolean(
    dressTitle ||
      dressWomen ||
      dressMen ||
      dressNotes
  );

  const hasGifts = Boolean(
    giftMessage ||
      bankName ||
      accountHolder ||
      accountNumber ||
      clabe
  );

  const showStory =
    isSectionEnabled(
      formData,
      'story'
    ) &&
    Boolean(
      storyTitle ||
        welcomeMessage ||
        coupleImage
    );

  const showParents =
    isSectionEnabled(
      formData,
      'parents'
    ) &&
    hasParents;

  const showLocation =
    isSectionEnabled(
      formData,
      'location'
    ) &&
    Boolean(
      venueName ||
        venueAddress ||
        mapsUrl
    );

  const showItinerary =
    isSectionEnabled(
      formData,
      'itinerary'
    ) &&
    cleanItinerary.length > 0;

  const showDressCode =
    isSectionEnabled(
      formData,
      'dressCode'
    ) &&
    hasDressCode;

  const showGallery =
    isSectionEnabled(
      formData,
      'gallery'
    ) &&
    gallery.length > 0;

  const showGifts =
    isSectionEnabled(
      formData,
      'gifts'
    ) &&
    hasGifts;

  const showMusic =
    isSectionEnabled(
      formData,
      'music'
    ) &&
    Boolean(backgroundMusic);

  const modeButtonStyle = (active) => ({
    display: 'inline-flex',
    minHeight: '35px',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    border: active
      ? `1px solid ${getAdminAccent()}`
      : `1px solid ${getAdminBorder()}`,
    borderRadius: '10px',
    padding: '0 12px',
    background: active
      ? getAdminAccent()
      : 'transparent',
    color: active
      ? '#0b111b'
      : getAdminTextSecondary(),
    fontSize: '9px',
    fontWeight: 750,
    cursor: 'pointer'
  });

  const secondaryButtonStyle = {
    display: 'inline-flex',
    minHeight: '42px',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: `1px solid ${getAdminBorder()}`,
    borderRadius: '11px',
    padding: '0 16px',
    background: getAdminSurface(),
    color: getAdminTextSecondary(),
    fontSize: '9px',
    fontWeight: 750,
    cursor: loading
      ? 'not-allowed'
      : 'pointer',
    opacity: loading ? 0.55 : 1
  };

  const primaryButtonStyle = {
    display: 'inline-flex',
    minHeight: '42px',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: `1px solid ${getAdminAccent()}`,
    borderRadius: '11px',
    padding: '0 18px',
    background:
      'linear-gradient(135deg, var(--admin-accent-bright, #dfc47d), var(--admin-accent, #c5a059))',
    color: '#0a111b',
    fontSize: '9px',
    fontWeight: 800,
    cursor: loading
      ? 'not-allowed'
      : 'pointer',
    opacity: loading ? 0.55 : 1,
    boxShadow:
      '0 9px 24px rgba(197,160,89,.14)'
  };

  function handleEdit() {
    if (
      typeof onEdit === 'function'
    ) {
      onEdit();
    }
  }

  function handleCreate() {
    if (
      loading ||
      typeof onCreateInvitation !==
        'function'
    ) {
      return;
    }

    onCreateInvitation();
  }

  return (
    <div
      className="preview-safe-root"
      style={{
        display: 'grid',
        width: '100%',
        gap: '22px',
        color: getAdminText()
      }}
    >
      {/* ===================================================
          HEADER
      ==================================================== */}

      <header
        style={{
          display: 'flex',
          alignItems: isNarrow
            ? 'stretch'
            : 'flex-end',
          justifyContent:
            'space-between',
          flexDirection: isNarrow
            ? 'column'
            : 'row',
          gap: '18px',
          paddingBottom: '4px'
        }}
      >
        <div>
          <span
            style={{
              display: 'block',
              marginBottom: '6px',
              color: getAdminAccent(),
              fontSize: '7px',
              fontWeight: 900,
              letterSpacing: '.18em',
              textTransform: 'uppercase'
            }}
          >
            Último paso
          </span>

          <h2
            style={{
              margin: 0,
              color: getAdminText(),
              fontSize: isPhone
                ? '24px'
                : '30px',
              fontWeight: 710,
              letterSpacing: '-.04em',
              lineHeight: 1.1
            }}
          >
            Revisión final
          </h2>

          <p
            style={{
              maxWidth: '720px',
              margin: '9px 0 0',
              color:
                getAdminTextSecondary(),
              fontSize: '10px',
              lineHeight: 1.65
            }}
          >
            Comprueba la información, el
            diseño y las secciones antes de
            publicar la invitación.
          </p>
        </div>

        <div
          role="group"
          aria-label="Tema de la vista previa"
          style={{
            display: 'inline-flex',
            alignSelf: isNarrow
              ? 'flex-start'
              : 'auto',
            gap: '6px',
            border: `1px solid ${getAdminBorder()}`,
            borderRadius: '12px',
            padding: '4px',
            background:
              getAdminSurfaceSoft()
          }}
        >
          <button
            type="button"
            style={modeButtonStyle(
              previewMode === 'light'
            )}
            onClick={() =>
              setPreviewMode('light')
            }
            aria-pressed={
              previewMode === 'light'
            }
          >
            ☀ Claro
          </button>

          <button
            type="button"
            style={modeButtonStyle(
              previewMode === 'dark'
            )}
            onClick={() =>
              setPreviewMode('dark')
            }
            aria-pressed={
              previewMode === 'dark'
            }
          >
            ☾ Nocturno
          </button>
        </div>
      </header>

      {/* ===================================================
          WORKSPACE
      ==================================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isNarrow
            ? '1fr'
            : '300px minmax(0, 1fr)',
          alignItems: 'start',
          gap: '20px'
        }}
      >
        {/* ===============================================
            SUMMARY
        ================================================ */}

        <aside
          style={{
            position: isNarrow
              ? 'static'
              : 'sticky',
            top: '22px',
            overflow: 'hidden',
            border: `1px solid ${getAdminBorder()}`,
            borderRadius: '18px',
            background:
              getAdminSurface(),
            boxShadow:
              '0 16px 45px rgba(0,0,0,.08)'
          }}
        >
          <header
            style={{
              padding: '19px 20px 17px'
            }}
          >
            <span
              style={{
                display: 'block',
                marginBottom: '7px',
                color: getAdminAccent(),
                fontSize: '7px',
                fontWeight: 900,
                letterSpacing: '.16em',
                textTransform: 'uppercase'
              }}
            >
              Resumen
            </span>

            <h3
              style={{
                margin: 0,
                color: getAdminText(),
                fontSize: '16px',
                fontWeight: 720
              }}
            >
              Configuración actual
            </h3>

            <p
              style={{
                margin: '7px 0 0',
                color:
                  getAdminTextMuted(),
                fontSize: '8px',
                lineHeight: 1.55
              }}
            >
              Una lectura rápida de lo que
              formará parte de la
              invitación.
            </p>
          </header>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',
              columnGap: '16px',
              borderTop: `1px solid ${getAdminBorder()}`,
              borderBottom: `1px solid ${getAdminBorder()}`,
              padding: '2px 20px',
              background:
                getAdminSurfaceSoft()
            }}
          >
            <Metric
              icon="sections"
              value={summary.sections}
              label="Secciones"
            />

            <Metric
              icon="activities"
              value={summary.activities}
              label="Actividades"
            />

            <Metric
              icon="media"
              value={summary.media}
              label="Archivos"
            />

            <Metric
              icon="gallery"
              value={summary.gallery}
              label="Fotografías"
            />
          </div>

          {/* INVITACIÓN */}

          <section
            style={{
              padding: '18px 20px'
            }}
          >
            <span
              style={{
                display: 'block',
                color: getAdminAccent(),
                fontSize: '7px',
                fontWeight: 900,
                letterSpacing: '.15em',
                textTransform: 'uppercase'
              }}
            >
              Invitación
            </span>

            <h4
              style={{
                margin: '5px 0 13px',
                color: getAdminText(),
                fontSize: '12px',
                fontWeight: 720
              }}
            >
              Datos principales
            </h4>

            <div
              style={{
                marginBottom: '5px',
                borderRadius: '11px',
                padding: '12px 13px',
                background:
                  getAdminSurfaceSoft()
              }}
            >
              <span
                style={{
                  display: 'block',
                  marginBottom: '4px',
                  color:
                    getAdminTextMuted(),
                  fontSize: '7px',
                  fontWeight: 800,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase'
                }}
              >
                Pareja
              </span>

              <strong
                style={{
                  color: getAdminText(),
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                {groomName ||
                brideName
                  ? coupleName
                  : 'Sin nombres todavía'}
              </strong>
            </div>

            <DetailRow
              icon="◷"
              label="Fecha"
              value={
                dateLabel ||
                'Selecciona la fecha'
              }
            />

            <DetailRow
              icon="⌖"
              label="Ubicación"
              value={
                venueName ||
                venueAddress
              }
              secondary={
                venueName &&
                venueAddress
                  ? venueAddress
                  : ''
              }
            />

            {!hasMainData && (
              <button
                type="button"
                onClick={handleEdit}
                style={{
                  display: 'flex',
                  width: '100%',
                  minHeight: '38px',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '9px',
                  border: 0,
                  borderRadius: '10px',
                  padding: '0 12px',
                  background:
                    'var(--admin-warning-soft, rgba(190,145,40,.11))',
                  color:
                    'var(--admin-warning, #d8b65f)',
                  fontSize: '8px',
                  fontWeight: 720,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: '6px',
                    height: '6px',
                    flexShrink: 0,
                    borderRadius: '50%',
                    background:
                      'currentColor'
                  }}
                />

                Revisa los datos principales
              </button>
            )}
          </section>

          <div
            style={{
              height: '1px',
              margin: '0 20px',
              background:
                getAdminBorder()
            }}
          />

          {/* TEMA */}

          <section
            style={{
              padding: '18px 20px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                gap: '12px',
                marginBottom: '9px'
              }}
            >
              <div>
                <span
                  style={{
                    display: 'block',
                    color:
                      getAdminAccent(),
                    fontSize: '7px',
                    fontWeight: 900,
                    letterSpacing: '.15em',
                    textTransform:
                      'uppercase'
                  }}
                >
                  Tema
                </span>

                <h4
                  style={{
                    margin: '5px 0 0',
                    color: getAdminText(),
                    fontSize: '12px',
                    fontWeight: 720
                  }}
                >
                  Paleta seleccionada
                </h4>
              </div>

              <span
                style={{
                  border: `1px solid ${getAdminBorder()}`,
                  borderRadius: '999px',
                  padding: '5px 8px',
                  background:
                    getAdminSurfaceSoft(),
                  color:
                    getAdminTextSecondary(),
                  fontSize: '7px',
                  fontWeight: 750
                }}
              >
                {previewMode === 'dark'
                  ? 'Nocturno'
                  : 'Claro'}
              </span>
            </div>

            <PaletteRow
              label="Principal"
              color={palette.primary}
            />

            <PaletteRow
              label="Secundario"
              color={palette.secondary}
            />

            <PaletteRow
              label="Fondo"
              color={palette.background}
            />

            <PaletteRow
              label="Texto"
              color={palette.text}
            />
          </section>

          <div
            style={{
              margin: '0 20px 20px',
              borderLeft:
                '2px solid var(--admin-info, #8fb8dc)',
              borderRadius: '0 8px 8px 0',
              padding: '9px 11px',
              background:
                'var(--admin-info-soft, rgba(73,128,177,.11))',
              color:
                getAdminTextMuted(),
              fontSize: '7px',
              lineHeight: 1.55
            }}
          >
            Esta vista sirve para revisar la
            composición. La invitación
            pública se adapta automáticamente
            al dispositivo.
          </div>
        </aside>

        {/* ===============================================
            CANVAS
        ================================================ */}

        <section
          style={{
            minWidth: 0,
            overflow: 'hidden',
            border: `1px solid ${getAdminBorder()}`,
            borderRadius: '22px',
            background:
              getAdminSurfaceSoft()
          }}
        >
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                'space-between',
              gap: '20px',
              borderBottom: `1px solid ${getAdminBorder()}`,
              padding: '17px 21px',
              background:
                getAdminSurface()
            }}
          >
            <div>
              <span
                style={{
                  display: 'block',
                  marginBottom: '4px',
                  color:
                    getAdminAccent(),
                  fontSize: '7px',
                  fontWeight: 900,
                  letterSpacing: '.16em',
                  textTransform:
                    'uppercase'
                }}
              >
                Vista móvil
              </span>

              <strong
                style={{
                  color:
                    getAdminTextSecondary(),
                  fontSize: '9px',
                  fontWeight: 650
                }}
              >
                Previsualización de la
                invitación
              </strong>
            </div>

            <div
              aria-hidden="true"
              style={{
                display: 'flex',
                gap: '6px'
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#ff6159'
                }}
              />

              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#ffbd2e'
                }}
              />

              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#28c941'
                }}
              />
            </div>
          </header>

          <div
            style={{
              display: 'flex',
              minHeight: isPhone
                ? '600px'
                : '760px',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: isPhone
                ? '24px 10px'
                : '42px 24px',
              background:
                'linear-gradient(145deg, var(--admin-surface-soft, #141d2a), var(--admin-surface-muted, #192332))'
            }}
          >
            {/* PHONE */}

            <div
              style={{
                position: 'relative',
                width: isPhone
                  ? '100%'
                  : 'min(430px, 100%)',
                maxWidth: '430px',
                overflow: 'hidden',
                border: '8px solid #090d14',
                borderRadius: isPhone
                  ? '28px'
                  : '38px',
                background: '#090d14',
                boxShadow:
                  '0 28px 80px rgba(0,0,0,.28)'
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '11px',
                  left: '50%',
                  zIndex: 20,
                  width: '82px',
                  height: '22px',
                  borderRadius: '999px',
                  background: '#05070a',
                  transform:
                    'translateX(-50%)'
                }}
              />

              <div
                style={{
                  maxHeight: isPhone
                    ? '700px'
                    : '780px',
                  overflowY: 'auto',
                  background:
                    palette.background,
                  color: palette.text,
                  scrollbarWidth: 'thin'
                }}
              >
                {/* HERO */}

                <section
                  style={{
                    display: 'flex',
                    minHeight: '450px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '55px 30px 42px',
                    backgroundImage:
                      coverImage
                        ? `linear-gradient(rgba(5,5,5,.30), rgba(5,5,5,.52)), url("${coverImage}")`
                        : `linear-gradient(145deg, ${palette.secondary}55, ${palette.background})`,
                    backgroundPosition:
                      'center',
                    backgroundSize:
                      'cover',
                    color: coverImage
                      ? '#ffffff'
                      : palette.text,
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '8px',
                        fontWeight: 800,
                        letterSpacing: '.25em',
                        textTransform:
                          'uppercase'
                      }}
                    >
                      Invitación
                    </span>

                    <span
                      aria-hidden="true"
                      style={{
                        width: '44px',
                        height: '1px',
                        margin: '18px 0 13px',
                        background:
                          coverImage
                            ? 'rgba(255,255,255,.7)'
                            : palette.primary
                      }}
                    />

                    <h1
                      style={{
                        display: 'flex',
                        margin: 0,
                        flexDirection:
                          'column',
                        alignItems: 'center',
                        fontFamily:
                          'Georgia, "Times New Roman", serif',
                        fontSize: isPhone
                          ? '36px'
                          : '44px',
                        fontWeight: 500,
                        lineHeight: 1.05
                      }}
                    >
                      {groomName &&
                      brideName ? (
                        <>
                          <span>
                            {groomName}
                          </span>

                          <small
                            style={{
                              margin:
                                '8px 0',
                              fontSize:
                                '19px',
                              fontStyle:
                                'italic',
                              fontWeight: 400
                            }}
                          >
                            &
                          </small>

                          <span>
                            {brideName}
                          </span>
                        </>
                      ) : (
                        <span>
                          {coupleName}
                        </span>
                      )}
                    </h1>

                    {dateLabel && (
                      <p
                        style={{
                          margin:
                            '20px 0 0',
                          fontSize:
                            '11px',
                          lineHeight: 1.5
                        }}
                      >
                        {dateLabel}
                      </p>
                    )}
                  </div>
                </section>

                {/* WELCOME */}

                {welcomeMessage && (
                  <section
                    style={{
                      position:
                        'relative',
                      padding:
                        '48px 35px',
                      textAlign:
                        'center'
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        display:
                          'block',
                        marginBottom:
                          '12px',
                        color:
                          palette.primary,
                        fontFamily:
                          'Georgia, serif',
                        fontSize:
                          '29px'
                      }}
                    >
                      “
                    </span>

                    <p
                      style={{
                        margin: 0,
                        color:
                          palette.text,
                        fontFamily:
                          'Georgia, serif',
                        fontSize:
                          '16px',
                        fontStyle:
                          'italic',
                        lineHeight: 1.8
                      }}
                    >
                      {welcomeMessage}
                    </p>
                  </section>
                )}

                {/* STORY */}

                {showStory && (
                  <PreviewSection
                    eyebrow="Nuestra historia"
                    title={
                      storyTitle ||
                      coupleName
                    }
                    palette={palette}
                  >
                    {coupleImage && (
                      <img
                        src={coupleImage}
                        alt={`Fotografía de ${coupleName}`}
                        style={{
                          display: 'block',
                          width: '100%',
                          maxHeight:
                            '360px',
                          margin:
                            '0 auto 20px',
                          borderRadius:
                            '14px',
                          objectFit:
                            'cover'
                        }}
                      />
                    )}

                    {formData?.story?.text &&
                      formData.story.text !==
                        welcomeMessage && (
                        <p
                          style={{
                            margin: 0,
                            color:
                              palette.text,
                            fontSize:
                              '11px',
                            lineHeight:
                              1.75,
                            opacity: 0.8
                          }}
                        >
                          {
                            formData.story
                              .text
                          }
                        </p>
                      )}
                  </PreviewSection>
                )}

                {/* PARENTS */}

                {showParents && (
                  <PreviewSection
                    eyebrow="Con la bendición"
                    title="Nuestros padres"
                    palette={palette}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          isPhone
                            ? '1fr'
                            : 'repeat(2, minmax(0, 1fr))',
                        gap: '10px'
                      }}
                    >
                      {(groomFather ||
                        groomMother) && (
                        <div
                          style={{
                            display:
                              'flex',
                            flexDirection:
                              'column',
                            gap: '7px',
                            border: `1px solid ${palette.secondary}66`,
                            borderRadius:
                              '12px',
                            padding:
                              '15px'
                          }}
                        >
                          <span
                            style={{
                              color:
                                palette.primary,
                              fontSize:
                                '7px',
                              fontWeight:
                                800,
                              letterSpacing:
                                '.1em',
                              textTransform:
                                'uppercase'
                            }}
                          >
                            Familia del novio
                          </span>

                          {groomFather && (
                            <strong
                              style={{
                                fontSize:
                                  '11px'
                              }}
                            >
                              {
                                groomFather
                              }
                            </strong>
                          )}

                          {groomMother && (
                            <strong
                              style={{
                                fontSize:
                                  '11px'
                              }}
                            >
                              {
                                groomMother
                              }
                            </strong>
                          )}
                        </div>
                      )}

                      {(brideFather ||
                        brideMother) && (
                        <div
                          style={{
                            display:
                              'flex',
                            flexDirection:
                              'column',
                            gap: '7px',
                            border: `1px solid ${palette.secondary}66`,
                            borderRadius:
                              '12px',
                            padding:
                              '15px'
                          }}
                        >
                          <span
                            style={{
                              color:
                                palette.primary,
                              fontSize:
                                '7px',
                              fontWeight:
                                800,
                              letterSpacing:
                                '.1em',
                              textTransform:
                                'uppercase'
                            }}
                          >
                            Familia de la novia
                          </span>

                          {brideFather && (
                            <strong
                              style={{
                                fontSize:
                                  '11px'
                              }}
                            >
                              {
                                brideFather
                              }
                            </strong>
                          )}

                          {brideMother && (
                            <strong
                              style={{
                                fontSize:
                                  '11px'
                              }}
                            >
                              {
                                brideMother
                              }
                            </strong>
                          )}
                        </div>
                      )}
                    </div>
                  </PreviewSection>
                )}

                {/* LOCATION */}

                {showLocation && (
                  <PreviewSection
                    eyebrow="Nuestro gran día"
                    title={
                      venueName ||
                      'Ubicación'
                    }
                    palette={palette}
                  >
                    {venueAddress && (
                      <p
                        style={{
                          margin: 0,
                          fontSize:
                            '11px',
                          lineHeight:
                            1.7,
                          opacity: 0.8
                        }}
                      >
                        {venueAddress}
                      </p>
                    )}

                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display:
                            'inline-flex',
                          minHeight:
                            '38px',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          marginTop:
                            '18px',
                          borderRadius:
                            '999px',
                          padding:
                            '0 18px',
                          background:
                            palette.primary,
                          color:
                            previewMode ===
                            'dark'
                              ? '#050505'
                              : '#ffffff',
                          fontSize:
                            '9px',
                          fontWeight:
                            750,
                          textDecoration:
                            'none'
                        }}
                      >
                        Ver ubicación
                      </a>
                    )}
                  </PreviewSection>
                )}

                {/* ITINERARY */}

                {showItinerary && (
                  <PreviewSection
                    eyebrow="Programa"
                    title="Itinerario"
                    palette={palette}
                  >
                    <div
                      style={{
                        display: 'grid',
                        textAlign: 'left'
                      }}
                    >
                      {cleanItinerary.map(
                        (
                          item,
                          index
                        ) => {
                          const time =
                            firstText(
                              item.time,
                              item.hour
                            );

                          const title =
                            firstText(
                              item.title,
                              item.name,
                              item.activity
                            );

                          const description =
                            firstText(
                              item.description,
                              item.details
                            );

                          const location =
                            firstText(
                              item.location,
                              item.place
                            );

                          return (
                            <article
                              key={
                                item.id ||
                                item._id ||
                                `${time}-${title}-${index}`
                              }
                              style={{
                                display:
                                  'grid',
                                gridTemplateColumns:
                                  '66px minmax(0, 1fr)',
                                gap: '12px',
                                borderBottom: `1px solid ${palette.secondary}55`,
                                padding:
                                  '14px 0'
                              }}
                            >
                              <span
                                style={{
                                  color:
                                    palette.primary,
                                  fontSize:
                                    '10px',
                                  fontWeight:
                                    800
                                }}
                              >
                                {time}
                              </span>

                              <div
                                style={{
                                  display:
                                    'flex',
                                  flexDirection:
                                    'column',
                                  gap: '4px'
                                }}
                              >
                                {title && (
                                  <strong
                                    style={{
                                      fontSize:
                                        '11px'
                                    }}
                                  >
                                    {title}
                                  </strong>
                                )}

                                {description && (
                                  <p
                                    style={{
                                      margin:
                                        0,
                                      fontSize:
                                        '9px',
                                      lineHeight:
                                        1.5,
                                      opacity:
                                        0.78
                                    }}
                                  >
                                    {
                                      description
                                    }
                                  </p>
                                )}

                                {location && (
                                  <span
                                    style={{
                                      fontSize:
                                        '8px',
                                      fontStyle:
                                        'italic',
                                      opacity:
                                        0.62
                                    }}
                                  >
                                    {
                                      location
                                    }
                                  </span>
                                )}
                              </div>
                            </article>
                          );
                        }
                      )}
                    </div>
                  </PreviewSection>
                )}

                {/* DRESS CODE */}

                {showDressCode && (
                  <PreviewSection
                    eyebrow="Código de vestimenta"
                    title={
                      dressTitle ||
                      'Vestimenta'
                    }
                    palette={palette}
                  >
                    {(dressWomen ||
                      dressMen) && (
                      <div
                        style={{
                          display:
                            'grid',
                          gridTemplateColumns:
                            isPhone
                              ? '1fr'
                              : 'repeat(2, minmax(0, 1fr))',
                          gap: '10px'
                        }}
                      >
                        {dressWomen && (
                          <div
                            style={{
                              display:
                                'flex',
                              flexDirection:
                                'column',
                              gap: '6px',
                              border: `1px solid ${palette.secondary}66`,
                              borderRadius:
                                '12px',
                              padding:
                                '15px'
                            }}
                          >
                            <span
                              style={{
                                color:
                                  palette.primary,
                                fontSize:
                                  '8px',
                                textTransform:
                                  'uppercase'
                              }}
                            >
                              Mujeres
                            </span>

                            <strong
                              style={{
                                fontSize:
                                  '11px'
                              }}
                            >
                              {
                                dressWomen
                              }
                            </strong>
                          </div>
                        )}

                        {dressMen && (
                          <div
                            style={{
                              display:
                                'flex',
                              flexDirection:
                                'column',
                              gap: '6px',
                              border: `1px solid ${palette.secondary}66`,
                              borderRadius:
                                '12px',
                              padding:
                                '15px'
                            }}
                          >
                            <span
                              style={{
                                color:
                                  palette.primary,
                                fontSize:
                                  '8px',
                                textTransform:
                                  'uppercase'
                              }}
                            >
                              Hombres
                            </span>

                            <strong
                              style={{
                                fontSize:
                                  '11px'
                              }}
                            >
                              {dressMen}
                            </strong>
                          </div>
                        )}
                      </div>
                    )}

                    {dressNotes && (
                      <p
                        style={{
                          margin:
                            '16px 0 0',
                          fontSize:
                            '10px',
                          lineHeight:
                            1.65,
                          opacity: 0.75
                        }}
                      >
                        {dressNotes}
                      </p>
                    )}
                  </PreviewSection>
                )}

                {/* GALLERY */}

                {showGallery && (
                  <PreviewSection
                    eyebrow="Momentos inolvidables"
                    title="Galería"
                    palette={palette}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(2, minmax(0, 1fr))',
                        gap: '8px'
                      }}
                    >
                      {gallery.map(
                        (
                          image,
                          index
                        ) => (
                          <img
                            key={`${image}-${index}`}
                            src={image}
                            alt={`Fotografía ${index + 1}`}
                            loading="lazy"
                            style={{
                              display:
                                'block',
                              width:
                                '100%',
                              height:
                                '155px',
                              borderRadius:
                                '9px',
                              objectFit:
                                'cover'
                            }}
                          />
                        )
                      )}
                    </div>
                  </PreviewSection>
                )}

                {/* GIFTS */}

                {showGifts && (
                  <PreviewSection
                    eyebrow="Detalles"
                    title="Regalos"
                    palette={palette}
                  >
                    {giftMessage && (
                      <p
                        style={{
                          margin:
                            '0 0 18px',
                          fontSize:
                            '10px',
                          lineHeight:
                            1.7,
                          opacity: 0.8
                        }}
                      >
                        {giftMessage}
                      </p>
                    )}

                    {(bankName ||
                      accountHolder ||
                      accountNumber ||
                      clabe) && (
                      <div
                        style={{
                          display:
                            'grid',
                          gap: '9px',
                          border: `1px solid ${palette.secondary}66`,
                          borderRadius:
                            '12px',
                          padding:
                            '15px',
                          textAlign:
                            'left'
                        }}
                      >
                        {[
                          [
                            'Banco',
                            bankName
                          ],
                          [
                            'Titular',
                            accountHolder
                          ],
                          [
                            'Cuenta',
                            accountNumber
                          ],
                          [
                            'CLABE',
                            clabe
                          ]
                        ].map(
                          ([
                            label,
                            value
                          ]) =>
                            value ? (
                              <div
                                key={
                                  label
                                }
                                style={{
                                  display:
                                    'flex',
                                  justifyContent:
                                    'space-between',
                                  gap: '12px'
                                }}
                              >
                                <span
                                  style={{
                                    fontSize:
                                      '8px',
                                    opacity:
                                      0.65,
                                    textTransform:
                                      'uppercase'
                                  }}
                                >
                                  {label}
                                </span>

                                <strong
                                  style={{
                                    overflowWrap:
                                      'anywhere',
                                    fontSize:
                                      '9px',
                                    textAlign:
                                      'right'
                                  }}
                                >
                                  {value}
                                </strong>
                              </div>
                            ) : null
                        )}
                      </div>
                    )}
                  </PreviewSection>
                )}

                {/* MUSIC */}

                {showMusic && (
                  <PreviewSection
                    eyebrow="Música"
                    title="Canción de fondo"
                    palette={palette}
                  >
                    <audio
                      controls
                      preload="metadata"
                      src={backgroundMusic}
                      style={{
                        width: '100%'
                      }}
                    />
                  </PreviewSection>
                )}

                {/* FOOTER */}

                <footer
                  style={{
                    borderTop: `1px solid ${palette.secondary}44`,
                    padding:
                      '38px 32px',
                    background:
                      `${palette.secondary}18`,
                    textAlign:
                      'center'
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'block',
                      color:
                        palette.primary,
                      fontSize: '22px'
                    }}
                  >
                    ✦
                  </span>

                  {groomName ||
                  brideName ? (
                    <strong
                      style={{
                        display:
                          'block',
                        marginTop:
                          '8px',
                        fontFamily:
                          'Georgia, serif',
                        fontSize:
                          '18px',
                        fontWeight:
                          500
                      }}
                    >
                      {coupleName}
                    </strong>
                  ) : null}

                  <p
                    style={{
                      margin:
                        '8px 0 0',
                      fontSize: '8px',
                      opacity: 0.62
                    }}
                  >
                    Invitación creada con
                    BodaSync
                  </p>
                </footer>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ===================================================
          FOOTER ACTIONS
      ==================================================== */}

      <footer
        style={{
          display: 'flex',
          alignItems: isNarrow
            ? 'stretch'
            : 'center',
          justifyContent:
            'space-between',
          flexDirection: isNarrow
            ? 'column'
            : 'row',
          gap: '16px',
          border: `1px solid ${getAdminBorder()}`,
          borderRadius: '16px',
          padding: '15px 17px',
          background:
            getAdminSurface()
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '3px'
          }}
        >
          <span
            style={{
              color: getAdminAccent(),
              fontSize: '7px',
              fontWeight: 900,
              letterSpacing: '.13em',
              textTransform: 'uppercase'
            }}
          >
            Antes de publicar
          </span>

          <strong
            style={{
              color: getAdminTextSecondary(),
              fontSize: '9px',
              fontWeight: 650
            }}
          >
            Revisa nombres, fecha y
            ubicación.
          </strong>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: isPhone
              ? 'column'
              : 'row',
            gap: '8px'
          }}
        >
          <button
            type="button"
            style={secondaryButtonStyle}
            onClick={handleEdit}
            disabled={loading}
          >
            <span aria-hidden="true">
              ✎
            </span>

            Editar datos
          </button>

          <button
            type="button"
            style={primaryButtonStyle}
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span aria-hidden="true">
                  ◷
                </span>

                Publicando...
              </>
            ) : (
              <>
                <span aria-hidden="true">
                  ↑
                </span>

                Crear invitación
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}