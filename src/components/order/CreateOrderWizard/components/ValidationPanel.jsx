"use client";
import React, { useState } from 'react';
import { Panel } from 'primereact/panel';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Badge } from 'primereact/badge';
import { Dialog } from 'primereact/dialog';
import { motion, AnimatePresence } from 'framer-motion';

const ValidationPanel = ({ 
  warnings = [], 
  acknowledgedWarnings = new Set(),
  onAcknowledge,
  className = "" 
}) => {
  const [expandedWarnings, setExpandedWarnings] = useState(new Set());
  const [selectedWarning, setSelectedWarning] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const getWarningSeverity = (warning) => {
    switch (warning.severity) {
      case 'critical': return 'error';
      case 'high': return 'warn';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'warn';
    }
  };

  const getWarningIcon = (warning) => {
    switch (warning.type) {
      case 'availability': return 'pi-calendar-times';
      case 'pricing': return 'pi-pound';
      case 'delivery': return 'pi-truck';
      case 'customer': return 'pi-user';
      case 'product': return 'pi-box';
      case 'payment': return 'pi-credit-card';
      default: return 'pi-exclamation-triangle';
    }
  };

  const toggleWarningExpanded = (warningId) => {
    const newExpanded = new Set(expandedWarnings);
    if (newExpanded.has(warningId)) {
      newExpanded.delete(warningId);
    } else {
      newExpanded.add(warningId);
    }
    setExpandedWarnings(newExpanded);
  };

  const handleAcknowledge = (warningId) => {
    onAcknowledge(warningId);
  };

  const showWarningDetail = (warning) => {
    setSelectedWarning(warning);
    setShowDetailDialog(true);
  };

  const unacknowledgedCount = warnings.filter(w => !acknowledgedWarnings.has(w.id)).length;
  const criticalCount = warnings.filter(w => w.severity === 'critical' && !acknowledgedWarnings.has(w.id)).length;

  const header = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <i className="pi pi-exclamation-triangle text-orange-500"></i>
        <span className="font-semibold">Validation Warnings</span>
        {unacknowledgedCount > 0 && (
          <Badge value={unacknowledgedCount} severity="warning" />
        )}
      </div>
      {criticalCount > 0 && (
        <span className="text-sm text-red-600 font-medium">
          {criticalCount} critical warning{criticalCount > 1 ? 's' : ''} require acknowledgment
        </span>
      )}
    </div>
  );

  if (warnings.length === 0) {
    return null;
  }

  return (
    <>
      <Panel header={header} className={`validation-panel ${className}`} toggleable>
        <div className="space-y-3">
          <AnimatePresence>
            {warnings.map((warning) => {
              const isAcknowledged = acknowledgedWarnings.has(warning.id);
              const isExpanded = expandedWarnings.has(warning.id);
              
              return (
                <motion.div
                  key={warning.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`border rounded-lg p-3 ${
                    isAcknowledged ? 'bg-gray-50 border-gray-300' : 
                    warning.severity === 'critical' ? 'bg-red-50 border-red-300' :
                    warning.severity === 'high' ? 'bg-orange-50 border-orange-300' :
                    'bg-yellow-50 border-yellow-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <i className={`pi ${getWarningIcon(warning)} text-lg ${
                      isAcknowledged ? 'text-gray-500' :
                      warning.severity === 'critical' ? 'text-red-600' :
                      warning.severity === 'high' ? 'text-orange-600' :
                      'text-yellow-600'
                    }`}></i>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-semibold ${isAcknowledged ? 'text-gray-600' : ''}`}>
                            {warning.title}
                          </h4>
                          <p className={`text-sm mt-1 ${isAcknowledged ? 'text-gray-500' : 'text-gray-700'}`}>
                            {warning.message}
                          </p>
                          
                          {warning.details && isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 text-sm text-gray-600"
                            >
                              <div className="bg-white bg-opacity-50 rounded p-2">
                                {warning.details}
                              </div>
                            </motion.div>
                          )}
                          
                          {warning.suggestion && (
                            <div className="mt-2 flex items-start gap-2">
                              <i className="pi pi-lightbulb text-blue-500 text-sm mt-0.5"></i>
                              <p className="text-sm text-blue-700">
                                <span className="font-medium">Suggestion:</span> {warning.suggestion}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-3">
                          {warning.details && (
                            <Button
                              icon={isExpanded ? "pi pi-chevron-up" : "pi pi-chevron-down"}
                              rounded
                              text
                              size="small"
                              onClick={() => toggleWarningExpanded(warning.id)}
                              tooltip={isExpanded ? "Hide details" : "Show details"}
                            />
                          )}
                          <Button
                            icon="pi pi-info-circle"
                            rounded
                            text
                            size="small"
                            onClick={() => showWarningDetail(warning)}
                            tooltip="More information"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            inputId={`ack-${warning.id}`}
                            checked={isAcknowledged}
                            onChange={() => handleAcknowledge(warning.id)}
                            disabled={isAcknowledged}
                          />
                          <label 
                            htmlFor={`ack-${warning.id}`} 
                            className={`text-sm cursor-pointer ${
                              isAcknowledged ? 'text-gray-500' : 'font-medium'
                            }`}
                          >
                            {isAcknowledged ? 'Acknowledged' : 'I acknowledge this warning'}
                          </label>
                        </div>
                        
                        {warning.action && !isAcknowledged && (
                          <Button
                            label={warning.action.label}
                            icon={warning.action.icon}
                            size="small"
                            severity="secondary"
                            outlined
                            onClick={warning.action.onClick}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {unacknowledgedCount > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <i className="pi pi-info-circle text-blue-600"></i>
                <p className="text-sm text-blue-800">
                  Please acknowledge all warnings before proceeding. 
                  {criticalCount > 0 && (
                    <span className="font-medium">
                      {' '}Critical warnings must be addressed.
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </Panel>

      <Dialog
        visible={showDetailDialog}
        onHide={() => setShowDetailDialog(false)}
        header={selectedWarning?.title}
        style={{ width: '500px' }}
        modal
      >
        {selectedWarning && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <i className={`pi ${getWarningIcon(selectedWarning)} text-2xl ${
                selectedWarning.severity === 'critical' ? 'text-red-600' :
                selectedWarning.severity === 'high' ? 'text-orange-600' :
                'text-yellow-600'
              }`}></i>
              <div>
                <p className="font-medium">{selectedWarning.type.charAt(0).toUpperCase() + selectedWarning.type.slice(1)} Warning</p>
                <p className="text-sm text-gray-500">Severity: {selectedWarning.severity}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-700">{selectedWarning.message}</p>
            </div>
            
            {selectedWarning.details && (
              <div>
                <h4 className="font-semibold mb-2">Details</h4>
                <p className="text-gray-700">{selectedWarning.details}</p>
              </div>
            )}
            
            {selectedWarning.impact && (
              <div>
                <h4 className="font-semibold mb-2">Potential Impact</h4>
                <p className="text-gray-700">{selectedWarning.impact}</p>
              </div>
            )}
            
            {selectedWarning.suggestion && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-semibold mb-2 text-blue-800">
                  <i className="pi pi-lightbulb mr-2"></i>
                  Recommended Action
                </h4>
                <p className="text-blue-700">{selectedWarning.suggestion}</p>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                label="Close"
                severity="secondary"
                outlined
                onClick={() => setShowDetailDialog(false)}
              />
              {!acknowledgedWarnings.has(selectedWarning.id) && (
                <Button
                  label="Acknowledge & Close"
                  icon="pi pi-check"
                  onClick={() => {
                    handleAcknowledge(selectedWarning.id);
                    setShowDetailDialog(false);
                  }}
                />
              )}
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default React.memo(ValidationPanel);