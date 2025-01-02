import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button, Menu, MenuItem, CircularProgress, Typography } from '@mui/material';
import DeleteTemplateButton from './DeleteTemplateButton';
import { useTranslation } from 'react-i18next';
const fetchTemplates = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/mail-templates`);
  return response.data;
};

const UseTemplateButton = ({ handleChange }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const {
    data: templates,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTemplateSelect = (template) => {
    handleChange('body', template.body);
    handleChange('subject', template.subject);
    handleChange('imagePosition', template?.imagePosition);
    handleChange('imageUrl', template?.imageUrl);
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
    <div>
      <Button variant="contained" onClick={handleClick}>
        Use Template
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {templates.map((template) => (
          <MenuItem
            key={template._id}
            onClick={() => handleTemplateSelect(template)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {template.subject}
            {/* Stop propagation here to prevent selecting the template when deleting */}
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <DeleteTemplateButton templateId={template._id} />
            </div>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default UseTemplateButton;
