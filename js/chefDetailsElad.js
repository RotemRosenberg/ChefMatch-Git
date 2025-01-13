// Retrieve chef data from local storage
const chef = JSON.parse(localStorage.getItem("selectedChef"));
const idToken = localStorage.getItem("id_token"); // Make sure the token is saved in localStorage
const payload = JSON.parse(atob(idToken.split(".")[1]));
const username = payload["cognito:username"] || "User";

if (chef) {
  // Update Chef Details Section
  document.getElementById("chef-name").textContent = chef.Name;
  document.getElementById("chef-category").textContent = chef.Category;
  document.getElementById("chef-description").textContent = chef.Description;
  const chefImage = document.getElementById("chef-image");
  chefImage.src = chef.PicURL;
  chefImage.alt = chef.Name;

  // Update Menu Section
  const menuItems = chef.Menu.split(","); // Assuming menu items are stored as a comma-separated string
  const menuSection = document.querySelectorAll(".menu-item");
  menuItems.forEach((menuItem, index) => {
    if (menuSection[index]) {
      menuSection[index].innerHTML = `<h5>${menuItem.trim()}</h5>`;
    }
  });

  // Set up Contact Form
  const sendEmailButton = document.getElementById("send-email-button");
  sendEmailButton.addEventListener("click", async () => {
    const message = document.getElementById("contact-message").value.trim();
    if (message) {
      // API Gateway endpoint
      const apiEndpoint =
        "https://uqewoozqal.execute-api.us-east-1.amazonaws.com/test/sendEmail";

      // Construct the payload
      const payload = {
        chefEmail: "eladaharon065@gmail.com", // Chef's email
        userName: username, // User's name
        message: message, // Message from the user
      };

      try {
        // Send POST request to API Gateway
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const responseData = await response.json();
          alert("Message sent successfully!");
        } else {
          const errorData = await response.json();
          console.error("Error sending email:", errorData);
          alert("Failed to send the message. Please try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    } else {
      alert("Please write a message before sending.");
    }
  });
} else {
  // Redirect to the team page if no chef data is found
  window.location.href = "chefs.html";
}
