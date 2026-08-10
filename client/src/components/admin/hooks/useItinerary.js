import { useMemo } from 'react';

import {
  createItineraryItem
} from '../config/adminConfig';

const ALLOWED_FIELDS = [
  'time',
  'title',
  'description',
  'location'
];

function normalizeItineraryItem(item = {}) {
  return {
    id:
      item.id ||
      `${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`,

    time:
      typeof item.time === 'string'
        ? item.time
        : '',

    title:
      typeof item.title === 'string'
        ? item.title
        : '',

    description:
      typeof item.description === 'string'
        ? item.description
        : '',

    location:
      typeof item.location === 'string'
        ? item.location
        : ''
  };
}

export default function useItinerary({
  formData,
  setFormData
}) {
  const itinerary = Array.isArray(
    formData.itinerary
  )
    ? formData.itinerary
    : [];

  const completedActivitiesCount = useMemo(() => {
    return itinerary.filter(
      (item) =>
        item.time?.trim() &&
        item.title?.trim()
    ).length;
  }, [itinerary]);

  const hasValidActivity =
    completedActivitiesCount > 0;

  function updateItinerary(updater) {
    setFormData((currentForm) => {
      const currentItinerary =
        Array.isArray(
          currentForm.itinerary
        )
          ? currentForm.itinerary
          : [];

      return {
        ...currentForm,

        itinerary:
          updater(currentItinerary)
      };
    });
  }

  function handleItineraryChange(
    itemId,
    field,
    value
  ) {
    if (
      !itemId ||
      !ALLOWED_FIELDS.includes(field)
    ) {
      return;
    }

    updateItinerary(
      (currentItinerary) =>
        currentItinerary.map((item) =>
          item.id === itemId
            ? {
                ...item,
                [field]: value
              }
            : item
        )
    );
  }

  function addItineraryItem(
    initialValues = {}
  ) {
    const newItem = {
      ...createItineraryItem(),
      ...initialValues
    };

    updateItinerary(
      (currentItinerary) => [
        ...currentItinerary,
        normalizeItineraryItem(newItem)
      ]
    );
  }

  function removeItineraryItem(itemId) {
    if (!itemId) {
      return;
    }

    updateItinerary(
      (currentItinerary) => {
        const remainingItems =
          currentItinerary.filter(
            (item) =>
              item.id !== itemId
          );

        if (
          remainingItems.length === 0
        ) {
          return [
            createItineraryItem()
          ];
        }

        return remainingItems;
      }
    );
  }

  function duplicateItineraryItem(
    itemId
  ) {
    updateItinerary(
      (currentItinerary) => {
        const itemIndex =
          currentItinerary.findIndex(
            (item) =>
              item.id === itemId
          );

        if (itemIndex === -1) {
          return currentItinerary;
        }

        const selectedItem =
          currentItinerary[itemIndex];

        const duplicatedItem =
          normalizeItineraryItem({
            ...selectedItem,
            id: undefined,

            title:
              selectedItem.title
                ? `${selectedItem.title} copia`
                : ''
          });

        const updatedItinerary = [
          ...currentItinerary
        ];

        updatedItinerary.splice(
          itemIndex + 1,
          0,
          duplicatedItem
        );

        return updatedItinerary;
      }
    );
  }

  function moveItineraryItem(
    itemIndex,
    direction
  ) {
    updateItinerary(
      (currentItinerary) => {
        const newIndex =
          itemIndex + direction;

        if (
          itemIndex < 0 ||
          itemIndex >=
            currentItinerary.length ||
          newIndex < 0 ||
          newIndex >=
            currentItinerary.length
        ) {
          return currentItinerary;
        }

        const updatedItinerary = [
          ...currentItinerary
        ];

        const selectedItem =
          updatedItinerary[itemIndex];

        updatedItinerary[itemIndex] =
          updatedItinerary[newIndex];

        updatedItinerary[newIndex] =
          selectedItem;

        return updatedItinerary;
      }
    );
  }

  function moveItineraryItemUp(
    itemIndex
  ) {
    moveItineraryItem(
      itemIndex,
      -1
    );
  }

  function moveItineraryItemDown(
    itemIndex
  ) {
    moveItineraryItem(
      itemIndex,
      1
    );
  }

  function sortItineraryByTime() {
    updateItinerary(
      (currentItinerary) => {
        return [
          ...currentItinerary
        ].sort((firstItem, secondItem) => {
          if (
            !firstItem.time &&
            !secondItem.time
          ) {
            return 0;
          }

          if (!firstItem.time) {
            return 1;
          }

          if (!secondItem.time) {
            return -1;
          }

          return firstItem.time.localeCompare(
            secondItem.time
          );
        });
      }
    );
  }

  function clearItinerary() {
    updateItinerary(() => [
      createItineraryItem()
    ]);
  }

  function replaceItinerary(items) {
    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      clearItinerary();
      return;
    }

    const normalizedItems =
      items.map(
        normalizeItineraryItem
      );

    updateItinerary(
      () => normalizedItems
    );
  }

  function getCleanItinerary() {
    return itinerary
      .filter(
        (item) =>
          item.title?.trim() ||
          item.time?.trim()
      )
      .map((item) => ({
        time:
          item.time?.trim() || '',

        title:
          item.title?.trim() || '',

        description:
          item.description?.trim() ||
          '',

        location:
          item.location?.trim() || ''
      }));
  }

  return {
    itinerary,

    completedActivitiesCount,
    hasValidActivity,

    handleItineraryChange,

    addItineraryItem,
    removeItineraryItem,
    duplicateItineraryItem,

    moveItineraryItem,
    moveItineraryItemUp,
    moveItineraryItemDown,

    sortItineraryByTime,
    clearItinerary,
    replaceItinerary,
    getCleanItinerary
  };
}