import { useEffect, useState } from "react";
import Link from "next/link";
import ClickOutside from "@/components/ClickOutside";
import Image from "next/image";
import { io } from "socket.io-client";
import axios from "axios";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { BaseURL, imageBaseURL } from "../../../utils/baseUrl";
import moment from "moment";
import { FiMessageCircle, FiUser } from "react-icons/fi";
import useIntegrationStatus from "@/hooks/useIntegrationStatus";

const socket = io("http://localhost:8000");
// const socket = io("https://saasrental.io", {
//   path: "/socket.io",
//   transports: ["websocket"],
// });


const DropdownNotification = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const { token, user } = useSelector((state) => state?.authReducer);
  const router = useRouter();
  const vendorId = user?._id;
  const { isIntegrationActive } = useIntegrationStatus();
  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${BaseURL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(res.data.data);
      const unread = res.data.data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    checkWhatsAppStatus();

    // Join WebSocket room
    socket.emit("joinVendorRoom", vendorId);

    // Listen for new notifications
    socket.on("newNotification", (notification) => {
      // Filter out WhatsApp notifications if WhatsApp is not enabled
      if (notification.type === "whatsapp_message" && !whatsappEnabled) {
        return;
      }
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("newNotification");
    };
  }, [vendorId, whatsappEnabled]);

  const checkWhatsAppStatus = async () => {
    if (isIntegrationActive) {
      const isActive = await isIntegrationActive('whatsapp');
      setWhatsappEnabled(isActive);
    }
  };

  // Mark all as read when dropdown is opened
  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((notif) => 
        notif._id === id ? { ...notif, isRead: true } : notif
      )
    );
    
    setUnreadCount((prev) => Math.max(prev - 1, 0)); // Ensure it never goes below 0
  
    try {
      await axios.put(`${BaseURL}/notifications/read/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
  
      // Revert the state if the API call fails
      setNotifications((prev) =>
        prev.map((notif) => 
          notif._id === id ? { ...notif, isRead: false } : notif
        )
      );
      
      setUnreadCount((prev) => prev + 1);
    }
  };
  
  function removeImagePrefix(path) {
    return path?.replace(/^images[\\/]/, "").replace(/\\/g, "/"); // Convert `\` to `/`
  }
  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative hidden sm:block">
      <li>
      <Link
  onClick={() => setDropdownOpen(!dropdownOpen)}
  href="#"
  className="relative flex h-12 w-12 items-center justify-center rounded-full border border-stroke bg-gray-2 text-dark hover:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:hover:text-white"
>
  <span className="relative">
    <svg
      className="fill-current duration-300 ease-in-out"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.0001 1.0415C6.43321 1.0415 3.54172 3.933 3.54172 7.49984V8.08659C3.54172 8.66736 3.36981 9.23513 3.04766 9.71836L2.09049 11.1541C0.979577 12.8205 1.82767 15.0855 3.75983 15.6125C4.3895 15.7842 5.0245 15.9294 5.66317 16.0482L5.66475 16.0525C6.30558 17.7624 8.01834 18.9582 10 18.9582C11.9817 18.9582 13.6944 17.7624 14.3352 16.0525L14.3368 16.0483C14.9755 15.9295 15.6106 15.7842 16.2403 15.6125C18.1724 15.0855 19.0205 12.8205 17.9096 11.1541L16.9524 9.71836C16.6303 9.23513 16.4584 8.66736 16.4584 8.08659V7.49984C16.4584 3.933 13.5669 1.0415 10.0001 1.0415ZM12.8137 16.2806C10.9446 16.504 9.05539 16.504 7.18626 16.2806C7.77872 17.1319 8.8092 17.7082 10 17.7082C11.1908 17.7082 12.2213 17.1319 12.8137 16.2806ZM4.79172 7.49984C4.79172 4.62335 7.12357 2.2915 10.0001 2.2915C12.8765 2.2915 15.2084 4.62335 15.2084 7.49984V8.08659C15.2084 8.91414 15.4533 9.72317 15.9124 10.4117L16.8696 11.8475C17.5072 12.804 17.0204 14.104 15.9114 14.4065C12.0412 15.462 7.95893 15.462 4.08872 14.4065C2.9797 14.104 2.49291 12.804 3.13055 11.8475L4.08772 10.4117C4.54676 9.72317 4.79172 8.91414 4.79172 8.08659V7.49984Z"
        fill=""
      />
    </svg>

    {/* Notification Count Badge */}
    {unreadCount > 0 && (
  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full 
  bg-orange-500 text-xs font-bold text-white dark:bg-orange-400">
    {unreadCount > 9 ? "9+" : unreadCount}
  </span>
)}
  </span>
</Link>


        {dropdownOpen && (
          <div className="absolute -right-27 mt-7.5 flex h-[550px] w-75 flex-col rounded-xl border-[0.5px] border-stroke bg-white px-5.5 pb-5.5 pt-5 shadow-default dark:border-dark-3 dark:bg-gray-dark sm:right-0 sm:w-[364px]">
            <div className="mb-5 flex items-center justify-between">
              <h5 className="text-lg font-medium text-dark dark:text-white">
                Notifications
              </h5>
              <span className="rounded-md bg-primary px-2 py-0.5 text-body-xs font-medium text-white">
                {unreadCount} new
              </span>
            </div>

        

      {notifications.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No new notifications</p>
      ) : (
        <ul className="flex flex-col gap-2 overflow-y-scroll pr-2">
          {notifications?.filter(item => {
            // Filter out WhatsApp notifications if WhatsApp is not enabled
            if (item?.type === "whatsapp_message" && !whatsappEnabled) {
              return false;
            }
            return true;
          }).map((item, index) => {
            const isWhatsApp = item?.type === "whatsapp_message";
            
            return (
              <li
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg transition cursor-pointer ${
                  item?.isRead
                    ? "bg-gray-100 dark:bg-dark-4"
                    : isWhatsApp
                      ? "bg-green-100 dark:bg-green-900"
                      : "bg-orange-100 dark:bg-orange-900"
                } hover:bg-opacity-80`}
                onClick={() => {
                  if (isWhatsApp && item?.data?.customerId) {
                    router.push(`/customer/360/${item.data.customerId}`);
                    setDropdownOpen(false);
                  }
                  if (!item.isRead) {
                    markAsRead(item._id);
                  }
                }}
              >
                {/* Profile Picture or Icon */}
                {isWhatsApp ? (
                  <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full">
                    <FiMessageCircle className="w-5 h-5 text-white" />
                  </div>
                ) : item?.data?.user?.profile_Picture ? (
                  <Image
                    width={40}
                    height={40}
                    src={`${imageBaseURL}/images/${removeImagePrefix(item?.data?.user?.profile_Picture)}`}
                    alt="User"
                    className="rounded-full object-cover w-10 h-10 border border-gray-300 dark:border-dark-4"
                  />
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-400 rounded-full">
                    <FiUser className="w-5 h-5 text-white" />
                  </div>
                )}

                <div className="flex-1">
                  {/* Notification Content */}
                  {isWhatsApp ? (
                    <>
                      <p className="text-sm font-medium text-dark dark:text-white">
                        {item?.message || "New WhatsApp Message"}
                      </p>
                      {item?.data?.messagePreview && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {item.data.messagePreview}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        From: {item?.data?.customerPhone || "Unknown"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-dark dark:text-white">
                        {item?.data?.user?.legalName} <span className="text-xs text-gray-500">{item?.data?.user?.role}</span>
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{item?.type}</p>
                    </>
                  )}

                  {/* Time Ago */}
                  <p className="text-xs text-gray-400">{moment(item?.createdAt).fromNow()}</p>
                </div>

                {/* Mark as Read Button */}
                {!item.isRead && (
                  <button
                    className="text-xs text-blue-500 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(item._id);
                    }}
                  >
                    Mark as read
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}


           <div className="py-3">
           <Link className="flex items-center  justify-center rounded-[7px] border border-primary p-2.5 font-medium text-primary" href="/notifications">
              See all notifications
            </Link>
           </div>
          </div>
        )}
      </li>
    </ClickOutside>
  );
};

export default DropdownNotification;
