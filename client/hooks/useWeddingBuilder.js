import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  createWedding,
  deleteWedding,
  getWeddings
} from '../../../services/weddingService';

import {
  DEFAULT_SECTIONS,
  EMPTY_MEDIA,
  createEmptyForm,
  createItineraryItem
} from '../config/adminConfig';

const DEFAULT_BUSINESS_NAME = 'BodaSync';

const DEFAULT_WELCOME_MESSAGE =
  'Nos llena de alegría compartir este momento contigo.';

function getInitialSettings() {
  if (typeof window === 'undefined') {
    return {
      businessName: DEFAULT_BUSINESS_NAME,
      defaultMessage: DEFAULT_WELCOME_MESSAGE
    };
  }

  return {
    businessName:
      localStorage.getItem('bodasync_business_name') ||
      DEFAULT_BUSINESS_NAME,

    defaultMessage:
      localStorage.getItem('bodasync_default_message') ||
      DEFAULT_WELCOME_MESSAGE
  };
}

function revokeMediaUrl(mediaItem) {
  if (mediaItem?.previewUrl) {
    URL.revokeObjectURL(mediaItem.previewUrl);
  }
}

function revokeAllMediaUrls(media) {
  revokeMediaUrl(media.coverImage);
  revokeMediaUrl(media.coupleImage);
  revokeMediaUrl(media.backgroundMusic);

  media.gallery.forEach((image) => {
    revokeMediaUrl(image);
  });
}

