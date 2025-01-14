// הגדרות AWS
 AWS.config.update({
  region: "us-east-1", 
  accessKeyId: "ASIA3JTXKMHA43TBLFT2", 
  secretAccessKey: "tJh9efu3jUfZlAi7I1kDoo3G2tq3t1vVncKpLD8j",
  sessionToken: "IQoJb3JpZ2luX2VjEAQaCXVzLXdlc3QtMiJIMEYCIQDM6S/KZaNEA/28P26FvRnH3hyLMx8W28TK/uknBBTNnwIhANs1ff69sXmLWsHKq3C7zA651ybox1P9bVjl+f0TRYd8KrICCO3//////////wEQARoMNzc2NTY1NTgwMjI1IgyTc8QqLiaLhqDKFX8qhgJWLjIuWzTJpXqV77XEhNlwa2RSJS149YaLhVGjfHXSpevRiuP28jRLtcbA6SIalhmaScUr9zYYOArXS7nWjaWzXokh2DP0rpTI3FR1mTIqJnY7VyJszs4qnkOeXB/1Nc+5VY3a5/BphUobwIOyBfCQ3SrCAEVldX2IyH3wmb1okF3dI8sNzVQd0v5iAUwh/53xO61jxfBx5+B6RTdmNlj3OUnpyg/ruOaEhkK9bLFNDq+LzIquWqRjqtqu6hDV9k7lip6+eT1GNE5+TrXIKv1iE5xVnQTYprmaFuhynJOqsrEF50oVsPzze63dxmwNgvcDk8wYgg+phPu03rm0dCbXFOw3EvXJMO2HlLwGOpwBhbbZR9tM5ro4OfNTqSmddINs9FSxUyUfDyPSoCdxIcJV1ql1BTibRa+QMqohtQiXKJpjHzXhrgedJYxbez5gbG7GiuEIoozMwqod0V/eowGWquSq6avMJHH0YdrU5BIis3GEkDjeg/vlxy+2KeGX7GnLdnyXpx7TmqFStsMPpTjK/H8HxgUqop2ZFWF1BriVahMUfinA7hPhI9Wf" // ה-Session Token
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
    window.location.href = "chefDetails.html";
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