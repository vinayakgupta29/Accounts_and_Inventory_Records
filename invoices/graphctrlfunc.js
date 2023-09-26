function formatISODateToMonthDay(isoDateString, monthNames) {
  const date = new Date(isoDateString);
  // Get the month and day from the date
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  // Format the result as "Month,Day"
  const formattedDate = `${month},${day}`;
  console.log(formattedDate);

  return formattedDate;
}


export { formatISODateToMonthDay };
