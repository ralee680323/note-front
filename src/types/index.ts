export interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: string;
}

export interface User {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface NoteFormData {
  title: string;
  content: string;
} 