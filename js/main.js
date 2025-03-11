// API configuration
const API_BASE_URL = "https://api.aladhan.com/v1";
const LOCATION = {
  city: "Dhaka",
  country: "Bangladesh",
  method: 1, // Hanafi method
};

// Cache for API responses
const cache = new Map();

// State for current fiqh
let currentFiqh = "Hanafi"; // Default to Hanafi

// Function to toggle fiqh
function toggleFiqh() {
  currentFiqh = currentFiqh === "Hanafi" ? "Shafi'i" : "Hanafi";
  document.getElementById("toggleFiqh").textContent =
    currentFiqh === "Hanafi" ? "Switch to Shafi'i" : "Switch to Hanafi";
  document.getElementById("fiqhNote").textContent =
    currentFiqh === "Hanafi"
      ? "Asr times according to Hanafi School"
      : "Asr times according to Shafi'i School";
  document.getElementById("fullMonthFiqhNote").textContent =
    currentFiqh === "Hanafi"
      ? "Asr calculation method: Hanafi"
      : "Asr calculation method: Shafi'i";

  updateCurrentDay();
  populateFullMonth();
}

// Attach event listener to toggle button
document.getElementById("toggleFiqh").addEventListener("click", toggleFiqh);

// Function to update location
function updateLocation(city, country) {
  LOCATION.city = city;
  LOCATION.country = country;
  document.getElementById("locationName").textContent = `${city}, ${country}`;
  updateCurrentDay();
  populateFullMonth();
}

// Attach event listener to city select dropdown
document.getElementById("citySelect").addEventListener("change", (e) => {
  const [city, country] = e.target.value.split(", ");
  updateLocation(city, country);
});

// Auto-detect user location
function detectLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          const city = data.city || data.locality;
          const country = data.countryName;
          updateLocation(city, country);
        } catch (error) {
          console.error("Error fetching location:", error);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  }
}

// Detect location on page load
detectLocation();

