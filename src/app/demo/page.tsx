'use client';

import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { auth } from '../../lib/firebase';
import { getDatabase, ref, push, set } from 'firebase/database';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatGPTInterface() {
  const idRef = useRef<number>(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isNewChat, setIsNewChat] = useState<boolean>(true);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [userName, setUserName] = useState<string>('Guest');
  const [sessionPath, setSessionPath] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const db = getDatabase();

  // ---------------- User Auth ----------------
  useEffect(() => {
    if (auth.currentUser) {
      setUserName(auth.currentUser.displayName || 'User');
    }

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) setUserName(user.displayName || 'User');
      else setUserName('Guest');
    });

    return () => unsubscribe();
  }, []);

  // ---------------- Scroll ----------------
  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // ---------------- Theme ----------------
  const toggleTheme = (): void => setTheme(theme === 'light' ? 'dark' : 'light');
  const themes = {
    light: {
      background: 'bg-gray-50',
      inputBg: 'bg-gray-100',
      inputText: 'text-gray-900',
      btnBg: 'bg-blue-600',
      btnText: 'text-white',
      userMsgBg: 'bg-blue-500',
      userMsgText: 'text-white',
      botMsgBg: 'bg-gray-200',
      botMsgText: 'text-gray-900',
    },
    dark: {
      background: 'bg-gray-900',
      inputBg: 'bg-gray-800',
      inputText: 'text-gray-100',
      btnBg: 'bg-blue-500',
      btnText: 'text-white',
      userMsgBg: 'bg-blue-700',
      userMsgText: 'text-white',
      botMsgBg: 'bg-gray-700',
      botMsgText: 'text-gray-300',
    },
  };
  const currentTheme = themes[theme];

  // ---------------- Firebase helpers ----------------
  const createChatSession = async (title: string) => {
    const today = new Date().toISOString().split('T')[0]; // 2025-09-04
    const path =
      userName !== 'Guest'
        ? `users/${auth.currentUser?.uid}/chats/${today}`
        : `guestChats/${today}`;

    const sessionRef = push(ref(db, path));
    await set(ref(db, `${path}/${sessionRef.key}/meta`), {
      title,
      startedAt: Date.now(),
    });
    return { sessionPath: `${path}/${sessionRef.key}/messages` };
  };

  // ---------------- Chat actions ----------------
  const startNewChat = async (): Promise<void> => {
    idRef.current = 0;
    setMessages([]);
    setIsNewChat(true);
    setInputText('');
    setIsTyping(false);

    const { sessionPath } = await createChatSession('New Chat');
    setSessionPath(sessionPath);
  };

  const handleSendMessage = async (): Promise<void> => {
    if (inputText.trim() === '') return;

    let path = sessionPath;
    if (!path) {
      const created = await createChatSession('New Chat');
      path = created.sessionPath;
      setSessionPath(path);
    }

    if (isNewChat) setIsNewChat(false);

    // Local user message
    const userMessage: Message = {
      id: idRef.current + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    const textToSend = inputText;
    setInputText('');
    idRef.current += 1;

    // Show typing
    setIsTyping(true);

    try {
      const res = await fetch('https://ommajithiya.in/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await res.json();
      let botText = '⚠️ No response from server.';
      if (res.ok && data && data.response) botText = data.response;

      // Local bot message
      const botMessage: Message = {
        id: idRef.current + 1,
        text: botText,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      idRef.current += 1;

      // ✅ Save both user + bot together in one object
      const msgRef = push(ref(db, path));
      await set(msgRef, {
        user: { text: textToSend, timestamp: Date.now() },
        bot: { text: botText, timestamp: Date.now() },
      });
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: idRef.current + 1,
        text: '❌ Sorry, I\'m having trouble connecting.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
      idRef.current += 1;
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <div className={`${currentTheme.background} flex h-screen`}>
      {/* Sidebar */}
      <div className="w-64 p-4 border-r">
        <h2 className="text-xl font-semibold">Jini AI</h2>
        <button onClick={toggleTheme}>Toggle Theme</button>
        <button
          onClick={startNewChat}
          className="mt-4 p-2 bg-blue-600 text-white rounded"
        >
          New Chat
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`mb-2 ${
                msg.sender === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block px-4 py-2 rounded-lg ${
                  msg.sender === 'user'
                    ? currentTheme.userMsgBg + ' ' + currentTheme.userMsgText
                    : currentTheme.botMsgBg + ' ' + currentTheme.botMsgText
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="text-left">
              <span className="italic text-gray-500">Typing...</span>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <div className="p-4 border-t flex gap-2">
          <input
            type="text"
            className={`flex-1 px-4 py-2 rounded-full ${currentTheme.inputBg} ${currentTheme.inputText}`}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Hi ${userName}, ask me anything...`}
          />
          <button
            onClick={handleSendMessage}
            className={`${currentTheme.btnBg} ${currentTheme.btnText} px-4 py-2 rounded-full`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
