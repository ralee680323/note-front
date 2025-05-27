import axios from 'axios';
import { Note, User, AuthResponse, NoteFormData } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (userData: User): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', userData);
    return response.data;
  },
  register: async (userData: User): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },
};

export const notes = {
  getAll: async (): Promise<Note[]> => {
    const response = await api.get<Note[]>('/notes');
    return response.data;
  },
  getOne: async (id: string): Promise<Note> => {
    const response = await api.get<Note>(`/notes/${id}`);
    return response.data;
  },
  create: async (noteData: NoteFormData): Promise<Note> => {
    const response = await api.post<Note>('/notes', noteData);
    return response.data;
  },
  update: async (id: string, noteData: NoteFormData): Promise<Note> => {
    const response = await api.put<Note>(`/notes/${id}`, noteData);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },
}; 