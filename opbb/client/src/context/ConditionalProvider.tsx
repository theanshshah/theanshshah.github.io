import React from 'react';
import { SocketProvider } from './SocketContext';
import { StaticSocketProvider } from './StaticSocketContext';

const isGitHubPages = window.location.hostname.includes('github.io');

export const ConditionalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isGitHubPages) {
    return <StaticSocketProvider>{children}</StaticSocketProvider>;
  }
  return <SocketProvider>{children}</SocketProvider>;
};
