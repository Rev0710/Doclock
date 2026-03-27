import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { appointmentsAPI } from "../services/api";

export const AppointmentContext = createContext(null);

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentsAPI.list();
      const data = res.data;

      if (Array.isArray(data)) {
        setAppointments(data);
      } else if (Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
      } else if (Array.isArray(data.data)) {
        setAppointments(data.data);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Failed to load appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const addAppointment = async (formData) => {
    try {
      await appointmentsAPI.create(formData);
      await loadAppointments();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Booking failed",
      };
    }
  };

  const removeAppointment = async (id) => {
    try {
      await appointmentsAPI.delete(id);
      await loadAppointments();
      return { success: true };
    } catch (error) {
      console.error("Delete failed:", error);
      return { success: false };
    }
  };

  const updateAppointment = async (id, payload) => {
    try {
      await appointmentsAPI.update(id, payload);
      await loadAppointments();
      return { success: true };
    } catch (error) {
      console.error("Update failed:", error);
      return { success: false };
    }
  };

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        loading,
        loadAppointments,
        addAppointment,
        removeAppointment,
        updateAppointment,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

// ✅ ADD THIS (FIXES YOUR ERROR)
export const useAppointments = () => {
  const ctx = useContext(AppointmentContext);
  if (!ctx) throw new Error("useAppointments must be used inside AppointmentProvider");
  return ctx;
};