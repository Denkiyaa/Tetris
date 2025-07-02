import React from 'react';
import styles from './Cell.module.css';
import { SHAPES } from '../gameHelpers';

const Cell = ({ type }) => (
  <div
    className={styles.cell}
    style={{
      backgroundColor: `rgba(${SHAPES[type].color}, 0.8)`,
    }}
  />
);

export default React.memo(Cell);