// Function to fetch all chefs from the API
async function fetchChefs() {
  const apiURL =
    "https://uqewoozqal.execute-api.us-east-1.amazonaws.com/test/chefs";

  try {
    const response = await fetch(apiURL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const responseData = await response.json();

    // Parse the JSON string in responseData.body to get the actual chefs array
    const chefs = Array.isArray(responseData)
      ? responseData
      : JSON.parse(responseData.body);
    console.log("Parsed chefs data:", chefs);
    return chefs;
  } catch (error) {
    console.error("Failed to fetch chefs:", error);
    return [];
  }
}

// Search chefs based on input
async function searchChefs() {
  const searchType = document.getElementById("searchType").value;
  const searchInput = document.getElementById("searchInput").value.trim();
  if (!searchInput) {
    alert("Please enter a value to search!");
    return;
  }

  const apiURL = `https://uqewoozqal.execute-api.us-east-1.amazonaws.com/test/chefs/searchChefs?type=${searchType}&value=${encodeURIComponent(
    searchInput
  )}`;

  try {
    const response = await fetch(apiURL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const responseData = await response.json();

    // Parse the JSON string in responseData.body to get the actual chefs array
    const chefs = Array.isArray(responseData)
      ? responseData
      : JSON.parse(responseData.body);
    console.log("Parsed chefs data for search:", chefs);

    if (Array.isArray(chefs) && chefs.length > 0) {
      renderChefs(chefs); // Render the searched chefs
    } else {
      alert("No chefs found matching your search criteria.");
    }
  } catch (error) {
    console.error("Failed to search chefs:", error);
    alert("An error occurred while searching for chefs.");
  }
}

// Render chefs to the UI
function renderChefs(chefs) {
  const container = document.getElementById("chefs-container");
  container.innerHTML = ""; // Clear existing content
  console.log("Rendering chefs:", chefs);
  chefs.forEach((chef) => {
    const chefCard = `
      <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
        <div class="team-item text-center rounded overflow-hidden" 
             onclick='viewChefDetails(${JSON.stringify(chef).replace(
               /'/g,
               "\\'"
             )})'>
          <img class="img-fluid" src="${chef.ProfilePic}" alt="${chef.Name}" />
          <div class="team-text">
            <div class="team-title">
              <h5>${chef.Name}</h5>
              <span>${chef.Category}</span>
            </div>
          </div>
        </div>
      </div>`;
    container.innerHTML += chefCard;
  });
}

// Function to handle viewing chef details
function viewChefDetails(chef) {
  localStorage.setItem("selectedChef", JSON.stringify(chef));
  window.location.href = "chefDetails.html";
}

// Initialize the page when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  const chefs = await fetchChefs();
  if (chefs && Array.isArray(chefs)) {
    renderChefs(chefs); // Render all chefs on page load
  } else {
    console.error("Failed to load or parse chefs data");
  }
});

// Attach search button click event
document.getElementById("searchButton").addEventListener("click", searchChefs);
