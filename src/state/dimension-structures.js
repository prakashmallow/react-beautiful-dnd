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
export const allTheElements = (x, y) => {
  let stack = [];

  let allElements = document.getElementsByTagName('*');
  let len = allElements.length;

  for (let i = 0; i < len; i++) {
    let elm = allElements[i];
    let rect = elm.getBoundingClientRect();

    if (
      y >= rect.top &&
      y <= rect.bottom &&
      x >= rect.left &&
      x <= rect.right
    ) {
      stack.push(elm);
    }
  }
  return stack;
};

export const getDroppableList = (draggable, pageBorderBox, droppables) => {
  let droppedOnEle = allTheElements(pageBorderBox.center.x , pageBorderBox.center.y).find((data) =>
    data.className.includes('-drop-zone'),
  );
  if(droppedOnEle){
    return values({ [droppedOnEle.className]: droppables[droppedOnEle.className], })
  }
  if (document.getElementById('appear-on-top')) {
    const draggableParentId =
      oldActiveDroppable !== draggable.descriptor.droppableId
        ? `${
          document.getElementById('appear-on-top').classList[0]
        }-folder-items`
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
      oldActiveDroppable = `${
        document.getElementById('appear-on-top').classList[0]
      }-folder-items`;
    }
    return isInsideParent ? values(newDroppables) : values(droppables);
  }
  return values(droppables);
};

export const toDroppableList = memoizeOne(
  (droppables: DroppableDimensionMap): DroppableDimension[] =>
    values(droppables),
);

export const toDraggableList = memoizeOne(
  (draggables: DraggableDimensionMap): DraggableDimension[] =>
    values(draggables),
);
