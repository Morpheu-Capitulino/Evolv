import React from 'react';
import '../styles/GreenButton.css';

export default function GreenButton({ text, onClick, style }) {
  return (
    <button className="green-button" onClick={onClick} style={style}>
      {text}
    </button>
  );
}