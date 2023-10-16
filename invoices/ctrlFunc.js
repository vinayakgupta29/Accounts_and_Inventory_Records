const { InvoiceLines } = require("./invoiveModels");

const InvoiceActions = {
  today: () => `WHERE DATE(date_time) = CURRENT_DATE`,
  toAndFromDate: (sdate, endate) =>
    `WHERE date_time BETWEEN '${sdate}' AND '${endate}'`,

  thisMonth: () =>
    `WHERE EXTRACT(MONTH FROM date_time) = EXTRACT(MONTH FROM CURRENT_DATE);`,

  thisWeek: () =>
    `WHERE EXTRACT(WEEK FROM date_time) = EXTRACT(WEEK FROM CURRENT_DATE);`,

  thisQuater: () =>
    `WHERE CEIL(EXTRACT(MONTH FROM date_time) / 3.0) = CEIL(EXTRACT(MONTH FROM CURRENT_DATE) / 3.0);`,

  thisYear: () =>
    `WHERE EXTRACT(YEAR FROM date_time) = EXTRACT(YEAR FROM CURRENT_DATE);`,

  beforeDate: (e, date) => `WHERE date_time <= '${date}' `,

  afterDate: (date, e) => `WHERE date_time >= '${date}' `,
  all: () => ``,
};

async function getAmountInsertInvoiceLineRecord(
  client,
  username,
  invoiceId,
  contents
) {
  for (let doc of contents) {
    const unit_price = (
      await client.query(
        `SELECT unit_price FROM ${username}_inventory WHERE id=$1;`,
        [doc.product_id]
      )
    ).rows[0];
    doc.amount = unit_price.unit_price * doc.quantity; // Access the unit_price value
    await InvoiceLines.createTable(client, username);
    await InvoiceLines.insertRecord(client, username, invoiceId, doc);
  }
}

function formatISODate(isoDateString, monthNames) {
  const date = new Date(isoDateString);
  // Get the month and day from the date

  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  // Format the result as "Month,Day"
  const formattedDate = `${month} ${day}`;
  return formattedDate;
}

function renderGraph(chartData, reqLabel) {
  const timeStamps = chartData.map((i) => new Date(i.date));
  var highest = Math.max(...timeStamps);
  var lowest = Math.min(...timeStamps);
  const interval = (highest - lowest) / 10;
  const dates = chartData.map((i) => i.date);
  var arr = [];
  for (let i = 1; i <= 10; i++) {
    arr.push(lowest + i * interval);
  }
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const values = chartData.map((item) => item[reqLabel]);
  const itemData = {}; // Create an object to group data by item

  chartData.forEach((item) => {
    // Convert the date string to a Date object
    const date = new Date(item.date);

    // Calculate the y-value (amount/quantity)
    const yValue = parseFloat(item.amount) / item.quantity;

    // Create or append to the itemData object
    if (!itemData[item.item]) {
      itemData[item.item] = { labels: [], data: [] };
    }

    // Push the date to labels and yValue to data for the corresponding item
    itemData[item.item].labels.push(date);
    itemData[item.item].data.push(yValue);
  });

  const colors = [
    "#6c4c7c",
    "#0c84a4",
    "#8cdcd4",
    "#cc442c",
    "#9cdc64",
    "#f4cc5c",
    "##fca454",
    "#2c90c0",
    "#dcd878",
  ];

  const datasets = Object.entries(itemData).map(
    ([item, { labels, data }, index]) => ({
      label: item,
      data: data,
      fill: false,
      backgroundColor: colors[index % colors.length],
      borderWidth: 2,
    })
  );
  const labels = arr.map((item) => formatISODate(item, monthNames));
  const subText = new Date(highest).getFullYear();
  const html = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Chart</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </head>
      <body>    <canvas id="myChart" width="1000" height="400"></canvas>
      <script>
      const datasets = ${JSON.stringify(datasets)};
      const myChart = new Chart(document.getElementById("myChart").getContext("2d"), {
        type: "line", // Choose the chart type (e.g., 'bar', 'line', 'pie')
        data: {
          labels: ${JSON.stringify(labels)},
          datasets: datasets,
        },
        options: {
          responsive: false, // Set to true for responsive charts
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    </script>
       <h2><center> Sales of the year ${subText} </center></h2>
      </body>
      </html>`;
  return html;
}
module.exports = {
  InvoiceActions,
  getAmountInsertInvoiceLineRecord,
  formatISODate,
  renderGraph,
};
