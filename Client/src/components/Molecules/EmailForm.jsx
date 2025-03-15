import { useState, useEffect, useMemo, useRef } from "react";
import React from 'react';
import PropTypes from "prop-types";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { 
  EditorState, 
  RichUtils, 
  convertToRaw, 
  convertFromHTML, 
  ContentState
} from "draft-js";
import Editor from '@draft-js-plugins/editor';
import createImagePlugin from '@draft-js-plugins/image';
import "draft-js/dist/Draft.css";

import ImageUploader from "../../components/ImageUploader";
import EmailPreviewModal from "../Modals/EmailPreviewModal";
import { useTranslation } from "react-i18next";
import UseTemplateButton from "../Atoms/UseTemplateButton";

// Create a class for handling editor errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in editor component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with the editor. Please try refreshing the page.</div>;
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

const StyleButton = ({ style, label, onToggle, isBlock = false, editorState }) => {
  const onClickButton = (e) => {
    e.preventDefault();
    if (isBlock) {
      onToggle(style);
    } else {
      onToggle(style);
    }
  };
  
  const isActive = () => {
    if (isBlock) {
      const selection = editorState.getSelection();
      const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();
      return blockType === style;
    } else {
      return editorState.getCurrentInlineStyle().has(style);
    }
  };
  
  return (
    <Button 
      variant={isActive() ? "contained" : "outlined"} 
      size="small" 
      onClick={onClickButton}
      sx={{ minWidth: 'auto', padding: '4px 8px', margin: '0 2px' }}
    >
      {label}
    </Button>
  );
};

StyleButton.propTypes = {
  style: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
  isBlock: PropTypes.bool,
  editorState: PropTypes.object.isRequired,
};

