'use client';

import { useState, useRef, useEffect } from 'react';
import React from 'react';
import styled from 'styled-components';
import Link from "next/link";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { getDatabase, ref, push, set } from 'firebase/database';
import { onValue, serverTimestamp } from "firebase/database";
import { useRouter } from 'next/navigation';
import { FiDownload } from "react-icons/fi";

interface Message {
  id: string | number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

type ChatHistoryItem = {
  id: string;
  title: string;
};

// Helper: convert CSS string to React style object
// function styleStringToObject(styleString: string) {
//   return styleString
//     .split(';')
//     .filter(Boolean)
//     .reduce<Record<string, string>>((styleObj, styleProperty) => {
//       const [key, value] = styleProperty.split(':');
//       if (!key || !value) return styleObj;
//       const jsKey = key
//         .trim()
//         .replace(/-([a-z])/g, (_, char) => char.toUpperCase()); // convert kebab-case to camelCase
//       styleObj[jsKey] = value.trim();
//       return styleObj;
//     }, {});
// }
function styleStringToObject(styleString: string): React.CSSProperties {
  return styleString
    .split(';')
    .filter(Boolean)
    .reduce<React.CSSProperties>((styleObj, styleProperty) => {
      const [key, value] = styleProperty.split(':');
      if (!key || !value) return styleObj;
      const jsKey = key
        .trim()
        .replace(/-([a-z])/g, (_, char) => char.toUpperCase()) as keyof React.CSSProperties;
      styleObj[jsKey] = value.trim() as any;
      return styleObj;
    }, {});
}

const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);


// function parseHtmlToReact(html: string, currentTheme: any) {
//   const template = document.createElement("template");
//   template.innerHTML = html;
//   const nodes = template.content.childNodes;

//   const convertNode = (node: ChildNode, index: number): React.ReactNode => {
//     if (node.nodeType === Node.TEXT_NODE) return node.textContent;
//     if (node.nodeType !== Node.ELEMENT_NODE) return null;

//     const el = node as HTMLElement;

//     const styleAttr = el.getAttribute("style") || "";
//     const style = styleStringToObject(styleAttr);

//     // Apply theme-based defaults if not overridden by inline style
//     if (!style.color && currentTheme?.textColor) {
//       style.color = currentTheme.textColor; // universal text color
//     }
//     if (!style.backgroundColor && currentTheme?.bgColor) {
//       style.backgroundColor = currentTheme.bgColor; // optional background color
//     }

//     const standardHtmlTags = [
//       "div", "p", "span", "h1", "h2", "h3", "h4", "h5", "h6",
//       "ul", "ol", "li", "b", "i", "strong", "em", "br", "hr"
//     ];
//     const tag = standardHtmlTags.includes(el.tagName.toLowerCase())
//       ? el.tagName.toLowerCase()
//       : "div";

//     const children = Array.from(el.childNodes).map((child, idx) =>
//       convertNode(child, idx)
//     );

//     // Theme-aware class mapping
//     const classMap: Record<string, string> = {
//       strong: `font-bold ${currentTheme.strongColor}`,
//       b: `font-bold ${currentTheme.bColor}`,
//       em: `italic ${currentTheme.emColor}`,
//       i: `italic ${currentTheme.iColor}`,
//       p: `mb-2 ${currentTheme.pColor}`,
//       li: `list-disc ml-5 ${currentTheme.liColor}`,
//       h1: `text-2xl font-bold mb-2 ${currentTheme.h1Color}`,
//       h2: `text-xl font-semibold mb-1 ${currentTheme.h2Color}`,
//       h3: `text-lg font-semibold ${currentTheme.h3Color}`,
//       span: `${currentTheme.spanColor}`,
//       div: `${currentTheme.divColor}`,
//       ul: `${currentTheme.ulColor}`,
//       ol: `${currentTheme.olColor}`,
//       hr: `${currentTheme.hrColor}`,
//     };


//     const extraProps: any = { style, key: index };

//     if (classMap[tag]) {
//       extraProps.className = classMap[tag];
//     }

