'use client'

import React, { useContext, useEffect, useState } from 'react';
import { PrimeReactContext } from 'primereact/api';
import Head from 'next/head';
import Link from 'next/link';

const ThemeSwitcher = () => {
  // const { changeTheme } = useContext(PrimeReactContext);
  const [changeTheme, setchangeTheme] = useState('')

  // const switchTheme = (newTheme) => {
  //   const linkElementId = 'theme-link'; // Ensure this matches the ID in the HTML head

  //   changeTheme('lara-light-blue', newTheme, linkElementId, () => {
  //     console.log(`Theme switched to ${newTheme}`);
  //   });
  // };
  useEffect(() => {
    // Add the theme link element dynamically if it doesn't exist
    if (!document.getElementById('theme-link')) {
      const link = document.createElement('link');
      link.id = 'theme-link';
      link.rel = 'stylesheet';
      link.href = `/themes/${changeTheme}/theme.css`; // Provide the path to your initial theme
      document.head.appendChild(link);
    }
  }, [changeTheme]);
  console.log(changeTheme)
  return (
    <div>
  
      <button onClick={() => setchangeTheme('lara-light-blue')}>Light Theme</button>
      <button onClick={() => setchangeTheme('lara-dark-purple')}>Dark Theme</button>
    </div>
  );
};

export default ThemeSwitcher;
