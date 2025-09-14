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
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { 
  EditorState, 
  RichUtils, 
  convertToRaw, 
  convertFromHTML, 
  ContentState,
  SelectionState,
  CompositeDecorator,
  Modifier
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

// Link component for Draft.js
const Link = ({ contentState, entityKey, children }) => {
  const { url } = contentState.getEntity(entityKey).getData();
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      style={{
        color: '#1976d2',
        textDecoration: 'underline',
        cursor: 'pointer'
      }}
      onClick={(e) => {
        // Prevent default in editor to avoid navigation
        e.preventDefault();
      }}
    >
      {children}
    </a>
  );
};

Link.propTypes = {
  contentState: PropTypes.object.isRequired,
  entityKey: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

// Function to find link entities
const findLinkEntities = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
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
  isSingleEmail = false,
}) => {
  const { t } = useTranslation();
  const editorRef = useRef(null);

  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [localHtml, setLocalHtml] = useState(body || '');
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  // HTML Mode state
  const [htmlMode, setHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState('');
  
  // Create the image plugin
  const imagePlugin = useMemo(() => createImagePlugin(), []);
  const plugins = useMemo(() => [imagePlugin], [imagePlugin]);

  // Create decorator for links - memoize properly to prevent re-creation
  const decorator = useMemo(() => new CompositeDecorator([
    {
      strategy: findLinkEntities,
      component: Link,
    },
  ]), []); // Empty dependency array to prevent re-creation

  // Reset state when body is empty (indicating modal close/reset)
  // But don't reset if we have content in localHtml (template was loaded)
  useEffect(() => {
    console.log('Body reset useEffect triggered. Body:', body, 'LocalHtml:', localHtml, 'IsLoadingTemplate:', isLoadingTemplate);
    
    // More conservative reset logic - only reset when explicitly needed
    const shouldReset = !body && !localHtml && !isLoadingTemplate;
    const hasImageTemplate = localHtml && localHtml.includes('<img');
    
    if (shouldReset && !hasImageTemplate) {
      console.log('Resetting editor state because body is empty, no local content, and not loading template');
      setEmailPreviewOpen(false);
      setIsSending(false);
      setImageDialogOpen(false);
      setLinkDialogOpen(false);
      setLinkUrl('');
      setLinkText('');
      setEditorState(EditorState.createEmpty(decorator));
    } else {
      const reason = hasImageTemplate ? 'image template loaded' : 
                    localHtml ? 'has local content' : 
                    isLoadingTemplate ? 'template loading' : 
                    body ? 'has body content' : 'unknown';
      console.log(`Skipping reset because: ${reason}`);
    }
  }, [body, localHtml, isLoadingTemplate]);

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
    if (!html || html.trim() === '') {
      return EditorState.createEmpty(decorator);
    }
    
    try {
      // First, check if the HTML contains img tags
      const hasImages = html && html.includes('<img');
      
      if (!hasImages) {
        // If no images, use the standard conversion
        const blocksFromHTML = convertFromHTML(html);
        const contentState = ContentState.createFromBlockArray(
          blocksFromHTML.contentBlocks,
          blocksFromHTML.entityMap
        );
        return EditorState.createWithContent(contentState, decorator);
      }
    
    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Get all image elements
    const imageElements = tempDiv.querySelectorAll('img');
    const imageUrls = Array.from(imageElements)
      .map(img => img.src)
      .filter(url => validateImageUrl(url));
    
    // For template loading, we should preserve the HTML structure as much as possible
    // Instead of removing images and re-adding them, let's use a simpler approach
    // that maintains the original image positions
    
    try {
      // For HTML with images, try a different approach that preserves image positions
      console.log('Processing HTML with images for template loading');
      
      // First, try the standard convertFromHTML approach
      const blocksFromHTML = convertFromHTML(html);
      let contentState = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      
      // If the conversion worked and we have content, return it
      if (contentState.hasText() || contentState.getBlockMap().size > 1) {
        return EditorState.createWithContent(contentState, decorator);
      }
      
      // If standard conversion didn't work well, fall back to the complex approach
      throw new Error('Standard conversion did not preserve content properly');
      
    } catch (conversionError) {
      console.warn('Standard HTML conversion failed, trying fallback:', conversionError);
      
      // Fallback: Remove images and add them back (original logic)
      let htmlWithoutImages = html;
      imageElements.forEach((img) => {
        // Replace with a simple placeholder to maintain structure
        htmlWithoutImages = htmlWithoutImages.replace(img.outerHTML, '[IMAGE_PLACEHOLDER]');
      });
      
      // Convert HTML to ContentState
      const blocksFromHTML = convertFromHTML(htmlWithoutImages);
      let contentState = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      
      // Start with an editor state from this content
      let editorState = EditorState.createWithContent(contentState, decorator);
      
      // Try to add images back, but this may not preserve positions
      imageUrls.forEach(imageUrl => {
        try {
          editorState = imagePlugin.addImage(editorState, imageUrl);
        } catch {
          console.warn('Failed to add image:', imageUrl);
        }
      });
      
      return editorState;
    }
    
    return editorState;
    } catch (error) {
      console.error('Error creating editor state from HTML:', error);
      console.error('Problematic HTML:', html);
      // Fallback to plain text
      const plainText = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
      const contentState = ContentState.createFromText(plainText);
      return EditorState.createWithContent(contentState, decorator);
    }
  }, [imagePlugin, decorator]); // Remove validateImageUrl to prevent recreation

  // Initialize editor state with enhanced image handling
  const [editorState, setEditorState] = useState(() => {
    if (body) {
      return createEditorStateFromHTML(body);
    }
    return EditorState.createEmpty(decorator);
  });

  // State declarations moved to top of component

  // Handle template loading when body prop changes
  useEffect(() => {
    console.log('Template loading useEffect triggered. Body:', body, 'LocalHtml:', localHtml, 'IsLoading:', isLoadingTemplate);
    // Only update if the body prop changes and is different from localHtml
    if (body && body !== localHtml && !isLoadingTemplate) {
      console.log('Loading template body:', body);
      console.log('Current localHtml:', localHtml);
      
      setIsLoadingTemplate(true);
      
      // Clean and simplify the HTML for better Draft.js compatibility
      let cleanHtml = body;
      
      // Check if HTML contains images before cleaning
      const hasImages = cleanHtml.includes('<img');
      
      if (!hasImages) {
        // Only apply aggressive cleaning if there are no images
        // Remove wrapper divs and keep only the essential content
        cleanHtml = cleanHtml.replace(/<div style="position: relative; display: inline-block;">/g, '');
        cleanHtml = cleanHtml.replace(/<div><p>/g, '<p>');
        cleanHtml = cleanHtml.replace(/<\/p><\/div>/g, '</p>');
        cleanHtml = cleanHtml.replace(/^\s*<div[^>]*>/, '').replace(/<\/div>\s*$/, '');
      } else {
        // For HTML with images, do minimal cleaning to preserve structure
        console.log('Template contains images, preserving HTML structure');
      }
      
      cleanHtml = cleanHtml.trim();
      
      console.log('Cleaned HTML:', cleanHtml);
      
      // Use setTimeout to ensure the loading flag is set before processing
      setTimeout(() => {
        try {
          // For templates with images, use a different approach
          let newEditorState;
          
          if (hasImages) {
            console.log('Loading template with images - using empty editor with preview');
            // For templates with images, create empty editor and show preview
            // This prevents Draft.js from mangling the images
            newEditorState = EditorState.createEmpty(decorator);
            console.log('Created empty editor for image template, will show preview');
          } else {
            // For text-only templates, use the complex conversion
            newEditorState = createEditorStateFromHTML(cleanHtml);
          }
          
          setEditorState(newEditorState);
          // For templates with images, store the original HTML to preserve images
          // For text templates, store the cleaned HTML
          setLocalHtml(hasImages ? body : cleanHtml);
          
          // For image templates, immediately update the parent with the template HTML
          if (hasImages) {
            console.log('Updating parent with image template HTML');
            handleChange("body", body);
          }
          
          console.log('Template loaded successfully with HTML conversion');
          console.log('Editor content after loading:', newEditorState.getCurrentContent().getPlainText());
          
          // Delay clearing the loading flag to prevent interference
          setTimeout(() => {
            setIsLoadingTemplate(false);
            console.log('Template loading completed');
          }, 100);
          
        } catch (error) {
          console.error('Error loading template with HTML conversion:', error);
          
          // Fallback: For image templates, use empty editor with preview
          if (hasImages) {
            console.log('Fallback: Using empty editor for image template with preview');
            setEditorState(EditorState.createEmpty(decorator));
            setLocalHtml(body); // Keep original HTML with images
            handleChange("body", body); // Update parent with template HTML
            setTimeout(() => setIsLoadingTemplate(false), 100);
          } else {
            // For text templates, try simpler conversion
            try {
              // Fallback: Simple HTML to Draft.js conversion
              const blocksFromHTML = convertFromHTML(cleanHtml);
              const contentState = ContentState.createFromBlockArray(
                blocksFromHTML.contentBlocks,
                blocksFromHTML.entityMap
              );
              const newEditorState = EditorState.createWithContent(contentState, decorator);
              setEditorState(newEditorState);
              setLocalHtml(cleanHtml);
              console.log('Template loaded successfully with simple conversion');
              setTimeout(() => setIsLoadingTemplate(false), 100);
            } catch (simpleError) {
              console.error('Error with simple conversion:', simpleError);
              
              // Last fallback: Plain text
              const plainText = cleanHtml.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
              if (plainText) {
                const contentState = ContentState.createFromText(plainText);
                const newEditorState = EditorState.createWithContent(contentState, decorator);
                setEditorState(newEditorState);
                setLocalHtml(plainText);
                console.log('Template loaded as plain text:', plainText);
              } else {
                console.log('Template body was empty after HTML removal');
                setEditorState(EditorState.createEmpty(decorator));
                setLocalHtml('');
              }
              setTimeout(() => setIsLoadingTemplate(false), 100);
            }
          }
        }
      }, 50);
    }
  }, [body, localHtml]); // Remove isLoadingTemplate from dependencies to prevent blocking

  useEffect(() => {
    // Don't update parent while loading template to prevent conflicts
    if (isLoadingTemplate) {
      console.log('Skipping HTML conversion because template is loading');
      return;
    }
    
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
          let blockText = text;
          
          // Process entity ranges for links and other entities
          if (block.entityRanges && block.entityRanges.length > 0) {
            // Sort entity ranges by offset to process them in order
            const sortedRanges = [...block.entityRanges].sort((a, b) => a.offset - b.offset);
            let processedText = '';
            let currentOffset = 0;
            
            sortedRanges.forEach(range => {
              const entityKey = range.key;
              const entity = rawContent.entityMap[entityKey];
              
              // Add text before the entity
              if (range.offset > currentOffset) {
                processedText += text.slice(currentOffset, range.offset);
              }
              
              // Get the entity text
              const entityText = text.slice(range.offset, range.offset + range.length);
              
              // Handle different entity types
              if (entity && entity.type === 'LINK') {
                const url = entity.data.url;
                processedText += `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #1976d2; text-decoration: underline;">${entityText}</a>`;
              } else {
                // For other entities or if entity not found, just add the text
                processedText += entityText;
              }
              
              currentOffset = range.offset + range.length;
            });
            
            // Add remaining text after the last entity
            if (currentOffset < text.length) {
              processedText += text.slice(currentOffset);
            }
            
            blockText = processedText;
          }
          
          // Wrap in appropriate HTML tags based on block type
          if (block.type === 'unstyled') {
            html += `<p>${blockText}</p>`;
          } else if (block.type === 'header-one') {
            html += `<h1>${blockText}</h1>`;
          } else if (block.type === 'header-two') {
            html += `<h2>${blockText}</h2>`;
          } else if (block.type === 'ordered-list-item') {
            html += `<li>${blockText}</li>`;
          } else if (block.type === 'unordered-list-item') {
            html += `<li>${blockText}</li>`;
          } else {
            html += `<p>${blockText}</p>`;
          }
        }
      }
    });
    
    // For image templates with preview, don't override the template HTML
    if (localHtml && localHtml.includes('<img') && !html.trim()) {
      console.log('Preserving image template HTML since editor is empty');
      return;
    }
    
    // Update local HTML state first
    setLocalHtml(html);
    
    if (html !== body) {
      handleChange("body", html);
    }
  }, [editorState, body, handleChange, isLoadingTemplate, localHtml]);

  // Handle HTML mode changes
  useEffect(() => {
    if (htmlMode) {
      // When entering HTML mode, sync rawHtml with current content
      setRawHtml(body || localHtml || '');
    } else {
      // When exiting HTML mode, convert rawHtml back to editor if needed
      if (rawHtml && rawHtml !== localHtml) {
        try {
          const newEditorState = createEditorStateFromHTML(rawHtml);
          setEditorState(newEditorState);
        } catch (error) {
          console.warn('Failed to convert HTML back to editor:', error);
        }
      }
    }
  }, [htmlMode]);

  // Handle raw HTML changes in HTML mode
  useEffect(() => {
    if (htmlMode && rawHtml !== body) {
      handleChange("body", rawHtml);
      setLocalHtml(rawHtml);
    }
  }, [rawHtml, htmlMode, handleChange]);

  const hasMultipleRecipients = !isSingleEmail && to && to.includes(",");

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

  // Link functionality
  const createLinkEntity = (url, text) => {
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', { url });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    
    const selection = editorState.getSelection();
    let newEditorState;
    
    if (selection.isCollapsed()) {
      // No text selected, insert new text with link
      const newContentState = Modifier.insertText(
        contentStateWithEntity,
        selection,
        text,
        null,
        entityKey
      );
      newEditorState = EditorState.push(editorState, newContentState, 'insert-characters');
      
      // Move cursor to end of inserted text
      const newSelection = SelectionState.createEmpty(selection.getStartKey()).merge({
        anchorOffset: selection.getStartOffset() + text.length,
        focusOffset: selection.getStartOffset() + text.length,
      });
      newEditorState = EditorState.forceSelection(newEditorState, newSelection);
    } else {
      // Text is selected, apply link to selection
      newEditorState = RichUtils.toggleLink(editorState, selection, entityKey);
    }
    
    return newEditorState;
  };

  const handleLinkCreate = () => {
    if (!linkUrl.trim()) return;
    
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    
    let selectedText = '';
    if (!selection.isCollapsed()) {
      const startKey = selection.getStartKey();
      const endKey = selection.getEndKey();
      const startBlock = contentState.getBlockForKey(startKey);
      
      if (startKey === endKey) {
        // Selection within same block
        selectedText = startBlock.getText().slice(
          selection.getStartOffset(),
          selection.getEndOffset()
        );
      } else {
        // Selection spans multiple blocks - just use first block for simplicity
        selectedText = startBlock.getText().slice(selection.getStartOffset());
      }
    }
    
    const textToUse = linkText.trim() || selectedText || linkUrl;
    const newEditorState = createLinkEntity(linkUrl, textToUse);
    
    setEditorState(newEditorState);
    setLinkDialogOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handleLinkDialogOpen = () => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      const selectedText = editorState
        .getCurrentContent()
        .getPlainText()
        .slice(selection.getStartOffset(), selection.getEndOffset());
      setLinkText(selectedText);
    }
    setLinkDialogOpen(true);
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
      const text = block.text;
      
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
      else if (text.trim()) {
        let blockText = text;
        
        // Process entity ranges for links and other entities
        if (block.entityRanges && block.entityRanges.length > 0) {
          const sortedRanges = [...block.entityRanges].sort((a, b) => a.offset - b.offset);
          let processedText = '';
          let currentOffset = 0;
          
          sortedRanges.forEach(range => {
            const entityKey = range.key;
            const entity = rawContent.entityMap[entityKey];
            
            if (range.offset > currentOffset) {
              processedText += text.slice(currentOffset, range.offset);
            }
            
            const entityText = text.slice(range.offset, range.offset + range.length);
            
            if (entity && entity.type === 'LINK') {
              const url = entity.data.url;
              processedText += `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #1976d2; text-decoration: underline;">${entityText}</a>`;
            } else {
              processedText += entityText;
            }
            
            currentOffset = range.offset + range.length;
          });
          
          if (currentOffset < text.length) {
            processedText += text.slice(currentOffset);
          }
          
          blockText = processedText;
        }
        
        if (block.type === 'unstyled') {
          currentHtml += `<p>${blockText}</p>`;
        } else if (block.type === 'header-one') {
          currentHtml += `<h1>${blockText}</h1>`;
        } else if (block.type === 'header-two') {
          currentHtml += `<h2>${blockText}</h2>`;
        } else if (block.type === 'ordered-list-item') {
          currentHtml += `<li>${blockText}</li>`;
        } else if (block.type === 'unordered-list-item') {
          currentHtml += `<li>${blockText}</li>`;
        } else {
          currentHtml += `<p>${blockText}</p>`;
        }
      }
    });
    
    // Synchronize the current HTML with our state
    setLocalHtml(currentHtml);
    
    setEmailPreviewOpen(true);
  };

  const generateEmailContent = () => {
    // Use rawHtml in HTML mode, otherwise use localHtml from editor
    const contentToUse = htmlMode ? rawHtml : localHtml;
    
    const emailContent = `
      <div style="position: relative; max-width: 100%;">
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">${contentToUse}</div>
        <!-- Email Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 10px; margin-top: 20px;">
          <tr>
            <td align="center">
              <img src="https://image-uploader-lirone-v1.s3.eu-central-1.amazonaws.com/2025-05-12_07-48-36.jpeg" alt="Email Footer" style="max-width: 100%; height: auto;" />
            </td>
          </tr>
        </table>
      </div>
    `;
    
    return emailContent;
  };

  const handleEmailSubmit = async () => {
    // Validate that sender is selected
    if (!from || from.trim() === '') {
      setNotification({
        open: true,
        message: t("email.selectSenderError") || "Please select a sender email address",
        severity: 'error'
      });
      return;
    }

    setIsSending(true);
    try {
      const emailContent = generateEmailContent();
      await handleSubmit(emailContent);
      
      // Show success notification
      setNotification({
        open: true,
        message: t("email.sentSuccess") || "Email sent successfully!",
        severity: 'success'
      });
    } catch (error) {
      console.error("Error sending email:", error);
      setNotification({
        open: true,
        message: t("email.sendError") || "Failed to send email. Please try again.",
        severity: 'error'
      });
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
          disabled={isSingleEmail}
          InputProps={{
            readOnly: isSingleEmail,
          }}
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
            backgroundColor: "#fff",
            border: '1px solid #ddd',
            borderRadius: '4px',
            position: 'relative'
          }}
        >
          {/* Sticky Toolbar - Only show in rich text mode */}
          <Box 
            sx={{ 
              position: 'sticky',
              top: 0,
              zIndex: 1000,
              backgroundColor: '#fff',
              borderBottom: '1px solid #eee', 
              display: 'flex', 
              flexWrap: 'wrap',
              p: 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {/* HTML Mode Toggle - Always visible */}
            <Button 
              variant={htmlMode ? "contained" : "outlined"}
              size="small"
              onClick={() => setHtmlMode(!htmlMode)}
              sx={{ 
                minWidth: 'auto', 
                padding: '4px 8px', 
                margin: '0 2px',
                backgroundColor: htmlMode ? '#1976d2' : 'transparent',
                color: htmlMode ? 'white' : '#1976d2'
              }}
            >
              📄 HTML
            </Button>
            
            {/* Rich Text Formatting Tools - Only show when NOT in HTML mode */}
            {!htmlMode && (
              <>
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
                  onClick={handleLinkDialogOpen}
                  sx={{ minWidth: 'auto', padding: '4px 8px', margin: '0 2px' }}
                >
                  🔗 Lien
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => setImageDialogOpen(true)}
                  sx={{ minWidth: 'auto', padding: '4px 8px', margin: '0 2px' }}
                >
                  Image
                </Button>
              </>
            )}
          </Box>
          
          {/* Editor Content Area */}
          {htmlMode ? (
            /* HTML Mode - Raw HTML Editor */
            <Box sx={{ padding: '20px' }}>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                📄 {t("email.htmlModeInfo") || "HTML Mode: Paste your HTML content below. Perfect for AI-generated emails!"}
              </Typography>
              <TextField
                multiline
                fullWidth
                minRows={15}
                maxRows={25}
                value={rawHtml}
                onChange={(e) => setRawHtml(e.target.value)}
                placeholder="Paste your HTML content here..."
                variant="outlined"
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                    fontSize: '13px',
                    lineHeight: '1.4'
                  },
                  '& .MuiInputBase-input': {
                    minHeight: '350px !important'
                  }
                }}
              />
            </Box>
          ) : (
            /* Rich Text Editor Mode */
            <Box 
              onClick={focusEditor}
              sx={{ 
                minHeight: '400px', // Increased height for better editing experience
                padding: '20px',
                '& .DraftEditor-root': {
                  height: '100%',
                  width: '100%'
                },
                '& .public-DraftEditor-content': {
                  minHeight: '350px'
                },
                // Style links in the editor
                '& a': {
                  color: '#1976d2',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                },
                // Draft.js entity styling
                '& [data-entity-type="LINK"]': {
                  color: '#1976d2',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }
              }}
            >
              {/* Show template preview when we have HTML content but empty editor */}
              {localHtml && localHtml.includes('<img') && (!editorState.getCurrentContent().hasText()) ? (
                <Box sx={{ 
                  border: '2px dashed #ccc',
                  borderRadius: '8px',
                  p: 2,
                  mb: 2,
                  backgroundColor: '#f9f9f9'
                }}>
                  <Typography variant="h6" sx={{ mb: 1, color: '#666' }}>
                    📧 {t("email.templatePreview") || "Template Preview"}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                    {t("email.templateLoadedInfo") || "Image template loaded. The content will be included in your email."}
                  </Typography>
                  <Box 
                    sx={{ 
                      maxHeight: '200px', 
                      overflow: 'auto',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      p: 1,
                      backgroundColor: '#fff',
                      fontSize: '14px'
                    }}
                    dangerouslySetInnerHTML={{ __html: localHtml }}
                  />
                </Box>
              ) : null}
              
              <ErrorBoundary>
                <Editor
                  editorState={editorState}
                  onChange={setEditorState}
                  handleKeyCommand={handleKeyCommand}
                  plugins={plugins}
                  ref={editorRef}
                  placeholder={
                    localHtml && localHtml.includes('<img') && (!editorState.getCurrentContent().hasText()) 
                      ? "You can add additional content here..." 
                      : "Write your email content here..."
                  }
                />
              </ErrorBoundary>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Link dialog */}
      <Dialog 
        open={linkDialogOpen} 
        onClose={() => {
          setLinkDialogOpen(false);
          setLinkUrl('');
          setLinkText('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("email.createLink") || "Create Hyperlink"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label={t("email.linkUrl") || "URL"}
              type="url"
              fullWidth
              variant="outlined"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label={t("email.linkText") || "Link Text (optional)"}
              type="text"
              fullWidth
              variant="outlined"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Click here"
              helperText={t("email.linkTextHelper") || "If empty, selected text or URL will be used"}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setLinkDialogOpen(false);
            setLinkUrl('');
            setLinkText('');
          }}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button 
            onClick={handleLinkCreate}
            variant="contained"
            disabled={!linkUrl.trim()}
          >
            {t("email.createLink") || "Create Link"}
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
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
  isSingleEmail: PropTypes.bool,
};

export default EmailForm;