//     if (VOID_ELEMENTS.has(tag)) {
//       return React.createElement(tag, extraProps);
//     }

//     return React.createElement(tag, extraProps, children);
//   };

//   return Array.from(nodes).map((node, index) => convertNode(node, index));
// }

function parseHtmlToReact(html: string, currentTheme: any): React.ReactNode[] {
  const template = document.createElement("template");
  template.innerHTML = html;
  const nodes = Array.from(template.content.childNodes);

  const standardHtmlTags = [
    "div", "p", "span", "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li", "b", "i", "strong", "em", "br", "hr"
  ];

  const classMap: Record<string, string> = {
    strong: `font-bold ${currentTheme.strongColor || ''}`,
    b: `font-bold ${currentTheme.bColor || ''}`,
    em: `italic ${currentTheme.emColor || ''}`,
    i: `italic ${currentTheme.iColor || ''}`,
    p: `mb-2 ${currentTheme.pColor || ''}`,
    li: `list-disc ml-5 ${currentTheme.liColor || ''}`,
    h1: `text-2xl font-bold mb-2 ${currentTheme.h1Color || ''}`,
    h2: `text-xl font-semibold mb-1 ${currentTheme.h2Color || ''}`,
    h3: `text-lg font-semibold ${currentTheme.h3Color || ''}`,
    span: `${currentTheme.spanColor || ''}`,
    div: `${currentTheme.divColor || ''}`,
    ul: `${currentTheme.ulColor || ''}`,
    ol: `${currentTheme.olColor || ''}`,
    hr: `${currentTheme.hrColor || ''}`,
  };

  const convertNode = (node: ChildNode, index: number): React.ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const el = node as HTMLElement;
    const styleAttr = el.getAttribute("style") || "";
    const style = styleStringToObject(styleAttr);

    // Apply theme defaults only if not already set
    if (!style.color && currentTheme.textColor) {
      style.color = currentTheme.textColor;
    }
    if (!style.backgroundColor && currentTheme.bgColor) {
      style.backgroundColor = currentTheme.bgColor;
    }

    const tag = standardHtmlTags.includes(el.tagName.toLowerCase())
      ? el.tagName.toLowerCase()
      : "div";

    const children = Array.from(el.childNodes).map((child, idx) =>
      convertNode(child, idx)
    );

    const extraProps: React.HTMLAttributes<HTMLElement> & { style: React.CSSProperties; key: number } = {
      style,
      key: index
    };

    if (classMap[tag]) {
      extraProps.className = classMap[tag];
    }

    if (VOID_ELEMENTS.has(tag)) {
      return React.createElement(tag, extraProps);
    }

    return React.createElement(tag, extraProps, children);
  };

  return nodes.map((node, index) => convertNode(node, index));
}

