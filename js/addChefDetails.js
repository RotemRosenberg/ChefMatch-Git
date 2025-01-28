// הגדרות AWS כל פעם בפתחית מעבדה צריך לשנות בהתאם את הנתונים
 AWS.config.update({
  region: "us-east-1", 
  accessKeyId: "ASIA3JTXKMHAYQUIPOST", 
  secretAccessKey: "8j3Pp3ReJyFk02AeUbU9umaFOvNcxa8PI1Lihj61",
  sessionToken: "IQoJb3JpZ2luX2VjEGkaCXVzLXdlc3QtMiJHMEUCIQCT2Kot/coNQg5JLHisfDbG40UBkCxjPN362EtgDDxFlwIgWWKeKsre166b7/jArPwFFkaVXdECFN0W9j02EA16xW8qqQIIchABGgw3NzY1NjU1ODAyMjUiDPipQXc+ijl1BiFnMyqGAiGQWX2jE1KA7nj4x4697RVkv5OdtON3WmZ9uiACwFVRkHYQZV+Lc5emeYIAHMF5rHbZSMqIVV+WPsPQI7/dX1mxMuunzFK1JKEfHyuYRk/GeUQXTCHxu7Yi5oCL3iiqoBR6CHRSnAbj7OreG5HWjRjuiqu8wDyMJFhM8nyI7l5C+kx4n4/unrIFvUYiKH+/QRjZ2tRruK4bey79P2/u/NI+GsG7p64PtSN7Xu/CKfmyth2EZM67p9+G5Xh+YHaBjbGU7Ote1k03uhoD8H3PDvSpZj+S1AcPpgiQdRoWrT3P3EZGG+6Rrpo0EuD92DDY1gX3cfVI9uKbBukRhWB8cp/Xr/SK5YIw1b3ivAY6nQG+9QRs5LRxNo0vLd6JfNAro4Ki+kH+jRkuccxyLAhwu8EB9Hssd+i9CNbw6Nfhkt3/SiWRcoQ+3u9WNUCbiyjiDgAvMmzlxx+3fC1HUqiFKjKr4nKm/unMAUM0Jla3OhGTRTEq63kHZR/Ghvt3KZyjv3ihhpUtBhF73k4cxcZTWeKoW3QMblc5fOKuyB1/kW+EQmRBSyk4XEagBvId" // ה-Session Token
});
let isProfilePicUploaded = false;
let isGalleryUploaded = false;
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const bucketName = "chefs-images"; 
const idToken = localStorage.getItem('id_token');
const payload = JSON.parse(atob(idToken.split('.')[1]));
      console.log('User Info:', payload);
      const EmailUser = payload['email'];
console.log(EmailUser)
localStorage.setItem("selectedChef", EmailUser);

async function uploadProfilePic() {
  const fileInput = document.getElementById("chef-profile-pic");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please choose a profile picture.");
    return null;
  }

  const params = {
    Bucket: bucketName,
    Key: `img/${file.name}`,
    Body: file,
    ContentType: file.type,
  };

  try {
    const data = await s3.upload(params).promise();
    console.log("Profile picture uploaded:", data.Location);
    isProfilePicUploaded = true; // עדכון סטטוס העלאת תמונת הפרופיל
    document.getElementById("profile-pic-url").textContent = "Images uploaded successfully.";
    return data.Location; // URL של התמונה
  } catch (err) {
    console.error("Error uploading profile picture:", err);
    alert("Failed to upload profile picture.");
    return null;
  }
}

async function uploadGalleryImages() {
  const fileInput = document.getElementById("chef-gallery");
  const files = fileInput.files;
  const urls = [];

  for (const file of files) {
    const params = {
      Bucket: bucketName,
      Key: `img/${file.name}`,
      Body: file,
      ContentType: file.type,
    };

    try {
      const data = await s3.upload(params).promise();
      console.log("Gallery image uploaded:", data.Location);
      urls.push(data.Location); // URL של התמונה
    } catch (err) {
      console.error("Error uploading gallery image:", err);
      alert(`Failed to upload gallery image: ${file.name}`);
    }
  }
  if (urls.length > 0) {
    isGalleryUploaded = true; // עדכון סטטוס העלאת תמונות הגלריה
    updateCreateButtonState(); // בדיקה אם הכפתור הסופי יכול לפעול
    document.getElementById("gallery-urls").textContent = "Images uploaded successfully.";

  }

  return urls;
}

async function createChefProfile() {
  const name = document.getElementById("chef-name").value;
  const price = document.getElementById("chef-price").value;
  const description = document.getElementById("chef-description").value;

  // משיכת קטגוריות שסומנו
  const categories = Array.from(
    document.querySelectorAll("input[type='checkbox']:checked")
  )
    .map((checkbox) => checkbox.value)
    .join(' '); // מחבר את הערכים למחרוזת עם רווחים
  

  // העלאת תמונות
  const profilePicUrl = await uploadProfilePic();
  const galleryUrls = await uploadGalleryImages();

  if (!profilePicUrl) {
    alert("Profile picture upload failed. Cannot create profile.");
    return;
  }

  // נתונים שיוכנסו לטבלה
  const item = {
    TableName: "ChefsTable", 
    Item: {
      Email: EmailUser,
      Category: categories,
      Date: Date.now().toString(), 
      Description: description,
      Gallery: galleryUrls,
      Name: name,
      Price: parseFloat(price),
      ProfilePic: profilePicUrl,
    },
  };
console.log(item);
  try {
    await dynamoDB.put(item).promise();
    console.log("Chef profile added to DynamoDB:", item.Item);
    alert("Chef profile created successfully!");
    window.location.href = "chefs.html";
  } catch (err) {
    console.error("Error adding chef profile to DynamoDB:", err);
    alert("Failed to create chef profile.");
  }
}
// עדכון מצב כפתור "Create Profile"
function updateCreateButtonState() {
  const createButton = document.getElementById("create-profile-btn");
  if (isProfilePicUploaded && isGalleryUploaded) {
    createButton.disabled = false; // פתיחת הכפתור
  } else {
    createButton.disabled = true; // השארת הכפתור מושבת
  }
}