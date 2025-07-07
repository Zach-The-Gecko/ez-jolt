const displayCashierShifts = (shifts) => {
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
  console.log(formattedShifts);
};

document.addEventListener("click", () => {
  fetch("/get-shifts-for-date-range")
    .then((response) => response.json())
    .then((data) => {
      const shifts = data.data.scheduleShift;
      const cashierShifts = shifts.filter((shift) => {
        return shift.role.name.includes("Cashier");
      });
      displayCashierShifts(cashierShifts);
    })
    .catch((error) => {
      console.error("Error fetching shifts:", error);
    });
});
