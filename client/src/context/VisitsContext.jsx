import { createContext, useContext, useState, useEffect } from 'react';

const VisitsContext = createContext();

export const useVisits = () => {
  const context = useContext(VisitsContext);
  if (!context) {
    throw new Error('useVisits must be used within a VisitsProvider');
  }
  return context;
};

export const VisitsProvider = ({ children }) => {
  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [pastVisits, setPastVisits] = useState([]);

  // Load visits from localStorage on component mount
  useEffect(() => {
    const savedUpcomingVisits = localStorage.getItem('upcomingVisits');
    const savedPastVisits = localStorage.getItem('pastVisits');
    
    if (savedUpcomingVisits) {
      setUpcomingVisits(JSON.parse(savedUpcomingVisits));
    }
    
    if (savedPastVisits) {
      setPastVisits(JSON.parse(savedPastVisits));
    }
  }, []);

  // Save visits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('upcomingVisits', JSON.stringify(upcomingVisits));
  }, [upcomingVisits]);

  useEffect(() => {
    localStorage.setItem('pastVisits', JSON.stringify(pastVisits));
  }, [pastVisits]);

  // Check for expired visits and move them to past visits
  useEffect(() => {
    const checkExpiredVisits = () => {
      const now = new Date();
      const expired = [];
      const stillUpcoming = [];

      upcomingVisits.forEach(visit => {
        const visitDateTime = new Date(`${visit.date}T${visit.time}`);
        if (visitDateTime < now) {
          expired.push({ ...visit, status: 'completed' });
        } else {
          stillUpcoming.push(visit);
        }
      });

      if (expired.length > 0) {
        setUpcomingVisits(stillUpcoming);
        setPastVisits(prev => [...prev, ...expired]);
      }
    };

    // Check on mount and then every hour
    checkExpiredVisits();
    const interval = setInterval(checkExpiredVisits, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [upcomingVisits]);

  const addVisit = (visitData) => {
    const newVisit = {
      id: Date.now().toString(),
      bookingDate: new Date().toISOString(),
      status: 'confirmed',
      ...visitData
    };

    setUpcomingVisits(prev => [...prev, newVisit]);
    return newVisit;
  };

  const cancelVisit = (visitId) => {
    setUpcomingVisits(prev => 
      prev.map(visit => 
        visit.id === visitId 
          ? { ...visit, status: 'cancelled' }
          : visit
      )
    );
  };

  const rescheduleVisit = (visitId, newDate, newTime) => {
    setUpcomingVisits(prev => 
      prev.map(visit => 
        visit.id === visitId 
          ? { ...visit, date: newDate, time: newTime, status: 'rescheduled' }
          : visit
      )
    );
  };

  const getVisitsByProperty = (propertyId) => {
    return upcomingVisits.filter(visit => visit.propertyId === propertyId);
  };

  const getVisitStats = () => {
    const totalVisits = upcomingVisits.length + pastVisits.length;
    const completedVisits = pastVisits.filter(visit => visit.status === 'completed').length;
    const cancelledVisits = [...upcomingVisits, ...pastVisits].filter(visit => visit.status === 'cancelled').length;
    const upcomingCount = upcomingVisits.filter(visit => visit.status === 'confirmed').length;

    return {
      total: totalVisits,
      completed: completedVisits,
      cancelled: cancelledVisits,
      upcoming: upcomingCount
    };
  };

  const getNextUpcomingVisit = () => {
    const confirmedVisits = upcomingVisits.filter(visit => visit.status === 'confirmed');
    if (confirmedVisits.length === 0) return null;

    return confirmedVisits.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    })[0];
  };

  const value = {
    upcomingVisits,
    pastVisits,
    addVisit,
    cancelVisit,
    rescheduleVisit,
    getVisitsByProperty,
    getVisitStats,
    getNextUpcomingVisit
  };

  return (
    <VisitsContext.Provider value={value}>
      {children}
    </VisitsContext.Provider>
  );
};