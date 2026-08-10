export function isValidDateValue(dateValue) {
  if (!dateValue) {
    return false;
  }

  const date = new Date(dateValue);

  return !Number.isNaN(date.getTime());
}

export function formatWeddingDate(
  dateValue,
  options = {}
) {
  if (!isValidDateValue(dateValue)) {
    return 'Fecha no disponible';
  }

  const date = new Date(dateValue);

  const defaultOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      ...defaultOptions,
      ...options
    }
  ).format(date);
}

export function formatWeddingDateOnly(
  dateValue
) {
  return formatWeddingDate(
    dateValue,
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: undefined,
      minute: undefined
    }
  );
}

export function formatWeddingTime(
  dateValue
) {
  if (!isValidDateValue(dateValue)) {
    return 'Hora no disponible';
  }

  const date = new Date(dateValue);

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      hour: '2-digit',
      minute: '2-digit'
    }
  ).format(date);
}

export function formatPreviewDate(
  dateValue
) {
  if (!dateValue) {
    return 'Selecciona la fecha';
  }

  if (!isValidDateValue(dateValue)) {
    return 'Fecha no válida';
  }

  return formatWeddingDate(dateValue);
}

export function formatCalendarDate(
  dateValue
) {
  if (!isValidDateValue(dateValue)) {
    return '';
  }

  const date = new Date(dateValue);

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatDateTimeLocal(
  dateValue
) {
  if (!isValidDateValue(dateValue)) {
    return '';
  }

  const date = new Date(dateValue);

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  const hours = String(
    date.getHours()
  ).padStart(2, '0');

  const minutes = String(
    date.getMinutes()
  ).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getEventDateParts(
  dateValue
) {
  if (!isValidDateValue(dateValue)) {
    return {
      day: '',
      month: '',
      year: '',
      time: '',
      weekday: ''
    };
  }

  const date = new Date(dateValue);

  return {
    day: new Intl.DateTimeFormat(
      'es-MX',
      {
        day: '2-digit'
      }
    ).format(date),

    month: new Intl.DateTimeFormat(
      'es-MX',
      {
        month: 'long'
      }
    ).format(date),

    year: new Intl.DateTimeFormat(
      'es-MX',
      {
        year: 'numeric'
      }
    ).format(date),

    time: new Intl.DateTimeFormat(
      'es-MX',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(date),

    weekday: new Intl.DateTimeFormat(
      'es-MX',
      {
        weekday: 'long'
      }
    ).format(date)
  };
}

export function isPastDate(
  dateValue
) {
  if (!isValidDateValue(dateValue)) {
    return false;
  }

  return (
    new Date(dateValue).getTime() <
    Date.now()
  );
}

export function isFutureDate(
  dateValue
) {
  if (!isValidDateValue(dateValue)) {
    return false;
  }

  return (
    new Date(dateValue).getTime() >
    Date.now()
  );
}

export function calculateCountdown(
  dateValue,
  currentDate = new Date()
) {
  if (!isValidDateValue(dateValue)) {
    return {
      completed: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMilliseconds: 0
    };
  }

  const eventDate =
    new Date(dateValue);

  const now =
    currentDate instanceof Date
      ? currentDate
      : new Date(currentDate);

  const difference =
    eventDate.getTime() -
    now.getTime();

  if (difference <= 0) {
    return {
      completed: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMilliseconds: 0
    };
  }

  const days = Math.floor(
    difference /
      (1000 * 60 * 60 * 24)
  );

  const hours = Math.floor(
    (difference /
      (1000 * 60 * 60)) %
      24
  );

  const minutes = Math.floor(
    (difference /
      (1000 * 60)) %
      60
  );

  const seconds = Math.floor(
    (difference / 1000) %
      60
  );

  return {
    completed: false,
    days,
    hours,
    minutes,
    seconds,
    totalMilliseconds: difference
  };
}

export function getMinimumEventDate() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    now.getDate()
  ).padStart(2, '0');

  const hours = String(
    now.getHours()
  ).padStart(2, '0');

  const minutes = String(
    now.getMinutes()
  ).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getGoogleCalendarDates(
  startDateValue,
  durationHours = 6
) {
  if (!isValidDateValue(startDateValue)) {
    return {
      startDate: '',
      endDate: ''
    };
  }

  const startDate =
    new Date(startDateValue);

  const endDate =
    new Date(
      startDate.getTime() +
        durationHours *
          60 *
          60 *
          1000
    );

  function formatGoogleDate(date) {
    return date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  }

  return {
    startDate:
      formatGoogleDate(startDate),

    endDate:
      formatGoogleDate(endDate)
  };
}

export function createGoogleCalendarUrl({
  title,
  startDate,
  location = '',
  description = '',
  durationHours = 6
}) {
  if (
    !title ||
    !isValidDateValue(startDate)
  ) {
    return '';
  }

  const dates =
    getGoogleCalendarDates(
      startDate,
      durationHours
    );

  const params =
    new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${dates.startDate}/${dates.endDate}`,
      details: description,
      location
    });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}