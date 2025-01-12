// הגדרות AWS
 AWS.config.update({
  region: "us-east-1", // עדכן את האזור שלך
  accessKeyId: "ASIA3JTXKMHAYKGPYADB", // המפתח שסיפקת
  secretAccessKey: "+hTTeTXVEqDyq69eW7YOMWh/y4jxMMg6i5IhDg65", // המפתח הסודי
  sessionToken: "IQoJb3JpZ2luX2VjEO7//////////wEaCXVzLXdlc3QtMiJGMEQCIHFdUnQc4HSHWZlbDsWxqgQg5jpQrKpYrP9Z3S+jfN2cAiASrLYA0xMPr5ROp/bDpfETzwKogE1zGFrv92edq8WNXiqyAgjX//////////8BEAEaDDc3NjU2NTU4MDIyNSIMHRPtWl5l3gBWR/LsKoYCOAnIUhK8LsX/f5bRn3zfaK3/9cyBkRqLQy5HULcROqQBbAIT1D2ueymNBW4ck2L3vrBn4hSFLM4CbeFO2akJOVdnQTqt3zzF30iUCqY+m6huaeJzSTH6w55GJw9r7FopCovCBx0/eGAWNtuXqGMzTODu257oCKLJcQ8p2mHUO5pFjTfeqh+nX6e9cE+L4I7t7VXwCjJfBSaQ9cHSbVdZT5PufVuLC1vXZ2NvCydF42x1VeudKiUajI9EYIfhywrBKpAy8IOMVVX6cTI0rvE2ZPskbDgMPjYR97GVuWwkJDMk19t2lTZS+7q5cl00bCbzhWa1mIcqhwMSlwzzsF2Dkvl7BKuJxDC9lY+8BjqeAebVTQR2O0MIbEh4Z/+BfvaMAOKYLHtY/1jpkiCxkuXQ0fvwWTJSLgvFuQFSSxY+f1tK/AxcT8/C6cXWH3zUeLQ9ma+i30GhX5h5kpLspCIiROIWuhhhpFLHuE8rP+A4KJaJJqoN9BO5fEd9DLnOs0sJp0+0cv7LzOguZD5d8pSwfr0Eajl0uR9BUMKDqWsgQXyvSul/rQsCqB/SSnoq" // ה-Session Token
});
let isProfilePicUploaded = false;
let isGalleryUploaded = false;
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const bucketName = "chefs-images"; // שם הדלי שלך

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
  ).map((checkbox) => checkbox.value);

  // העלאת תמונות
  const profilePicUrl = await uploadProfilePic();
  const galleryUrls = await uploadGalleryImages();

  if (!profilePicUrl) {
    alert("Profile picture upload failed. Cannot create profile.");
    return;
  }

  // נתונים שיוכנסו לטבלה
  const item = {
    TableName: "ChefsTable", // שם הטבלה שלך
    Item: {
      Email: "fifa18rotem@gmail.com",
      Category: categories,
      Date: Date.now().toString(), // מזהה ייחודי
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