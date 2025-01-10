// useDonatorNotes.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import axios from "axios";

// ------------------ //
//    API FUNCTIONS   //
// ------------------ //

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

// --------------------- //
//   CUSTOM HOOK LOGIC   //
// --------------------- //

export function useDonatorNotes(donatorId) {
  const queryClient = useQueryClient();
  const currentUser = useSelector((state) => state.user.user);

  // 1) Fetching Notes
  const {
    data: notes = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["notes", donatorId],
    queryFn: () => fetchNotes(donatorId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // 2) Add Note Mutation
  const addNoteMutation = useMutation({
    mutationFn: ({ note }) =>
      addNote({ donatorId, note, userId: currentUser?._id }),
    onMutate: async ({ note }) => {
      await queryClient.cancelQueries({ queryKey: ["notes", donatorId] });
      const previousNotes = queryClient.getQueryData(["notes", donatorId]);

      const tempId = `temp-${new Date().getTime()}`;
      const newNoteEntry = {
        _id: tempId,
        note,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        dueDate: null,
        user: currentUser,
      };

      queryClient.setQueryData(["notes", donatorId], (old) => [
        ...(old || []),
        newNoteEntry,
      ]);

      return { previousNotes, tempId };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes", donatorId], context.previousNotes);
      }
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(["notes", donatorId], (old) =>
        old.map((note) => (note._id === context.tempId ? data : note))
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", donatorId] });
    },
  });

  // 3) Delete Note Mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (noteId) => deleteNote(noteId),
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ["notes", donatorId] });
      const previousNotes = queryClient.getQueryData(["notes", donatorId]);

      queryClient.setQueryData(["notes", donatorId], (old) =>
        old.filter((note) => note._id !== noteId && note.id !== noteId)
      );

      return { previousNotes };
    },
    onError: (err, noteId, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes", donatorId], context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", donatorId] });
    },
  });

  // 4) Toggle Note Status Mutation
  const toggleNoteMutation = useMutation({
    mutationFn: (noteId) => toggleNoteStatus(noteId),
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ["notes", donatorId] });
      const previousNotes = queryClient.getQueryData(["notes", donatorId]);

      queryClient.setQueryData(["notes", donatorId], (old) =>
        old.map((note) =>
          note._id === noteId || note.id === noteId
            ? { ...note, isCompleted: !note.isCompleted }
            : note
        )
      );

      return { previousNotes };
    },
    onError: (err, noteId, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes", donatorId], context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", donatorId] });
    },
  });

  // 5) Set Due Date Mutation
  const setDueDateMutation = useMutation({
    mutationFn: ({ noteId, date }) => setDueDate({ noteId, date }),
    onMutate: async ({ noteId, date }) => {
      await queryClient.cancelQueries({ queryKey: ["notes", donatorId] });
      const previousNotes = queryClient.getQueryData(["notes", donatorId]);

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
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes", donatorId], context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", donatorId] });
    },
  });

  // Return everything needed by the component
  return {
    notes,
    isLoading,
    isError,
    error,
    addNoteMutation,
    deleteNoteMutation,
    toggleNoteMutation,
    setDueDateMutation,
  };
}
