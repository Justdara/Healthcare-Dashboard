// Access the environment variables from the window.env object
async function fetchData() {
  let url = "https://fedskillstest.coalitiontechnologies.workers.dev";
  let username = window.env.USERNAME;
  let password = window.env.PASSWORD;
  let auth = btoa(`${username}:${password}`);

  // fetch api response
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Network response was not ok " + response.statusText);
  }

  const data = await response.json();
  // Filter data to get only Jessica Taylor's details
  const jessicaData = data.find((person) => person.name === "Jessica Taylor");
  if (data) {
    displayData(jessicaData);
  } else {
    console.log("Jessica Taylor not found");
  }
}
// display all neccessary data
function displayData(person) {
  document.getElementById("profile_picture").src = person.profile_picture;
  document.getElementById("name").textContent = person.name;

  const dob = new Date(person.date_of_birth);
  const formattedDob = dob.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  document.getElementById("date_of_birth").textContent = formattedDob;

  document.getElementById("gender").textContent = person.gender;
  document.getElementById("emergency_contact").textContent =
    person.emergency_contact;
  document.getElementById("insurance_type").textContent = person.insurance_type;
  document.getElementById("phone_number").textContent = person.phone_number;
  document.getElementById("systolic_value").textContent =
    person.diagnosis_history[0].blood_pressure.systolic.value;
  document.getElementById("systolic_level").textContent =
    person.diagnosis_history[0].blood_pressure.systolic.levels;
  document.getElementById("diastolic_value").textContent =
    person.diagnosis_history[0].blood_pressure.diastolic.value;
  document.getElementById("diastolic_level").textContent =
    person.diagnosis_history[0].blood_pressure.diastolic.levels;

  // Populating lab results
  const labResults = document.getElementById("lab-results");
  person.lab_results.forEach((r) => {
    const li = document.createElement("li");
    li.textContent = r;
    labResults.appendChild(li);
  });
  // Populating  diagnostic list
  const diagnosticListContainer = document.getElementById("diagnostic_list");
  diagnosticListContainer.innerHTML = ""; // Clear previous content
  person.diagnostic_list.forEach((diagnostic) => {
    const diagnosticDiv = document.createElement("div");
    diagnosticDiv.classList.add("item");
    diagnosticDiv.innerHTML = `
           <p>${diagnostic.name}</p>
           <p>${diagnostic.description}</p>
           <p>${diagnostic.status}</p>
       `;
    diagnosticListContainer.appendChild(diagnosticDiv);
  });
  // populating diagnosis history for the chart
  document.getElementById(
    "respiratory_rate"
  ).textContent = `${person.diagnosis_history[0].respiratory_rate.value} bpm`;
  document.getElementById(
    "temperature"
  ).textContent = `${person.diagnosis_history[0].temperature.value}°F`;
  document.getElementById(
    "heart_rate"
  ).textContent = `${person.diagnosis_history[0].heart_rate.value} bpm`;

  document.getElementById("respiratory_level").textContent =
    person.diagnosis_history[0].respiratory_rate.levels;
  document.getElementById("temperature_level").textContent =
    person.diagnosis_history[0].temperature.levels;
  document.getElementById("heart_level").textContent =
    person.diagnosis_history[0].heart_rate.levels;

  const getLastSixMonthsData = (data) => {
    return data.slice(0, 6).reverse();
  };

  const lastSixMonthsData = getLastSixMonthsData(person.diagnosis_history);

  const getLastSixSystolicData = (data) => {
    return data.slice(0, 6).reverse();
  };

  const lastSixSystolicData = getLastSixSystolicData(person.diagnosis_history);

  const getLastSixDiastolicData = (data) => {
    return data.slice(0, 6).reverse();
  };

  const lastSixDiastolicData = getLastSixDiastolicData(
    person.diagnosis_history
  );

  const labels = lastSixMonthsData.map(
    (entry) => `${entry.month.slice(0, 3)}, ${entry.year}`
  );
  const systolicData = lastSixSystolicData.map(
    (entry) => entry.blood_pressure.systolic.value
  );
  const diastolicData = lastSixDiastolicData.map(
    (entry) => entry.blood_pressure.diastolic.value
  );

  // Create the line chart
  const ctx = document.getElementById("myChart");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Systolic",
          data: systolicData,
          borderColor: "#E66FD2",
          backgroundColor: "#E66FD2",
          fill: false,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: "#E66FD2",
        },
        {
          label: "Diastolic",
          data: diastolicData,
          borderColor: "#7E6CAB",
          backgroundColor: "#7E6CAB",
          fill: false,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: "#7E6CAB",
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: false,
          min: 60,
          max: 180,
          stepSize: 20,
          ticks: {
            color: "black",
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "black",
          },
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Blood Pressure",
          align: "start",
          color: "black",
          font: {
            family: "Manrope, sans-serif",
            size: 17,
            weight: "bold",
          },
          padding: { bottom: 20, top: 20 },
        },
        legend: {
          display: false, // Hide legend
        },
      },
    },
    // adding second title
    plugins: [
      {
        id: "secondTitle",
        beforeDraw: (chart) => {
          const ctx = chart.ctx;
          ctx.save();
          ctx.font = "15px Manrope, sans-serif";
          ctx.fillStyle = "black";
          ctx.textAlign = "right";
          ctx.fillText("Last 6 months", chart.width - 50, 34);

          const img = new Image();
          img.src = "assets/expand_more_FILL0_wght300_GRAD0_opsz24.png";
          img.onload = function () {
            ctx.drawImage(img, chart.width - 40, 26, 10, 6);
          };

          ctx.restore();
        },
      },
    ],
  });
}

window.onload = fetchData;
