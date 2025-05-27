import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import NotesPage from '../page';
import { notes } from '@/services/api';

// Mock the next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    logout: jest.fn(),
  }),
}));

// Mock the API service
jest.mock('@/services/api', () => ({
  notes: {
    getAll: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Notes Page', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (notes.getAll as jest.Mock).mockResolvedValue([
      {
        _id: '1',
        title: 'Test Note',
        content: 'Test Content',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ]);
  });

  it('should create a new note', async () => {
    render(<NotesPage />);

    // Click add note button
    const addButton = screen.getByText('Add Note');
    fireEvent.click(addButton);

    // Fill in the form
    const titleInput = screen.getByLabelText('Title');
    const contentInput = screen.getByLabelText('Content');
    
    fireEvent.change(titleInput, { target: { value: 'New Note' } });
    fireEvent.change(contentInput, { target: { value: 'New Content' } });

    // Submit the form
    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    // Verify API call
    await waitFor(() => {
      expect(notes.create).toHaveBeenCalledWith({
        title: 'New Note',
        content: 'New Content',
      });
    });
  });

  it('should delete an existing note', async () => {
    render(<NotesPage />);

    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByText('Test Note')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByLabelText('delete');
    fireEvent.click(deleteButton);

    // Verify API call
    await waitFor(() => {
      expect(notes.delete).toHaveBeenCalledWith('1');
    });
  });
}); 