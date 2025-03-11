// Fetch User Location
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`
            )
              .then((response) => response.json())
              .then((data) => {
                document.getElementById(
                  "user-location"
                ).textContent = `Location: ${data.city}, ${data.countryName}`;
              });
          },
          () => {
            document.getElementById("user-location").textContent =
              "Location: Unknown";
          }
        );

        // Display Current Date
        const today = new Date();
        const options = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };
        const arabicDate = today.toLocaleDateString("ar-SA", options);
        const englishDate = today.toLocaleDateString("en-US", options);

        document.getElementById(
          "current-date"
        ).innerHTML = `${englishDate} | ${arabicDate}`;