// @flow
import memoizeOne from 'memoize-one';
import { values } from '../native-with-fallback';
import type {
  DroppableDimension,
  DroppableDimensionMap,
  DraggableDimension,
  DraggableDimensionMap,
} from '../types';
import getOffsetValues from './get-offset-values';

export const toDroppableMap = memoizeOne(
  (droppables: DroppableDimension[]): DroppableDimensionMap =>
    droppables.reduce((previous, current) => {
      previous[current.descriptor.id] = current;
      return previous;
    }, {}),
);

export const toDraggableMap = memoizeOne(
  (draggables: DraggableDimension[]): DraggableDimensionMap =>
    draggables.reduce((previous, current) => {
      previous[current.descriptor.id] = current;
      return previous;
    }, {}),
);
export const filter = (obj, predicate, isManualTrigger) => {
  let key, result = {};
  for (key in obj) {
    if (obj.hasOwnProperty(key) && !predicate(key)) {
      result[key] = { ...obj[key], isManualTrigger };
    }
  }
  return result;
};

export const getElement = memoizeOne(
  (id) => document.getElementsByClassName(id.replace('-folder-items', ''))[0],
);

export const getFilteredDroppableList = (obj) =>
  filter(obj, (data) => data.includes('-drop-zone'));

export const checkIsItemInsideFolder = (
  droppableId,
  isHome,
  { x, y },
  droppables,
) => {
  const droppableElement = getElement(droppableId);
  if (
    droppableElement &&
    droppableElement.classList &&
    !(droppableElement.className.includes('home-activity') ^ isHome)
  ) {
    const container = droppables[droppableId].subject.active;
    return (
      x > container.right ||
      x < container.left ||
      y < container.top ||
      y > container.bottom
    );
  }
  return true;
};

export const getDraggableParentId = (
  droppables,
  isHome,
  center,
  isManualTrigger,
) => {
  const foldersLIst = filter(
    droppables,
    (data) =>
      data.includes('-drop-zone') ||
      data.includes('activities') ||
      data.includes('captures') ||
      checkIsItemInsideFolder(data, isHome, center, droppables),
    isManualTrigger,
  );

  const folderElement = Object.keys(foldersLIst).reduce(
    (acc, data) => {
      const order = Number(
        document
          .querySelector(`[data-rbd-droppable-id="${data}"]`)
          ?.getAttribute('data-index-freespace-order') || 0,
      );
      if (order > acc.order) {
        return {
          id: data,
          order,
        };
      }
      return acc;
    },
    {
      id: '',
      order: 0,
    },
  );
  return folderElement?.id || Object.keys(foldersLIst)[0];
};

export const getDroppableList = (draggable, pageBorderBox, droppables) => {
  const { offsetX, offsetY } = getOffsetValues(draggable.descriptor.id);
  const x = offsetX ? offsetX + pageBorderBox.left : pageBorderBox.center.x;
  const y = offsetY ? offsetY + pageBorderBox.top : pageBorderBox.center.y;
  const isManualTrigger = !(isNaN(offsetX) && isNaN(offsetY));
  const isFullScreen = document
    .elementsFromPoint(x, y)
    .some(
      (ele) =>
        ele.className.includes('ant-modal-content') &&
        Boolean(ele.closest('.fullscreen-folder-modal')),
    );
  if (isFullScreen) {
    const ele = document.querySelector(
      `[data-rbd-droppable-id*='-fr-folder-items']`,
    );
    const id = ele.getAttribute('data-rbd-droppable-id');
    return values({ [id]: { ...droppables[id], isManualTrigger } });
  }

  const droppedOnEle = document
    .elementsFromPoint(x, y)
    .find(({ className }) => className.includes('-drop-zone'));
  if (droppedOnEle) {
    return values({
      [droppedOnEle.className]: {
        ...droppables[droppedOnEle.className],
        isManualTrigger,
      },
    });
  }
  const isActivity = document
    .elementsFromPoint(x, y)
    .some(({ id }) => id.includes('activityModalMount'));
  if (isActivity) {
    return values({
      activities: { ...droppables.activities, isManualTrigger },
    });
  }
  const isCapture = document
    .elementsFromPoint(x, y)
    .some(({ id }) => id.includes('captureModalMount'));
  if (isCapture) {
    return values({
      captures: { ...droppables.captures, isManualTrigger },
    });
  }

  const isHome = document
    .elementsFromPoint(x, y)
    .some(({ id }) => id.includes('homeFolderModalMount'));
  const topElement = isHome
    ? document.getElementById('appear-home-on-top')
    : document.getElementById('appear-on-top');
  if (topElement) {
    const draggableParentId = getDraggableParentId(
      droppables,
      Boolean(isHome),
      { x, y },
      isManualTrigger,
    );
    return draggableParentId
      ? values({
          [draggableParentId]: {
            ...droppables[draggableParentId],
            isManualTrigger,
          },
        })
      : [];
  }
  return values(getFilteredDroppableList(droppables));
};

export const toDroppableList = memoizeOne(
  (droppables: DroppableDimensionMap): DroppableDimension[] =>
    values(droppables),
);

export const toDraggableList = memoizeOne(
  (draggables: DraggableDimensionMap): DraggableDimension[] =>
    values(draggables),
);
