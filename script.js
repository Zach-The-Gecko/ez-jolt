import axios from "axios";
import fs from "fs";

const date = `["2025-07-03T15:23:41+00:00",null,false]`;
const encodedDate = encodeURIComponent(date);

let config = {
  method: "get",
  maxBodyLength: Infinity,
  url: `https://app.joltup.com/rest/v1/ScheduleShift?scopes=%7B%22active%22:%5B%5D,%22checkForInvalidSwapTrades%22:%5B%5D,%22publishedScope%22:%5B%5D,%22previouslyOwnedScope%22:%7B%7D,%22location%22:%5B%2200001d1525a4fb561015740789fad14c%22%5D,%22inRange%22:${encodedDate},%22tradePendingScope%22:%5B%5D%7D&sort=%5B%7B%22property%22:%22startTime%22,%22direction%22:%22ASC%22%7D,%7B%22property%22:%22personId%22,%22direction%22:%22ASC%22%7D%5D&with=%7B%22swapRequest%22:%7B%22scopes%22:%7B%22active%22:%5B%5D,%22userPermissionScope%22:%5B%5D%7D,%22with%22:%7B%22approver%22:%7B%22alias%22:%22swapApprover%22%7D%7D%7D,%22pickupRequests%22:%7B%22scopes%22:%7B%22active%22:%5B%5D%7D,%22with%22:%7B%22newPerson%22:%7B%22scopes%22:%7B%22eagerThumbnailScope%22:%5B%22newPhoto%22,%22newThumb%22%5D%7D%7D,%22oldPerson%22:%7B%22scopes%22:%7B%22eagerThumbnailScope%22:%5B%22oldPhoto%22,%22oldThumb%22%5D%7D%7D,%22approver%22:%7B%7D%7D%7D,%22person%22:%7B%22scopes%22:%7B%22eagerThumbnailScope%22:%5B%5D%7D%7D,%22role%22:%7B%7D,%22hasStations%22:%7B%22scopes%22:%7B%22active%22:%5B%5D%7D%7D,%22stations%22:%7B%7D%7D`,
  headers: {
    Cookie: "PHPSESSID=o57u5oc2d00llhqrr4tr9oqjnc3a02np;",
  },
};

axios
  .request(config)
  .then((response) => {
    fs.writeFileSync("res_3.json", JSON.stringify(response.data, null, 2));
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
