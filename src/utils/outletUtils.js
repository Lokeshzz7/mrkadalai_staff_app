// Utility functions for managing outlet data in localStorage
export const outletUtils = {
    // Store outlet details in localStorage
    storeOutletDetails: (outletData) => {
        try {
            localStorage.setItem('outletDetails', JSON.stringify(outletData));
            console.log('Outlet details stored:', outletData);
        } catch (error) {
            console.error('Error storing outlet details:', error);
        }
    },

    // Get outlet details from localStorage
    getOutletDetails: () => {
        try {
            const storedOutlet = localStorage.getItem('outletDetails');
            return storedOutlet ? JSON.parse(storedOutlet) : null;
        } catch (error) {
            console.error('Error retrieving outlet details:', error);
            return null;
        }
    },

    // Get specific outlet property
    getOutletProperty: (property) => {
        const outlet = outletUtils.getOutletDetails();
        return outlet ? outlet[property] : null;
    },

    // Get outlet ID specifically
    getOutletId: () => {
        return outletUtils.getOutletProperty('id');
    },

    // Get outlet name
    getOutletName: () => {
        return outletUtils.getOutletProperty('name');
    },

    // Get outlet address
    getOutletAddress: () => {
        return outletUtils.getOutletProperty('address');
    },

    // Clear outlet details from localStorage
    clearOutletDetails: () => {
        try {
            localStorage.removeItem('outletDetails');
            console.log('Outlet details cleared from localStorage');
        } catch (error) {
            console.error('Error clearing outlet details:', error);
        }
    },

    // Check if outlet details exist
    hasOutletDetails: () => {
        return !!outletUtils.getOutletDetails();
    }
};

// Custom hook to use outlet details
import { useState, useEffect } from 'react';

export const useOutletDetails = () => {
    const [outletDetails, setOutletDetails] = useState(null);

    useEffect(() => {
        const details = outletUtils.getOutletDetails();
        setOutletDetails(details);
    }, []);

    const updateOutletDetails = (newDetails) => {
        outletUtils.storeOutletDetails(newDetails);
        setOutletDetails(newDetails);
    };

    return {
        outletDetails,
        outletId: outletDetails?.id,
        outletName: outletDetails?.name,
        outletAddress: outletDetails?.address,
        outletPhone: outletDetails?.phone,
        outletEmail: outletDetails?.email,
        updateOutletDetails,
        clearOutletDetails: () => {
            outletUtils.clearOutletDetails();
            setOutletDetails(null);
        }
    };
};