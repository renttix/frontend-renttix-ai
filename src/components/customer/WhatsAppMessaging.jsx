"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { Avatar } from "primereact/avatar";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import axios from "axios";
import { BaseURL } from "../../../utils/baseUrl";
import moment from "moment";
import { 
  FiSend, FiCheck, FiCheckCircle, FiClock, 
  FiAlertCircle, FiRefreshCw, FiPhone
} from "react-icons/fi";
import { SiWhatsapp } from "react-icons/si";

const WhatsAppMessaging = ({ customer, onMessageSent }) => {
  const toast = useRef(null);
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [whatsappConfigured, setWhatsappConfigured] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkWhatsAppConfiguration();
    fetchMessageHistory();
  }, [customer._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkWhatsAppConfiguration = async () => {
    try {
      const response = await axios.get(`${BaseURL}/whatsapp/configuration`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      setWhatsappConfigured(response.data.success && response.data.data?.isActive);
    } catch (error) {
      console.error("Error checking WhatsApp configuration:", error);
      setWhatsappConfigured(false);
    }
  };

  const fetchMessageHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BaseURL}/whatsapp/history/${customer._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setMessages(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching message history:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load message history",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !customer.number) {
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: customer.number ? "Please enter a message" : "Customer has no phone number",
        life: 3000,
      });
      return;
    }

    setSending(true);
    try {
      const response = await axios.post(
        `${BaseURL}/whatsapp/send`,
        {
          customerId: customer._id,
          to: customer.number,
          message: newMessage.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        // Add message to local state immediately
        const newMsg = {
          _id: Date.now().toString(),
          direction: "outbound",
          body: newMessage.trim(),
          status: "sent",
          createdAt: new Date(),
          from: "business",
          to: customer.number,
        };
        
        setMessages([...messages, newMsg]);
        setNewMessage("");
        
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Message sent successfully",
          life: 3000,
        });

        // Notify parent component
        if (onMessageSent) {
          onMessageSent(newMsg);
        }

        // Refresh messages after a delay to get the actual message with Twilio ID
        setTimeout(() => {
          fetchMessageHistory();
        }, 2000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to send message",
        life: 3000,
      });
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMessageHistory();
    setRefreshing(false);
  };

  const getMessageStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <FiCheckCircle className="text-green-500" />;
      case "sent":
        return <FiCheck className="text-blue-500" />;
      case "failed":
        return <FiAlertCircle className="text-red-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const formatPhoneNumber = (number) => {
    if (!number) return "No phone number";
    // Format as needed
    return number.startsWith("+") ? number : `+${number}`;
  };

  if (!whatsappConfigured) {
    return (
      <div className="whatsapp-not-configured">
        <Message 
          severity="warn" 
          text="WhatsApp is not configured. Please configure WhatsApp in System Setup → Integrations."
          className="w-full"
        />
      </div>
    );
  }

  return (
    <div className="whatsapp-messaging-container">
      <Toast ref={toast} />
      
      {/* Header */}
      <div className="messaging-header">
        <div className="customer-info">
          <Avatar 
            label={customer.name?.charAt(0).toUpperCase()} 
            size="large"
            shape="circle"
            className="customer-avatar-small"
          />
          <div className="customer-details">
            <h4 className="customer-name">{customer.name}</h4>
            <p className="customer-phone">
              <FiPhone className="phone-icon" />
              {formatPhoneNumber(customer.number)}
            </p>
          </div>
        </div>
        <Button
          icon={<FiRefreshCw className={refreshing ? "spinning" : ""} />}
          className="p-button-text p-button-rounded"
          onClick={handleRefresh}
          disabled={refreshing}
          tooltip="Refresh messages"
          tooltipOptions={{ position: "left" }}
        />
      </div>

      <Divider />

      {/* Messages Container */}
      <div className="messages-container">
        {loading ? (
          <div className="loading-container">
            <ProgressSpinner />
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <SiWhatsapp className="whatsapp-watermark" />
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`message-bubble ${message.direction}`}
              >
                <div className="message-content">
                  <p className="message-text">{message.body}</p>
                  <div className="message-meta">
                    <span className="message-time">
                      {moment(message.createdAt).format("HH:mm")}
                    </span>
                    {message.direction === "outbound" && (
                      <span className="message-status">
                        {getMessageStatusIcon(message.status)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="message-input-container">
        <InputTextarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          rows={2}
          className="message-input"
          disabled={sending || !customer.number}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button
          icon={sending ? <ProgressSpinner style={{ width: "20px", height: "20px" }} /> : <FiSend />}
          className="send-button"
          onClick={handleSendMessage}
          disabled={sending || !newMessage.trim() || !customer.number}
          tooltip={!customer.number ? "Customer has no phone number" : "Send message"}
          tooltipOptions={{ position: "left" }}
        />
      </div>

      {!customer.number && (
        <Message 
          severity="info" 
          text="This customer has no phone number. Add a phone number to enable WhatsApp messaging."
          className="mt-3"
        />
      )}
    </div>
  );
};

export default WhatsAppMessaging;