const EmailForm = ({
  formValues: {
    from = '',
    subject = '',
    body = '',
    to = '',
  },
  handleChange,
  handleSubmit,
}) => {
  const { t } = useTranslation();
  const editorRef = useRef(null);

  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  
  // Create the image plugin
  const imagePlugin = useMemo(() => createImagePlugin(), []);
  const plugins = useMemo(() => [imagePlugin], [imagePlugin]);

  // Initialize editor state
  const [editorState, setEditorState] = useState(() => {
    if (body) {
      const blocksFromHTML = convertFromHTML(body);
      const contentState = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      return EditorState.createWithContent(contentState);
    }
    return EditorState.createEmpty();
  });

  // Inside the EmailForm component, add this state
  const [localHtml, setLocalHtml] = useState(body);

  useEffect(() => {
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    
    // Debug: Log raw content structure
    console.log('Raw content in useEffect:', JSON.stringify(rawContent));
    
    // Log all entities in the entity map
    console.log('Entity map in useEffect:', rawContent.entityMap);
    
    // Count the blocks by type
    const blockTypes = {};
    rawContent.blocks.forEach(block => {
      blockTypes[block.type] = (blockTypes[block.type] || 0) + 1;
    });
    console.log('Block types count:', blockTypes);
    
    // Convert Draft.js content to HTML
    let html = '';
    
    rawContent.blocks.forEach(block => {
      const text = block.text;
      
      // Debug log
      console.log('Processing block:', block.type, 'text:', text, 'entityRanges:', block.entityRanges);
      
      // Handle atomic blocks (images)
      if (block.type === 'atomic') {
        const entityKey = block.entityRanges[0]?.key;
        console.log('Atomic block found, entityKey:', entityKey);
        
        if (entityKey !== undefined && rawContent.entityMap[entityKey]) {
          const entity = rawContent.entityMap[entityKey];
          console.log('Entity found for atomic block:', entity);
          
          // The image plugin uses 'image' type, not 'IMAGE'
          if ((entity.type === 'IMAGE' || entity.type.toLowerCase() === 'image') && entity.data.src) {
            const imgSrc = entity.data.src;
            console.log('Adding image HTML for src:', imgSrc);
            html += `<img src="${imgSrc}" alt="Embedded image" style="max-width: 100%; height: auto; display: block; margin: 10px 0;" />`;
          } else {
            console.warn('Entity is not an image type:', entity.type);
          }
        } else {
          console.warn('No entity found for atomic block with key:', entityKey);
        }
      }
      // Handle text blocks
      else {
        if (text.trim()) {
          if (block.type === 'unstyled') {
            html += `<p>${text}</p>`;
          } else if (block.type === 'header-one') {
            html += `<h1>${text}</h1>`;
          } else if (block.type === 'header-two') {
            html += `<h2>${text}</h2>`;
          } else if (block.type === 'ordered-list-item') {
            html += `<li>${text}</li>`;
          } else if (block.type === 'unordered-list-item') {
            html += `<li>${text}</li>`;
          } else {
            html += `<p>${text}</p>`;
          }
        }
      }
    });

    console.log('Final HTML generated:', html);
    
    // Update local HTML state first
    setLocalHtml(html);
    
    if (html !== body) {
      console.log('Updating body, old:', body, 'new:', html);
      handleChange("body", html);
    }
  }, [editorState, body, handleChange]);

  const hasMultipleRecipients = to && to.includes(",");

  const recipientCount = hasMultipleRecipients
    ? to.split(",").filter((email) => email.trim() !== "").length
    : to
    ? 1
    : 0;

  const fromEmails = ["contact.lesenfantsderachi@gmail.com"];

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const toggleInlineStyle = (style) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const toggleBlockType = (blockType) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  const handleFormChange = (e) => {
    handleChange(e.target.name, e.target.value);
  };

  const handlePreview = () => {
    // Force generate HTML from current editor state to ensure we have the latest content
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    let currentHtml = '';
    
    // Process blocks directly here to ensure fresh content
    rawContent.blocks.forEach(block => {
      // Handle atomic blocks (images)
      if (block.type === 'atomic') {
        const entityKey = block.entityRanges[0]?.key;
        if (entityKey !== undefined && rawContent.entityMap[entityKey]) {
          const entity = rawContent.entityMap[entityKey];
          if ((entity.type === 'IMAGE' || entity.type.toLowerCase() === 'image') && entity.data.src) {
            currentHtml += `<img src="${entity.data.src}" alt="Embedded image" style="max-width: 100%; height: auto; display: block; margin: 10px 0;" />`;
          }
        }
      }
      // Handle text blocks
      else if (block.text.trim()) {
        if (block.type === 'unstyled') {
          currentHtml += `<p>${block.text}</p>`;
        } else if (block.type === 'header-one') {
          currentHtml += `<h1>${block.text}</h1>`;
        } else if (block.type === 'header-two') {
          currentHtml += `<h2>${block.text}</h2>`;
        } else if (block.type === 'ordered-list-item') {
          currentHtml += `<li>${block.text}</li>`;
        } else if (block.type === 'unordered-list-item') {
          currentHtml += `<li>${block.text}</li>`;
        } else {
          currentHtml += `<p>${block.text}</p>`;
        }
      }
    });
    
    // Synchronize the current HTML with our state
    setLocalHtml(currentHtml);
    
    setEmailPreviewOpen(true);
  };

  const generateEmailContent = () => {
    // Debug - log body content
    console.log('generateEmailContent - body content:', localHtml);
    
    // Ensure body content is properly wrapped
    const emailContent = `
      <div style="position: relative; max-width: 100%;">
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">${localHtml}</div>
        <!-- Email Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 10px; margin-top: 20px;">
          <tr>
            <td align="center">
              <img src="https://image-uploader-lirone-v1.s3.eu-central-1.amazonaws.com/logo%20table%20mail.jpeg" alt="Email Footer" style="max-width: 100%; height: auto;" />
            </td>
          </tr>
        </table>
      </div>
    `;
    
    console.log('Final email content for preview:', emailContent);
    return emailContent;
  };

  const handleEmailSubmit = async () => {
    setIsSending(true);
    try {
      const emailContent = generateEmailContent();
      await handleSubmit(emailContent);
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email.");
    }
    setIsSending(false);
  };

  // Focus the editor when clicking on the container
  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Function to insert image using the image plugin
  const insertImage = (imageUrl) => {
    try {
      console.log('Attempting to insert image at URL:', imageUrl);
      
      // Use the imagePlugin to add an image at the current selection
      const newState = imagePlugin.addImage(editorState, imageUrl);
      
      // Get the updated content state with the image
      const contentState = newState.getCurrentContent();
      const rawContent = convertToRaw(contentState);
      
      // Log the entity map to see the image entity
      console.log('Entity map after image insertion:', rawContent.entityMap);
      
      // Check if the entity was created properly
      const entityKeys = Object.keys(rawContent.entityMap);
      if (entityKeys.length > 0) {
        console.log('Entity keys found:', entityKeys);
        entityKeys.forEach(key => {
          const entity = rawContent.entityMap[key];
          console.log(`Entity ${key}:`, entity);
        });
      } else {
        console.warn('No entities found after image insertion!');
      }
      
      // Find the atomic block that should contain the image
      const atomicBlocks = rawContent.blocks.filter(block => block.type === 'atomic');
      console.log('Atomic blocks after insertion:', atomicBlocks);
      
      setEditorState(newState);
      setImageDialogOpen(false);
      console.log('Image inserted using plugin:', imageUrl);
    } catch (error) {
      console.error('Error inserting image:', error);
      setImageDialogOpen(false);
    }
  };

  // Handle image upload from the dialog
  const handleImageUpload = (url) => {
    console.log('handleImageUpload called with URL:', url);
    
    // Verify image URL by creating an Image object
    const img = new Image();
    img.onload = () => {
      console.log('Image verified successfully:', url);
      console.log('Image dimensions:', img.width, 'x', img.height);
      insertImage(url);
    };
    img.onerror = (error) => {
      console.error('Error verifying image:', error);
      alert('Could not load the image. Please try again with a different image URL.');
      setImageDialogOpen(false);
    };
    img.src = url;
  };

  return (
    <Box>
      <TextField
        select
        label={t("email.from") || "From"}
        value={from}
        name="from"
        onChange={handleFormChange}
        fullWidth
        margin="normal"
        helperText={t("email.fromHelper") || "Select the sender email"}
      >
        {fromEmails.map((email) => (
          <MenuItem key={email} value={email}>
            {email}
          </MenuItem>
        ))}
      </TextField>

      {hasMultipleRecipients ? (
        <Box sx={{ mt: 2, mb: 1 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            {t("email.recipients") || "Recipients"}:{" "}
            <strong>{recipientCount}</strong>
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 1,
              maxHeight: "100px",
              overflowY: "auto",
              backgroundColor: "#f5f5f5",
            }}
          >
            <Typography variant="body2" color="textSecondary">
              {t("email.broadcastNotice") ||
                "This email will be sent to all active donors with valid email addresses."}
            </Typography>
          </Paper>
          <TextField type="hidden" name="to" value={to} />
        </Box>
      ) : (
        <TextField
          label={t("email.to") || "To"}
          value={to}
          name="to"
          onChange={handleFormChange}
          fullWidth
          margin="normal"
          helperText={t("email.toHelper") || "Enter the recipient email"}
        />
      )}

      <TextField
        label={t("email.subject") || "Subject"}
        value={subject}
        name="subject"
        onChange={handleFormChange}
        fullWidth
        margin="normal"
      />

      <Box sx={{ mt: 2, mb: 2 }}>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 1, 
            backgroundColor: "#fff",
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        >
          <Box sx={{ mb: 1, pb: 1, borderBottom: '1px solid #eee', display: 'flex', flexWrap: 'wrap' }}>
            <StyleButton 
              label="B" 
              style="BOLD" 
              onToggle={toggleInlineStyle}
              editorState={editorState}
            />
            <StyleButton 
              label="I" 
              style="ITALIC" 
              onToggle={toggleInlineStyle}
              editorState={editorState}
            />
            <StyleButton 
              label="U" 
              style="UNDERLINE" 
              onToggle={toggleInlineStyle}
              editorState={editorState}
            />
            <StyleButton 
              label="H1" 
              style="header-one" 
              onToggle={toggleBlockType} 
              isBlock={true}
              editorState={editorState}
            />
            <StyleButton 
              label="H2" 
              style="header-two" 
              onToggle={toggleBlockType} 
              isBlock={true}
              editorState={editorState}
            />
            <StyleButton 
              label="UL" 
              style="unordered-list-item" 
              onToggle={toggleBlockType} 
              isBlock={true}
              editorState={editorState}
            />
            <StyleButton 
              label="OL" 
              style="ordered-list-item" 
              onToggle={toggleBlockType} 
              isBlock={true}
              editorState={editorState}
            />
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => setImageDialogOpen(true)}
              sx={{ minWidth: 'auto', padding: '4px 8px', margin: '0 2px' }}
            >
              Image
            </Button>
          </Box>
          <Box 
            onClick={focusEditor}
            sx={{ 
              minHeight: '200px', 
              padding: '10px',
              '& .DraftEditor-root': {
                height: '100%',
                width: '100%'
              }
            }}
          >
            <ErrorBoundary>
              <Editor
                editorState={editorState}
                onChange={setEditorState}
                handleKeyCommand={handleKeyCommand}
                plugins={plugins}
                ref={editorRef}
                placeholder="Write your email content here..."
              />
            </ErrorBoundary>
          </Box>
        </Paper>
      </Box>

      {/* Image uploader dialog */}
      <Dialog 
        open={imageDialogOpen} 
        onClose={() => setImageDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("email.uploadImage") || "Upload Image"}</DialogTitle>
        <DialogContent>
          <ImageUploader 
            handleChange={(name, url) => {
              if (name === 'imageUrl') {
                handleImageUpload(url);
              }
            }} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>
            {t("common.cancel") || "Cancel"}
          </Button>
        </DialogActions>
      </Dialog>

      <EmailPreviewModal
        open={emailPreviewOpen}
        onClose={() => setEmailPreviewOpen(false)}
        fullEmailBody={generateEmailContent()}
      />

      <Box
        sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "space-between" }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleEmailSubmit}
            disabled={isSending}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isSending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              t("email.send") || "Send Email"
            )}
          </Button>
          <Button variant="outlined" onClick={handlePreview}>
            {t("email.preview") || "Preview Email"}
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <UseTemplateButton handleChange={handleChange} />
        </Box>
      </Box>
    </Box>
  );
};

EmailForm.propTypes = {
  formValues: PropTypes.shape({
    from: PropTypes.string.isRequired,
    subject: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

export default EmailForm;
