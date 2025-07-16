const startDateElement = document.querySelector("#start");
const endDateElement = document.querySelector("#end");
const submitButton = document.querySelector("#submit");
const selectCurrentWeekButton = document.querySelector("#selectCurrentWeek");

submitButton.addEventListener("click", async () => {
  const requestData = JSON.stringify({
    start: startDateElement.value,
    end: endDateElement.value,
  });

  const encodedData = encodeURI(requestData);
  const response = await fetch(
    "http://localhost:3000/get-shifts-for-date-range?data=" + encodedData
  );
  const data = await response.json();

  const shifts = data.data.scheduleShift;
  const cashierShifts = shifts.filter((shift) => {
    // return shift.role.name.includes("Cashier");
    if (!shift.stations || !shift.person) {
      console.log(shift);
    }
    return shift.stations && shift.person;
  });

  drawChart(formatShifts1(cashierShifts));

  // fetch("/get-shifts-for-date-range")
  //   .then((response) => response.json())
  //   .then((data) => {
  //     const shifts = data.data.scheduleShift;
  //     const cashierShifts = shifts.filter((shift) => {
  //       return shift.role.name.includes("Cashier");
  //     });
  //     drawChart(formatShifts1(cashierShifts));
  //   })

  console.log(data);
});

selectCurrentWeekButton.addEventListener("click", () => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Set to the first day of the week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to the last day of the week (Saturday)

  startDateElement.value = startOfWeek.toISOString().split("T")[0];
  endDateElement.value = endOfWeek.toISOString().split("T")[0];
});

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

const formatShifts1 = (shifts) => {
  shifts.sort((a, b) => a.startTime - b.startTime);
  const formattedShifts = shifts.reduce((acc, shift, index, allShifts) => {
    const shiftDate = new Date(shift.startTime * 1000).toLocaleDateString();
    const shiftForChart = [
      shift.stations[0].name,
      `${shift.person.firstName} ${shift.person.lastName}`,
      `color: ${getStationColor(
        shift.stations[0].name
      )}; stroke-width: 2; stroke-color: #000000`,
      new Date(shift.startTime * 1000),
      new Date(shift.endTime * 1000),
    ];

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

function drawChart(shifts) {
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
    dataTable.addColumn({ type: "string", id: "style", role: "style" });
    // dataTable.addColumn({ <---- Add this line to include styles, something with function notation instead of arrow notation and writing functiond eclaration after writing the function that calls it??? I have no idea
    dataTable.addColumn({ type: "date", id: "Start" });
    dataTable.addColumn({ type: "date", id: "End" });

    dataTable.addRows(shiftsForDate);

    const options = {
      // timeline: { colorByRowLabel: true },
      // alternatingRowStyle: false,
      colors: ["#e38484", "#e2a3a3"],
    };

    chart.draw(dataTable, options);
  });
}

// const myShifts = dataFromServer.data.scheduleShift.reduce((acc, shift) => {
//   if( shift.person.id == "0007ce3c26229241a27bd3d4401f2187"){
//     acc.push(shift)
//   }
//   return acc;
// }, [])

// myShifts.map(())
