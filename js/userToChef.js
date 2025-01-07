// Add click event listener to the button
document
  .getElementById("requestChef")
  .addEventListener("click", async function (event) {
    event.preventDefault();

    const token = localStorage.getItem("id_token");

    if (!token) {
      alert("User not authenticated!");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userEmail = payload["email"];
      const userGroup = payload["cognito:groups"]
        ? payload["cognito:groups"][0]
        : null;

      if (userGroup && userGroup !== "SimpleUser") {
        alert("You are already a chef!");
        return;
      }

      const apiUrl = "https://gcyu5g0u93.execute-api.us-east-1.amazonaws.com/prod/check-request";
      const requestData = { email: userEmail };
      // Make the POST request to the server
      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })
        .then((response) => {
          // Check if the response is OK
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          return response.json(); // Parse response body as JSON
        })
        .then((data) => {
          console.log("Response from server:", data);

          // Assuming the server response has the relevant number in the `body`
          const statusCode = data.body;

          // Check the returned data and handle accordingly
          if (statusCode === "1") {
            alert("Your request is pending approval.");
          } else if (statusCode === "2") {
            alert("Your previous request was rejected.");
          } else {
            sendRequest(userEmail);
          }
        })
        .catch((error) => {
          // Handle errors
          console.error("Error:", error);

          if (error.message.includes("Failed to fetch")) {
            alert(
              "Failed to connect to the server. Please check your internet connection or try again later."
            );
          } else if (error.message.includes("500")) {
            alert("Server error. Please try again later.");
          } else {
            alert("An unexpected error occurred. Please try again.");
          }
        });
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to communicate with the server. Please try again.");
    }
  });

function sendRequest(userEmail) {
  // API endpoint (replace with your actual API Gateway URL)
  const apiUrl ="https://gcyu5g0u93.execute-api.us-east-1.amazonaws.com/prod/chef-request";
  const requestData = {
    email: userEmail, // Replace with the logged-in user's email
    oldGroup: "SimpleUser",
    newGroup: "ChefUser",
  };

  // Make the POST request to the server
  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Handle the success response
      alert("Request sent successfully!");
      console.log(data);
    })
    .catch((error) => {
      // Handle errors
      console.error("Error:", error);
      alert("You have already submitted a request.");
    });
}
