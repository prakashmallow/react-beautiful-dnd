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

let oldActiveDroppable = '';

export const filter = memoizeOne((obj, predicate) => {
  let key;
  let result = {};
  for (key in obj) {
    if (obj.hasOwnProperty(key) && !predicate(key)) {
      result[key] = obj[key];
    }
  }
  return result;
});

export const getFilteredDroppableList = memoizeOne((obj) =>
  filter(obj, (data) => data.includes('-drop-zone')),
);

export const getElement = memoizeOne((id) =>
  document.getElementsByClassName(id.replace('-folder-items', ''))[0],
);

export const getDraggableParent = memoizeOne(
  (draggable, topElement, isHome) => {
    const droppableId = draggable.descriptor.droppableId;
    if (
      oldActiveDroppable === droppableId &&
      !(
        (getElement(droppableId) &&
          getElement(droppableId).classList &&
          [...getElement(droppableId).classList].includes('home')) ^ isHome
      )
    ) {
      return droppableId;
    }

    return `${topElement.classList[0]}-folder-items`;
  },
);

export const getDroppableList = memoizeOne(
  (draggable, pageBorderBox, droppables) => {
    const dropZoneElement = document
      .elementsFromPoint(pageBorderBox.left, pageBorderBox.top)
      .find(({ className }) => className.includes('-drop-zone'));
    if (dropZoneElement) {
      return values({
        [dropZoneElement.className]: droppables[dropZoneElement.className],
      });
    }

    const isDropOnActivity = document
      .elementsFromPoint(pageBorderBox.left, pageBorderBox.top)
      .some(({ id }) => id.includes('activityModalMount'));
    if (isDropOnActivity) {
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
      const draggableParentId = getDraggableParent(
        draggable,
        topElement,
        isHome,
      );
      const parentRndComponent = getElement(draggableParentId);
      const parentPosition = parentRndComponent.getBoundingClientRect();
      const isInsideParent = !(
        x > parentPosition.right ||
        x < parentPosition.left ||
        y < parentPosition.top ||
        y > parentPosition.bottom
      );

      let newDroppables = {};
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
  },
);

export const toDroppableList = memoizeOne(
  (droppables: DroppableDimensionMap): DroppableDimension[] =>
    values(droppables),
);

export const toDraggableList = memoizeOne(
  (draggables: DraggableDimensionMap): DraggableDimension[] =>
    values(draggables),
);
