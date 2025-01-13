// API Gateway URLs
const API_URL =
  "https://x0al7zm0lg.execute-api.us-east-1.amazonaws.com/prod/chefDetails";
const SEND_EMAIL_API_URL =
  "https://4qzmr89vv4.execute-api.us-east-1.amazonaws.com/prod/sendEmail";

$(document).ready(function () {
  // Fetch the chef's email from localStorage
  const email = JSON.parse(localStorage.getItem("selectedChef"));
  console.log("Email from localStorage:", email);

  if (email) {
    fetchChefDetails(email);
  } else {
    console.error("No selected chef email found in localStorage.");
  }

  // Set up the contact form
  const emailForm = document.getElementById("email-form");

  // Add an event listener to handle form submission
  emailForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent form from refreshing the page

    // Check if the user is logged in
    const idToken = localStorage.getItem("id_token");
    if (!idToken) {
      alert("You must be logged in to send an email.");
      return;
    }

    const chefEmail = email; // Chef email from localStorage
    const userName = document.getElementById("full-name").value.trim();
    const message = document.getElementById("contact-message").value.trim();
    const bookingDate = document.getElementById("booking-date").value;

    // Validate the form inputs
    if (!chefEmail || !message || !userName || !bookingDate) {
      alert("Please fill in all fields before sending.");
      return;
    }

    try {
      // Construct the payload for the email
      console.log("chef Email: ", chefEmail);
      const payload = {
        body: JSON.stringify({
          chefEmail: chefEmail, // Chef's email fetched dynamically
          userName: userName, // User's name from the input
          message: message, // Message from the user
          date: bookingDate, // Date selected by the user
        }),
      };

      // Send POST request to the email API
      const response = await fetch(SEND_EMAIL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Message sent successfully!");
        // Clear the form inputs
        emailForm.reset();
      } else {
        const errorData = await response.json();
        console.error("Error sending email:", errorData);
        alert("Failed to send the message. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  });
});

// Function to fetch chef details
async function fetchChefDetails(email) {
  try {
    // Send the email through query parameters
    const response = await fetch(
      `${API_URL}?email=${encodeURIComponent(email)}`,
      {
        method: "GET", // Change to GET as we are using query parameters
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.json();
    const data = JSON.parse(rawData.body); // Parse the body into readable data
    console.log("Chef Details:", data);

    // Update HTML with chef details
    document.getElementById("chef-name").textContent = data.Name;
    document.getElementById("chef-category").textContent = data.Category;
    document.getElementById(
      "chef-price"
    ).textContent = `Price: $${data.Price} Per Person`;
    document.getElementById("chef-description").textContent = data.Description;
    document.getElementById("chef-image").src = data.ProfilePic;

    // Update gallery
    const galleryCarousel = document.querySelector(
      "#chefGalleryCarousel .carousel-inner"
    );
    galleryCarousel.innerHTML = ""; // Clear old images

    if (Array.isArray(data.Gallery) && data.Gallery.length > 0) {
      for (let i = 0; i < data.Gallery.length; i += 3) {
        const carouselItem = document.createElement("div");
        carouselItem.className = "carousel-item";
        if (i === 0) {
          carouselItem.classList.add("active");
        }

        const rowDiv = document.createElement("div");
        rowDiv.className = "row";

        data.Gallery.slice(i, i + 3).forEach((imageUrl) => {
          const colDiv = document.createElement("div");
          colDiv.className = "col-md-4";

          const img = document.createElement("img");
          img.src = imageUrl;
          img.alt = "Dish Image";
          img.className = "img-fluid rounded shadow-sm";

          colDiv.appendChild(img);
          rowDiv.appendChild(colDiv);
        });

        carouselItem.appendChild(rowDiv);
        galleryCarousel.appendChild(carouselItem);
      }
    } else {
      galleryCarousel.innerHTML =
        "<p class='text-center'>No dishes available</p>";
    }
    return data;
  } catch (error) {
    console.error("Error fetching chef details:", error);
    return null;
  }
}
