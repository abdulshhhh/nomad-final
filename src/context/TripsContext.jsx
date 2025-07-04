import React, { createContext, useContext, useState } from "react";

const TripsContext = createContext();

export const TripsProvider = ({ children }) => {
  const [joinedTripsData, setJoinedTripsData] = useState([]);
  // ...any other state or logic...

  return (
    <TripsContext.Provider value={{ joinedTripsData, setJoinedTripsData }}>
      {children}
    </TripsContext.Provider>
  );
};

// This is the custom hook you must export!
export const useTrips = () => useContext(TripsContext);