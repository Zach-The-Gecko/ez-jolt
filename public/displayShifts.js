google.charts.load("current", { packages: ["timeline"] });

const formatShifts = (shifts) => {
  const formattedShifts = shifts.reduce((acc, shift) => {
    const shiftDate = new Date(shift.startTime * 1000);
    if (!acc[shiftDate.toDateString()]) {
      acc[shiftDate.toDateString()] = {
        gift: { "Head Cashier": [], Cashier: [] },
        grants: { "Head Cashier": [], Cashier: [] },
        golfMaze: { "Head Cashier": [], Cashier: [] },
        other: { "Head Cashier": [], Cashier: [] },
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
      location = "gift";
    } else if (station.includes("Grants")) {
      location = "grants";
    } else if (
      station.includes("Golf") ||
      station.includes("Maze") ||
      station === "Rock" ||
      station === "Monkey Mayhem"
    ) {
      location = "golfMaze";
    } else {
      console.warn(`Unknown station: ${station}`);
      location = "other";
    }

    acc[shiftDate.toDateString()][location][shift.role.name].push(shift);
    return acc;
  }, {});
  return formattedShifts;
};

const drawChart = (shifts) => {
  var container = document.getElementById("grants");
  var chart = new google.visualization.Timeline(container);
  var dataTable = new google.visualization.DataTable();
  dataTable.addColumn({ type: "string", id: "Position" });
  dataTable.addColumn({ type: "string", id: "Name" });
  dataTable.addColumn({ type: "date", id: "Start" });
  dataTable.addColumn({ type: "date", id: "End" });
  dataTable.addRows([
    ["Shift", "Shift 1", new Date(1751896800000), new Date(1751905800000)],
    ["Shift", "Shift 2", new Date(1751905800000), new Date(1751919600000)],
    ["Shift", "Shift 3", new Date(1751919600000), new Date(1751919600000)],
  ]);

  chart.draw(dataTable);
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
