import axios from "axios";
import fs from "fs";

export default async (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  endDate.setTime(endDate.getTime() + 86400000); // Add one day to end date

  const date = `["${startDate.getUTCFullYear()}-${
    startDate.getUTCMonth() + 1
  }-${startDate.getUTCDate()}T06:00:00+00:00","${endDate.getUTCFullYear()}-${
    endDate.getUTCMonth() + 1
  }-${endDate.getUTCDate()}T05:59:59+00:00",true]`;

  const encodedDate = encodeURIComponent(date);

  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://app.joltup.com/rest/v1/ScheduleShift?scopes=%7B%22active%22:%5B%5D,%22checkForInvalidSwapTrades%22:%5B%5D,%22publishedScope%22:%5B%5D,%22previouslyOwnedScope%22:%7B%7D,%22location%22:%5B%2200001d1525a4fb561015740789fad14c%22%5D,%22inRange%22:${encodedDate}%7D&sort=%5B%7B%22property%22:%22startTime%22,%22direction%22:%22ASC%22%7D,%7B%22property%22:%22personId%22,%22direction%22:%22ASC%22%7D%5D&with=%7B%22swapRequest%22:%7B%22scopes%22:%7B%22active%22:%5B%5D,%22userPermissionScope%22:%5B%5D%7D,%22with%22:%7B%22approver%22:%7B%22alias%22:%22swapApprover%22%7D%7D%7D,%22pickupRequests%22:%7B%22scopes%22:%7B%22active%22:%5B%5D%7D,%22with%22:%7B%22newPerson%22:%7B%22scopes%22:%7B%22eagerThumbnailScope%22:%5B%22newPhoto%22,%22newThumb%22%5D%7D%7D,%22oldPerson%22:%7B%22scopes%22:%7B%22eagerThumbnailScope%22:%5B%22oldPhoto%22,%22oldThumb%22%5D%7D%7D,%22approver%22:%7B%7D%7D%7D,%22person%22:%7B%22scopes%22:%7B%22eagerThumbnailScope%22:%5B%5D%7D%7D,%22role%22:%7B%7D,%22hasStations%22:%7B%22scopes%22:%7B%22active%22:%5B%5D%7D%7D,%22stations%22:%7B%7D%7D`,
    headers: {
      Cookie: "PHPSESSID=o57u5oc2d00llhqrr4tr9oqjnc3a02np;",
    },
  };

  try {
    const requestData = await axios.request(config);
    return requestData.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
