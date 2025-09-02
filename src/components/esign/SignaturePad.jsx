"use client";
import React, { useRef, useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import PropTypes from "prop-types";

const SignaturePad = ({
  onSignatureChange,
  width = 400,
  height = 200,
  penColor = "#000000",
  penWidth = 2,
  backgroundColor = "#ffffff",
  className = "",
}) => {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const loadSignaturePad = async () => {
      try {
        if (typeof window !== 'undefined') {
          console.log('Loading SignaturePad library...');
          const SignaturePadLib = (await import('signature_pad')).default;
          const canvas = canvasRef.current;

          if (!canvas) {
            console.error('Canvas element not found');
            return;
          }

          const ctx = canvas.getContext('2d');

          // Set canvas size with proper scaling
          canvas.width = width * window.devicePixelRatio || 1;
          canvas.height = height * window.devicePixelRatio || 1;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;

          // Scale the context for crisp drawing
          const scale = window.devicePixelRatio || 1;
          ctx.scale(scale, scale);

          console.log('Canvas setup:', {
            width: canvas.width,
            height: canvas.height,
            styleWidth: canvas.style.width,
            styleHeight: canvas.style.height,
            scale
          });

          // Create signature pad with better options
          signaturePadRef.current = new SignaturePadLib(canvas, {
            penColor,
            minWidth: penWidth,
            maxWidth: penWidth * 2,
            backgroundColor,
            throttle: 16, // Limit update frequency
            minDistance: 5, // Minimum distance to start a stroke
            velocityFilterWeight: 0.7, // Smoothing factor
          });

          // Listen for signature changes
          signaturePadRef.current.addEventListener('beginStroke', handleBeginStroke);
          signaturePadRef.current.addEventListener('endStroke', handleEndStroke);

          console.log('SignaturePad initialized successfully');

          // Test if signature pad is working by checking methods
          if (signaturePadRef.current) {
            console.log('Testing signature pad methods:');
            console.log('- isEmpty():', signaturePadRef.current.isEmpty());
            console.log('- toData() length:', signaturePadRef.current.toData().length);
          }

          // Force initial update after a short delay
          setTimeout(() => {
            console.log('Forcing initial signature status update');
            updateSignatureStatus(true);
          }, 200);
        }
      } catch (error) {
        console.error('Error loading SignaturePad:', error);
      }
    };

    loadSignaturePad();

    // Cleanup function
    return () => {
      if (signaturePadRef.current) {
        try {
          signaturePadRef.current.off('beginStroke', handleBeginStroke);
          signaturePadRef.current.off('endStroke', handleEndStroke);
        } catch (error) {
          console.warn('Error removing signature pad event listeners:', error);
        }
        signaturePadRef.current = null;
      }

      if (canvasRef.current) {
        canvasRef.current = null;
      }
    };
  }, [width, height, penColor, penWidth, backgroundColor]);

  const handleBeginStroke = () => {
    console.log('Signature stroke began');
    setIsDrawing(true);
  };

  const handleEndStroke = () => {
    console.log('Signature stroke ended');
    setIsDrawing(false);
    updateSignatureStatus();
  };

  // Mouse event handlers for debugging
  const handleMouseDown = (e) => {
    console.log('Mouse down on canvas:', { x: e.offsetX, y: e.offsetY });
  };

  const handleMouseMove = (e) => {
    // Only log if actually drawing
    if (isDrawing) {
      console.log('Mouse move while drawing:', { x: e.offsetX, y: e.offsetY });
    }
  };

  const handleMouseUp = (e) => {
    console.log('Mouse up on canvas');
  };

  // Touch event handlers for mobile devices
  const handleTouchStart = (e) => {
    e.preventDefault();
    console.log('Touch start on canvas');
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    console.log('Touch move on canvas');
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    console.log('Touch end on canvas');
    // Force update after touch to ensure signature detection
    setTimeout(() => updateSignatureStatus(true), 50);
  };

  const updateSignatureStatus = (force = false) => {
    // Skip if we're still drawing and not forced
    if (isDrawing && !force) return;

    const signature = signaturePadRef.current;
    if (!signature) return;

    const hasSign = !signature.isEmpty();
    setHasSignature(hasSign);

    if (onSignatureChange) {
      const signatureData = hasSign ? signature.toDataURL() : null;
      console.log('SignaturePad: updating signature status:', { hasSign, dataLength: signatureData?.length });
      onSignatureChange(signatureData, hasSign);
    }
  };

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setHasSignature(false);
      if (onSignatureChange) {
        console.log('SignaturePad: clearing signature');
        onSignatureChange(null, false);
      }
    }
  };

  const handleUndo = () => {
    if (signaturePadRef.current) {
      const data = signaturePadRef.current.toData();
      if (data && data.length > 0) {
        data.pop(); // Remove the last stroke
        signaturePadRef.current.fromData(data);
        updateSignatureStatus(true); // Force update even if drawing
      }
    }
  };

  return (
    <div className={className}>
      <Card className="p-4 border border-gray-200 rounded-lg">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold mb-2">Signature</h3>
          <p className="text-sm text-gray-600 mb-4">
            Please sign using your mouse, touchpad, or finger
          </p>
        </div>

        {/* Signature Canvas */}
        <div className="border border-gray-300 rounded-lg p-2 bg-white">
          <canvas
            ref={canvasRef}
            className="border border-gray-200 rounded cursor-crosshair"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              maxWidth: '100%',
              touchAction: 'none',
              backgroundColor: backgroundColor,
              cursor: 'crosshair',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <Button
              type="button"
              icon="pi pi-search"
              label="Check"
              tooltip="Check signature detection manually"
              tooltipOptions={{ position: 'top' }}
              className="p-button-secondary p-button-outlined"
              onClick={() => {
                const signature = signaturePadRef.current;
                if (signature) {
                  const hasSign = !signature.isEmpty();
                  const signatureData = hasSign ? signature.toDataURL() : null;
                  console.log('Manual signature check:', { hasSign, dataLength: signatureData?.length });
                  setHasSignature(hasSign);
                  if (onSignatureChange) {
                    onSignatureChange(signatureData, hasSign);
                  }
                }
              }}
            />

            <Button
              type="button"
              icon="pi pi-undo"
              tooltip="Undo last stroke"
              tooltipOptions={{ position: 'top' }}
              className="p-button-secondary p-button-outlined"
              onClick={handleUndo}
              disabled={!hasSignature}
            />

            <Button
              type="button"
              icon="pi pi-trash"
              tooltip="Clear signature"
              tooltipOptions={{ position: 'top' }}
              className="p-button-secondary p-button-outlined"
              onClick={handleClear}
              disabled={!hasSignature}
            />
          </div>

          {/* Drawing Status */}
          {isDrawing && (
            <div className="text-sm text-blue-600 flex items-center gap-1">
              <i className="pi pi-spin pi-spinner"></i>
              Drawing...
            </div>
          )}

          {hasSignature && !isDrawing && (
            <div className="text-sm text-green-600 flex items-center gap-1">
              <i className="pi pi-check"></i>
              Signature captured
            </div>
          )}

          {!hasSignature && !isDrawing && (
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <i className="pi pi-pencil"></i>
              Ready to sign
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-xs text-blue-700">
            <strong>Tips:</strong>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Use a smooth, natural writing motion</li>
              <li>Make sure your signature is legible and complete</li>
              <li>You can erase and start over if needed</li>
              <li>Once signed, you can submit the document</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

SignaturePad.propTypes = {
  onSignatureChange: PropTypes.func,
  width: PropTypes.number,
  height: PropTypes.number,
  penColor: PropTypes.string,
  penWidth: PropTypes.number,
  backgroundColor: PropTypes.string,
  className: PropTypes.string,
};

export default SignaturePad;