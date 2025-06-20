import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Image } from 'primereact/image';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';
import PropTypes from 'prop-types';
import { BaseURL } from '../../../../../utils/baseUrl';

const ProductAttachmentViewer = ({ visible, onHide, product }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  if (!product || !product.attachments || product.attachments.length === 0) {
    return null;
  }

  const getFileIcon = (fileType) => {
    const iconMap = {
      'pdf': 'pi pi-file-pdf',
      'doc': 'pi pi-file-word',
      'docx': 'pi pi-file-word',
      'xls': 'pi pi-file-excel',
      'xlsx': 'pi pi-file-excel',
      'jpg': 'pi pi-image',
      'jpeg': 'pi pi-image',
      'png': 'pi pi-image',
      'gif': 'pi pi-image',
      'txt': 'pi pi-file',
      'csv': 'pi pi-file',
      'zip': 'pi pi-file-zip',
      'rar': 'pi pi-file-zip'
    };
    
    const extension = fileType?.toLowerCase() || '';
    return iconMap[extension] || 'pi pi-file';
  };

  const getFileTypeTag = (fileType) => {
    const typeConfig = {
      'pdf': { label: 'PDF', severity: 'danger' },
      'doc': { label: 'DOC', severity: 'info' },
      'docx': { label: 'DOCX', severity: 'info' },
      'xls': { label: 'XLS', severity: 'success' },
      'xlsx': { label: 'XLSX', severity: 'success' },
      'jpg': { label: 'JPG', severity: 'warning' },
      'jpeg': { label: 'JPEG', severity: 'warning' },
      'png': { label: 'PNG', severity: 'warning' },
      'gif': { label: 'GIF', severity: 'warning' },
      'txt': { label: 'TXT', severity: 'secondary' },
      'csv': { label: 'CSV', severity: 'secondary' },
      'zip': { label: 'ZIP', severity: 'secondary' },
      'rar': { label: 'RAR', severity: 'secondary' }
    };
    
    const extension = fileType?.toLowerCase() || '';
    const config = typeConfig[extension] || { label: extension.toUpperCase(), severity: 'secondary' };
    
    return <Tag value={config.label} severity={config.severity} />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleDownload = (attachment) => {
    const downloadUrl = `${BaseURL}/api/products/attachments/${attachment._id}/download`;
    window.open(downloadUrl, '_blank');
  };

  const handlePreview = (attachment) => {
    const previewableTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
    const extension = attachment.fileType?.toLowerCase() || '';
    
    if (previewableTypes.includes(extension)) {
      setPreviewUrl(`${BaseURL}/api/products/attachments/${attachment._id}/preview`);
      setPreviewType(extension);
    } else {
      // For non-previewable files, trigger download
      handleDownload(attachment);
    }
  };

  const fileNameTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-2">
        <i className={`${getFileIcon(rowData.fileType)} text-2xl`}></i>
        <div>
          <div className="font-semibold">{rowData.name}</div>
          {rowData.description && (
            <div className="text-sm text-500">{rowData.description}</div>
          )}
        </div>
      </div>
    );
  };

  const fileTypeTemplate = (rowData) => {
    return getFileTypeTag(rowData.fileType);
  };

  const fileSizeTemplate = (rowData) => {
    return formatFileSize(rowData.size);
  };

  const uploadDateTemplate = (rowData) => {
    if (!rowData.uploadedAt) return 'Unknown';
    return new Date(rowData.uploadedAt).toLocaleDateString();
  };

  const actionsTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          className="p-button-text p-button-sm"
          onClick={() => handlePreview(rowData)}
          tooltip="Preview"
        />
        <Button
          icon="pi pi-download"
          className="p-button-text p-button-sm"
          onClick={() => handleDownload(rowData)}
          tooltip="Download"
        />
      </div>
    );
  };

  // Group attachments by category
  const groupedAttachments = product.attachments.reduce((acc, attachment) => {
    const category = attachment.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(attachment);
    return acc;
  }, {});

  const categories = Object.keys(groupedAttachments);

  return (
    <>
      <Dialog
        header={`Attachments for ${product.name}`}
        visible={visible}
        style={{ width: '60vw' }}
        onHide={onHide}
        maximizable
      >
        {categories.length > 1 ? (
          <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
            {categories.map((category, index) => (
              <TabPanel key={category} header={`${category} (${groupedAttachments[category].length})`}>
                <DataTable
                  value={groupedAttachments[category]}
                  className="p-datatable-sm"
                  emptyMessage="No attachments in this category"
                >
                  <Column header="File" body={fileNameTemplate} />
                  <Column header="Type" body={fileTypeTemplate} style={{ width: '100px' }} />
                  <Column header="Size" body={fileSizeTemplate} style={{ width: '120px' }} />
                  <Column header="Uploaded" body={uploadDateTemplate} style={{ width: '120px' }} />
                  <Column header="Actions" body={actionsTemplate} style={{ width: '120px' }} />
                </DataTable>
              </TabPanel>
            ))}
          </TabView>
        ) : (
          <DataTable
            value={product.attachments}
            className="p-datatable-sm"
            emptyMessage="No attachments available"
          >
            <Column header="File" body={fileNameTemplate} />
            <Column header="Type" body={fileTypeTemplate} style={{ width: '100px' }} />
            <Column header="Size" body={fileSizeTemplate} style={{ width: '120px' }} />
            <Column header="Uploaded" body={uploadDateTemplate} style={{ width: '120px' }} />
            <Column header="Actions" body={actionsTemplate} style={{ width: '120px' }} />
          </DataTable>
        )}

        {/* Quick Info Card */}
        <Card className="mt-3">
          <div className="grid">
            <div className="col-12 md:col-4">
              <div className="text-500 text-sm">Total Attachments</div>
              <div className="text-2xl font-semibold">{product.attachments.length}</div>
            </div>
            <div className="col-12 md:col-4">
              <div className="text-500 text-sm">Total Size</div>
              <div className="text-2xl font-semibold">
                {formatFileSize(product.attachments.reduce((sum, att) => sum + (att.size || 0), 0))}
              </div>
            </div>
            <div className="col-12 md:col-4">
              <div className="text-500 text-sm">Categories</div>
              <div className="text-2xl font-semibold">{categories.length}</div>
            </div>
          </div>
        </Card>
      </Dialog>

      {/* Preview Dialog */}
      {previewUrl && (
        <Dialog
          header="Preview"
          visible={!!previewUrl}
          style={{ width: '80vw', height: '80vh' }}
          onHide={() => {
            setPreviewUrl(null);
            setPreviewType(null);
          }}
          maximizable
        >
          {['jpg', 'jpeg', 'png', 'gif'].includes(previewType) ? (
            <div className="text-center">
              <Image
                src={previewUrl}
                alt="Preview"
                preview
                style={{ maxWidth: '100%', maxHeight: '70vh' }}
              />
            </div>
          ) : previewType === 'pdf' ? (
            <iframe
              src={previewUrl}
              style={{ width: '100%', height: '70vh', border: 'none' }}
              title="PDF Preview"
            />
          ) : (
            <div className="text-center py-5">
              <i className="pi pi-file text-4xl text-300 mb-3"></i>
              <p className="text-500">Preview not available for this file type</p>
              <Button
                label="Download File"
                icon="pi pi-download"
                className="mt-2"
                onClick={() => {
                  const attachment = product.attachments.find(a => 
                    `${BaseURL}/api/products/attachments/${a._id}/preview` === previewUrl
                  );
                  if (attachment) handleDownload(attachment);
                }}
              />
            </div>
          )}
        </Dialog>
      )}
    </>
  );
};

ProductAttachmentViewer.propTypes = {
  visible: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  product: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    attachments: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      description: PropTypes.string,
      fileType: PropTypes.string,
      size: PropTypes.number,
      category: PropTypes.string,
      uploadedAt: PropTypes.string
    }))
  })
};

export default React.memo(ProductAttachmentViewer);