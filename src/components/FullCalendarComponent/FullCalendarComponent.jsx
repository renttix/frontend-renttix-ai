"use client";

import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useSelector } from "react-redux";
import axios from "axios";
import { BaseURL } from "../../../utils/baseUrl";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";

const FullCalendarComponent = () => {
    const [events, setEvents] = useState([]);
    const [currentView, setCurrentView] = useState("dayGridMonth");
    const { token } = useSelector((state) => state?.authReducer);

    const handleDateClick = (arg) => {
        console.log(arg)
        alert(`Clicked on date: ${arg.dateStr}`);
    };

    useEffect(() => {
        const fetchCalendarEvents = async () => {
            if (!token) return;
            try {
                const response = await axios.get(`${BaseURL}/calendar/calendar-events`, {
                    headers: { authorization: `Bearer ${token}` },
                });
                setEvents(response.data?.data);
            } catch (err) {
                console.log(err);
            }
        };

        fetchCalendarEvents();
    }, [token]);

    // Custom rendering of events
    const renderEventContent = (eventInfo) => {
        return (
            <div className="custom-event">
                {/* <strong>{eventInfo.timeText}</strong> */}
                <Tag severity={eventInfo.event.extendedProps.type=="delivery"?"danger":'success'} value={`${eventInfo.timeText} ${eventInfo.event.title}`}/>
                {/* <span>{eventInfo.event.title}</span> */}
            </div>
        );
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md ">
         <div className=" flex justify-between w-full">
         <label htmlFor="" className="text-4xl font-semibold text-dark-2 dark:text-white">Calendar</label>
            <div className="flex gap-2 mb-4">
                <Button size="small" onClick={() => setCurrentView("dayGridMonth")} variant={currentView === "dayGridMonth" ? "default" : "outline"}>Month</Button>
                <Button size="small" onClick={() => setCurrentView("timeGridWeek")} variant={currentView === "timeGridWeek" ? "default" : "outline"}>Week</Button>
                <Button size="small" onClick={() => setCurrentView("timeGridDay")} variant={currentView === "timeGridDay" ? "default" : "outline"}>Day</Button>
            </div></div>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={currentView}
                events={events}
                // dateClick={handleDateClick}
                eventClick={handleDateClick}
                editable={true}
                selectable={true}
                key={currentView} // Re-render when view changes
                eventContent={renderEventContent} // Custom event rendering
            />
        </div>
    );
};

export default FullCalendarComponent;