import React from "react";
import { Card } from "primereact/card";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";

const DocumentUploader = ({ documents, onUpload, onRemove }) => {
  const handleUpload = (event) => {
    const files = event.files;
    const newDocuments = [...documents];
    
    files.forEach(file => {
      newDocuments.push({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date()
      });
    });
    
    onUpload(newDocuments);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type?.includes("pdf")) return "pi pi-file-pdf";
    if (type?.includes("image")) return "pi pi-image";
    if (type?.includes("word") || type?.includes("document")) return "pi pi-file-word";
    if (type?.includes("excel") || type?.includes("spreadsheet")) return "pi pi-file-excel";
    return "pi pi-file";
  };

  return (
    <Card title="Supporting Documents" className="mt-4">
      <FileUpload
        mode="basic"
        multiple
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        maxFileSize={10000000}
        onSelect={handleUpload}
        auto
        chooseLabel="Upload Documents"
        className="mb-3"
      />

      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <i className={`${getFileIcon(doc.type)} text-xl`}></i>
                <div>
                  <p className="font-medium text-sm">{doc.name}</p>
                  <p className="text-xs text-gray-600">{formatFileSize(doc.size)}</p>
                </div>
              </div>
              <Button
                icon="pi pi-times"
                rounded
                text
                severity="danger"
                size="small"
                onClick={() => onRemove(index)}
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default DocumentUploader;