export default function useWeddingBuilder() {
  const initialSettingsRef = useRef(getInitialSettings());

  const [activeSection, setActiveSection] =
    useState('create');

  const [formTab, setFormTab] =
    useState('general');

  const [events, setEvents] =
    useState([]);

  const [generatedWedding, setGeneratedWedding] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [loadingEvents, setLoadingEvents] =
    useState(false);

  const [error, setError] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

  const [settings, setSettings] = useState(
    initialSettingsRef.current
  );

  const [formData, setFormData] = useState(() =>
    createEmptyForm(
      initialSettingsRef.current.defaultMessage
    )
  );

  const [media, setMedia] = useState(() => ({
    ...EMPTY_MEDIA,
    gallery: []
  }));

  const latestMediaRef = useRef(media);

  useEffect(() => {
    latestMediaRef.current = media;
  }, [media]);

  useEffect(() => {
    return () => {
      revokeAllMediaUrls(latestMediaRef.current);
    };
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      setError('');

      const data = await getWeddings();

      setEvents(
        Array.isArray(data) ? data : []
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          'No fue posible cargar los eventos.'
      );
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const activeSectionsCount = useMemo(() => {
    return Object.values(formData.sections).filter(
      Boolean
    ).length;
  }, [formData.sections]);

  const coupleNames = useMemo(() => {
    const groomName =
      formData.groomName.trim() || 'Nombre';

    const brideName =
      formData.brideName.trim() || 'Nombre';

    return `${groomName} & ${brideName}`;
  }, [
    formData.groomName,
    formData.brideName
  ]);

  const generatedUrl = useMemo(() => {
    if (
      !generatedWedding?.slug ||
      typeof window === 'undefined'
    ) {
      return '';
    }

    return `${window.location.origin}/boda/${generatedWedding.slug}`;
  }, [generatedWedding]);

  function clearMessages() {
    setError('');
    setSuccessMessage('');
  }

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked
    } = event.target;

    setFormData((currentForm) => ({
      ...currentForm,

      [name]:
        type === 'checkbox'
          ? checked
          : value
    }));
  }

  function handleNumberChange(event) {
    const { name, value } = event.target;

    const numericValue = Number(value);

    setFormData((currentForm) => ({
      ...currentForm,

      [name]:
        Number.isNaN(numericValue)
          ? 1
          : numericValue
    }));
  }

  function handleThemeChange(event) {
    const { name, value } = event.target;

    setFormData((currentForm) => ({
      ...currentForm,

      theme: {
        ...currentForm.theme,
        [name]: value
      }
    }));
  }

  function handleSectionToggle(sectionKey) {
    setFormData((currentForm) => ({
      ...currentForm,

      sections: {
        ...currentForm.sections,

        [sectionKey]:
          !currentForm.sections[sectionKey]
      }
    }));
  }

  function activateAllSections() {
    setFormData((currentForm) => ({
      ...currentForm,

      sections: {
        ...DEFAULT_SECTIONS
      }
    }));
  }

  function deactivateAllSections() {
    const disabledSections = Object.keys(
      DEFAULT_SECTIONS
    ).reduce((result, sectionKey) => {
      result[sectionKey] = false;
      return result;
    }, {});

    setFormData((currentForm) => ({
      ...currentForm,
      sections: disabledSections
    }));
  }

  function handleItineraryChange(
    itemId,
    field,
    value
  ) {
    setFormData((currentForm) => ({
      ...currentForm,

      itinerary:
        currentForm.itinerary.map((item) =>
          item.id === itemId
            ? {
                ...item,
                [field]: value
              }
            : item
        )
    }));
  }

  function addItineraryItem() {
    setFormData((currentForm) => ({
      ...currentForm,

      itinerary: [
        ...currentForm.itinerary,
        createItineraryItem()
      ]
    }));
  }

  function removeItineraryItem(itemId) {
    setFormData((currentForm) => {
      const remainingItems =
        currentForm.itinerary.filter(
          (item) => item.id !== itemId
        );

      return {
        ...currentForm,

        itinerary:
          remainingItems.length > 0
            ? remainingItems
            : [createItineraryItem()]
      };
    });
  }

  function moveItineraryItem(
    itemIndex,
    direction
  ) {
    setFormData((currentForm) => {
      const newIndex =
        itemIndex + direction;

      if (
        newIndex < 0 ||
        newIndex >= currentForm.itinerary.length
      ) {
        return currentForm;
      }

      const updatedItinerary = [
        ...currentForm.itinerary
      ];

      const selectedItem =
        updatedItinerary[itemIndex];

      updatedItinerary[itemIndex] =
        updatedItinerary[newIndex];

      updatedItinerary[newIndex] =
        selectedItem;

      return {
        ...currentForm,
        itinerary: updatedItinerary
      };
    });
  }

  function validateFile(file, acceptedType) {
    if (!file) {
      return false;
    }

    const expectsImage =
      acceptedType === 'image';

    const expectsAudio =
      acceptedType === 'audio';

    if (
      expectsImage &&
      !file.type.startsWith('image/')
    ) {
      setError(
        'Selecciona un archivo de imagen válido.'
      );

      return false;
    }

    if (
      expectsAudio &&
      !file.type.startsWith('audio/')
    ) {
      setError(
        'Selecciona un archivo de audio válido.'
      );

      return false;
    }

    const maximumSize = expectsAudio
      ? 12 * 1024 * 1024
      : 5 * 1024 * 1024;

    if (file.size > maximumSize) {
      setError(
        expectsAudio
          ? 'La canción no debe superar los 12 MB.'
          : 'Cada imagen no debe superar los 5 MB.'
      );

      return false;
    }

    return true;
  }

  function handleSingleMediaChange(
    event,
    mediaKey,
    acceptedType
  ) {
    const file =
      event.target.files?.[0];

    if (!validateFile(file, acceptedType)) {
      event.target.value = '';
      return;
    }

    const previewUrl =
      URL.createObjectURL(file);

    setMedia((currentMedia) => {
      revokeMediaUrl(
        currentMedia[mediaKey]
      );

      return {
        ...currentMedia,

        [mediaKey]: {
          file,
          name: file.name,
          type: file.type,
          size: file.size,
          previewUrl
        }
      };
    });

    setError('');
    event.target.value = '';
  }

  function removeSingleMedia(mediaKey) {
    setMedia((currentMedia) => {
      revokeMediaUrl(
        currentMedia[mediaKey]
      );

      return {
        ...currentMedia,
        [mediaKey]: null
      };
    });
  }

  function handleGalleryChange(event) {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    const availableSpaces =
      8 - media.gallery.length;

    if (availableSpaces <= 0) {
      setError(
        'La galería permite un máximo de 8 imágenes.'
      );

      event.target.value = '';
      return;
    }

    const filesToProcess =
      selectedFiles.slice(0, availableSpaces);

    const newGalleryItems = [];

    for (const file of filesToProcess) {
      if (!validateFile(file, 'image')) {
        continue;
      }

      newGalleryItems.push({
        id: `${Date.now()}-${Math.random()
          .toString(16)
          .slice(2)}`,

        file,
        name: file.name,
        type: file.type,
        size: file.size,

        previewUrl:
          URL.createObjectURL(file)
      });
    }

    if (newGalleryItems.length > 0) {
      setMedia((currentMedia) => ({
        ...currentMedia,

        gallery: [
          ...currentMedia.gallery,
          ...newGalleryItems
        ]
      }));

      setError('');
    }

    event.target.value = '';
  }

  function removeGalleryImage(imageId) {
    setMedia((currentMedia) => {
      const selectedImage =
        currentMedia.gallery.find(
          (image) => image.id === imageId
        );

      revokeMediaUrl(selectedImage);

      return {
        ...currentMedia,

        gallery:
          currentMedia.gallery.filter(
            (image) => image.id !== imageId
          )
      };
    });
  }

  function clearMedia() {
    setMedia((currentMedia) => {
      revokeAllMediaUrls(currentMedia);

      return {
        ...EMPTY_MEDIA,
        gallery: []
      };
    });
  }

  function resetForm() {
    setFormData(
      createEmptyForm(
        settings.defaultMessage
      )
    );

    clearMedia();

    setFormTab('general');
    setGeneratedWedding(null);
    clearMessages();
  }

  function validateForm() {
    if (!formData.groomName.trim()) {
      setFormTab('general');

      setError(
        'Escribe el nombre del novio.'
      );

      return false;
    }

    if (!formData.brideName.trim()) {
      setFormTab('general');

      setError(
        'Escribe el nombre de la novia.'
      );

      return false;
    }

    if (!formData.eventDate) {
      setFormTab('general');

      setError(
        'Selecciona la fecha y hora del evento.'
      );

      return false;
    }

    const eventDate =
      new Date(formData.eventDate);

    if (Number.isNaN(eventDate.getTime())) {
      setFormTab('general');

      setError(
        'La fecha del evento no es válida.'
      );

      return false;
    }

    if (
      formData.sections.location &&
      !formData.venueName.trim()
    ) {
      setFormTab('general');

      setError(
        'La ubicación está activa. Escribe el nombre del lugar.'
      );

      return false;
    }

    if (formData.sections.itinerary) {
      const hasValidActivity =
        formData.itinerary.some(
          (item) =>
            item.time.trim() &&
            item.title.trim()
        );

      if (!hasValidActivity) {
        setFormTab('itinerary');

        setError(
          'Agrega al menos una actividad con hora y nombre, o desactiva el itinerario.'
        );

        return false;
      }
    }

    if (
      formData.sections.gallery &&
      media.gallery.length === 0
    ) {
      setFormTab('media');

      setError(
        'La galería está activa. Agrega fotografías o desactiva esta sección.'
      );

      return false;
    }

    if (
      formData.sections.music &&
      !media.backgroundMusic
    ) {
      setFormTab('media');

      setError(
        'La música está activa. Selecciona una canción o desactiva esta sección.'
      );

      return false;
    }

    return true;
  }

  function createWeddingPayload() {
    return {
      ...formData,

      groomName:
        formData.groomName.trim(),

      brideName:
        formData.brideName.trim(),

      welcomeMessage:
        formData.welcomeMessage.trim(),

      venueName:
        formData.venueName.trim(),

      venueAddress:
        formData.venueAddress.trim(),

      mapsUrl:
        formData.mapsUrl.trim(),

      groomFather:
        formData.groomFather.trim(),

      groomMother:
        formData.groomMother.trim(),

      brideFather:
        formData.brideFather.trim(),

      brideMother:
        formData.brideMother.trim(),

      storyTitle:
        formData.storyTitle.trim(),

      storyText:
        formData.storyText.trim(),

      itinerary:
        formData.itinerary
          .filter(
            (item) =>
              item.title.trim() ||
              item.time.trim()
          )
          .map((item) => ({
            time: item.time.trim(),
            title: item.title.trim(),

            description:
              item.description.trim(),

            location:
              item.location.trim()
          })),

      media: {
        coverImageName:
          media.coverImage?.name || '',

        coupleImageName:
          media.coupleImage?.name || '',

        musicFileName:
          media.backgroundMusic?.name || '',

        galleryFileNames:
          media.gallery.map(
            (image) => image.name
          )
      }
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      clearMessages();
      setGeneratedWedding(null);

      const payload =
        createWeddingPayload();

      const wedding =
        await createWedding(payload);

      setGeneratedWedding(wedding);

      setEvents((currentEvents) => [
        wedding,
        ...currentEvents
      ]);

      setSuccessMessage(
        'La invitación fue creada correctamente.'
      );

      setFormData(
        createEmptyForm(
          settings.defaultMessage
        )
      );

      clearMedia();
      setFormTab('general');

      if (typeof window !== 'undefined') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    } catch (requestError) {
      setError(
        requestError.message ||
          'No fue posible crear la invitación.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!id) {
      return;
    }

    const shouldDelete =
      typeof window === 'undefined'
        ? false
        : window.confirm(
            '¿Estás seguro de que deseas eliminar este evento?'
          );

    if (!shouldDelete) {
      return;
    }

    try {
      clearMessages();

      await deleteWedding(id);

      setEvents((currentEvents) =>
        currentEvents.filter(
          (wedding) => wedding._id !== id
        )
      );

      setSuccessMessage(
        'El evento fue eliminado correctamente.'
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          'No fue posible eliminar el evento.'
      );
    }
  }

  function handleSaveSettings(event) {
    event.preventDefault();

    const cleanBusinessName =
      settings.businessName.trim() ||
      DEFAULT_BUSINESS_NAME;

    const cleanDefaultMessage =
      settings.defaultMessage.trim() ||
      DEFAULT_WELCOME_MESSAGE;

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'bodasync_business_name',
        cleanBusinessName
      );

      localStorage.setItem(
        'bodasync_default_message',
        cleanDefaultMessage
      );
    }

    setSettings({
      businessName: cleanBusinessName,
      defaultMessage: cleanDefaultMessage
    });

    setFormData((currentForm) => ({
      ...currentForm,

      welcomeMessage:
        currentForm.welcomeMessage ||
        cleanDefaultMessage
    }));

    setError('');

    setSuccessMessage(
      'Los ajustes fueron guardados.'
    );
  }

  function changeSection(section) {
    setActiveSection(section);
    clearMessages();

    if (section === 'events') {
      loadEvents();
    }
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return 'Fecha no disponible';
    }

    const date =
      new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat(
      'es-MX',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(date);
  }

  function formatPreviewDate() {
    if (!formData.eventDate) {
      return 'Selecciona la fecha';
    }

    return formatDate(
      formData.eventDate
    );
  }

  async function copyGeneratedUrl() {
    if (!generatedUrl) {
      setError(
        'Todavía no hay un enlace para copiar.'
      );

      return;
    }

    try {
      await navigator.clipboard.writeText(
        generatedUrl
      );

      setError('');

      setSuccessMessage(
        'El enlace fue copiado.'
      );
    } catch {
      setError(
        'No fue posible copiar el enlace.'
      );
    }
  }

  return {
    activeSection,
    setActiveSection,

    formTab,
    setFormTab,

    events,
    setEvents,

    generatedWedding,
    setGeneratedWedding,

    loading,
    loadingEvents,

    error,
    setError,

    successMessage,
    setSuccessMessage,

    settings,
    setSettings,

    formData,
    setFormData,

    media,
    setMedia,

    activeSectionsCount,
    coupleNames,
    generatedUrl,

    loadEvents,
    clearMessages,

    handleChange,
    handleNumberChange,
    handleThemeChange,

    handleSectionToggle,
    activateAllSections,
    deactivateAllSections,

    handleItineraryChange,
    addItineraryItem,
    removeItineraryItem,
    moveItineraryItem,

    handleSingleMediaChange,
    removeSingleMedia,

    handleGalleryChange,
    removeGalleryImage,

    clearMedia,
    resetForm,

    handleSubmit,
    handleDelete,
    handleSaveSettings,

    changeSection,
    formatDate,
    formatPreviewDate,
    copyGeneratedUrl
  };
}