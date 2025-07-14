google.charts.load("current", { packages: ["timeline"] });

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

const formatShifts1 = (shifts) => {
  shifts.sort((a, b) => a.startTime - b.startTime);
  const formattedShifts = shifts.reduce((acc, shift, index, allShifts) => {
    const shiftDate = new Date(shift.startTime * 1000).toLocaleDateString();
    const shiftForChart = [
      shift.stations[0].name,
      `${shift.person.firstName} ${shift.person.lastName}`,
      new Date(shift.startTime * 1000),
      new Date(shift.endTime * 1000),
    ];

    if (index === 0) {
      acc.push([[shiftForChart], shiftDate]);
    } else if (shiftDate === acc[acc.length - 1][1]) {
      acc[acc.length - 1][0].push(shiftForChart);
    } else {
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

  shifts.forEach((shift) => console.log(shift.stations[0].name));

  console.log(formattedShifts);
};

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
    const shiftsToDraw = Object.entries(shiftsForDate).map(
      ([location, shifts]) => {
        const chartData = [];

        const locationContainer = document.createElement("div");
        locationContainer.className = "locationContainer";
        const locationHeader = document.createElement("h3");
        locationHeader.innerText = location;
        locationHeader.className = "locationHeader";
        locationContainer.appendChild(locationHeader);

        dateContainer.appendChild(locationContainer);

        shifts["Head Cashier"].map((shift) => {
          chartData.push([
            shift.stations[0].name,
            `${shift.person.firstName} ${shift.person.lastName}`,
            new Date(shift.startTime * 1000),
            new Date(shift.endTime * 1000),
          ]);
        });
        shifts.Cashier.map((shift) => {
          chartData.push([
            shift.stations[0].name,
            `${shift.person.firstName} ${shift.person.lastName}`,
            new Date(shift.startTime * 1000),
            new Date(shift.endTime * 1000),
          ]);
        });

        return [locationContainer, chartData];
      }
    );

    const dateHeader = document.createElement("h2");
    dateHeader.innerText = date;
    dateHeader.className = "dateHeader";
    document.getElementById("shiftDisplay").appendChild(dateHeader);

    document.getElementById("shiftDisplay").appendChild(dateContainer);

    shiftsToDraw.forEach(([locationContainer, chartData]) => {
      const chart = new google.visualization.Timeline(locationContainer);
      const dataTable = new google.visualization.DataTable();
      dataTable.addColumn({ type: "string", id: "Position" });
      dataTable.addColumn({ type: "string", id: "Name" });
      dataTable.addColumn({ type: "date", id: "Start" });
      dataTable.addColumn({ type: "date", id: "End" });
      dataTable.addRows(chartData);

      chart.draw(dataTable);
    });
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
      console.log(formatShifts1(cashierShifts));
      // drawChart(formatShifts(cashierShifts));
    })
    .catch((error) => {
      console.error("Error fetching shifts:", error);
    });
});
