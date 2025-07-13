google.charts.load("current", { packages: ["timeline"] });

const formatShifts1 = (shifts) => {
  shifts.sort((a, b) => a.startTime - b.startTime);
  const formattedShifts = shifts.reduce(
    (acc, shift, index, allShifts) => {
      if (index === 0) {
        acc[0].push([shift]);
      } else {
        previousShiftDate = new Date(allShifts[index - 1].startTime * 1000);
        currentShiftDate = new Date(shift.startTime * 1000);
        if (
          previousShiftDate.toDateString() === currentShiftDate.toDateString()
        ) {
          acc[1]++;
          acc[0].push(shift);
        }
      } // Not sure why I'm using date Index, fix this later
      console.log(acc[1]);
      return acc;
    },
    [[], { dateIndex: 0 }]
  );
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
