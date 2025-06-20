import React, { useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { BaseURL } from '../../../../utils/baseUrl';
import { useSelector } from 'react-redux';
import { Button } from 'primereact/button';

function ExportData({route,nameFile}) {
    const { token } = useSelector((state) => state?.authReducer);
    const [loading, setloading] = useState(false)

  const handleDownload = async () => {
    setloading(true)
    try {
        const response = await axios.get(`${BaseURL}${route}`, {
            responseType: 'blob',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          setloading(false)

      const contentDisposition = response.headers['content-disposition'];
      let filename = `${nameFile}.csv`; // Default filename
      if (contentDisposition) {
        const matches = /filename="([^"]*)"/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      // Create a Blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });

      // Save the Blob as a file
      saveAs(blob, filename);
    } catch (error) {
        setloading(false)

      console.error('Error downloading the file:', error);
    }
  };

  return (
      <Button
              label="Export"
              loading={loading}
              icon="pi pi-upload"
              className="p-button-help"
              onClick={handleDownload}
            />
  );
}

export default ExportData;
