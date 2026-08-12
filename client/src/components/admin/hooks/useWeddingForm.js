import { useMemo, useState } from 'react';

import {
  DEFAULT_SECTIONS,
  createEmptyForm
} from '../config/adminConfig';

export default function useWeddingForm(defaultMessage = '') {
  const [formData, setFormData] = useState(() =>
    createEmptyForm(defaultMessage)
  );

  const activeSectionsCount = useMemo(() => {
    return Object.values(formData.sections).filter(Boolean).length;
  }, [formData.sections]);

  const coupleNames = useMemo(() => {
    const groomName = formData.groomName.trim() || 'Nombre del novio';
    const brideName = formData.brideName.trim() || 'Nombre de la novia';

    return `${groomName} & ${brideName}`;
  }, [formData.groomName, formData.brideName]);

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked
    } = event.target;

    setFormData((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function handleNumberChange(event) {
    const {
      name,
      value,
      min,
      max
    } = event.target;

    let numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      numericValue = 1;
    }

    if (min !== '' && numericValue < Number(min)) {
      numericValue = Number(min);
    }

    if (max !== '' && numericValue > Number(max)) {
      numericValue = Number(max);
    }

    setFormData((currentForm) => ({
      ...currentForm,
      [name]: numericValue
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
    if (!(sectionKey in DEFAULT_SECTIONS)) {
      return;
    }

    setFormData((currentForm) => ({
      ...currentForm,
      sections: {
        ...currentForm.sections,
        [sectionKey]: !currentForm.sections[sectionKey]
      }
    }));
  }

  function setSectionEnabled(sectionKey, enabled) {
    if (!(sectionKey in DEFAULT_SECTIONS)) {
      return;
    }

    setFormData((currentForm) => ({
      ...currentForm,
      sections: {
        ...currentForm.sections,
        [sectionKey]: Boolean(enabled)
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
    const disabledSections = Object.keys(DEFAULT_SECTIONS).reduce(
      (sections, sectionKey) => {
        sections[sectionKey] = false;
        return sections;
      },
      {}
    );

    setFormData((currentForm) => ({
      ...currentForm,
      sections: disabledSections
    }));
  }

  function updateFormField(fieldName, value) {
    setFormData((currentForm) => ({
      ...currentForm,
      [fieldName]: value
    }));
  }

  function updateNestedField(groupName, fieldName, value) {
    setFormData((currentForm) => ({
      ...currentForm,
      [groupName]: {
        ...currentForm[groupName],
        [fieldName]: value
      }
    }));
  }

  function resetForm(newDefaultMessage = defaultMessage) {
    setFormData(
      createEmptyForm(newDefaultMessage)
    );
  }

  function loadFormData(weddingData) {
    if (!weddingData || typeof weddingData !== 'object') {
      return;
    }

    const emptyForm = createEmptyForm(defaultMessage);

    setFormData({
      ...emptyForm,
      ...weddingData,

      sections: {
        ...emptyForm.sections,
        ...(weddingData.sections || {})
      },

      theme: {
        ...emptyForm.theme,
        ...(weddingData.theme || {})
      },

      itinerary:
        Array.isArray(weddingData.itinerary) &&
        weddingData.itinerary.length > 0
          ? weddingData.itinerary
          : emptyForm.itinerary
    });
  }

  return {
    formData,
    setFormData,

    activeSectionsCount,
    coupleNames,

    handleChange,
    handleNumberChange,
    handleThemeChange,

    handleSectionToggle,
    setSectionEnabled,
    activateAllSections,
    deactivateAllSections,

    updateFormField,
    updateNestedField,

    resetForm,
    loadFormData
  };
}