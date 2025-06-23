import React, { useState } from 'react';
import styles from './NicknameForm.module.css';

const NicknameForm = ({ onStart }) => {
  const [nickname, setNickname] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nickname.trim()) {
      onStart(nickname.trim());
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Nickname Girin</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Oyuncu Adı"
          maxLength="10"
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Oyuna Başla
        </button>
      </form>
    </div>
  );
};

export default NicknameForm;