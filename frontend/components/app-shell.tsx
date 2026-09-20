'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, FluentProvider, Tab, TabList, Toolbar, ToolbarButton, tokens, createLightTheme, createDarkTheme } from '@fluentui/react-components';
import { CalendarRegular, DataBarVerticalRegular, HomeRegular, WeatherSunnyRegular, WeatherMoonRegular } from '@fluentui/react-icons';

const brandRamp = { 10: '#001f2b', 20: '#003747', 30: '#004d62', 40: '#07617a', 50: '#0f5b78', 60: '#28728b', 70: '#47899e', 80: '#6ba1b2', 90: '#8fb8c5', 100: '#afd0d9', 110: '#c8e1e7', 120: '#d9ebef', 130: '#e7f2f4', 140: '#eff7f8', 150: '#f6fbfc', 160: '#ffffff' } as const;

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(localStorage.getItem('app-theme') === 'dark'); }, []);
  const toggleTheme = () => { const next = !dark; setDark(next); localStorage.setItem('app-theme', next ? 'dark' : 'light'); };
  const theme = dark ? createDarkTheme(brandRamp) : createLightTheme(brandRamp);
  return <FluentProvider theme={theme} className="shell">
    <header style={{ borderBottom: `1px solid ${tokens.colorNeutralStroke2}`, background: tokens.colorNeutralBackground1 }}>
      <Toolbar style={{ maxWidth: 1440, margin: '0 auto', padding: '12px 36px', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'inherit', textDecoration: 'none', fontWeight: 600 }}><DataBarVerticalRegular />Playdex Operations</Link>
        <ToolbarButton icon={dark ? <WeatherSunnyRegular /> : <WeatherMoonRegular />} aria-label="Toggle color theme" onClick={toggleTheme} />
        <Avatar name="Alex Morgan" color="brand" />
      </Toolbar>
      <TabList appearance="subtle" style={{ maxWidth: 1440, margin: '0 auto', padding: '0 36px' }}>
        <Tab icon={<HomeRegular />} value="dashboard" onClick={() => { window.location.href = '/'; }}>Dashboard</Tab>
        <Tab icon={<CalendarRegular />} value="events" onClick={() => { window.location.href = '/events'; }}>Events</Tab>
        <Tab icon={<DataBarVerticalRegular />} value="venues" onClick={() => { window.location.href = '/venues'; }}>Venues</Tab>
        <Tab icon={<CalendarRegular />} value="bookings" onClick={() => { window.location.href = '/bookings'; }}>Bookings</Tab>
      </TabList>
    </header>
    <main className="app-main">{children}</main>
  </FluentProvider>;
}

