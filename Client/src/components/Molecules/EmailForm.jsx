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

  // Utility function to validate image URLs
  const validateImageUrl = (url) => {
    // Check if URL is valid
    let isValidUrl = false;
    try {
      new URL(url);
      isValidUrl = true;
    } catch {
      return false;
    }
    
    if (!isValidUrl) return false;
    
    // Check if URL likely points to an image
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
    const hasImageExtension = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext) || 
      url.includes(`${ext.substring(1)}?`) // Handle URLs with query params
    );
    
    // Also consider URLs from known image hosting services
    const knownImageHosts = ['s3.', 'cloudinary.com', 'imgur.com', 'i.imgur.com'];
    const isKnownImageHost = knownImageHosts.some(host => url.includes(host));
    
    // If either condition is true, consider it valid
    return hasImageExtension || isKnownImageHost;
  };

  // Function to create editor state from HTML with proper image handling
  const createEditorStateFromHTML = useMemo(() => (html) => {
    // First, check if the HTML contains img tags
    const hasImages = html && html.includes('<img');
    
    if (!hasImages) {
      // If no images, use the standard conversion
      const blocksFromHTML = convertFromHTML(html);
      const contentState = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      return EditorState.createWithContent(contentState);
    }
    
    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Get all image elements
    const imageElements = tempDiv.querySelectorAll('img');
    const imageUrls = Array.from(imageElements)
      .map(img => img.src)
      .filter(url => validateImageUrl(url));
    
    // First convert HTML without images
    // Replace img tags with placeholders that will be removed later
    let htmlWithoutImages = html;
    imageElements.forEach((img) => {
      // Remove the image completely instead of replacing with a placeholder
      htmlWithoutImages = htmlWithoutImages.replace(img.outerHTML, '');
    });
    
    // Convert HTML to ContentState
    const blocksFromHTML = convertFromHTML(htmlWithoutImages);
    let contentState = ContentState.createFromBlockArray(
      blocksFromHTML.contentBlocks,
      blocksFromHTML.entityMap
    );
    
    // Start with an editor state from this content
    let editorState = EditorState.createWithContent(contentState);
    
    // Now add each image back as a proper entity
    imageUrls.forEach(imageUrl => {
      try {
        editorState = imagePlugin.addImage(editorState, imageUrl);
      } catch {
        // Silent fail if image insertion fails
      }
    });
    
    return editorState;
  }, [imagePlugin, validateImageUrl]);

  // Initialize editor state with enhanced image handling
  const [editorState, setEditorState] = useState(() => {
    if (body) {
      return createEditorStateFromHTML(body);
    }
    return EditorState.createEmpty();
  });

  // Inside the EmailForm component, add this state
  const [localHtml, setLocalHtml] = useState(body);

  // Handle template loading when body prop changes
  useEffect(() => {
    // Only update if the body prop changes and is different from localHtml
    if (body && body !== localHtml) {
      setEditorState(createEditorStateFromHTML(body));
      setLocalHtml(body);
    }
  }, [body, localHtml, createEditorStateFromHTML]);

  useEffect(() => {
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    
    // Convert Draft.js content to HTML
    let html = '';
    
    rawContent.blocks.forEach(block => {
      const text = block.text;
      
      // Handle atomic blocks (images)
      if (block.type === 'atomic') {
        const entityKey = block.entityRanges[0]?.key;
        
        if (entityKey !== undefined && rawContent.entityMap[entityKey]) {
          const entity = rawContent.entityMap[entityKey];
          
          // The image plugin uses 'image' type, not 'IMAGE'
          if ((entity.type === 'IMAGE' || entity.type.toLowerCase() === 'image') && entity.data.src) {
            const imgSrc = entity.data.src;
            html += `<img src="${imgSrc}" alt="Embedded image" style="max-width: 100%; height: auto; display: block; margin: 10px 0;" />`;
          }
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
    
    // Update local HTML state first
    setLocalHtml(html);
    
    if (html !== body) {
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
    // Ensure body content is properly wrapped
    const emailContent = `
      <div style="position: relative; max-width: 100%;">
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">${localHtml}</div>
        <!-- Email Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 10px; margin-top: 20px;">
          <tr>
            <td align="center">
              <img src="https://ci3.googleusercontent.com/mail-sig/AIorK4z-IuMSYfe5kuASbYstIdbVrtawGWnO2ATZutINarXAFhx8l49tsl2t1PwjTbQ5nxEp9Mk_596A22pM" alt="Email Footer" style="max-width: 100%; height: auto;" />
            </td>
          </tr>
        </table>
      </div>
    `;
    
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
      // Use the imagePlugin to add an image at the current selection
      const newState = imagePlugin.addImage(editorState, imageUrl);
      
      setEditorState(newState);
      setImageDialogOpen(false);
    } catch (error) {
      console.error('Error inserting image:', error);
      setImageDialogOpen(false);
    }
  };

  // Handle image upload from the dialog
  const handleImageUpload = (url) => {
    // Verify image URL by creating an Image object
    const img = new Image();
    img.onload = () => {
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
              label="Gras" 
              style="BOLD" 
              onToggle={toggleInlineStyle}
              editorState={editorState}
            />
            <StyleButton 
              label="Italique" 
              style="ITALIC" 
              onToggle={toggleInlineStyle}
              editorState={editorState}
            />
            <StyleButton 
              label="Souligné" 
              style="UNDERLINE" 
              onToggle={toggleInlineStyle}
              editorState={editorState}
            />
            {/* <StyleButton 
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
            /> */}
            <StyleButton 
              label="* * * " 
              style="unordered-list-item" 
              onToggle={toggleBlockType} 
              isBlock={true}
              editorState={editorState}
            />
            <StyleButton 
              label="1. 2. 3." 
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
