google.charts.load("current", { packages: ["timeline"] });

const formatShifts = (shifts) => {
  const formattedShifts = shifts.reduce((acc, shift) => {
    const shiftDate = new Date(shift.startTime * 1000);
    if (!acc[shiftDate.toDateString()]) {
      acc[shiftDate.toDateString()] = {
        Gift: { "Head Cashier": [], Cashier: [] },
        Grants: { "Head Cashier": [], Cashier: [] },
        "Golf / Maze": { "Head Cashier": [], Cashier: [] },
        Other: { "Head Cashier": [], Cashier: [] },
      };
    }
    const station = shift.stations[0].name;
    if (shift.stations.length > 1) {
      console.warn(
        `Shift on ${shiftDate.toDateString()} has multiple stations: ${shift.stations
          .map((s) => s.name)
          .join(", ")}`
      );
    }
    let location = "";
    if (station.includes("Gift")) {
      location = "Gift";
    } else if (station.includes("Grants")) {
      location = "Grants";
    } else if (
      station.includes("Golf") ||
      station.includes("Maze") ||
      station === "Rock" ||
      station === "Monkey Mayhem"
    ) {
      location = "Golf / Maze";
    } else {
      console.warn(`Unknown station: ${station}`);
      location = "Other";
    }

    acc[shiftDate.toDateString()][location][shift.role.name].push(shift);
    return acc;
  }, {});
  return formattedShifts;
};

const drawChart = (shifts) => {
  Object.entries(shifts).map(([date, shiftsForDate]) => {
    const dateContainer = document.createElement("div");
    dateContainer.className = "shiftsForDateContainer";
    Object.entries(shiftsForDate).map(([location, shifts]) => {
      const locationContainer = document.createElement("div");
      locationContainer.className = "location-container";
      locationContainer.innerHTML = `<h3>${location}</h3>`;
      shifts["Head Cashier"].map((shift) => {
        const shiftElement = document.createElement("div");
        shiftElement.className = "shift";
        shiftElement.innerHTML = `Shift: ${shift.id}`;
        locationContainer.appendChild(shiftElement);
      });
      shifts.Cashier.forEach((shift) => {
        const shiftElement = document.createElement("div");
        shiftElement.className = "shift";
        shiftElement.innerHTML = `Shift: ${shift.id}`;
        locationContainer.appendChild(shiftElement);
      });
      dateContainer.appendChild(locationContainer);
    });

    const dateHeader = document.createElement("h2");
    dateHeader.innerText = date;
    dateHeader.className = "dateHeader";
    document.getElementById("shiftDisplay").appendChild(dateHeader);

    document.getElementById("shiftDisplay").appendChild(dateContainer);

    // var container = document.getElementById("Grants");
    // var chart = new google.visualization.Timeline(container);
    // var dataTable = new google.visualization.DataTable();
    // dataTable.addColumn({ type: "string", id: "Position" });
    // dataTable.addColumn({ type: "string", id: "Name" });
    // dataTable.addColumn({ type: "date", id: "Start" });
    // dataTable.addColumn({ type: "date", id: "End" });
    // dataTable.addRows([
    //   ["Shift", "Shift 1", new Date(1751896800000), new Date(1751905800000)],
    //   ["Shift", "Shift 2", new Date(1751905800000), new Date(1751919600000)],
    //   ["Shift", "Shift 3", new Date(1751919600000), new Date(1751919600000)],
    // ]);

    // chart.draw(dataTable);
  });
};

document.addEventListener("click", () => {
  fetch("/get-shifts-for-date-range")
    .then((response) => response.json())
    .then((data) => {
      const shifts = data.data.scheduleShift;
      const cashierShifts = shifts.filter((shift) => {
        return shift.role.name.includes("Cashier");
      });
      console.log(formatShifts(cashierShifts));
      drawChart(formatShifts(cashierShifts));
    })
    .catch((error) => {
      console.error("Error fetching shifts:", error);
    });
});
