const startDateElement = document.querySelector("#start");
const endDateElement = document.querySelector("#end");
const submitButton = document.querySelector("#submit");

submitButton.addEventListener("click", () => {
  const requestData = JSON.stringify({
    start: startDateElement.value,
    end: endDateElement.value,
  });

  console.log(requestData); // This is where you would send the request to your server or API
});
