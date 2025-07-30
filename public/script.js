// DOM element references
const startDateElement = document.querySelector("#start");
const endDateElement = document.querySelector("#end");
const submitButton = document.querySelector("#submit");
const selectCurrentWeekButton = document.querySelector("#selectCurrentWeek");
const findPersonInput = document.querySelector("#findPerson");

let pageCurrentShifts = [];

/**
 * Handles the submit button click to fetch and display shifts
 */
const submitButtonClickHandler = async () => {
  try {
    const requestData = JSON.stringify({
      start: startDateElement.value,
      end: endDateElement.value,
    });

    const encodedData = encodeURI(requestData);
    const response = await fetch(
      `http://192.168.1.16:3000/get-shifts-for-date-range?data=${encodedData}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const shifts = data.data.scheduleShift;

    // Filter shifts that have both stations and person data
    const cashiershifts = shifts.filter((shift) => {
      return shift.role.name.includes("Cashier");
    });

    pageCurrentShifts = cashiershifts;

    drawChart(formatShifts(cashiershifts));
  } catch (error) {
    console.error("Error fetching shifts:", error);
  }
};

/**
 * Sets the date inputs to the current week (Sunday to Saturday)
 */
const selectCurrentWeekClickHandler = () => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Set to the first day of the week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to the last day of the week (Saturday)

  startDateElement.value = startOfWeek.toISOString().split("T")[0];
  endDateElement.value = endOfWeek.toISOString().split("T")[0];
};

// Event listeners
submitButton.addEventListener("click", submitButtonClickHandler);
selectCurrentWeekButton.addEventListener("click", (e) => {
  e.preventDefault();
  selectCurrentWeekClickHandler();
});

// Initialize Google Charts
google.charts.load("current", { packages: ["timeline"] });

/**
 * Gets the order number for a station to determine sorting order
 * @param {string} station - The station name
 * @returns {number} The order number for the station
 */
const getStationOrderNumber = (station) => {
  let num;
  if (station.includes("Gift")) num = 1;
  else if (station.includes("Grants")) num = 2;
  else if (station.includes("Golf")) num = 3;
  else if (
    station.includes("Maze") ||
    station === "Monkey Mayhem" ||
    station === "Rock"
  )
    num = 4;
  else {
    num = 5;
  }

  if (station.includes("Head")) {
    num -= 0.5;
  }
  if (station.includes("Register")) {
    num -= 0.25;
  }

  return num;
};

/**
 * Gets the color for a station based on its type
 * @param {string} station - The station name
 * @returns {string} The color hex code for the station
 */
const getStationColor = (station) => {
  const stationNum = Math.ceil(getStationOrderNumber(station));
  switch (stationNum) {
    case 1:
      return "#e37171";
    case 2:
      return "#eeff6d";
    case 3:
      return "#7ed57c";
    case 4:
      return "#573caf";
    case 5:
      return "#9032b5";
    default:
      return "#4bb6ce"; // Fallback color
  }
};

/**
 * Formats shifts data for display in the chart
 * @param {Array} shifts - Array of shift objects
 * @returns {Array} Formatted shifts grouped by date
 */
const formatShifts = (shifts) => {
  shifts.sort((a, b) => a.startTime - b.startTime);

  const formattedShifts = shifts.reduce((acc, shift, index, allShifts) => {
    const displayName = `${shift.person.firstName} ${shift.person.lastName}`;
    let style = `stroke-color: ${getStationColor(
      shift.stations[0].name
    )}; stroke-width: 5; color: #ffffff`;

    if (
      displayName.toLowerCase().includes(findPersonInput.value.toLowerCase()) &&
      findPersonInput.value
    ) {
      style = `stroke-color: ${getStationColor(
        shift.stations[0].name
      )}; stroke-width: 5; color: #353535`;
    }
    if (shift.pickupRequests) {
      console.log(shift.pickupRequests);
      style = `stroke-color: #ff00ff; stroke-width: 5; color: #ff0000`;
    }

    const shiftDate = new Date(shift.startTime * 1000).toLocaleDateString();
    const shiftForChart = [
      shift.stations[0].name,
      displayName,
      style,
      new Date(shift.startTime * 1000),
      new Date(shift.endTime * 1000),
    ];

    // Sort the last group when we reach the end
    if (index === allShifts.length - 1) {
      acc[acc.length - 1][0].sort((a, b) => {
        if (getStationOrderNumber(a[0]) !== getStationOrderNumber(b[0])) {
          return getStationOrderNumber(a[0]) - getStationOrderNumber(b[0]);
        }
        return a[0].localeCompare(b[0]);
      });
    }

    if (index === 0) {
      acc.push([[shiftForChart], shiftDate]);
    } else if (shiftDate === acc[acc.length - 1][1]) {
      acc[acc.length - 1][0].push(shiftForChart);
    } else {
      // Sort the previous group before starting a new one
      acc[acc.length - 1][0].sort((a, b) => {
        if (getStationOrderNumber(a[0]) !== getStationOrderNumber(b[0])) {
          return getStationOrderNumber(a[0]) - getStationOrderNumber(b[0]);
        }
        return a[0].localeCompare(b[0]);
      });
      acc.push([[shiftForChart], shiftDate]);
    }

    return acc;
  }, []);

  return formattedShifts;
};

findPersonInput.addEventListener("input", () => {
  drawChart(formatShifts(pageCurrentShifts));
});

/**
 * Draws the timeline chart for the shifts
 * @param {Array} shifts - Formatted shifts data grouped by date
 */
function drawChart(shifts) {
  // Clear existing charts
  document.getElementById("shiftDisplay").innerHTML = "";

  shifts.forEach(([shiftsForDate, date]) => {
    const personName = findPersonInput.value;
    const personContainedOnDate = shiftsForDate.filter((shift) => {
      return shift[1].toLowerCase().includes(personName.toLowerCase());
    }).length;

    console.log(personContainedOnDate, personName, date);

    if (!personContainedOnDate) {
      return;
    }

    const dateContainer = document.createElement("div");
    dateContainer.className = "shiftsForDateContainer";

    const dateHeader = document.createElement("h2");
    dateHeader.innerText = new Date(date).toDateString();
    dateHeader.className = "dateHeader";

    document.getElementById("shiftDisplay").appendChild(dateHeader);
    document.getElementById("shiftDisplay").appendChild(dateContainer);

    const chart = new google.visualization.Timeline(dateContainer);
    const dataTable = new google.visualization.DataTable();

    dataTable.addColumn({ type: "string", id: "Position" });
    dataTable.addColumn({ type: "string", id: "Name" });
    dataTable.addColumn({ type: "string", id: "style", role: "style" });
    dataTable.addColumn({ type: "date", id: "Start" });
    dataTable.addColumn({ type: "date", id: "End" });

    dataTable.addRows(shiftsForDate);

    chart.draw(dataTable);
  });
}
