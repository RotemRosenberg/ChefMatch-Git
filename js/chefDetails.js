// כתובת ה-API Gateway
const API_URL = "https://kmr57na7l7.execute-api.us-east-1.amazonaws.com/prod/chef-details";

$(document).ready(function() {
    const email = JSON.parse(localStorage.getItem("selectedChef"));
    console.log("Email from localStorage:", email);
    fetchChefDetails(email);
});
  

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
   const galleryCarousel = document.querySelector("#chefGalleryCarousel .carousel-inner");
   galleryCarousel.innerHTML = ""; // ניקוי תמונות ישנות
   
   if (Array.isArray(data.Gallery) && data.Gallery.length > 0) {
       // נחלק את התמונות לקבוצות של 3
       for (let i = 0; i < data.Gallery.length; i += 3) {
           // יצירת carousel-item
           const carouselItem = document.createElement("div");
           carouselItem.className = "carousel-item";
   
           // הסמן את הפריט הראשון כ-active
           if (i === 0) {
               carouselItem.classList.add("active");
           }
   
           // יצירת שורה להכיל את התמונות
           const rowDiv = document.createElement("div");
           rowDiv.className = "row";
   
           // הוספת 3 תמונות לשורה
           data.Gallery.slice(i, i + 3).forEach((imageUrl) => {
               const colDiv = document.createElement("div");
               colDiv.className = "col-md-4"; // עמודה ברוחב 4 (3 עמודות לשורה)
   
               const img = document.createElement("img");
               img.src = imageUrl;
               img.alt = "Dish Image";
               img.className = "img-fluid rounded shadow-sm";
   
               colDiv.appendChild(img);
               rowDiv.appendChild(colDiv);
           });
   
           // הוספת השורה ל-carousel-item
           carouselItem.appendChild(rowDiv);
   
           // הוספת carousel-item ל-carousel-inner
           galleryCarousel.appendChild(carouselItem);
       }
   } else {
       galleryCarousel.innerHTML = "<p class='text-center'>No dishes available</p>";
   }
        return data;
    } catch (error) {
        console.error("Error fetching chef details:", error);
        return null;
    }
}



