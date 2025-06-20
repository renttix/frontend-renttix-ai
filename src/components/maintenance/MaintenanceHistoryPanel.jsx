import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Timeline } from 'primereact/timeline';
import { TabView, TabPanel } from 'primereact/tabview';
import { Image } from 'primereact/image';
import { Rating } from 'primereact/rating';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import axios from 'axios';
import { BaseURL } from '../../../utils/baseUrl';
import { useSelector } from 'react-redux';
import { formatDate } from '../../../utils/helper';
import './MaintenanceHistoryPanel.css';

const MaintenanceHistoryPanel = ({ orderId, orderDetails }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [dateFilter, setDateFilter] = useState([null, null]);
  const [activeTab, setActiveTab] = useState(0);
  
  const { token } = useSelector((state) => state?.authReducer);
  const toast = useRef(null);

  useEffect(() => {
    if (orderId) {
      fetchMaintenanceHistory();
      fetchStatistics();
    }
  }, [orderId, dateFilter]);

  const fetchMaintenanceHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFilter[0]) params.startDate = dateFilter[0].toISOString();
      if (dateFilter[1]) params.endDate = dateFilter[1].toISOString();

      const response = await axios.get(
        `${BaseURL}/maintenance/history/order/${orderId}`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setHistory(response.data.data.history || []);
    } catch (error) {
      console.error('Error fetching maintenance history:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch maintenance history',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const params = { orderId };
      if (dateFilter[0]) params.startDate = dateFilter[0].toISOString();
      if (dateFilter[1]) params.endDate = dateFilter[1].toISOString();

      const response = await axios.get(
        `${BaseURL}/maintenance/history/stats/summary`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const statusBodyTemplate = (rowData) => {
    const severity = {
      pending: 'warning',
      in_progress: 'info',
      completed: 'success',
      failed: 'danger',
      skipped: 'secondary'
    };
    
    return (
      <Tag 
        value={rowData.status} 
        severity={severity[rowData.status]}
        className="text-uppercase"
      />
    );
  };

  const dateBodyTemplate = (rowData) => {
    return (
      <div>
        <div className="font-semibold">{formatDate(rowData.serviceDate.scheduled)}</div>
        {rowData.serviceDate.completed && (
          <small className="text-gray-500">
            Completed: {formatDate(rowData.serviceDate.completed)}
          </small>
        )}
      </div>
    );
  };

  const durationBodyTemplate = (rowData) => {
    const planned = rowData.serviceDetails?.duration?.planned;
    const actual = rowData.serviceDetails?.duration?.actual;
    
    return (
      <div>
        {actual ? (
          <>
            <span className={actual > planned ? 'text-red-600' : 'text-green-600'}>
              {actual} min
            </span>
            <small className="text-gray-500 ml-1">
              (planned: {planned} min)
            </small>
          </>
        ) : (
          <span>{planned} min</span>
        )}
      </div>
    );
  };

  const completedByTemplate = (rowData) => {
    if (!rowData.completionDetails?.completedBy) return '-';
    
    return (
      <div>
        <div>{rowData.completionDetails.completedBy.name}</div>
        <small className="text-gray-500">
          {rowData.completionDetails.route?.routeName}
        </small>
      </div>
    );
  };

  const ratingTemplate = (rowData) => {
    if (!rowData.customerInteraction?.feedback?.rating) return '-';
    
    return (
      <Rating 
        value={rowData.customerInteraction.feedback.rating} 
        readOnly 
        cancel={false}
        stars={5}
      />
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-eye"
        className="p-button-text p-button-sm"
        onClick={() => {
          setSelectedRecord(rowData);
          setShowDetailDialog(true);
        }}
        tooltip="View Details"
      />
    );
  };

  const renderTimelineContent = (item) => {
    return (
      <Card className="timeline-card">
        <div className="flex justify-content-between align-items-center mb-2">
          <h4 className="m-0">{item.serviceDetails?.taskType || 'Service'}</h4>
          {statusBodyTemplate(item)}
        </div>
        <p className="text-gray-600 mb-2">
          {formatDate(item.serviceDate.scheduled)}
          {item.serviceDate.completed && (
            <span className="ml-2">
              • Completed in {item.actualDuration || item.serviceDetails?.duration?.actual} min
            </span>
          )}
        </p>
        {item.completionDetails?.completedBy && (
          <p className="text-sm">
            <i className="pi pi-user mr-1"></i>
            {item.completionDetails.completedBy.name}
          </p>
        )}
        {item.issues && item.issues.length > 0 && (
          <div className="mt-2">
            <Tag 
              icon="pi pi-exclamation-triangle" 
              severity="warning" 
              value={`${item.issues.length} issue(s)`}
            />
          </div>
        )}
      </Card>
    );
  };

  const header = (
    <div className="flex justify-content-between align-items-center">
      <h3 className="m-0">Maintenance History</h3>
      <div className="flex gap-2">
        <Calendar
          value={dateFilter}
          onChange={(e) => setDateFilter(e.value)}
          selectionMode="range"
          readOnlyInput
          placeholder="Filter by date"
          dateFormat="dd/mm/yy"
          showIcon
          className="date-filter"
        />
        <Button
          icon="pi pi-refresh"
          className="p-button-text"
          onClick={() => {
            fetchMaintenanceHistory();
            fetchStatistics();
          }}
          loading={loading}
        />
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      
      <Card className="maintenance-history-panel">
        {header}
        
        {/* Statistics Summary */}
        {statistics && (
          <div className="statistics-grid mb-4">
            <div className="stat-card">
              <div className="stat-value">{statistics.totalServices}</div>
              <div className="stat-label">Total Services</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{statistics.completedServices}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{statistics.completionRate}%</div>
              <div className="stat-label">Completion Rate</div>
              <ProgressBar 
                value={statistics.completionRate} 
                showValue={false}
                className="mt-2"
              />
            </div>
            <div className="stat-card">
              <div className="stat-value">{Math.round(statistics.averageServiceTime)} min</div>
              <div className="stat-label">Avg Service Time</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                <Rating 
                  value={statistics.averageRating} 
                  readOnly 
                  cancel={false}
                  stars={5}
                />
              </div>
              <div className="stat-label">Avg Rating</div>
            </div>
          </div>
        )}

        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
          <TabPanel header="Table View">
            <DataTable
              value={history || []}
              loading={loading}
              paginator
              rows={10}
              emptyMessage="No maintenance history found"
              className="p-datatable-sm"
            >
              <Column field="serviceDate" header="Date" body={dateBodyTemplate} />
              <Column field="serviceDetails.taskType" header="Task Type" />
              <Column field="status" header="Status" body={statusBodyTemplate} />
              <Column field="duration" header="Duration" body={durationBodyTemplate} />
              <Column field="completedBy" header="Completed By" body={completedByTemplate} />
              <Column field="rating" header="Rating" body={ratingTemplate} />
              <Column body={actionBodyTemplate} style={{ width: '4rem' }} />
            </DataTable>
          </TabPanel>
          
          <TabPanel header="Timeline View">
            <Timeline 
              value={history} 
              content={renderTimelineContent}
              className="maintenance-timeline"
            />
          </TabPanel>
        </TabView>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        visible={showDetailDialog}
        onHide={() => setShowDetailDialog(false)}
        header="Service Details"
        style={{ width: '70vw' }}
        maximizable
      >
        {selectedRecord && (
          <div className="service-detail-content">
            <TabView>
              <TabPanel header="General Info">
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <h4>Service Information</h4>
                    <div className="field">
                      <label>Task Type:</label>
                      <p>{selectedRecord.serviceDetails?.taskType}</p>
                    </div>
                    <div className="field">
                      <label>Priority:</label>
                      <Tag 
                        value={selectedRecord.serviceDetails?.priority} 
                        severity={
                          selectedRecord.serviceDetails?.priority === 'urgent' ? 'danger' :
                          selectedRecord.serviceDetails?.priority === 'high' ? 'warning' :
                          'info'
                        }
                      />
                    </div>
                    <div className="field">
                      <label>Status:</label>
                      {statusBodyTemplate(selectedRecord)}
                    </div>
                  </div>
                  
                  <div className="col-12 md:col-6">
                    <h4>Timing</h4>
                    <div className="field">
                      <label>Scheduled:</label>
                      <p>{formatDate(selectedRecord.serviceDate.scheduled)} {new Date(selectedRecord.serviceDate.scheduled).toLocaleTimeString()}</p>
                    </div>
                    {selectedRecord.serviceDate.started && (
                      <div className="field">
                        <label>Started:</label>
                        <p>{formatDate(selectedRecord.serviceDate.started)} {new Date(selectedRecord.serviceDate.started).toLocaleTimeString()}</p>
                      </div>
                    )}
                    {selectedRecord.serviceDate.completed && (
                      <div className="field">
                        <label>Completed:</label>
                        <p>{formatDate(selectedRecord.serviceDate.completed)} {new Date(selectedRecord.serviceDate.completed).toLocaleTimeString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabPanel>

              <TabPanel header="Service Checklist">
                {selectedRecord.serviceChecklist && selectedRecord.serviceChecklist.length > 0 ? (
                  <div className="checklist-items">
                    {selectedRecord.serviceChecklist.map((item, index) => (
                      <div key={index} className="checklist-item">
                        <i className={`pi ${item.checked ? 'pi-check-circle text-green-500' : 'pi-circle text-gray-400'} mr-2`}></i>
                        <span className={item.checked ? '' : 'text-gray-500'}>{item.item}</span>
                        {item.notes && (
                          <small className="block ml-4 text-gray-600">{item.notes}</small>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No checklist items</p>
                )}
              </TabPanel>

              <TabPanel header="Issues & Notes">
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <h4>Issues</h4>
                    {selectedRecord.issues && selectedRecord.issues.length > 0 ? (
                      selectedRecord.issues.map((issue, index) => (
                        <Card key={index} className="mb-2">
                          <div className="flex justify-content-between align-items-start">
                            <div>
                              <Tag value={issue.type} severity="warning" className="mb-2" />
                              <p>{issue.description}</p>
                              {issue.resolved && (
                                <small className="text-green-600">
                                  <i className="pi pi-check mr-1"></i>
                                  Resolved: {issue.resolutionNotes}
                                </small>
                              )}
                            </div>
                            <Tag 
                              value={issue.severity} 
                              severity={issue.severity === 'critical' ? 'danger' : 'warning'}
                            />
                          </div>
                        </Card>
                      ))
                    ) : (
                      <p className="text-gray-500">No issues reported</p>
                    )}
                  </div>
                  
                  <div className="col-12 md:col-6">
                    <h4>Notes</h4>
                    {selectedRecord.notes?.service && (
                      <div className="field">
                        <label>Service Notes:</label>
                        <p>{selectedRecord.notes.service}</p>
                      </div>
                    )}
                    {selectedRecord.notes?.followUp && (
                      <div className="field">
                        <label>Follow-up Required:</label>
                        <p className="text-orange-600">{selectedRecord.notes.followUp}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabPanel>

              <TabPanel header="Images & Documents">
                <div className="grid">
                  <div className="col-12">
                    <h4>Images</h4>
                    {selectedRecord.images && selectedRecord.images.length > 0 ? (
                      <div className="image-gallery">
                        {selectedRecord.images.map((img, index) => (
                          <div key={index} className="image-item">
                            <Image 
                              src={`${BaseURL}${img.url}`} 
                              alt={img.caption || img.type}
                              preview
                              className="service-image"
                            />
                            <div className="image-info">
                              <Tag value={img.type} />
                              {img.caption && <small>{img.caption}</small>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No images uploaded</p>
                    )}
                  </div>
                  
                  <div className="col-12 mt-4">
                    <h4>Documents</h4>
                    {selectedRecord.documents && selectedRecord.documents.length > 0 ? (
                      <div className="document-list">
                        {selectedRecord.documents.map((doc, index) => (
                          <div key={index} className="document-item">
                            <i className="pi pi-file-pdf mr-2"></i>
                            <a href={`${BaseURL}${doc.url}`} target="_blank" rel="noopener noreferrer">
                              {doc.name}
                            </a>
                            <Tag value={doc.type} className="ml-2" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No documents uploaded</p>
                    )}
                  </div>
                </div>
              </TabPanel>

              <TabPanel header="Customer Feedback">
                {selectedRecord.customerInteraction ? (
                  <div className="customer-feedback">
                    <div className="field">
                      <label>Customer Present:</label>
                      <p>{selectedRecord.customerInteraction.present ? 'Yes' : 'No'}</p>
                    </div>
                    
                    {selectedRecord.customerInteraction.name && (
                      <div className="field">
                        <label>Customer Name:</label>
                        <p>{selectedRecord.customerInteraction.name}</p>
                      </div>
                    )}
                    
                    {selectedRecord.customerInteraction.feedback && (
                      <>
                        <div className="field">
                          <label>Rating:</label>
                          <Rating 
                            value={selectedRecord.customerInteraction.feedback.rating} 
                            readOnly 
                            cancel={false}
                          />
                        </div>
                        
                        {selectedRecord.customerInteraction.feedback.comment && (
                          <div className="field">
                            <label>Comment:</label>
                            <p>{selectedRecord.customerInteraction.feedback.comment}</p>
                          </div>
                        )}
                      </>
                    )}
                    
                    {selectedRecord.customerInteraction.signature?.url && (
                      <div className="field">
                        <label>Customer Signature:</label>
                        <Image 
                          src={`${BaseURL}${selectedRecord.customerInteraction.signature.url}`} 
                          alt="Customer Signature"
                          preview
                          className="signature-image"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No customer feedback recorded</p>
                )}
              </TabPanel>
            </TabView>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default MaintenanceHistoryPanel;