import { createContext, useContext, useState, useEffect } from 'react';

const FamilyContext = createContext(null);

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};

export const clearInvalidFamilyData = () => {
  localStorage.removeItem('selectedFamily');
  console.log('Cleared invalid family selection');
};

export const FamilyProvider = ({ children }) => {
  const [selectedFamily, setSelectedFamily] = useState(() => {
    const saved = localStorage.getItem('selectedFamily');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate that saved family has the required structure
        if (parsed && typeof parsed.id === 'number') {
          return parsed;
        } else {
          console.warn('Invalid family structure in localStorage, clearing it');
          localStorage.removeItem('selectedFamily');
          return null;
        }
      } catch (error) {
        console.error('Error parsing saved family:', error);
        localStorage.removeItem('selectedFamily');
        return null;
      }
    }
    return null;
  });

  // Function to update family and ensure localStorage is updated
  const updateSelectedFamily = (family) => {
    setSelectedFamily(family);
    if (family) {
      localStorage.setItem('selectedFamily', JSON.stringify(family));
    } else {
      localStorage.removeItem('selectedFamily');
    }
  };

  useEffect(() => {
    if (selectedFamily) {
      localStorage.setItem('selectedFamily', JSON.stringify(selectedFamily));
    } else {
      localStorage.removeItem('selectedFamily');
    }
  }, [selectedFamily]);

  const isAdmin = () => {
    return selectedFamily?.role === 'admin';
  };

  const value = {
    selectedFamily,
    setSelectedFamily: updateSelectedFamily,
    isAdmin,
  };

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
};