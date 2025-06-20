'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import CalendarWidget from '../../components/dashboard/widgets/CalendarWidget';
import 'primereact/resources/themes/lara-light-teal/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export default function TestCalendarPage() {
  return (
    <Provider store={store}>
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <h1 style={{ marginBottom: '20px' }}>Calendar Widget Test</h1>
        <div style={{ height: '800px', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <CalendarWidget 
            config={{
              widgetId: 'test-calendar',
              title: 'Rental Calendar',
              icon: 'calendar',
              minWidth: 12,
              maxWidth: 12,
              resizable: false
            }}
          />
        </div>
      </div>
    </Provider>
  );
}