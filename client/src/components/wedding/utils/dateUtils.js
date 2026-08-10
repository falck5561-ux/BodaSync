const DEFAULT_LOCALE = 'es-MX';

export function parseWeddingDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  const parsedDate = dateValue instanceof Date ? dateValue : new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

export function isValidWeddingDate(dateValue) {
  return Boolean(parseWeddingDate(dateValue));
}

export function formatWeddingDateLong(
  dateValue,
  options = {}
) {
  const parsedDate = parseWeddingDate(dateValue);

  if (!parsedDate) {
    return 'Fecha pendiente';
  }

  const {
    locale = DEFAULT_LOCALE,
    includeTime = true,
    capitalize = true
  } = options;

  const formatterOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };

  if (includeTime) {
    formatterOptions.hour = 'numeric';
    formatterOptions.minute = '2-digit';
  }

  const formattedDate = new Intl.DateTimeFormat(
    locale,
    formatterOptions
  ).format(parsedDate);

  if (!capitalize) {
    return formattedDate;
  }

  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}

export function formatWeddingDateHero(
  dateValue,
  locale = DEFAULT_LOCALE
) {
  const parsedDate = parseWeddingDate(dateValue);

  if (!parsedDate) {
    return 'Fecha pendiente';
  }

  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(parsedDate);

  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}

export function formatWeddingDateShort(dateValue) {
  const parsedDate = parseWeddingDate(dateValue);

  if (!parsedDate) {
    return '-- . -- . ----';
  }

  const day = String(parsedDate.getDate()).padStart(2, '0');
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const year = parsedDate.getFullYear();

  return `${day} . ${month} . ${year}`;
}

export function formatWeddingTime(
  dateValue,
  locale = DEFAULT_LOCALE
) {
  const parsedDate = parseWeddingDate(dateValue);

  if (!parsedDate) {
    return 'Hora pendiente';
  }

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit'
  }).format(parsedDate);
}

export function formatItineraryTime(
  timeValue,
  locale = DEFAULT_LOCALE
) {
  if (!timeValue) {
    return '';
  }

  const [hourValue, minuteValue = '00'] = String(timeValue).split(':');
  const hour = Number(hourValue);
  const minute = Number(minuteValue);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return String(timeValue);
  }

  const temporaryDate = new Date();
  temporaryDate.setHours(hour, minute, 0, 0);

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit'
  }).format(temporaryDate);
}

export function formatItineraryTimeWithSuffix(timeValue) {
  const formattedTime = formatItineraryTime(timeValue);

  if (!formattedTime) {
    return '';
  }

  return `${formattedTime} HRS`;
}

export function getWeddingDateParts(dateValue) {
  const parsedDate = parseWeddingDate(dateValue);

  if (!parsedDate) {
    return {
      year: null,
      monthIndex: null,
      month: '',
      day: null,
      weekday: '',
      hour: null,
      minute: null
    };
  }

  const month = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    month: 'long'
  }).format(parsedDate);

  const weekday = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    weekday: 'long'
  }).format(parsedDate);

  return {
    year: parsedDate.getFullYear(),
    monthIndex: parsedDate.getMonth(),
    month: month.charAt(0).toUpperCase() + month.slice(1),
    day: parsedDate.getDate(),
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    hour: parsedDate.getHours(),
    minute: parsedDate.getMinutes()
  };
}

export function calculateTimeLeft(dateValue, now = new Date()) {
  const targetDate = parseWeddingDate(dateValue);
  const currentDate = parseWeddingDate(now);

  if (!targetDate || !currentDate) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      finished: false,
      valid: false
    };
  }

  const difference = targetDate.getTime() - currentDate.getTime();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      finished: true,
      valid: true
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    finished: false,
    valid: true
  };
}

export function getCalendarMonthData(dateValue) {
  const parsedDate = parseWeddingDate(dateValue) || new Date();
  const year = parsedDate.getFullYear();
  const monthIndex = parsedDate.getMonth();
  const weddingDay = parsedDate.getDate();

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();

  const emptyDays = Array.from(
    { length: firstDayOfMonth },
    () => null
  );

  const monthDays = Array.from(
    { length: daysInMonth },
    (_, index) => index + 1
  );

  return {
    year,
    monthIndex,
    weddingDay,
    monthName: getWeddingDateParts(parsedDate).month,
    daysInMonth,
    firstDayOfMonth,
    calendarGrid: [...emptyDays, ...monthDays]
  };
}

export function toCalendarUtcString(dateValue) {
  const parsedDate = parseWeddingDate(dateValue);

  if (!parsedDate) {
    return '';
  }

  return parsedDate
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

export function addHoursToDate(dateValue, hours = 4) {
  const parsedDate = parseWeddingDate(dateValue);

  if (!parsedDate) {
    return null;
  }

  const result = new Date(parsedDate);
  result.setHours(result.getHours() + hours);

  return result;
}

export function isWeddingFinished(dateValue) {
  const parsedDate = parseWeddingDate(dateValue);

  if (!parsedDate) {
    return false;
  }

  return parsedDate.getTime() <= Date.now();
}