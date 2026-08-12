export const DEFAULT_SECTIONS = {
  countdown: true,
  calendar: true,
  parents: true,
  story: true,
  gallery: true,
  itinerary: true,
  location: true,
  dressCode: true,
  gifts: true,
  music: true,
  guestBook: true
};

export const SECTION_OPTIONS = [
  {
    key: 'countdown',
    title: 'Cuenta regresiva',
    description: 'Muestra cuánto falta para la boda.'
  },
  {
    key: 'calendar',
    title: 'Calendario',
    description: 'Permite agregar el evento al calendario.'
  },
  {
    key: 'parents',
    title: 'Padres de los novios',
    description: 'Muestra los nombres de los padres.'
  },
  {
    key: 'story',
    title: 'Nuestra historia',
    description: 'Muestra la historia personalizada de la pareja.'
  },
  {
    key: 'gallery',
    title: 'Galería',
    description: 'Muestra fotografías de los novios.'
  },
  {
    key: 'itinerary',
    title: 'Itinerario',
    description: 'Muestra actividades, horarios y ubicaciones.'
  },
  {
    key: 'location',
    title: 'Ubicación',
    description: 'Muestra el lugar, dirección y enlace de Google Maps.'
  },
  {
    key: 'dressCode',
    title: 'Código de vestimenta',
    description: 'Indica cómo deben vestir los invitados.'
  },
  {
    key: 'gifts',
    title: 'Mesa de regalos',
    description: 'Muestra información de regalos o transferencia.'
  },
  {
    key: 'music',
    title: 'Música de fondo',
    description: 'Reproduce la canción elegida para la invitación.'
  },
  {
    key: 'guestBook',
    title: 'Libro de firmas',
    description: 'Permite que los invitados dejen mensajes para los novios.'
  }
];

export const FORM_TABS = [
  {
    key: 'general',
    label: 'Información general'
  },
  {
    key: 'content',
    label: 'Contenido'
  },
  {
    key: 'sections',
    label: 'Secciones'
  },
  {
    key: 'itinerary',
    label: 'Itinerario'
  },
  {
    key: 'media',
    label: 'Fotos y música'
  },
  {
    key: 'design',
    label: 'Diseño'
  },
  {
    key: 'preview',
    label: 'Vista previa'
  }
];

export function createItineraryItem() {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    time: '',
    title: '',
    description: '',
    location: ''
  };
}

export function createEmptyForm(defaultMessage = '') {
  return {
    groomName: '',
    brideName: '',
    eventDate: '',
    welcomeMessage: defaultMessage,

    venueName: '',
    venueAddress: '',
    mapsUrl: '',

    groomFather: '',
    groomMother: '',
    brideFather: '',
    brideMother: '',

    storyTitle: 'Nuestra historia',
    storyText: '',

    dressCodeTitle: '',
    dressCodeWomen: '',
    dressCodeMen: '',
    dressCodeNotes: '',

    giftMessage: '',
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    clabe: '',

    guestBookTitle: 'Libro de firmas',

    sections: {
      ...DEFAULT_SECTIONS
    },

    itinerary: [createItineraryItem()],

    theme: {
      primaryColor: '#9b7b6b',
      secondaryColor: '#d6b89c',
      backgroundColor: '#fffaf6',
      textColor: '#2f2925'
    }
  };
}

export const EMPTY_MEDIA = {
  coverImage: null,
  coupleImage: null,
  backgroundMusic: null,
  gallery: []
};