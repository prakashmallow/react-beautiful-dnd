// @flow
import memoizeOne from 'memoize-one';
import { values } from '../native-with-fallback';
import type {
  DroppableDimension,
  DroppableDimensionMap,
  DraggableDimension,
  DraggableDimensionMap,
} from '../types';

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
export const filter = (obj, predicate) => {
  let key, result = {};
  for (key in obj) {
    if (obj.hasOwnProperty(key) && !predicate(key)) {
      result[key] = obj[key];
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

export const getDraggableParentId = (droppables, isHome, center) => {
  const foldersLIst = filter(
    droppables,
    (data) =>
      data.includes('-drop-zone') ||
      data.includes('activities') ||
      data.includes('captures') ||
      checkIsItemInsideFolder(data, isHome, center, droppables),
  );
  return Object.keys(foldersLIst)[0];
};

export const getDroppableList = (draggable, pageBorderBox, droppables) => {
  const { x, y } = pageBorderBox.center;
  const isFullScreen = document
    .elementsFromPoint(x, y)
    .some(
      (ele) =>
        ele.className.includes('ant-modal-content') &&
        !!ele.closest('.fullscreen-folder-modal'),
    );
  if (isFullScreen) {
    const ele = document.querySelector(
      `[data-rbd-droppable-id*='-fr-folder-items']`,
    );
    const id = ele.getAttribute('data-rbd-droppable-id');
    return values({ [id]: droppables[id] });
  }

  const droppedOnEle = document
    .elementsFromPoint(pageBorderBox.left, pageBorderBox.top)
    .find(({ className }) => className.includes('-drop-zone'));
  if (droppedOnEle) {
    return values({
      [droppedOnEle.className]: droppables[droppedOnEle.className],
    });
  }
  const isActivity = document
    .elementsFromPoint(pageBorderBox.left, pageBorderBox.top)
    .some(({ id }) => id.includes('activityModalMount'));
  if (isActivity) {
    return values({ activities: droppables.activities });
  }

  const isHome = document
    .elementsFromPoint(x, y)
    .some(({ id }) => id.includes('homeFolderModalMount'));
  const topElement = isHome
    ? document.getElementById('appear-home-on-top')
    : document.getElementById('appear-on-top');
  if (topElement) {
    const draggableParentId =
      getDraggableParentId(droppables, !!isHome, pageBorderBox.center) ||
      `${topElement.classList[0]}-folder-items`;
    return values({
      [draggableParentId]: droppables[draggableParentId],
    });
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