async function fetchPrayerTimes(date) {
  const dateStr = moment(date).format("YYYY-MM-DD");
  const cacheKey = `prayer_${dateStr}_${currentFiqh}_${LOCATION.city}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/timingsByCity/${dateStr}?city=${LOCATION.city}&country=${LOCATION.country}&method=${LOCATION.method}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to fetch prayer times");
    }

    const timings = data.data.timings;

    // Adjust Asr time based on selected fiqh
    const asrTime =
      currentFiqh === "Hanafi"
        ? moment(timings.Asr, "HH:mm").add(52, "minutes")
        : moment(timings.Asr, "HH:mm");

    const formatted = {
      date: dateStr,
      suhur: moment(timings.Imsak, "HH:mm").format("HH:mm"),
      fajr: moment(timings.Fajr, "HH:mm").format("HH:mm"),
      sunrise: moment(timings.Sunrise, "HH:mm").format("HH:mm"),
      dhuhr: moment(timings.Dhuhr, "HH:mm").format("HH:mm"),
      asr: asrTime.format("HH:mm"),
      maghrib: moment(timings.Maghrib, "HH:mm").format("HH:mm"),
      isha: moment(timings.Isha, "HH:mm").format("HH:mm"),
    };

    cache.set(cacheKey, formatted);
    return formatted;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    return null;
  }
}

async function fetchRamadanTimes(year) {
  const ramadanStart = moment("2025-03-01"); // First day of Ramadan 2025
  const days = [];

  for (let i = 0; i < 30; i++) {
    const date = moment(ramadanStart).add(i, "days");
    const times = await fetchPrayerTimes(date);
    if (times) {
      days.push({
        ...times,
        ramadanDay: `Ramadan-${i + 1}`,
      });
    }
  }

  return days;
}

function formatDate(dateStr) {
  return moment(dateStr).format("DD MMM YYYY");
}

function formatTime(timeStr) {
  return moment(timeStr, "HH:mm").format("hh:mm A");
}

function getCurrentPrayer(prayers) {
  const now = moment();
  const times = [
    { name: "Suhur", time: moment(prayers.suhur, "HH:mm") },
    { name: "Fajr", time: moment(prayers.fajr, "HH:mm") },
    { name: "Sunrise", time: moment(prayers.sunrise, "HH:mm") },
    { name: "Dhuhr", time: moment(prayers.dhuhr, "HH:mm") },
    { name: "Asr", time: moment(prayers.asr, "HH:mm") },
    { name: "Maghrib", time: moment(prayers.maghrib, "HH:mm") },
    { name: "Isha", time: moment(prayers.isha, "HH:mm") },
  ];

  // Sort times for today
  const sortedTimes = times.sort((a, b) => a.time - b.time);
  
  // Find current active prayer
  for (let i = 0; i < sortedTimes.length; i++) {
    if (now.isBefore(sortedTimes[i].time)) {
      return sortedTimes[i-1]?.name || "Isha"; // Return previous prayer if exists, else Isha
    }
  }
  return "Isha"; // Default to Isha if after all prayers
}

function getNextPrayer(prayers) {
  const now = moment();
  const times = [
    { name: "Suhur", time: prayers.suhur },
    { name: "Fajr", time: prayers.fajr },
    { name: "Sunrise", time: prayers.sunrise },
    { name: "Dhuhr", time: prayers.dhuhr },
    { name: "Asr", time: prayers.asr },
    { name: "Maghrib", time: prayers.maghrib },
    { name: "Isha", time: prayers.isha },
  ];

  for (const prayer of times) {
    const prayerTime = moment(prayer.time, "HH:mm");
    if (now.isBefore(prayerTime)) {
      return {
        name: prayer.name,
        time: prayer.time,
        remaining: moment.duration(prayerTime.diff(now)),
      };
    }
  }

  return {
    name: "Suhur",
    time: times[0].time,
    remaining: moment.duration(times[0].time.diff(now)).add(1, 'days'),
  };
}

async function populateFullMonth() {
  const tbody = document.getElementById("fullMonthBody");
  const showMoreBtn = document.getElementById("showMoreBtn");
  tbody.innerHTML = `<tr><td colspan="9" class="px-4 py-2 text-center text-sm text-light">Loading...</td></tr>`;

  const ramadanTimes = await fetchRamadanTimes(2025);

  tbody.innerHTML = "";
  ramadanTimes.forEach((day, index) => {
    const row = document.createElement("tr");
    row.classList.add("table-row");
    // Show only first 10 rows by default
    if (index >= 10) {
      row.classList.add("hidden-row");
    }
    
    row.innerHTML = `
      <td class="px-4 py-2 whitespace-nowrap text-sm text-light text-opacity-60">${formatDate(
        day.date
      )}</td>
      <td class="px-4 py-2 whitespace-nowrap text-sm text-light text-opacity-60">${
        day.ramadanDay
      }</td>
      <td class="px-4 py-2 whitespace-nowrap text-sm text-light text-opacity-60">${formatTime(
        day.suhur
      )}</td>
      <td class="px-4 py-2 whitespace-nowrap text-sm text-light text-opacity-60">${formatTime(
        day.fajr
      )}</td>
      <td class="px-4 py-2 whitespace-nowrap text-sm text-light text-opacity-60">${formatTime(
        day.sunrise
      )}</td>
      <td class="px-4 py-2 whitespace-nowrap text-sm text-light text-opacity-60">${formatTime(
        day.dhuhr
      )}</td>
      <td class="px-4 py-2 whitespace-nowrap text-sm text-light text-opacity-60">${formatTime(
        day.asr
      )}</td>
      <td class="px-4 py-2 whitespace-nowrap text-sm text-light text-opacity-60">${formatTime(
        day.maghrib
      )}</td>
      <td class="px-4 py-2 whitespace-nowrap text-sm text-light text-opacity-60">${formatTime(
        day.isha
      )}</td>
    `;
    tbody.appendChild(row);
  });

  // Ensure button is visible and set initial text
  showMoreBtn.textContent = "Show More";
}

// Toggle between Show More and Show Less
document.getElementById("showMoreBtn").addEventListener("click", () => {
  const rows = document.querySelectorAll("#fullMonthBody .table-row");
  const showMoreBtn = document.getElementById("showMoreBtn");
  const isShowingMore = showMoreBtn.textContent === "Show Less";

  rows.forEach((row, index) => {
    if (index >= 10) {
      if (isShowingMore) {
        row.classList.add("hidden-row");
      } else {
        row.classList.remove("hidden-row");
      }
    }
  });

  showMoreBtn.textContent = isShowingMore ? "Show More" : "Show Less";
});

// Search filter functionality
document.getElementById("searchInput").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const rows = document.querySelectorAll("#fullMonthBody .table-row");

  rows.forEach((row) => {
    const date = row.cells[0].textContent.toLowerCase();
    const ramadanDay = row.cells[1].textContent.toLowerCase();
    if (date.includes(searchTerm) || ramadanDay.includes(searchTerm)) {
      row.classList.remove("hidden-row");
    } else {
      row.classList.add("hidden-row");
    }
  });
});

async function updateCurrentDay() {
  const currentDayBody = document.getElementById("currentDayBody");
  const currentTimeElement = document.getElementById("currentTime");
  const nextPrayerElement = document.getElementById("nextPrayer");

  // Show current time
  currentTimeElement.textContent = moment().format("hh:mm:ss A");

  // Get today's prayer times
  const todayData = await fetchPrayerTimes(moment());

  if (todayData) {
    const currentPrayer = getCurrentPrayer(todayData);
    const nextPrayer = getNextPrayer(todayData);
    nextPrayerElement.textContent = `Next Prayer: ${
      nextPrayer.name
    } at ${formatTime(
      nextPrayer.time
    )} (in ${nextPrayer.remaining.hours()}h ${nextPrayer.remaining.minutes()}m)`;

    currentDayBody.innerHTML = `
      <tr>
        <td class="px-4 py-8 whitespace-nowrap text-light text-lg text-center font-medium">${formatDate(
          todayData.date
        )}</td>
        <td class="px-4 py-8 whitespace-nowrap text-light text-lg text-center ${
          currentPrayer === "Suhur" ? "bg-secondary" : ""
        }">${formatTime(todayData.suhur)}</td>
        <td class="px-4 py-8 whitespace-nowrap text-light text-lg text-center ${
          currentPrayer === "Fajr" ? "bg-secondary" : ""
        }">${formatTime(todayData.fajr)}</td>
        <td class="px-4 py-8 whitespace-nowrap text-light text-lg text-center ${
          currentPrayer === "Sunrise" ? "bg-secondary" : ""
        }">${formatTime(todayData.sunrise)}</td>
        <td class="px-4 py-8 whitespace-nowrap text-light text-lg text-center ${
          currentPrayer === "Dhuhr" ? "bg-secondary" : ""
        }">${formatTime(todayData.dhuhr)}</td>
        <td class="px-4 py-8 whitespace-nowrap text-light text-lg text-center ${
          currentPrayer === "Asr" ? "bg-secondary" : ""
        }">${formatTime(todayData.asr)}</td>
        <td class="px-4 py-8 whitespace-nowrap text-light text-lg text-center ${
          currentPrayer === "Maghrib" ? "bg-secondary" : ""
        }">${formatTime(todayData.maghrib)}</td>
        <td class="px-4 py-8 whitespace-nowrap text-light text-lg text-center ${
          currentPrayer === "Isha" ? "bg-secondary" : ""
        }">${formatTime(todayData.isha)}</td>
      </tr>
    `;
  }
}

// Initialize tables
populateFullMonth();
updateCurrentDay();

// Update current time and next prayer every second
setInterval(updateCurrentDay, 1000);

// Check for date change every minute
setInterval(() => {
  const now = moment();
  if (now.hour() === 0 && now.minute() === 0) {
    updateCurrentDay();
    populateFullMonth();
  }
}, 60000);

// Download functionality
document.getElementById("downloadPdf").addEventListener("click", () => {
  const link = document.createElement('a');
  link.href = '../assets/Imdadia-Hafezi-Quran.pdf';
  link.download = 'Imdadia-Hafezi-Quran.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});