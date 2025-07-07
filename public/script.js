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

// const myShifts = dataFromServer.data.scheduleShift.reduce((acc, shift) => {
//   if( shift.person.id == "0007ce3c26229241a27bd3d4401f2187"){
//     acc.push(shift)
//   }
//   return acc;
// }, [])

// myShifts.map(())
