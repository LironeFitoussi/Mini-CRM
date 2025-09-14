import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button, Menu, MenuItem, CircularProgress, Typography, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteTemplateButton from './DeleteTemplateButton';
import { useTranslation } from 'react-i18next';
const fetchTemplates = async () => {
  try {
    console.log('Fetching templates from:', `${import.meta.env.VITE_API_URL}/api/v1/mail-templates`);
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/mail-templates`);
    console.log('Templates fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
};

const UseTemplateButton = ({ handleChange }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const queryClient = useQueryClient();
  
  const {
    data: templates,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  });

  const handleRefresh = () => {
    console.log('Manually refreshing templates...');
    queryClient.invalidateQueries(['templates']);
    refetch();
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTemplateSelect = (template) => {
    console.log('Selected template:', template);
    console.log('Template body:', template.body);
    console.log('Template subject:', template.subject);
    
    // Apply template data
    handleChange('body', template.body || '');
    handleChange('subject', template.subject || '');
    handleChange('imagePosition', template?.imagePosition || 'top');
    handleChange('imageUrl', template?.imageUrl || '');
    handleChange('imageLink', template?.imageLink || '');
    handleChange('isImageClickable', template?.isImageClickable || false);
    handleChange('clickableImageText', template?.clickableImageText || '');
    
    handleClose();
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <CircularProgress />
      </div>
    );
  }

  if (isError) {
    return (
      <Typography
        color="error"
        variant="body1"
        style={{ textAlign: 'center', marginTop: '20px' }}
      >
        {t('templates.errorLoadingTemplates') || 'Error loading templates'}: 
        {error.message}
      </Typography>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Button variant="contained" onClick={handleClick}>
        Use Template ({templates?.length || 0})
      </Button>
      <IconButton onClick={handleRefresh} size="small" title="Refresh templates">
        <RefreshIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {templates && templates.length > 0 ? (
          templates.map((template) => (
            <MenuItem
              key={template._id}
              onClick={() => handleTemplateSelect(template)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {template.subject || template.name || 'Untitled Template'}
              {/* Stop propagation here to prevent selecting the template when deleting */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <DeleteTemplateButton templateId={template._id} />
              </div>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <Typography variant="body2" color="textSecondary">
              {t('templates.noTemplates') || 'No templates available'}
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

export default UseTemplateButton;
