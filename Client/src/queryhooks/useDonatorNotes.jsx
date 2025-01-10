// useDonatorNotes.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import axios from "axios";

// -----------------------------------------
// API FUNCTIONS
// -----------------------------------------
const fetchNotes = async (donatorId) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/v1/notes/donator/${donatorId}`
  );
  return data;
};

const addNote = async ({ donatorId, note, userId }) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/v1/notes`,
    { note, donator: donatorId, user: userId }
  );
  return data;
};

const deleteNote = async (noteId) => {
  await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/notes/${noteId}`);
};

const toggleNoteStatus = async (noteId) => {
  const { data } = await axios.patch(
    `${import.meta.env.VITE_API_URL}/api/v1/notes/${noteId}/toggleIsCompleted`
  );
  return data;
};

const setDueDate = async ({ noteId, date }) => {
  const { data } = await axios.patch(
    `${import.meta.env.VITE_API_URL}/api/v1/notes/${noteId}/dueDate`,
    { dueDate: date }
  );
  return data;
};

// -----------------------------------------
// CUSTOM HOOK: useDonatorNotes
// -----------------------------------------
export function useDonatorNotes(donatorId) {
  const queryClient = useQueryClient();
  const currentUser = useSelector((state) => state.user.user);

  // 1) FETCH NOTES
  const {
    data: notes = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["notes", donatorId],
    queryFn: () => fetchNotes(donatorId),
    staleTime: 1000 * 60 * 5, // e.g. 5 minutes
  });

  // Common function to revalidate both queries
  const revalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["notes", donatorId] });
    queryClient.invalidateQueries({ queryKey: ["donator", donatorId] });
  };

  // 2) ADD NOTE (Optimistic)
  const addNoteMutation = useMutation({
    mutationFn: ({ note }) =>
      addNote({ donatorId, note, userId: currentUser?._id }),
    onMutate: async ({ note }) => {
      await queryClient.cancelQueries({ queryKey: ["notes", donatorId] });
      const previousNotes = queryClient.getQueryData(["notes", donatorId]);

      // Create a temporary note
      const tempId = `temp-${Date.now()}`;
      const newNoteEntry = {
        _id: tempId,
        note,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        dueDate: null,
        user: currentUser,
      };

      // Optimistic update
      queryClient.setQueryData(["notes", donatorId], (old = []) => [
        ...old,
        newNoteEntry,
      ]);

      return { previousNotes, tempId };
    },
    onError: (err, variables, context) => {
      // Roll back
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes", donatorId], context.previousNotes);
      }
    },
    onSuccess: (data, variables, context) => {
      // Replace the temp note with the real one
      queryClient.setQueryData(["notes", donatorId], (old) =>
        old.map((note) => (note._id === context.tempId ? data : note))
      );
    },
    onSettled: () => {
      // Revalidate everything
      revalidateAll();
    },
  });

  // 3) DELETE NOTE (Optimistic)
  const deleteNoteMutation = useMutation({
    mutationFn: (noteId) => deleteNote(noteId),
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ["notes", donatorId] });
      const previousNotes = queryClient.getQueryData(["notes", donatorId]);

      // Optimistically remove
      queryClient.setQueryData(["notes", donatorId], (old) =>
        old.filter(
          (note) => note._id !== noteId && note.id !== noteId
        )
      );

      return { previousNotes };
    },
    onError: (err, variables, context) => {
      // Roll back
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes", donatorId], context.previousNotes);
      }
    },
    onSettled: () => {
      // Revalidate everything
      revalidateAll();
    },
  });

  // 4) TOGGLE COMPLETION (Optimistic)
  const toggleNoteMutation = useMutation({
    mutationFn: (noteId) => toggleNoteStatus(noteId),
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ["notes", donatorId] });
      const previousNotes = queryClient.getQueryData(["notes", donatorId]);

      // Flip isCompleted
      queryClient.setQueryData(["notes", donatorId], (old) =>
        old.map((note) =>
          note._id === noteId || note.id === noteId
            ? { ...note, isCompleted: !note.isCompleted }
            : note
        )
      );

      return { previousNotes };
    },
    onError: (err, variables, context) => {
      // Roll back
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes", donatorId], context.previousNotes);
      }
    },
    onSettled: () => {
      // Revalidate everything
      revalidateAll();
    },
  });

  // 5) SET DUE DATE (Optimistic)
  const setDueDateMutation = useMutation({
    mutationFn: ({ noteId, date }) => setDueDate({ noteId, date }),
    onMutate: async ({ noteId, date }) => {
      await queryClient.cancelQueries({ queryKey: ["notes", donatorId] });
      const previousNotes = queryClient.getQueryData(["notes", donatorId]);

      // Optimistically set the due date
      queryClient.setQueryData(["notes", donatorId], (old) =>
        old.map((note) =>
          note._id === noteId || note.id === noteId
            ? { ...note, dueDate: date }
            : note
        )
      );

      return { previousNotes };
    },
    onError: (err, variables, context) => {
      // Roll back
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes", donatorId], context.previousNotes);
      }
    },
    onSettled: () => {
      // Revalidate everything
      revalidateAll();
    },
  });

  return {
    notes,
    isLoading,
    isError,
    error,
    // Mutations
    addNoteMutation,
    deleteNoteMutation,
    toggleNoteMutation,
    setDueDateMutation,
  };
}
