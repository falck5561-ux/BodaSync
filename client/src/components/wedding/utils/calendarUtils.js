import {
  addHoursToDate,
  parseWeddingDate,
  toCalendarUtcString
} from './dateUtils';

const GOOGLE_CALENDAR_URL =
  'https://calendar.google.com/calendar/render';

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function escapeIcsText(value) {
  return cleanText(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function createCalendarTitle(
  groomName,
  brideName
) {
  const groom = cleanText(groomName);
  const bride = cleanText(brideName);

  if (groom && bride) {
    return `Boda de ${groom} y ${bride}`;
  }

  if (groom) {
    return `Boda de ${groom}`;
  }

  if (bride) {
    return `Boda de ${bride}`;
  }

  return 'Boda';
}

export function getCalendarDates({
  eventDate,
  endDate,
  durationHours = 4
}) {
  const start =
    parseWeddingDate(eventDate);

  if (!start) {
    return {
      start: null,
      end: null,
      startUtc: '',
      endUtc: ''
    };
  }

  const parsedEndDate =
    parseWeddingDate(endDate);

  const end =
    parsedEndDate ||
    addHoursToDate(
      start,
      durationHours
    );

  return {
    start,
    end,
    startUtc:
      toCalendarUtcString(start),
    endUtc:
      toCalendarUtcString(end)
  };
}

export function createGoogleCalendarUrl({
  groomName,
  brideName,
  eventDate,
  endDate,
  durationHours = 4,
  location = '',
  details = ''
}) {
  const {
    startUtc,
    endUtc
  } = getCalendarDates({
    eventDate,
    endDate,
    durationHours
  });

  if (!startUtc || !endUtc) {
    return '';
  }

  const params =
    new URLSearchParams();

  params.set(
    'action',
    'TEMPLATE'
  );

  params.set(
    'text',
    createCalendarTitle(
      groomName,
      brideName
    )
  );

  params.set(
    'dates',
    `${startUtc}/${endUtc}`
  );

  const normalizedLocation =
    cleanText(location);

  const normalizedDetails =
    cleanText(details);

  if (normalizedLocation) {
    params.set(
      'location',
      normalizedLocation
    );
  }

  if (normalizedDetails) {
    params.set(
      'details',
      normalizedDetails
    );
  }

  return `${GOOGLE_CALENDAR_URL}?${params.toString()}`;
}

export function openGoogleCalendar(
  calendarData
) {
  const calendarUrl =
    createGoogleCalendarUrl(
      calendarData
    );

  if (
    !calendarUrl ||
    typeof window === 'undefined'
  ) {
    return false;
  }

  window.open(
    calendarUrl,
    '_blank',
    'noopener,noreferrer'
  );

  return true;
}

export function createIcsContent({
  groomName,
  brideName,
  eventDate,
  endDate,
  durationHours = 4,
  location = '',
  details = '',
  url = ''
}) {
  const {
    startUtc,
    endUtc
  } = getCalendarDates({
    eventDate,
    endDate,
    durationHours
  });

  if (!startUtc || !endUtc) {
    return '';
  }

  const nowUtc =
    toCalendarUtcString(
      new Date()
    );

  const eventTitle =
    createCalendarTitle(
      groomName,
      brideName
    );

  const eventId =
    `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}@bodasync`;

  const normalizedLocation =
    cleanText(location);

  const normalizedDetails =
    cleanText(details);

  const normalizedUrl =
    cleanText(url);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BodaSync//Invitacion Digital//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${eventId}`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${escapeIcsText(eventTitle)}`
  ];

  if (normalizedDetails) {
    lines.push(
      `DESCRIPTION:${escapeIcsText(
        normalizedDetails
      )}`
    );
  }

  if (normalizedLocation) {
    lines.push(
      `LOCATION:${escapeIcsText(
        normalizedLocation
      )}`
    );
  }

  if (normalizedUrl) {
    lines.push(
      `URL:${normalizedUrl}`
    );
  }

  lines.push(
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return lines.join('\r\n');
}

export function downloadCalendarFile({
  fileName = 'boda',
  ...calendarData
}) {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined'
  ) {
    return false;
  }

  const content =
    createIcsContent(calendarData);

  if (!content) {
    return false;
  }

  const safeFileName =
    cleanText(fileName)
      .toLowerCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .replace(
        /[^a-z0-9]+/g,
        '-'
      )
      .replace(
        /^-+|-+$/g,
        ''
      ) || 'boda';

  const blob = new Blob(
    [content],
    {
      type: 'text/calendar;charset=utf-8'
    }
  );

  const objectUrl =
    URL.createObjectURL(blob);

  const downloadLink =
    document.createElement('a');

  downloadLink.href =
    objectUrl;

  downloadLink.download =
    `${safeFileName}.ics`;

  document.body.appendChild(
    downloadLink
  );

  downloadLink.click();
  downloadLink.remove();

  URL.revokeObjectURL(
    objectUrl
  );

  return true;
}

export function createWeddingCalendarData(
  wedding = {}
) {
  const groomName =
    cleanText(
      wedding.groomName ||
        wedding.novio
    );

  const brideName =
    cleanText(
      wedding.brideName ||
        wedding.novia
    );

  const venue =
    wedding.venue || {};

  const location =
    wedding.location || {};

  const locationText =
    cleanText(
      venue.name ||
        location.venueName ||
        location.name ||
        wedding.locationLabel ||
        venue.address ||
        location.venueAddress ||
        location.address ||
        wedding.lugar
    );

  const details =
    cleanText(
      wedding.welcomeMessage ||
        wedding.mainMessage ||
        wedding.mensajePrincipal
    );

  const slug =
    cleanText(wedding.slug);

  const fileNameParts = [
    'boda',
    groomName,
    brideName
  ].filter(Boolean);

  return {
    groomName,
    brideName,

    eventDate:
      wedding.eventDate ||
      wedding.fecha ||
      '',

    endDate:
      wedding.endDate ||
      '',

    durationHours:
      wedding.durationHours ||
      4,

    location: locationText,

    details,

    url:
      cleanText(
        wedding.publicUrl
      ) ||
      (
        typeof window !==
          'undefined'
          ? window.location.href
          : ''
      ),

    fileName:
      fileNameParts.join('-') ||
      (slug
        ? `boda-${slug}`
        : 'boda')
  };
}