"use client";
import React, { useState, useRef, useCallback } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { Dialog } from 'primereact/dialog';
import { Image } from 'primereact/image';
import { motion, AnimatePresence } from 'framer-motion';

const FileAttachmentZone = ({ 
  onFilesChange,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.xls', '.xlsx'],
  existingFiles = [],
  className = ""
}) => {
  const [files, setFiles] = useState(existingFiles);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const fileUploadRef = useRef(null);

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return 'pi-file-pdf';
      case 'doc':
      case 'docx': return 'pi-file-word';
      case 'xls':
      case 'xlsx': return 'pi-file-excel';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'pi-image';
      default: return 'pi-file';
    }
  };

  const getFileTypeColor = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return 'danger';
      case 'doc':
      case 'docx': return 'info';
      case 'xls':
      case 'xlsx': return 'success';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'warning';
      default: return 'secondary';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize) {
      return { valid: false, error: `File size exceeds ${formatFileSize(maxSize)}` };
    }

    // Check file type
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      return { valid: false, error: `File type ${extension} not accepted` };
    }

    // Check duplicate
    if (files.some(f => f.name === file.name)) {
      return { valid: false, error: 'File already uploaded' };
    }

    return { valid: true };
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, [files]);

  const handleFiles = (newFiles) => {
    const validFiles = [];
    const errors = [];

    newFiles.forEach(file => {
      if (files.length + validFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const validation = validateFile(file);
      if (validation.valid) {
        // Add file metadata
        const fileWithMeta = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          file: file,
          id: Date.now() + Math.random(),
          uploadProgress: 0
        };
        validFiles.push(fileWithMeta);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
      
      // Simulate upload progress
      validFiles.forEach(file => {
        simulateUpload(file.id);
      });
    }

    if (errors.length > 0) {
      // Show errors (you might want to use a toast notification here)
      console.error('File upload errors:', errors);
    }
  };

  const simulateUpload = (fileId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 200);
  };

  const removeFile = (fileId) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    
    // Clean up upload progress
    const newProgress = { ...uploadProgress };
    delete newProgress[fileId];
    setUploadProgress(newProgress);
  };

  const handlePreviewFile = (file) => {
    setPreviewFile(file);
    setShowPreviewDialog(true);
  };

  const canPreview = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'pdf'].includes(extension);
  };

  const customUpload = (event) => {
    handleFiles(event.files);
  };

  return (
    <div className={`file-attachment-zone ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary-50' : 'border-gray-300 bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <FileUpload
          ref={fileUploadRef}
          mode="basic"
          multiple
          accept={acceptedTypes.join(',')}
          maxFileSize={maxSize}
          customUpload
          uploadHandler={customUpload}
          auto
          chooseLabel="Choose Files"
          className="hidden"
        />

        <div className="space-y-4">
          <div>
            <i className="pi pi-cloud-upload text-4xl text-gray-400"></i>
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              Drag and drop files here
            </p>
            <p className="text-sm text-gray-500 mt-1">or</p>
            <Button
              label="Browse Files"
              icon="pi pi-folder-open"
              severity="secondary"
              className="mt-2"
              onClick={() => fileUploadRef.current.getInput().click()}
            />
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Accepted formats: {acceptedTypes.join(', ')}</p>
            <p>Max file size: {formatFileSize(maxSize)}</p>
            <p>Max files: {maxFiles}</p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold text-sm">Uploaded Files ({files.length}/{maxFiles})</h4>
          <AnimatePresence>
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white border rounded-lg p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <i className={`pi ${getFileIcon(file.name)} text-2xl`}></i>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate max-w-xs">
                          {file.name}
                        </p>
                        <Tag 
                          value={file.name.split('.').pop().toUpperCase()} 
                          severity={getFileTypeColor(file.name)}
                          className="text-xs"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                      
                      {uploadProgress[file.id] !== undefined && uploadProgress[file.id] < 100 && (
                        <ProgressBar 
                          value={uploadProgress[file.id]} 
                          showValue={false}
                          style={{ height: '4px', marginTop: '4px' }}
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {canPreview(file.name) && uploadProgress[file.id] === 100 && (
                      <Button
                        icon="pi pi-eye"
                        rounded
                        text
                        size="small"
                        onClick={() => handlePreviewFile(file)}
                        tooltip="Preview"
                      />
                    )}
                    <Button
                      icon="pi pi-times"
                      rounded
                      text
                      severity="danger"
                      size="small"
                      onClick={() => removeFile(file.id)}
                      tooltip="Remove"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog
        visible={showPreviewDialog}
        onHide={() => setShowPreviewDialog(false)}
        header={previewFile?.name}
        style={{ width: '80vw', maxWidth: '800px' }}
        modal
      >
        {previewFile && (
          <div className="text-center">
            {previewFile.name.match(/\.(jpg|jpeg|png)$/i) ? (
              <Image 
                src={URL.createObjectURL(previewFile.file)} 
                alt={previewFile.name}
                width="100%"
                preview
              />
            ) : previewFile.name.match(/\.pdf$/i) ? (
              <div className="bg-gray-100 p-8 rounded">
                <i className="pi pi-file-pdf text-6xl text-red-500 mb-4"></i>
                <p className="text-gray-600">PDF preview not available</p>
                <Button
                  label="Download to view"
                  icon="pi pi-download"
                  className="mt-4"
                  size="small"
                  onClick={() => {
                    const url = URL.createObjectURL(previewFile.file);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = previewFile.name;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                />
              </div>
            ) : (
              <div className="bg-gray-100 p-8 rounded">
                <i className={`pi ${getFileIcon(previewFile.name)} text-6xl text-gray-500 mb-4`}></i>
                <p className="text-gray-600">Preview not available for this file type</p>
              </div>
            )}
          </div>
        )}
      </Dialog>

      {files.length === 0 && (
        <Message 
          severity="info" 
          text="No files attached yet. Drag and drop or click to browse."
          className="mt-4"
        />
      )}
    </div>
  );
};

export default React.memo(FileAttachmentZone);