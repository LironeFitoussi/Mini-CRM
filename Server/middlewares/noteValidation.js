// middlewares/noteValidation.js
const { z } = require('zod');

const createNoteSchema = z.object({
    note: z.string().min(1, "Note content is required."),
    donator: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid Donator ID format."),
    user: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid User ID format.")
});

const updateNoteSchema = z.object({
    note: z.string().min(1, "Note content is required.").optional(),
    donator: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid Donator ID format.").optional(),
    user: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid User ID format.").optional()
});

const validateCreateNote = (req, res, next) => {
    try {
        createNoteSchema.parse(req.body);
        next();
    } catch (error) {
        res.status(400).json({ error: error.errors });
    }
};

const validateUpdateNote = (req, res, next) => {
    try {
        updateNoteSchema.parse(req.body);
        next();
    } catch (error) {
        res.status(400).json({ error: error.errors });
    }
};

module.exports = {
    validateCreateNote,
    validateUpdateNote
};
