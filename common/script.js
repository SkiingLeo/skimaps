// script.js

let geofencingManager = new GeofencingManager();

// Get the current location from the URL path properly
const getCurrentLocation = () => {
    const pathSegments = window.location.pathname.split('/');
    // Look for either 'davos' or 'chaeserrugg' in the path
    const locationName = pathSegments.find(segment => 
        ['davos', 'chaeserrugg'].includes(segment.toLowerCase())
    ) || 'index';
    
    console.log('Detected location:', locationName);
    return { name: locationName };
};

let currentLocation = getCurrentLocation();
console.log('Current location:', currentLocation);

async function handleLocation(lat, lon) {
    try {
        // Check if coordinates are within the current location's bounds
        const locationCheck = geofencingManager.findLocation(lat, lon);
        console.log('Location check result:', locationCheck);
        
        // Get the current path segments
        const pathSegments = window.location.pathname.split('/');
        const projectRootIndex = pathSegments.findIndex(segment => 
            segment === 'PointPlotterStatic'
        );
        
        if (locationCheck.name !== currentLocation.name) {
            // Build the correct path from project root
            const newPath = pathSegments
                .slice(0, projectRootIndex + 1)
                .concat([locationCheck.name, 'index.html'])
                .join('/');
                
            window.location.href = newPath;
            return;
        }
        
        // If we're here, we're in the correct location
        const drawnPoint = findDrawnPoint(lat, lon);
        console.log('Found drawn point:', drawnPoint);
        
        plotPoint(drawnPoint.x, drawnPoint.y, lat, lon);
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('coordDisplay').textContent = 'Error: ' + error.message;
    }
}

function findClosestPoint(lat, lon) {
    if (!points || points.length === 0) {
        throw new Error('No points data available');
    }
    
    console.log('Finding closest point for:', lat, lon);
    const realPoints = points.filter(point => point.side === 'real');
    console.log('Number of real points:', realPoints.length);
    
    if (realPoints.length === 0) {
        throw new Error('No real points found in data');
    }
    
    let minDist = Infinity;
    let closestPoint = null;
    
    realPoints.forEach(point => {
        const dist = Math.sqrt(
            Math.pow(point.x - lon, 2) + 
            Math.pow(point.y - lat, 2)
        );
        if (dist < minDist) {
            minDist = dist;
            closestPoint = point;
        }
    });
    
    return closestPoint;
}

function findDrawnPoint(lat, lon) {
    const closestReal = findClosestPoint(lat, lon);
    console.log('Found closest real point:', closestReal);
    
    const drawnPoint = points.find(point =>
        point.side === 'drawn' && 
        point.slope_name === closestReal.slope_name && 
        point.number === closestReal.number
    );
    
    if (!drawnPoint) {
        throw new Error('No matching drawn point found');
    }
    
    console.log('Found matching drawn point:', drawnPoint);
    return drawnPoint;
}

function plotPoint(x, y, originalLat, originalLon) {
    x = parseFloat(x);
    y = parseFloat(y);
    originalLat = parseFloat(originalLat);
    originalLon = parseFloat(originalLon);
    
    console.log('Plotting point:', { x, y, originalLat, originalLon });
    
    const point = document.getElementById('plotPoint');
    const coordDisplay = document.getElementById('coordDisplay');
    const image = document.getElementById('plotImage');
    
    const imageRect = image.getBoundingClientRect();
    console.log('Image dimensions:', {
        width: imageRect.width,
        height: imageRect.height,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight
    });
    
    // Calculate scale if image is responsive
    const scaleX = imageRect.width / image.naturalWidth;
    const scaleY = imageRect.height / image.naturalHeight;

    // Scale the coordinates
    const scaledX = x * scaleX;
    const scaledY = imageRect.height - (y * scaleY); // Flip Y coordinate

    // Position the point
    point.style.position = 'absolute';
    point.style.left = `${scaledX}px`;
    point.style.top = `${scaledY}px`;
    point.style.display = 'block';
    
    console.log('Point styles:', {
        display: point.style.display,
        left: point.style.left,
        top: point.style.top,
        position: point.style.position
    });
    
    coordDisplay.textContent = `Original Location: ${originalLat.toFixed(6)}, ${originalLon.toFixed(6)}\n` +
                             `Mapped to point: ${x.toFixed(1)}, ${y.toFixed(1)}`;
}

// Event Listeners
document.getElementById('locationButton').addEventListener('click', function() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            handleLocation(lat, lon);
        },
        (error) => {
            let errorMessage = 'Error getting location: ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Location permission denied';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information unavailable';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Location request timed out';
                    break;
                default:
                    errorMessage += error.message;
            }
            document.getElementById('coordDisplay').textContent = errorMessage;
        }
    );
});

document.getElementById('plotButton').addEventListener('click', function() {
    const input = document.getElementById('coordInput').value;
    
    try {
        const [lat, lon] = input.split(',').map(coord => parseFloat(coord.trim()));
        if (isNaN(lat) || isNaN(lon)) {
            throw new Error('Invalid coordinate format');
        }
        handleLocation(lat, lon);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('coordDisplay').textContent = 'Error: ' + error.message;
    }
});