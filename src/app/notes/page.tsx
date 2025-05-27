'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { notes } from '@/services/api';
import { Note } from '@/types';

export default function NotesPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [notesList, setNotesList] = useState<Note[]>([]);
  const [open, setOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchNotes();
  }, [isAuthenticated, router]);

  const fetchNotes = async () => {
    try {
      const data = await notes.getAll();
      setNotesList(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleCreateNote = async () => {
    try {
      await notes.create(newNote);
      setOpen(false);
      setNewNote({ title: '', content: '' });
      fetchNotes();
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await notes.delete(id);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            My Notes
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
              sx={{ mr: 2 }}
            >
              Add Note
            </Button>
            <Button variant="outlined" color="secondary" onClick={logout}>
              Logout
            </Button>
          </Box>
        </Box>

        <List>
          {notesList.map((note) => (
            <ListItem
              key={note._id}
              disablePadding
              sx={{ 
                mb: 2,
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  cursor: 'pointer'
                }
              }}
              onClick={() => router.push(`/notes/${note._id}`)}
            >
              <ListItemText
                primary={note.title}
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </Typography>
                }
                sx={{ p: 2 }}
              />
              <ListItemSecondaryAction sx={{ mr: 2 }}>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note._id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Create New Note</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              inputProps={{ maxLength: 50 }}
            />
            <TextField
              margin="dense"
              label="Content"
              fullWidth
              multiline
              rows={4}
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              inputProps={{ maxLength: 200 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateNote} variant="contained" color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
} 