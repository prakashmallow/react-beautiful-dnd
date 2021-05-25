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
  let result = {}, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key) && !predicate(key)) {
      result[key] = obj[key];
    }
  }
  return result;
};

export const getFilteredDroppableList = (obj) => filter(obj, (data) => data.includes('-drop-zone'));

let oldActiveDroppable = '';
export const getDroppableList = (draggable, pageBorderBox, droppables) => {
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

  const { x, y } = pageBorderBox.center;
  const isHome = document
    .elementsFromPoint(x, y)
    .some(({ id }) => id.includes('homeFolderModalMount'));
  const topElement = isHome
    ? document.getElementById('appear-home-on-top')
    : document.getElementById('appear-on-top');
  if (topElement) {
    const draggableParentId =
      oldActiveDroppable !== draggable.descriptor.droppableId
        ? `${topElement.classList[0]}-folder-items`
        : draggable.descriptor.droppableId;
    const parentRndComponent = document.getElementsByClassName(
      draggableParentId.replace('-folder-items', ''),
    )[0];
    const parentPosition = parentRndComponent.getBoundingClientRect();
    let newDroppables = {};
    const isInsideParent = !(
      pageBorderBox.center.x > parentPosition.right ||
      pageBorderBox.center.x < parentPosition.left ||
      pageBorderBox.center.y < parentPosition.top ||
      pageBorderBox.center.y > parentPosition.bottom
    );

    if (isInsideParent) {
      newDroppables = {
        [draggableParentId]: droppables[draggableParentId],
      };
    } else {
      oldActiveDroppable = `${topElement.classList[0]}-folder-items`;
    }
    return isInsideParent
      ? values(getFilteredDroppableList(newDroppables))
      : values(getFilteredDroppableList(droppables));
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
