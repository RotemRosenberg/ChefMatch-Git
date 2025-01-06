// Function to fetch chefs from the API
async function fetchChefs() {
  const apiURL =
    "https://uqewoozqal.execute-api.us-east-1.amazonaws.com/dev/chefs";

  try {
    const response = await fetch(apiURL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const responseData = await response.json();

    // Parse the `body` field to extract the array of chefs
    const chefs = JSON.parse(responseData.body);
    return chefs;
  } catch (error) {
    console.error("Failed to fetch chefs:", error);
    return []; // Return an empty array to prevent breaking the rendering
  }
}

function renderChefs(chefs) {
  const container = document.getElementById("chefs-container");
  container.innerHTML = ""; // Clear existing content

  chefs.forEach((chef) => {
    const chefCard = `
      <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
        <div class="team-item text-center rounded overflow-hidden" 
             onclick='viewChefDetails(${JSON.stringify(chef)})'>
          <img class="img-fluid" src="${chef.PicURL}" alt="${chef.Name}" />
          <div class="team-text">
            <div class="team-title">
              <h5>${chef.Name}</h5>
              <span>${chef.Category}</span>
            </div>
            <div class="team-social">
              <a class="btn btn-square btn-light rounded-circle" href="#"
                ><i class="fab fa-facebook-f"></i
              ></a>
              <a class="btn btn-square btn-light rounded-circle" href="#"
                ><i class="fab fa-twitter"></i
              ></a>
              <a class="btn btn-square btn-light rounded-circle" href="#"
                ><i class="fab fa-instagram"></i
              ></a>
            </div>
            <div>
              <p>${chef.Description}</p>
              <p><strong>Menu:</strong> ${chef.Menu}</p>
              <p><strong>Email:</strong> <a href="mailto:${chef.Email}">${
      chef.Email
    }</a></p>
            </div>
          </div>
        </div>
      </div>`;
    container.innerHTML += chefCard;
  });
}

function viewChefDetails(chef) {
  // Save the chef object to localStorage
  localStorage.setItem("selectedChef", JSON.stringify(chef));

  // Navigate to the details page
  window.location.href = "chefDetails.html";
}

// Initialize the page when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  const chefs = await fetchChefs();
  if (chefs && Array.isArray(chefs)) {
    console.log("Parsed Chefs data:", chefs);
    renderChefs(chefs);
  } else {
    console.error("Failed to load or parse chefs data");
  }
});
