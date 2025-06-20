import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "primereact/button";
import { ProgressBar } from "primereact/progressbar";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiImage, FiUpload, FiX, FiMove, FiStar,
  FiVideo, FiFile, FiEye, FiDownload, FiCamera
} from "react-icons/fi";

export default function MediaStep({ 
  formData, 
  updateFormData, 
  files, 
  setFiles, 
  previews, 
  setPreviews 
}) {
  const [uploadProgress, setUploadProgress] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  
  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    
    acceptedFiles.forEach((file) => {
      if (newFiles.length < 10) { // Allow up to 10 files
        // Simulate upload progress
        const fileId = Date.now() + Math.random();
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            if (newProgress[fileId] < 100) {
              newProgress[fileId] += 10;
            } else {
              clearInterval(interval);
              delete newProgress[fileId];
            }
            return newProgress;
          });
        }, 100);
        
        newFiles.push(file);
        
        if (file.type.startsWith('image/')) {
          newPreviews.push({
            file,
            preview: URL.createObjectURL(file),
            type: 'image',
            id: fileId
          });
        } else if (file.type.startsWith('video/')) {
          newPreviews.push({
            file,
            preview: URL.createObjectURL(file),
            type: 'video',
            id: fileId
          });
        } else {
          newPreviews.push({
            file,
            preview: null,
            type: 'document',
            id: fileId
          });
        }
      }
    });
    
    setFiles(newFiles);
    setPreviews(newPreviews);
  }, [files, previews]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov'],
      'application/pdf': ['.pdf']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true
  });
  
  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // Clean up object URLs
    if (previews[index]?.preview) {
      URL.revokeObjectURL(previews[index].preview);
    }
    
    setFiles(newFiles);
    setPreviews(newPreviews);
  };
  
  const setPrimaryImage = (index) => {
    if (index === 0) return; // Already primary
    
    const newFiles = [...files];
    const newPreviews = [...previews];
    
    // Move to front
    const [file] = newFiles.splice(index, 1);
    const [preview] = newPreviews.splice(index, 1);
    
    newFiles.unshift(file);
    newPreviews.unshift(preview);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
  };
  
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem === null) return;
    
    const dragIndex = draggedItem;
    if (dragIndex === dropIndex) return;
    
    const newFiles = [...files];
    const newPreviews = [...previews];
    
    const [draggedFile] = newFiles.splice(dragIndex, 1);
    const [draggedPreview] = newPreviews.splice(dragIndex, 1);
    
    newFiles.splice(dropIndex, 0, draggedFile);
    newPreviews.splice(dropIndex, 0, draggedPreview);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
    setDraggedItem(null);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FiImage className="mr-3 text-blue-600" />
          Product Media
        </h2>
        <p className="mt-2 text-gray-600">
          Add images, videos, and documents to showcase your product
        </p>
      </div>
      
      {/* Media Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6"
      >
        <h3 className="font-semibold text-gray-900 mb-3">Media Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700 mb-1">Images</p>
            <ul className="text-gray-600 text-xs space-y-1">
              <li>• High resolution (min 800x600)</li>
              <li>• Multiple angles recommended</li>
              <li>• PNG, JPG, WebP formats</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">Videos</p>
            <ul className="text-gray-600 text-xs space-y-1">
              <li>• Max 2 minutes duration</li>
              <li>• Show product in action</li>
              <li>• MP4, AVI, MOV formats</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">Documents</p>
            <ul className="text-gray-600 text-xs space-y-1">
              <li>• User manuals</li>
              <li>• Safety certificates</li>
              <li>• PDF format preferred</li>
            </ul>
          </div>
        </div>
      </motion.div>
      
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-300
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          <div className={`
            w-20 h-20 rounded-full flex items-center justify-center mb-4
            ${isDragActive ? 'bg-blue-100' : 'bg-gray-200'}
          `}>
            <FiUpload className={`w-10 h-10 ${isDragActive ? 'text-blue-600' : 'text-gray-500'}`} />
          </div>
          
          <p className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse from your computer
          </p>
          
          <div className="flex items-center space-x-4">
            <Button
              label="Browse Files"
              icon={<FiFile className="mr-2" />}
              className="p-button-sm"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              label="Take Photo"
              icon={<FiCamera className="mr-2" />}
              className="p-button-sm p-button-outlined"
              onClick={(e) => {
                e.stopPropagation();
                setShowCamera(true);
              }}
            />
          </div>
          
          <p className="text-xs text-gray-400 mt-4">
            Maximum file size: 50MB | Up to 10 files
          </p>
        </div>
      </div>
      
      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <motion.div
              key={fileId}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-3 shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">Uploading...</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <ProgressBar value={progress} className="h-2" />
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Media Gallery */}
      {previews.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Uploaded Media ({previews.length}/10)
            </h3>
            <Button
              label="Clear All"
              icon={<FiX className="mr-2" />}
              className="p-button-text p-button-sm p-button-danger"
              onClick={() => {
                previews.forEach(p => p.preview && URL.revokeObjectURL(p.preview));
                setFiles([]);
                setPreviews([]);
              }}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AnimatePresence>
              {previews.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`
                    relative group rounded-lg overflow-hidden shadow-md
                    ${index === 0 ? 'ring-2 ring-blue-500' : ''}
                    ${draggedItem === index ? 'opacity-50' : ''}
                    cursor-move
                  `}
                >
                  {/* Media Preview */}
                  <div className="aspect-square bg-gray-100">
                    {item.type === 'image' && (
                      <img
                        src={item.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {item.type === 'video' && (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <FiVideo className="w-12 h-12 text-white" />
                      </div>
                    )}
                    {item.type === 'document' && (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiFile className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Primary Badge */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Primary
                    </div>
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center space-x-2">
                      <Button
                        icon={<FiEye />}
                        className="p-button-rounded p-button-sm p-button-text bg-white text-gray-700"
                        tooltip="Preview"
                        tooltipOptions={{ position: 'top' }}
                      />
                      {index !== 0 && (
                        <Button
                          icon={<FiStar />}
                          className="p-button-rounded p-button-sm p-button-text bg-white text-gray-700"
                          onClick={() => setPrimaryImage(index)}
                          tooltip="Set as primary"
                          tooltipOptions={{ position: 'top' }}
                        />
                      )}
                      <Button
                        icon={<FiX />}
                        className="p-button-rounded p-button-sm p-button-text bg-white text-red-600"
                        onClick={() => removeFile(index)}
                        tooltip="Remove"
                        tooltipOptions={{ position: 'top' }}
                      />
                    </div>
                  </div>
                  
                  {/* File Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                    <p className="text-white text-xs truncate">
                      {files[index]?.name}
                    </p>
                    <p className="text-white text-xs opacity-75">
                      {(files[index]?.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-blue-50 rounded-lg"
          >
            <p className="text-sm text-blue-900">
              <FiMove className="inline mr-2" />
              Drag and drop to reorder. The first image will be the primary display image.
            </p>
          </motion.div>
        </div>
      )}
      
      {/* Empty State */}
      {previews.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FiImage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No media uploaded yet</p>
          <p className="text-sm text-gray-400">
            Add images and videos to make your product more appealing
          </p>
        </div>
      )}
    </div>
  );
}