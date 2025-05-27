'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Paper,
  IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { notes } from '@/services/api';
import { Note } from '@/types';

export default function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [note, setNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState({ title: '', content: '' });
  const [error, setError] = useState('');

  const fetchNote = useCallback(async () => {
    try {
      const data = await notes.getOne(id);
      setNote(data);
      setEditedNote({ title: data.title, content: data.content });
    } catch (error) {
      console.error('Error fetching note:', error);
      router.push('/notes');
    }
  }, [id, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchNote();
  }, [isAuthenticated, router, id, fetchNote]);


  const handleSave = async () => {
    if (!editedNote.title.trim()) {
      setError('Title is required');
      return;
    }
    setError('');
    try {
      await notes.update(id, editedNote);
      setIsEditing(false);
      fetchNote();
    } catch (error) {
      console.error('Error updating note:', error);
      setError('Failed to update note');
    }
  };

  if (!isAuthenticated || !note) {
    return null;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={() => router.push('/notes')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isEditing ? 'Edit Note' : 'Note Details'}
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4 }}>
          {isEditing ? (
            <>
              {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}
              <TextField
                fullWidth
                label="Title"
                value={editedNote.title}
                onChange={(e) => {
                  setEditedNote({ ...editedNote, title: e.target.value });
                  setError('');
                }}
                margin="normal"
                inputProps={{ maxLength: 50 }}
                error={!!error}
                helperText={error}
              />
              <TextField
                fullWidth
                label="Content"
                value={editedNote.content}
                onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
                margin="normal"
                multiline
                rows={6}
                inputProps={{ maxLength: 200 }}
              />
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                >
                  Save
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h5" gutterBottom>
                {note.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {note.content}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Created: {new Date(note.createdAt).toLocaleString()}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
} 