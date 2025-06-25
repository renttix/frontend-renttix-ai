import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { RadioButton } from "primereact/radiobutton";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";
import axios from "axios";
import { BaseURL } from "../../../../../utils/baseUrl";
import { useSelector } from "react-redux";
import "../styles/RouteSelector.css";

export default function RouteSelector({
  deliveryCoordinates,
  vendorId,
  currentRoute,
  onRouteChange,
  productId,
  productName,
  maintenanceDate,
  clearAddressSearch,
}) {
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [routeSuggestions, setRouteSuggestions] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [error, setError] = useState(null);
  const toast = React.useRef(null);

  const { token, user } = useSelector((state) => state?.authReducer);

  useEffect(() => {
    if (deliveryCoordinates && !currentRoute) {
      fetchRouteSuggestions();
    }
  }, [deliveryCoordinates, user]);

  const fetchRouteSuggestions = async () => {
    if (!deliveryCoordinates) {
      setError("No delivery coordinates available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${BaseURL}/routes/match-maintenance`,
        {
          coordinates: deliveryCoordinates,
          maintenanceDate,
          vendorId: user?._id,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        const { matchedRoute, suggestions } = response.data.data;

        if (matchedRoute) {
          onRouteChange({
            routeId: matchedRoute.routeId,
            routeName: matchedRoute.routeName,
            color: matchedRoute.color || "#3B82F6",
            // coordinates:routeData.coordinates,
            assignmentType: "automatic",
            assignedAt: new Date(),
          });

          toast.current?.show({
            severity: "success",
            summary: "Route Assigned",
            detail: `Automatically assigned to ${matchedRoute.routeName}`,
            life: 3000,
          });
        } else if (suggestions?.length > 0) {
          const sortedRoutes = [...suggestions].sort((a, b) => {
            const distA = a.isInGeofence ? 0 : a.distance || Infinity;
            const distB = b.isInGeofence ? 0 : b.distance || Infinity;
            return distA - distB;
          });

          const nearestRoute = sortedRoutes[0];

          if (nearestRoute) {
            onRouteChange({
              routeId: nearestRoute.routeId,
              routeName: nearestRoute.routeName,
              color: nearestRoute.color || "#3B82F6",
              assignmentType: "automatic",
              assignedAt: new Date(),
            });

            toast.current?.show({
              severity: "info",
              summary: "Nearest Route Assigned",
              detail: `Automatically assigned to ${nearestRoute.routeName}`,
              life: 3000,
            });
          }
        }

        setRouteSuggestions(suggestions || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch routes");
      }
    } catch (error) {
      console.error("Error fetching route suggestions:", error);
      let errorMessage = "Failed to fetch route suggestions";

      if (error.response?.status === 401) {
        errorMessage = "Authentication required. Please log in.";
      } else if (error.response?.status === 404) {
        errorMessage = "Route matching service not available";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);

      if (!token || process.env.NODE_ENV === "development") {
        const demoSuggestions = [
          {
            routeId: "demo-1",
            routeName: "North Route",
            color: "#3B82F6",
            isInGeofence: true,
            distance: 0,
          },
          {
            routeId: "demo-2",
            routeName: "South Route",
            color: "#10B981",
            isInGeofence: false,
            distance: 5.2,
          },
          {
            routeId: "demo-3",
            routeName: "Central Route",
            color: "#8B5CF6",
            isInGeofence: false,
            distance: 7.8,
          },
        ];
        setRouteSuggestions(demoSuggestions);

        onRouteChange({
          routeId: demoSuggestions[0].routeId,
          routeName: demoSuggestions[0].routeName,
          color: demoSuggestions[0].color,
          assignmentType: "automatic",
          assignedAt: new Date(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRouteChange = () => {
    if (!selectedRoute) {
      setError("Please select a route");
      return;
    }

    const isOverride =
      currentRoute && selectedRoute.routeId !== currentRoute.routeId;
    const isFloating = selectedRoute.assignmentType === "floating";
    const needsReason = isOverride || isFloating;

    if (needsReason && !overrideReason.trim()) {
      setError("Please provide a reason for the route change");
      return;
    }

    const updatedRoute = {
      ...selectedRoute,
      assignmentType:
        selectedRoute.assignmentType || (isOverride ? "manual" : "automatic"),
      overrideReason: needsReason ? overrideReason.trim() : undefined,
      assignedAt: new Date(),
    };

    onRouteChange(updatedRoute);

    setShowDialog(false);
    setSelectedRoute(null);
    setOverrideReason("");
    setError(null);
  };

  const getRouteStatusTag = () => {
    if (!currentRoute) return null;

    switch (currentRoute.assignmentType) {
      case "automatic":
        return (
          <Tag
            value="Auto-assigned"
            severity="success"
            icon="pi pi-check-circle"
          />
        );
      case "manual":
        return (
          <Tag value="Manually assigned" severity="warning" icon="pi pi-user" />
        );
      case "floating":
        return (
          <Tag value="Floating Route" severity="info" icon="pi pi-clock" />
        );
      default:
        return null;
    }
  };

  const dialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => {
          setShowDialog(false);
          setSelectedRoute(null);
          setOverrideReason("");
          setError(null);
        }}
        className="p-button-text"
      />
      <Button
        label="Confirm"
        icon="pi pi-check"
        onClick={handleRouteChange}
        disabled={!selectedRoute}
      />
    </div>
  );

  if (loading && !currentRoute) {
    return (
      <div className="route-loading">
        <ProgressSpinner />
        <span className="route-loading-text">Finding best route...</span>
      </div>
    );
  }

  return (
    <div className="route-selector">
      <Toast ref={toast} position="top-right" />

      {currentRoute ? (
        <div className="route-assignment-box has-route">
          <div className="route-header">
            <div className="route-info">
              <i
                className="pi pi-map-marker route-icon"
                style={{ color: currentRoute.color || "#3B82F6" }}
              ></i>
              <span className="route-name">{currentRoute.routeName}</span>
              {getRouteStatusTag()}
            </div>
               <div className="">
                 <Button
              icon="pi pi-times"
              className="p-button-text p-button-sm"
              onClick={clearAddressSearch}
              tooltip="delete route"
            />
            <Button
              icon="pi pi-pencil"
              className="p-button-text p-button-sm"
              onClick={() => {
                setSelectedRoute(currentRoute);
                setShowDialog(true);
              }}
              tooltip="Change route"
            />
               </div>
          </div>
          {currentRoute.overrideReason && (
            <div className="route-override-reason">
              <i className="pi pi-info-circle mr-1"></i>
              {currentRoute.overrideReason}
            </div>
          )}
        </div>
      ) : (
        <div className="no-route-box">
          <div className="no-route-info">
            <i className="pi pi-map"></i>
            <span>No route assigned</span>
          </div>
          <Button
            label="Assign Route"
            icon="pi pi-plus"
            className="p-button-sm"
            onClick={() => {
              fetchRouteSuggestions();
              setSelectedRoute(null);
              setShowDialog(true);
            }}
            disabled={!deliveryCoordinates}
          />
        </div>
      )}

      <Dialog
        header={`Route Assignment - ${productName}`}
        visible={showDialog}
        style={{ width: "500px" }}
        footer={dialogFooter}
        onHide={() => {
          setShowDialog(false);
          setSelectedRoute(null);
          setOverrideReason("");
          setError(null);
        }}
        className="route-dialog"
      >
        <div className="p-fluid">
          {error && (
            <Message severity="error" text={error} className="route-error" />
          )}

          {currentRoute && (
            <div className="current-assignment">
              <label className="current-assignment-label">
                Current Assignment:
              </label>
              <div className="current-assignment-info">
                <i
                  className="pi pi-map-marker"
                  style={{ color: currentRoute.color }}
                ></i>
                <span className="font-medium">{currentRoute.routeName}</span>
                {getRouteStatusTag()}
              </div>
            </div>
          )}

          <div className="route-options-container">
            <label className="route-options-label">Available Routes:</label>
            <div className="route-options">
              {routeSuggestions.map((route) => (
                <div
                  key={route.routeId}
                  className={`route-option ${selectedRoute?.routeId === route.routeId ? "selected" : ""}`}
                >
                  <div className="route-option-header">
                    <div className="route-option-name">
                      <RadioButton
                        inputId={route.routeId}
                        name="route"
                        value={route}
                        onChange={(e) => setSelectedRoute(e.value)}
                        checked={selectedRoute?.routeId === route.routeId}
                      />
                      <label
                        htmlFor={route.routeId}
                        className="ml-2 cursor-pointer"
                      >
                        <i
                          className="pi pi-map-marker"
                          style={{ color: route.color || "#3B82F6" }}
                        ></i>
                        <strong>{route.routeName}</strong>
                      </label>
                    </div>
                    <div className="route-option-status">
                      {route.isInGeofence ? (
                        <span className="in-area">✅ In area</span>
                      ) : (
                        <span className="distance">
                          📍 {route.distance} km away
                        </span>
                      )}
                      {route.availability && !route.hasCapacity && (
                        <Tag
                          value={route.availability.reason}
                          severity="danger"
                          className="ml-2 text-xs"
                        />
                      )}
                    </div>
                  </div>
                  {route.description && (
                    <div className="route-option-description">
                      {route.description}
                    </div>
                  )}
                </div>
              ))}

              {/* Floating Route Option */}
              <div
                className={`route-option floating-route-option ${selectedRoute?.routeId === "floating" ? "selected" : ""}`}
              >
                <div className="route-option-header">
                  <div className="route-option-name">
                    <RadioButton
                      inputId="floating-route"
                      name="route"
                      value={{
                        routeId: "floating",
                        routeName: "Floating Route",
                        assignmentType: "floating",
                      }}
                      onChange={(e) => setSelectedRoute(e.value)}
                      checked={selectedRoute?.routeId === "floating"}
                    />
                    <label
                      htmlFor="floating-route"
                      className="ml-2 cursor-pointer"
                    >
                      <div className="floating-route-info">
                        <i className="pi pi-clock floating-route-icon"></i>
                        <strong>Floating Route</strong>
                        <Tag
                          value="Manual scheduling"
                          severity="info"
                          className="floating-route-tag"
                        />
                      </div>
                    </label>
                  </div>
                </div>
                <div className="route-option-description">
                  For manual scheduling or when no route matches
                </div>
              </div>
            </div>
          </div>

          {selectedRoute &&
            (selectedRoute.assignmentType === "floating" ||
              (currentRoute &&
                selectedRoute?.routeId !== currentRoute.routeId)) && (
              <div className="override-reason-container">
                <label
                  htmlFor="override-reason"
                  className="override-reason-label"
                >
                  Reason for{" "}
                  {selectedRoute.assignmentType === "floating"
                    ? "floating assignment"
                    : "override"}
                  :<span className="override-reason-required">*</span>
                </label>
                <InputTextarea
                  id="override-reason"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  rows={3}
                  placeholder="Please provide a reason..."
                  className="override-reason-textarea"
                />
              </div>
            )}
        </div>
      </Dialog>
    </div>
  );
}
