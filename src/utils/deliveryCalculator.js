import axios from 'axios';

// Yerevan coordinates (center of the city)
const YEREVAN_COORDS = {
    lat: 40.1792,
    lng: 44.4991
};

// Base delivery fee for Yerevan
const YEREVAN_DELIVERY_FEE = 1000; // AMD
const COST_PER_KM = 100; // AMD per kilometer

// Armenian regions with approximate coordinates
const ARMENIAN_REGIONS_COORDS = {
    "Երևան": { lat: 40.1792, lng: 44.4991, baseDelivery: 1000 },
    "Արմավիր": { lat: 40.1500, lng: 43.9850 },
    "Արագածոտն": { lat: 40.5167, lng: 44.2167 },
    "Արարատ": { lat: 39.8167, lng: 44.7167 },
    "Կոտայք": { lat: 40.2500, lng: 44.7167 },
    "Շիրակ": { lat: 40.7833, lng: 43.8500 },
    "Լոռի": { lat: 41.0833, lng: 44.4833 },
    "Տավուշ": { lat: 40.8833, lng: 45.2333 },
    "Վայոց Ձոր": { lat: 39.8167, lng: 45.3333 },
    "Սյունիք": { lat: 39.5000, lng: 46.3333 },
    "Գեղարքունիք": { lat: 40.3667, lng: 45.5000 }
};

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance);
};

// Get coordinates from Google Maps Geocoding API
const getCoordinatesFromAddress = async (address) => {
    try {
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address + ', Armenia')}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`
        );

        if (response.data.results && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            return {
                lat: location.lat,
                lng: location.lng
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        return null;
    }
};

// Calculate delivery fee based on region
export const calculateDeliveryFeeByRegion = (region) => {
    if (region === "Երևան") {
        return YEREVAN_DELIVERY_FEE;
    }

    const regionCoords = ARMENIAN_REGIONS_COORDS[region];
    if (!regionCoords) {
        return YEREVAN_DELIVERY_FEE; // fallback
    }

    const distance = calculateDistance(
        YEREVAN_COORDS.lat,
        YEREVAN_COORDS.lng,
        regionCoords.lat,
        regionCoords.lng
    );

    return distance * COST_PER_KM;
};

// Calculate delivery fee based on specific address
export const calculateDeliveryFeeByAddress = async (address) => {
    try {
        const coords = await getCoordinatesFromAddress(address);
        if (!coords) {
            return YEREVAN_DELIVERY_FEE; // fallback
        }

        const distance = calculateDistance(
            YEREVAN_COORDS.lat,
            YEREVAN_COORDS.lng,
            coords.lat,
            coords.lng
        );

        // If within Yerevan (less than 15km from center), use flat rate
        if (distance <= 15) {
            return YEREVAN_DELIVERY_FEE;
        }

        return distance * COST_PER_KM;
    } catch (error) {
        console.error('Error calculating delivery fee:', error);
        return YEREVAN_DELIVERY_FEE; // fallback
    }
};

// Get distance information for display
export const getDeliveryInfo = async (region, address = '') => {
    if (region === "Երևան") {
        return {
            distance: 0,
            fee: YEREVAN_DELIVERY_FEE,
            isYerevan: true
        };
    }

    let distance, coords;

    if (address.trim()) {
        coords = await getCoordinatesFromAddress(`${address}, ${region}`);
    }

    if (!coords) {
        coords = ARMENIAN_REGIONS_COORDS[region];
    }

    if (coords) {
        distance = calculateDistance(
            YEREVAN_COORDS.lat,
            YEREVAN_COORDS.lng,
            coords.lat,
            coords.lng
        );
    } else {
        distance = 50; // fallback distance
    }

    const fee = distance <= 15 ? YEREVAN_DELIVERY_FEE : distance * COST_PER_KM;

    return {
        distance,
        fee,
        isYerevan: false
    };
};