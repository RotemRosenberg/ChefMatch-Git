// כתובת ה-API Gateway
const API_URL = "https://kmr57na7l7.execute-api.us-east-1.amazonaws.com/prod/chef-details";

// פונקציה לשליחת בקשת POST ל-API
async function fetchChefDetails(email) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email }) // המייל של השף
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawData = await response.json();
        const data = JSON.parse(rawData.body); // ניתוח ה-body למידע קריא    
        console.log("Chef Details:", data);

        // עדכון ה-HTML עם המידע
        document.getElementById("chef-name").textContent = data.Name;
        document.getElementById("chef-category").textContent = data.Category;
        document.getElementById("chef-price").textContent = `Price: $${data.Price} Per Person`;
        document.getElementById("chef-description").textContent = data.Description;
        document.getElementById("chef-image").src = data.ProfilePic;

   // עדכון גלריה
const galleryDiv = document.querySelector(".gallery");
galleryDiv.innerHTML = ""; // ניקוי תמונות ישנות

if (Array.isArray(data.Gallery) && data.Gallery.length > 0) {
    data.Gallery.forEach(imageUrl => {
        // יצירת דיב עם עיצוב
        const colDiv = document.createElement("div");
        colDiv.className = "col-md-4 mb-3";

        // יצירת תמונה
        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = "Dish Image";
        img.className = "img-fluid rounded shadow-sm";

        // הוספת התמונה לתוך הדיב
        colDiv.appendChild(img);

        // הוספת הדיב לגלריה
        galleryDiv.appendChild(colDiv);
    });
} else {
    galleryDiv.innerHTML = "<p class='text-center'>No dishes available</p>";
}

        return data;
    } catch (error) {
        console.error("Error fetching chef details:", error);
        return null;
    }
}

// דוגמה לשימוש בפונקציה
const email = "rotemros12@gmail.com"; // המייל של השף
fetchChefDetails(email).then(data => {
    if (!data) {
        console.error("Failed to load chef details.");
    }
});
