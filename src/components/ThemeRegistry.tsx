'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 