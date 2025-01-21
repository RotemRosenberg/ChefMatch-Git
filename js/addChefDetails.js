// הגדרות AWS
 AWS.config.update({
  region: "us-east-1", 
  accessKeyId: "ASIA3JTXKMHAVW5PNRYZ", 
  secretAccessKey: "mTAkdFojibmoMK7HDU3H5764N6WyUYyCzlYjnlN4",
  sessionToken: "IQoJb3JpZ2luX2VjEMX//////////wEaCXVzLXdlc3QtMiJHMEUCIGAnBc6gILOONWQJnILTFDVAoZJR2oprMDvR0xHRe/11AiEA3DvdN3rXC7L2TC1C2s+fee6kckx6cFOU43H/Id+HdRMqsgIIvv//////////ARABGgw3NzY1NjU1ODAyMjUiDKmh8SR4hMGdMr7AcyqGAlfKmmWYNqKzYiELMp0RfsMUEBkgzojUwObz/FO47M+pdnOJIhOYgYBxkf06Vjy75oEnNAinGKpgSYRP07V/vRuKncpT/kh1vVUVrYCYFi5Y2q/Y0WAVMaix+XUisMJJIUIisXGNW1e+lMpHpd0k/pwcxiI7VvjOvC9kanwUtI6UZWq94guQDwnp0VEmd4di92CrkxdyC/gG5duKaoF4VJegYVGqXyQIgBfC5X+cZQz2oKnNY3f0S/vAGTcq3CA42jmwbSqDyhLqHyyvSQh4B2M6JIeyzdLJuczHuHgKfO+PymNLYJKkSOmrfJ+DPizI8OaD9ZQt/zXfhIcL3aY4xfS7Tdl80ecw07W+vAY6nQFBxfrW6SNUkci+SnnGl3Q7wiPCJfmQH8s8IwH0CnOZrB+JFiuzy8txrGGU2S71FmNsw+32AuOCane/MrV/iQXcI48S5sQ4lsItoOWX9pin3qpQMbHCBAWaprKXVScClM2EWwzID7eny8uu7RF6MjUMW1Z0Y4NZbMpib3GvFsFXvXqWCVCdj5JbipZSQc0a1lVub1FIxkFW8oWbbKFo" // ה-Session Token
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