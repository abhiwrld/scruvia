"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatPage from '../page';

export default function ChatWithId({ params }: { params: { id: string } }) {
  const router = useRouter();

  // This component simply wraps the main ChatPage component
  // The ChatPage component will handle loading the specific chat based on the ID in the URL
  return <ChatPage />;
}