export default function ChatGPTInterface() {

  const idRef = useRef<number>(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isNewChat, setIsNewChat] = useState<boolean>(true);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const db = getDatabase();
  const [userName, setUserName] = useState<string>("");

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [greeting, setGreeting] = useState("");

  const [sessionPath, setSessionPath] = useState<string | null>(null);

  const [chatHistory, setChatHistory] = useState<{ id: string, title: string }[]>([]);
  const [today] = useState(() => new Date().toISOString().split("T")[0]);

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const [showGuestSuggestion, setShowGuestSuggestion] = useState(false);

  const router = useRouter();

  const [loadingChats, setLoadingChats] = useState(true);

  // ---------------- Fetch chat history ----------------
  useEffect(() => {
    const uid = auth.currentUser?.uid || '';
    const day = today || '';

    // Always keep same dependencies count
    if (!uid || !day) {
      setChatHistory([]);
      setLoadingChats(false);
      return;
    }

    const chatsPath = `users/${uid}/chats/${day}`;
    const chatsRef = ref(db, chatsPath);

    setLoadingChats(true);

    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setChatHistory([]);
        setLoadingChats(false);
        return;
      }

      const history: ChatHistoryItem[] = [];

      Object.keys(data).forEach((chatId) => {
        const chatData = data[chatId];
        // Correct for double nested "messages"
        if (chatData.messages && chatData.messages.messages) {
          const messagesObj = chatData.messages.messages;
          const messagesArray = Object.values(messagesObj) as {
            role?: string;
            content?: string;
            timestamp?: Date;
          }[];

          // Filter valid messages with content
          const filteredMessages = messagesArray.filter(
            (msg) => msg.role && typeof msg.content === 'string' && msg.content.trim() !== ''
          );

          // Sort by timestamp safely
          filteredMessages.sort((a, b) => {
            const t1 = a.timestamp
              ? typeof a.timestamp === 'string'
                ? Date.parse(a.timestamp)
                : Number(a.timestamp)
              : 0;
            const t2 = b.timestamp
              ? typeof b.timestamp === 'string'
                ? Date.parse(b.timestamp)
                : Number(b.timestamp)
              : 0;
            return t1 - t2;
          });

          // Compose title from first 3 messages
          const titleParts = filteredMessages.slice(0, 3).map((msg) => {
            // const sender = msg.role === 'user' ? 'user' : msg.role === 'bot' ? '' : msg.role || '';
            const content =
              typeof msg.content === 'string' && msg.content.length > 30
                ? msg.content.slice(0, 27) + '...'
                : msg.content || '';
            return `${content}`;
            // ${sender}
          });

          const title = titleParts.join('  ');
          history.push({ id: chatId, title });
        }
      });

      setChatHistory(history);
      setLoadingChats(false);
    });

    return () => unsubscribe();
  }, [db, today]);

  // ---------------- Greeting message ----------------
  useEffect(() => {
    // Runs only on client
    const hour = new Date().getHours();

    let baseGreeting = "";
    if (hour < 12) baseGreeting = "Good morning";
    else if (hour < 18) baseGreeting = "Good afternoon";
    else baseGreeting = "Good evening";

    const sweetMessages = [
      "Hope you’re having a wonderful day",
      "Glad to have you here",
      "Wishing you lots of positivity",
      "Always happy to see you",
      "Let’s make today amazing",
      "Here to help you shine",
      "Your presence brightens the room",
      "Ready to assist you",
      "Let’s achieve great things together",
      "Stay awesome",
      "Keep being your incredible self",
      "Good to see you",
      "You’re doing great",
      "Keep up the fantastic work",
    ];

    // Pick a random sweet message
    const randomMessage =
      sweetMessages[Math.floor(Math.random() * sweetMessages.length)];

    // Show username only if it exists and is not Guest
    const namePart = userName && userName !== "Guest" ? `, ${userName}` : "";

    setGreeting(`${baseGreeting}${namePart}! ${randomMessage}.`);
  }, [userName]);

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);

    if (isNewChat) { setIsNewChat(true); }
    router.push('/login');
  };

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Listen for auth state changes
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

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ---------------- Scroll ----------------
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const toggleTheme = (): void => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // ---------------- Firebase helpers ----------------
  // Theme-based style classes
  const themes = {
    light: {
      background: 'bg-gray-50',
      sidebarBg: 'bg-white',
      sidebarText: 'text-gray-900',
      mainBg: 'bg-gray-100',
      inputBg: 'bg-gray-100',
      inputText: 'text-gray-900',
      inputBorder: 'border-gray-300',
      btnBg: 'bg-blue-600',
      btnText: 'text-white',
      userMsgBg: 'bg-blue-500',
      userMsgText: 'text-white',
      botMsgBg: 'bg-gray-200',
      // botMsgText: 'text-gray-900',
      typingBg: 'bg-gray-200',
      typingText: 'text-gray-700',
      placeholderText: 'placeholder-gray-500',
      hoverSidebarBg: 'hover:bg-gray-100',
      borderColor: 'border-gray-300',
      circalBg: 'bg-gray-800/80',
      selectedChatbg: 'bg-gray-200',
      // For HTML parsing
      botMsgText: "text-gray-800",
      strongColor: "text-gray-700",
      bColor: "text-blue-600",
      emColor: "text-green-600",
      iColor: "text-purple-600",
      pColor: "text-gray-700",
      liColor: "text-gray-700",
      h1Color: "text-black",
      h2Color: "text-gray-900",
      h3Color: "text-gray-800",
      spanColor: "text-gray-700",
      divColor: "text-gray-800",
      ulColor: "text-gray-800",
      olColor: "text-gray-800",
      hrColor: "border-gray-400",
    },
    dark: {
      background: 'bg-gray-900',
      sidebarBg: 'bg-gray-800',
      sidebarText: 'text-gray-100',
      mainBg: 'bg-gray-900',
      inputBg: 'bg-gray-900',
      inputText: 'text-gray-100',
      inputBorder: 'border-gray-700',
      btnBg: 'bg-blue-500',
      btnText: 'text-white',
      userMsgBg: 'bg-blue-700',
      userMsgText: 'text-white',
      botMsgBg: 'bg-gray-700',
      // botMsgText: 'text-gray-300',
      typingBg: 'bg-gray-700',
      typingText: 'text-gray-300',
      placeholderText: 'placeholder-gray-400',
      hoverSidebarBg: 'hover:bg-gray-700',
      borderColor: 'border-gray-700',
      circalBg: 'bg-gray-100/40',
      selectedChatbg: 'bg-gray-700',
      // For HTML parsing
      botMsgText: "text-gray-200",
      strongColor: "text-gray-300",
      bColor: "text-blue-400",
      emColor: "text-green-400",
      iColor: "text-purple-400",
      pColor: "text-gray-300",
      liColor: "text-gray-300",
      h1Color: "text-white",
      h2Color: "text-gray-300",
      h3Color: "text-gray-300",
      spanColor: "text-gray-300",
      divColor: "text-gray-200",
      ulColor: "text-gray-200",
      olColor: "text-gray-200",
      hrColor: "border-gray-600",
    },
  };

  const currentTheme = themes[theme];


  // Styled component for theme toggle button
  const StyledWrapper = styled.div`
  /* <reset-style> ============================ */
  button {
    border: none;
    background: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    font-family: inherit;
  }

  /* <main-style> ============================ */
  .theme__icon {
    width: 32px;
    height: 32px;
    padding: 4px;
    overflow: hidden;
    position: relative;
  }

  .theme__icon > :nth-child(1) {
    width: 14px;
    height: 14px;
    border-radius: 24px;
    border: 1px solid #212121;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgb(255, 204, 0);
    transition: width .4s, height .4s, border .4s, background-color .4s;
    z-index: 10;
  }

  .theme__icon:hover > :nth-child(1) {
    width: 24px;
    height: 24px;
    border: 1px solid rgb(245, 245, 247);
    background-color: rgb(245, 245, 247);
  }

  .theme__icon > :nth-child(2) {
    width: 24px;
    height: 24px;
    border-radius: 24px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: transform .4s;
  }

  .theme__icon:hover > :nth-child(2) {
    transform: translate(-50%, -50%) rotate(-45deg) scale(.8);
  }

  .theme__icon > :nth-child(2) > :nth-child(1) {
    display: block;
    width: 2px;
    height: 24px;
    border-radius: 2px;
    position: relative;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgb(255, 204, 0);
  }

  .theme__icon > :nth-child(2) > :nth-child(2) {
    display: block;
    width: 24px;
    height: 2px;
    border-radius: 2px;
    position: relative;
    top: -54%;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgb(255, 204, 0);
  }

  .theme__icon > :nth-child(2) > :nth-child(3) {
    display: block;
    width: 24px;
    height: 2px;
    border-radius: 2px;
    position: relative;
    top: -60%;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    background-color: rgb(255, 204, 0);
  }

  .theme__icon > :nth-child(2) > :nth-child(4) {
    display: block;
    width: 24px;
    height: 2px;
    border-radius: 2px;
    position: relative;
    top: -70%;
    left: 50%;
    transform: translateX(-50%) rotate(-45deg);
    background-color: rgb(255, 204, 0);
  }

  .theme__icon > :nth-child(3) {
    width: 20px;
    height: 20px;
    border-radius: 24px;
    position: absolute;
    top: 50%;
    left: 100%;
    transform: translateY(-50%);
    background-color: #212121;
    transition: top .4s, left .4s;
    transition-delay: .2s;
    z-index: 20;
  }

  .theme__icon:hover > :nth-child(3) {
    top: 35%;
    left: 40%;
  }`;

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
    // After pushing user message
    // After pushing user + bot message to Firebase

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

    if (userName === "Guest" && messages.filter(m => m.sender === "user").length >= 1) {
      setShowGuestSuggestion(true);
    }

    setIsTyping(true);

    try {
      const res = await fetch('https://ommajithiya.in/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await res.json();
      let botText = '⚠️ No response from server.';

      if (res.ok && data?.response) {
        // Keep HTML with inline styles instead of stripping
        botText = data.response;
      }

      // Local bot message
      const botMessage: Message = {
        id: idRef.current + 1,
        text: botText,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      idRef.current += 1;

      // Firebase reference
      const messagesRef = ref(db, `${path}/messages`);

      // Push user message
      await push(messagesRef, {
        role: 'user',
        content: textToSend,
        timestamp: serverTimestamp(),
      });

      // Push bot message
      await push(messagesRef, {
        role: 'bot',
        content: botText,
        timestamp: serverTimestamp(),
      });

    } catch (err: unknown) {
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

  // ---------------- Load messages for current session ----------------
  useEffect(() => {
    if (!sessionPath) return;

    const messagesRef = ref(db, sessionPath);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data || !data.messages) {
        setMessages([]);
        return;
      }

      const chatMessages: Message[] = Object.entries(data.messages).map(([key, value]) => {
        const val: any = value;
        return {
          id: String(key),
          text: val.content || "",
          sender: (val.role === "user" || val.role === "bot") ? val.role : "bot",
          timestamp: val.timestamp ? new Date(val.timestamp) : new Date(),
        };
      });

      setMessages(chatMessages);
    });

    return () => unsubscribe();
  }, [sessionPath, db]);





  return (
    <div className={`${currentTheme.background} flex h-screen ${currentTheme.inputText}`}>

      {showGuestSuggestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`relative bg-gray-50 text-gray-900 border-l-4 border-gray-300 p-8 rounded-2xl shadow-xl max-w-md w-full mx-auto`}>

            {/* Close button */}
            <button
              onClick={() => setShowGuestSuggestion(false)}
              className="absolute top-3 right-3 text-gray-900 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-md bg-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
              Unlock Premium Features
            </h2>

            <p className="text-center text-gray-700 mb-6">
              Log in or sign up to get smarter responses, upload files and images, and enjoy more features!
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {['Smarter AI', 'File Uploads', 'Personalized', 'Faster Responses'].map((feature, idx) => (
                <div key={idx} className="flex items-center p-2 rounded-lg bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <a
                href="/login"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 text-center shadow hover:shadow-md"
              >
                Login
              </a>
              <a
                href="/registration"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 text-center shadow hover:shadow-md"
              >
                Sign Up
              </a>
            </div>

            {/* Continue without account */}
            <div className="text-center">
              <button
                onClick={() => setShowGuestSuggestion(false)}
                className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
              >
                Continue without account
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Sidebar */}
      {userName !== "Guest" && (<div
        className={`${currentTheme.sidebarBg} ${currentTheme.sidebarText} w-64 flex-shrink-0 ${sidebarOpen ? 'blck' : 'hidden'
          } md:block relative border-r ${currentTheme.borderColor}`}
      >
        <div className="p-4 flex justify-between items-center">

          <h2 className="text-xl font-semibold">Jini Ai</h2>
          <StyledWrapper>
            <button
              className="theme__icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              <span />
              <span>
                <span />
                <span />
                <span />
                <span />
              </span>
              <span />
            </button>
          </StyledWrapper>

        </div>

        <div className="p-4 border-t border-gray-300 dark:border-gray-700">
          <button
            onClick={startNewChat}
            className={`flex items-center mb-2 gap-2 w-full rounded-md border ${currentTheme.borderColor} p-3 text-sm ${currentTheme.hoverSidebarBg} transition-colors`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New chat
          </button>

          {/* <Link href="/demo">Go to Demo Page</Link> */}

          <div className="mb-2">
            <div
              className={`flex items-center gap-2 mb-2 text-sm ${currentTheme.sidebarText} ${currentTheme.hoverSidebarBg} cursor-pointer p-2 rounded-md`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <span>Library</span>
            </div>

            <div className={`flex items-center gap-2 text-sm ${currentTheme.sidebarText} ${currentTheme.hoverSidebarBg} cursor-pointer p-2 rounded-md`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Jinis</span>
            </div>
          </div>

          <div className=" border-t mt-5 pt-4">
            <h3 className="text-sm font-medium mb-2">Chats</h3>
            <div className="max-h-73 overflow-y-auto">
              {/* <ul className="space-y-2">
                {chatHistory.length === 0 ? (
                  <li>No chat history available</li>
                ) : (
                  [...chatHistory].reverse().map((chat) => (
                    <li
                      key={chat.id}
                      className={`text-sm cursor-pointer p-2 rounded-md ${selectedChatId === chat.id ? currentTheme.selectedChatbg : currentTheme.sidebarText
                        } ${currentTheme.hoverSidebarBg}`}
                      onClick={() => {
                        if (isNewChat) setIsNewChat(false);
                        setSelectedChatId(chat.id);
                        setSessionPath(`users/${auth.currentUser?.uid}/chats/${today}/${chat.id}/messages`);
                      }}
                    >
                      {chat.title}
                    </li>
                  ))
                )}
              </ul> */}
              <ul className="space-y-2">
                {loadingChats ? (
                  <li className="text-sm p-2 text-gray-500 italic">Loading chats...</li>
                ) : chatHistory.length === 0 ? (
                  <li className="text-sm p-2 text-gray-500 italic">No chat history available</li>
                ) : (
                  [...chatHistory].reverse().map((chat) => (
                    <li
                      key={chat.id}
                      className={`text-sm cursor-pointer p-2 rounded-md 
                        ${selectedChatId === chat.id ? currentTheme.selectedChatbg : currentTheme.sidebarText}
                        ${currentTheme.hoverSidebarBg}`}
                      onClick={() => {
                        if (isNewChat) setIsNewChat(false);
                        setSelectedChatId(chat.id);
                        setSessionPath(`users/${auth.currentUser?.uid}/chats/${today}/${chat.id}/messages`);
                      }}
                    >
                      {chat.title}
                    </li>
                  ))
                )}
              </ul>

            </div>
          </div>
        </div>

        <div className={`absolute bottom-0 w-full p-4 border-t ${currentTheme.borderColor}`}>
          <div ref={menuRef} className="relative">
            {/* Profile Button */}
            <div
              className="flex items-center gap-2 text-sm cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div className={`${currentTheme.circalBg} w-6 h-6 rounded-full flex items-center justify-center text-xs text-white`}>
                {userName?.slice(0, 1).toUpperCase() || "O"}
              </div>
              <span>{userName}</span>
              <span
                className={`text-xs px-2 py-1 rounded ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
              >
                Free
              </span>
            </div>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-32 bg-white dark:bg-gray-800 border rounded shadow-md z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>)}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header (mobile) */}
        <header
          className={`flex items-center justify-between p-4 border-b border-gray-200 md:hidden ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-100'}`}
        >
          {userName !== "Guest" && (
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}


          <h1 className="text-lg font-semibold">Jini AI</h1>
          <a
            href="/Jini_AI.apk"
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
          >
            <FiDownload size={18} />
          </a>
          {/* <div className="w-6"> </div> */}
        </header>

        {/* Header (desktop) */}
        <header className={`${currentTheme.sidebarBg} w-full items-center justify-between hidden sm:flex`}>
          <div className="flex pl-4 items-center gap-2">
            {userName == "Guest" && (
              <>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Jini AI</h1>
              </>
            )}

          </div>

          {/* Right Side */}
          <div className="flex p-2 items-center gap-4">
            {userName == "Guest" ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Login
                </Link>
                <Link
                  href="/registration"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
                <a
                  href="/Jini_AI.apk"
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Download App
                </a>
              </>
            ) : (
              <div className="relative items-center gap-4 hidden sm:flex">
                {/* Profile dropdown */}
                <button className={`flex items-center gap-2 px-3 py-2 rounded-md ${currentTheme.hoverSidebarBg}`}>
                  <span className={`${currentTheme.sidebarText}`}>{userName}</span>
                  <div className={`${currentTheme.circalBg} w-8 h-8 rounded-full  flex items-center justify-center text-white font-semibold`}>
                    {userName?.slice(0, 1).toUpperCase() || "O"}
                  </div>

                </button>

              </div>
            )}
          </div>
        </header>

        {/* Chat Area */}
        <div className={`flex-1 overflow-y-auto p-4 ${currentTheme.mainBg}`}>
          {isNewChat ? (
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className={`text-3xl font-semibold mb-6 ${currentTheme.inputText}`}>{greeting}</h2>

              {/* Center Search-style Input */}
              <div className="w-full max-w-2xl">
                <div className="relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything"
                    className={`w-full ${currentTheme.inputBg} ${currentTheme.inputText} rounded-full py-4 px-6 pr-12 shadow-md border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentTheme.placeholderText}`}
                  />

                  {/* Send button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={inputText.trim() === ''}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${currentTheme.btnBg} ${currentTheme.btnText} rounded-full p-2 hover:opacity-90 disabled:opacity-40`}
                    aria-label="send"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <p className={`text-center text-sm mt-4 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Jini AI can make mistakes. Consider checking important information.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">

              {/* {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${message.sender === 'user'
                      ? `${currentTheme.userMsgBg} ${currentTheme.userMsgText} rounded-br-none`
                      : `${currentTheme.botMsgBg} ${currentTheme.botMsgText} rounded-bl-none`
                      }`}
                  >
                    {message.sender === 'bot' ? (
                      parseHtmlToReact(message.text, currentTheme) // Make sure this returns React elements
                    ) : (
                      <p className={`${currentTheme.userMsgText} whitespace-pre-wrap`}>{message.text}</p> // Wrap user text in <p>
                    )}
                    <div
                      className={`text-xs mt-1 text-right ${message.sender === 'user'
                          ? `${currentTheme.userMsgText} opacity-70`
                          : `${currentTheme.botMsgText} opacity-60`
                        }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))} */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${message.sender === 'user'
                        ? `${currentTheme.userMsgBg} ${currentTheme.userMsgText} rounded-br-none`
                        : `${currentTheme.botMsgBg} ${currentTheme.botMsgText} rounded-bl-none`
                      }`}
                  >
                    {message.sender === 'bot' ? (
                      // Ensure parseHtmlToReact returns an array of React elements
                      <>{parseHtmlToReact(message.text, currentTheme)}</>
                    ) : (
                      <p className={`${currentTheme.userMsgText} whitespace-pre-wrap`}>{message.text}</p>
                    )}
                    <div
                      className={`text-xs mt-1 text-right ${message.sender === 'user'
                          ? `${currentTheme.userMsgText} opacity-70`
                          : `${currentTheme.botMsgText} opacity-60`
                        }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}


              {isTyping && (
                <div className={`flex justify-start`}>
                  <div className={`${currentTheme.typingBg} ${currentTheme.typingText} px-4 py-2 rounded-lg rounded-bl-none`}>
                    <div className="flex items-center">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      {/* <span className="ml-2 text-sm">Typing...</span> */}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Input Area (shown when a chat is active) */}
        {!isNewChat && (
          <div className={`p-1  ${currentTheme.borderColor} ${currentTheme.inputBg}`}>
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything"
                  className={`w-full ${currentTheme.inputBg} ${currentTheme.inputText} rounded-full py-4 px-6 pr-12 shadow-md border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentTheme.placeholderText}`}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={inputText.trim() === ''}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${currentTheme.btnBg} ${currentTheme.btnText} rounded-full p-2 hover:opacity-90 disabled:opacity-40`}
                  aria-label="send"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <p className={`text-center text-sm mt-4 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                Jini AI can make mistakes. Consider checking important information.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
