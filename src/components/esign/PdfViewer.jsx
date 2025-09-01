"use client";
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

const PdfViewer = ({
  pdfUrl,
  width = "100%",
  height = 600,
  onDocumentLoad = () => {},
  onError = () => {},
  className = "",
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfDocument, setPdfDocument] = useState(null);

  useEffect(() => {
    loadPdfJs();
  }, []);

  useEffect(() => {
    if (pdfUrl) {
      loadPdfDocument();
    }
  }, [pdfUrl]);

  const loadPdfJs = async () => {
    try {
      if (typeof window !== 'undefined') {
        const pdfjsLib = await import('pdfjs-dist');
        const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
      }
    } catch (error) {
      console.error('Error loading PDF.js:', error);
      onError(error);
      setError(error.message);
    }
  };

  const loadPdfDocument = async () => {
    try {
      setLoading(true);
      setError(null);

      const pdfjsLib = await import('pdfjs-dist');
      const loadingTask = pdfjsLib.getDocument(pdfUrl);

      const pdf = await loadingTask.promise;
      setPdfDocument(pdf);
      setNumPages(pdf.numPages);
      onDocumentLoad({ numPages: pdf.numPages });

    } catch (error) {
      console.error('Error loading PDF document:', error);
      onError(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pdfDocument && currentPage) {
      renderPage(currentPage);
    }
  }, [pdfDocument, currentPage]);

  const renderPage = async (pageNumber) => {
    try {
      setLoading(true);
      const page = await pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 }); // Scale for crisp rendering

      const canvas = canvasRef.current;
      const canvasContext = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      canvas.style.width = '100%';
      canvas.style.height = 'auto';

      const renderContext = {
        canvasContext,
        viewport,
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering PDF page:', error);
      setError('Failed to render PDF page');
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= numPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center border border-red-300 rounded-lg p-8 bg-red-50 ${className}`}>
        <div className="text-center">
          <i className="pi pi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <h3 className="text-lg font-semibold text-red-800 mb-2">PDF Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadPdfDocument}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`pdf-viewer ${className}`}>
      {/* PDF Canvas */}
      <div
        ref={containerRef}
        className="relative bg-white border border-gray-200 rounded-lg overflow-hidden"
        style={{ width, height: loading ? height : 'auto' }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin border-4 border-blue-600 border-t-transparent rounded-full w-8 h-8 mb-2"></div>
              <span className="text-sm text-gray-600">Loading PDF...</span>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="w-full h-auto block"
          style={{ display: loading ? 'none' : 'block' }}
        />
      </div>

      {/* Navigation Controls */}
      {numPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="pi pi-chevron-left mr-1"></i>
            Previous
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Page</span>
            <input
              type="number"
              min="1"
              max={numPages}
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value, 10))}
              className="w-16 text-center px-2 py-1 border border-gray-300 rounded text-sm"
              disabled={loading}
            />
            <span className="text-sm text-gray-700">of {numPages}</span>
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage === numPages}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <i className="pi pi-chevron-right ml-1"></i>
          </button>
        </div>
      )}

      {/* PDF Info */}
      {pdfDocument && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Document loaded • {numPages} pages • Page {currentPage} of {numPages}
        </div>
      )}
    </div>
  );
};

PdfViewer.propTypes = {
  pdfUrl: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onDocumentLoad: PropTypes.func,
  onError: PropTypes.func,
  className: PropTypes.string,
};

export default PdfViewer;