import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Badge } from 'primereact/badge';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import BaseWidget from '../BaseWidget';
import { formatDate } from '../../../utils/formatters';

const CustomerMessagesWidget = ({ widgetId, config = {} }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState(null);
  const [replyDialog, setReplyDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const toast = useRef(null);

  // Fetch customer messages
  useEffect(() => {
    fetchCustomerMessages();
    
    // Set up refresh interval if configured
    const refreshInterval = config.refreshInterval || 60000; // 1 minute default for messages
    const interval = setInterval(fetchCustomerMessages, refreshInterval);
    
    return () => clearInterval(interval);
  }, [config]);

  const fetchCustomerMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params based on config
      const params = new URLSearchParams();
      params.append('limit', config.limit || 50);
      params.append('status', config.status || 'unresolved');
      if (config.priority) params.append('priority', config.priority);
      if (config.channel) params.append('channel', config.channel);
      
      const response = await fetch(`/api/widget-data/customer-messages?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load customer messages',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Customer name template with unread badge
  const customerBodyTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-2">
        <div className="flex flex-column">
          <span className="font-semibold">{rowData.customerName}</span>
          {rowData.companyName && (
            <span className="text-sm text-500">{rowData.companyName}</span>
          )}
        </div>
        {rowData.unread && (
          <Badge value="New" severity="danger" />
        )}
      </div>
    );
  };

  // Message preview template
  const messageBodyTemplate = (rowData) => {
    const preview = rowData.message.length > 100 
      ? rowData.message.substring(0, 100) + '...' 
      : rowData.message;
    
    return (
      <div className="flex flex-column">
        <span className={rowData.unread ? 'font-semibold' : ''}>{preview}</span>
        {rowData.subject && (
          <span className="text-sm text-500 mt-1">{rowData.subject}</span>
        )}
      </div>
    );
  };

  // Date template
  const dateBodyTemplate = (rowData) => {
    const date = new Date(rowData.createdAt);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    let timeAgo;
    if (diffHours < 1) {
      const diffMinutes = Math.floor((now - date) / (1000 * 60));
      timeAgo = diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      timeAgo = diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else {
      timeAgo = formatDate(rowData.createdAt);
    }
    
    return (
      <span className={rowData.unread ? 'font-semibold' : ''}>{timeAgo}</span>
    );
  };

  // Priority template
  const priorityBodyTemplate = (rowData) => {
    const severityMap = {
      'high': 'danger',
      'medium': 'warning',
      'low': 'info'
    };
    
    return (
      <Tag 
        value={rowData.priority} 
        severity={severityMap[rowData.priority] || 'info'}
        style={{ textTransform: 'capitalize' }}
      />
    );
  };

  // Channel template
  const channelBodyTemplate = (rowData) => {
    const iconMap = {
      'email': 'pi-envelope',
      'sms': 'pi-mobile',
      'whatsapp': 'pi-whatsapp',
      'phone': 'pi-phone',
      'chat': 'pi-comments'
    };
    
    return (
      <div className="flex align-items-center gap-2">
        <i className={`pi ${iconMap[rowData.channel] || 'pi-comment'}`} />
        <span style={{ textTransform: 'capitalize' }}>{rowData.channel}</span>
      </div>
    );
  };

  // Actions template
  const actionsBodyTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-reply"
        className="p-button-text p-button-sm"
        onClick={() => handleReply(rowData)}
        tooltip="Quick Reply"
        tooltipOptions={{ position: 'top' }}
      />
    );
  };

  // Row expansion template
  const rowExpansionTemplate = (data) => {
    return (
      <div className="p-3">
        <div className="surface-100 border-round p-3">
          <div className="mb-3">
            <h6 className="mt-0 mb-2">Full Message:</h6>
            <p className="m-0 line-height-3">{data.message}</p>
          </div>
          
          {data.attachments && data.attachments.length > 0 && (
            <div className="mb-3">
              <h6 className="mb-2">Attachments:</h6>
              <div className="flex gap-2">
                {data.attachments.map((attachment, index) => (
                  <Tag key={index} value={attachment.name} icon="pi pi-paperclip" />
                ))}
              </div>
            </div>
          )}
          
          {data.previousMessages && data.previousMessages.length > 0 && (
            <div>
              <h6 className="mb-2">Conversation History:</h6>
              <div className="flex flex-column gap-2">
                {data.previousMessages.map((msg, index) => (
                  <div key={index} className={`p-2 border-round ${msg.fromCustomer ? 'surface-200' : 'surface-50'}`}>
                    <div className="flex justify-content-between mb-1">
                      <span className="font-semibold text-sm">
                        {msg.fromCustomer ? data.customerName : 'Support'}
                      </span>
                      <span className="text-sm text-500">{formatDate(msg.date)}</span>
                    </div>
                    <p className="m-0 text-sm">{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleReply = (message) => {
    setSelectedMessage(message);
    setReplyText('');
    setReplyDialog(true);
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    
    setSendingReply(true);
    try {
      const response = await fetch(`/api/messages/${selectedMessage._id}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: replyText,
          channel: selectedMessage.channel
        })
      });
      
      if (!response.ok) throw new Error('Failed to send reply');
      
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Reply sent successfully',
        life: 3000
      });
      
      setReplyDialog(false);
      // Mark message as read/resolved
      fetchCustomerMessages();
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to send reply',
        life: 3000
      });
    } finally {
      setSendingReply(false);
    }
  };

  // Loading skeleton
  const loadingTemplate = () => {
    return <Skeleton />;
  };

  // Empty state
  const emptyMessage = () => {
    return (
      <div className="flex flex-column align-items-center justify-content-center p-4">
        <i className="pi pi-inbox text-4xl text-300 mb-3" />
        <span className="text-500">No unresolved messages</span>
      </div>
    );
  };

  // Header actions with unread count
  const unreadCount = messages.filter(m => m.unread).length;
  const headerActions = (
    <>
      {unreadCount > 0 && (
        <Badge value={unreadCount} severity="danger" className="mr-2" />
      )}
      <Button
        icon="pi pi-refresh"
        className="p-button-text p-button-sm p-button-rounded"
        onClick={fetchCustomerMessages}
        tooltip="Refresh"
        tooltipOptions={{ position: 'top' }}
        disabled={loading}
      />
    </>
  );

  return (
    <>
      <Toast ref={toast} />
      <BaseWidget
        widgetId={widgetId}
        title="Customer Messages"
        icon="comments"
        headerActions={headerActions}
        loading={loading && messages.length === 0}
        error={error}
        minWidth={8}
        maxWidth={12}
      >
        <div className="customer-messages-widget">
          <DataTable
            value={messages}
            expandedRows={expandedRows}
            onRowToggle={(e) => setExpandedRows(e.data)}
            rowExpansionTemplate={rowExpansionTemplate}
            dataKey="_id"
            paginator={messages.length > 10}
            rows={10}
            rowsPerPageOptions={[10, 20, 50]}
            emptyMessage={emptyMessage}
            className="p-datatable-sm"
            stripedRows
            showGridlines={false}
            responsiveLayout="scroll"
            rowClassName={(data) => data.unread ? 'font-bold' : ''}
          >
            <Column expander style={{ width: '3rem' }} />
            <Column
              field="customerName"
              header="Customer"
              body={loading ? loadingTemplate : customerBodyTemplate}
              style={{ width: '20%' }}
            />
            <Column
              field="message"
              header="Message"
              body={loading ? loadingTemplate : messageBodyTemplate}
              style={{ width: '35%' }}
            />
            <Column
              field="createdAt"
              header="Date"
              body={loading ? loadingTemplate : dateBodyTemplate}
              style={{ width: '15%' }}
              sortable
            />
            <Column
              field="priority"
              header="Priority"
              body={loading ? loadingTemplate : priorityBodyTemplate}
              style={{ width: '10%' }}
            />
            <Column
              field="channel"
              header="Channel"
              body={loading ? loadingTemplate : channelBodyTemplate}
              style={{ width: '10%' }}
            />
            <Column
              body={loading ? loadingTemplate : actionsBodyTemplate}
              style={{ width: '7%' }}
              alignHeader="center"
              bodyStyle={{ textAlign: 'center' }}
            />
          </DataTable>
        </div>
      </BaseWidget>

      <Dialog
        header={`Reply to ${selectedMessage?.customerName}`}
        visible={replyDialog}
        style={{ width: '50vw' }}
        onHide={() => setReplyDialog(false)}
        footer={
          <div>
            <Button 
              label="Cancel" 
              icon="pi pi-times" 
              onClick={() => setReplyDialog(false)} 
              className="p-button-text" 
            />
            <Button 
              label="Send Reply" 
              icon="pi pi-send" 
              onClick={sendReply} 
              disabled={!replyText.trim() || sendingReply}
              loading={sendingReply}
            />
          </div>
        }
      >
        {selectedMessage && (
          <div>
            <div className="mb-3 p-3 surface-100 border-round">
              <div className="flex justify-content-between mb-2">
                <span className="font-semibold">{selectedMessage.customerName}</span>
                <span className="text-sm text-500">{formatDate(selectedMessage.createdAt)}</span>
              </div>
              <p className="m-0">{selectedMessage.message}</p>
            </div>
            
            <div className="field">
              <label htmlFor="reply">Your Reply</label>
              <InputTextarea
                id="reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                className="w-full"
                placeholder="Type your reply here..."
                autoFocus
              />
            </div>
            
            <div className="flex align-items-center gap-2 text-sm text-500">
              <i className={`pi ${selectedMessage.channel === 'email' ? 'pi-envelope' : selectedMessage.channel === 'sms' ? 'pi-mobile' : 'pi-whatsapp'}`} />
              <span>Reply will be sent via {selectedMessage.channel}</span>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default CustomerMessagesWidget;