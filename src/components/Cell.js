import React from 'react';
import styles from './Cell.module.css';
import { SHAPES } from '../gameHelpers';

const Cell = ({ type }) => (
  <div
    className={styles.cell}
    style={{
      backgroundColor: `rgba(${SHAPES[type].color}, 0.8)`,
      border: type === 0 ? '0px solid' : '4px solid',
      borderBottomColor: `rgba(${SHAPES[type].color}, 0.1)`,
      borderRightColor: `rgba(${SHAPES[type].color}, 1)`,
      borderTopColor: `rgba(${SHAPES[type].color}, 1)`,
      borderLeftColor: `rgba(${SHAPES[type].color}, 0.3)`,
    }}
  />
);

export default React.memo(Cell);