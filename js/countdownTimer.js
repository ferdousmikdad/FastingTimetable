// Constants for API
const BASE_URL = 'http://api.aladhan.com/v1/timingsByCity';
const CITY = 'Dhaka';  // Change this to your city
const COUNTRY = 'Bangladesh';  // Change this to your country
const SUHUR_OFFSET = 22; // Minutes before Fajr when Suhur should end

// Format time to 12-hour format with AM/PM
function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Calculate Suhur end time (subtract minutes from Fajr time)
function calculateSuhurEndTime(fajrTime) {
    const [hours, minutes] = fajrTime.split(':');
    const fajrDate = new Date();
    fajrDate.setHours(parseInt(hours));
    fajrDate.setMinutes(parseInt(minutes));
    
    // Subtract SUHUR_OFFSET minutes from Fajr time
    fajrDate.setMinutes(fajrDate.getMinutes() - SUHUR_OFFSET);
    
    return fajrDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Get prayer times from API
async function getPrayerTimes() {
    try {
        const response = await fetch(`${BASE_URL}?city=${CITY}&country=${COUNTRY}&method=2`);
        const data = await response.json();
        const fajrTime = data.data.timings.Fajr;
        return {
            suhur: calculateSuhurEndTime(fajrTime),    // Suhur end time
            maghrib: formatTime(data.data.timings.Maghrib)  // Iftar time
        };
    } catch (error) {
        console.error('Error fetching prayer times:', error);
        return null;
    }
}

// Convert time string to Date object
function convertToDate(timeStr) {
    // Parse time in 12-hour format
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':');
    const date = new Date();
    
    // Convert hours to 24-hour format
    let hour = parseInt(hours);
    if (period.toLowerCase() === 'pm' && hour !== 12) {
        hour += 12;
    } else if (period.toLowerCase() === 'am' && hour === 12) {
        hour = 0;
    }
    
    date.setHours(hour);
    date.setMinutes(parseInt(minutes));
    date.setSeconds(0);
    return date;
}

// Calculate time difference
function getTimeDifference(targetTime) {
    const now = new Date();
    let diff = targetTime - now;

    // If the time has passed for today, set it for tomorrow
    if (diff < 0) {
        targetTime.setDate(targetTime.getDate() + 1);
        diff = targetTime - now;
    }

    return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
}

// Update countdown display
function updateCountdown(containerId, timeObj) {
    const container = document.getElementById(containerId);
    if (!timeObj) {
        container.innerHTML = 'Loading...';
        return;
    }
    
    container.innerHTML = `
        <div class="grid grid-cols-3 gap-4 text-center">
            <div class="p-2 border-r-4 border-r-secondary border-opacity-15">
                <span class="text-4xl text-light font-bold">${String(timeObj.hours).padStart(2, '0')}</span>
                <div class="text-sm text-primary">Hours</div>
            </div>
            <div class="p-2">
                <span class="text-4xl text-light font-bold">${String(timeObj.minutes).padStart(2, '0')}</span>
                <div class="text-sm text-primary">Minutes</div>
            </div>
            <div class="p-2 pl-6 border-l-4 border-l-secondary border-opacity-15">
                <span class="text-4xl text-light font-bold">${String(timeObj.seconds).padStart(2, '0')}</span>
                <div class="text-sm text-primary">Seconds</div>
            </div>
        </div>
    `;
}

// Initialize the countdown
async function initializeCountdown() {
    const times = await getPrayerTimes();
    if (!times) return;

    // Display the actual prayer times
    document.getElementById('sahri-time').textContent = times.suhur;
    document.getElementById('iftar-time').textContent = times.maghrib;

    // Convert string times to Date objects
    const suhurTime = convertToDate(times.suhur);
    const iftarTime = convertToDate(times.maghrib);

    // Update countdowns every second
    setInterval(() => {
        const suhurDiff = getTimeDifference(suhurTime);
        const iftarDiff = getTimeDifference(iftarTime);
        
        updateCountdown('sahri-countdown', suhurDiff);
        updateCountdown('iftar-countdown', iftarDiff);
    }, 1000);
}

// Start the countdown when the page loads
document.addEventListener('DOMContentLoaded', initializeCountdown);