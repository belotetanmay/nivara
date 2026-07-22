'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import ChatWidget from './ChatWidget';

export default function ChatWidgetWrapper() {
  const pathname = usePathname();

  // Hide the chatbot widget on vendor and admin portals
  const shouldHideChat = pathname.startsWith('/admin') || pathname.startsWith('/vendor');

  if (shouldHideChat) {
    return null;
  }

  return <ChatWidget />;
}
