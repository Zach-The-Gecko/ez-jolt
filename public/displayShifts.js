const COLORS = {
  GIFT: "#FF5733",
  GIFT_HEAD: "#FF6F61",
  GRANTS: "#33FF57",
  GRANTS_HEAD: "#61FF6F",
  GOLF: "#3357FF",
  GOLF_HEAD: "#616FFF",
};

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
      "color: red;",
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

  return formattedShifts;
};

const drawChart = (shifts) => {
  console.log(shifts);
  shifts.map(([shiftsForDate, date]) => {
    const dateContainer = document.createElement("div");
    dateContainer.className = "shiftsForDateContainer";
    const dateHeader = document.createElement("h2");
    dateHeader.innerText = date;
    dateHeader.className = "dateHeader";
    document.getElementById("shiftDisplay").appendChild(dateHeader);

    document.getElementById("shiftDisplay").appendChild(dateContainer);

    const chart = new google.visualization.Timeline(dateContainer);
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: "string", id: "Position" });
    dataTable.addColumn({ type: "string", id: "Name" });
    dataTable.addColumn({ type: "date", id: "Start" });
    dataTable.addColumn({ type: "date", id: "End" });
    dataTable.addColumn({ type: "string", id: "style", role: "style" });

    dataTable.addRows(shiftsForDate);

    // const options = {
    //   timeline: { colorByRowLabel: true },
    //   // alternatingRowStyle: false,
    //   colors: ["#cbb69d", "#603913", "#c69c6e"],
    // };

    chart.draw(dataTable);
  });
};

const fetchAndDrawCharts = () => {
  fetch("/get-shifts-for-date-range")
    .then((response) => response.json())
    .then((data) => {
      const shifts = data.data.scheduleShift;
      const cashierShifts = shifts.filter((shift) => {
        return shift.role.name.includes("Cashier");
      });
      drawChart(formatShifts1(cashierShifts));
    })
    .catch((error) => {
      console.error("Error fetching shifts:", error);
    });
};

document.addEventListener("click", fetchAndDrawCharts);
