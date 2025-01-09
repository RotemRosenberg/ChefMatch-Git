async function uploadProfilePic() {
  const fileInput = document.getElementById('chef-profile-pic');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Please select a file first!');
    return;
  }

  try {
    // Get the signed URL
    const response = await fetch('https://kmr57na7l7.execute-api.us-east-1.amazonaws.com/prod/UploadImgS3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType: file.type })
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get signed URL');
    }
    
    const uploadUrl = data.uploadUrl;

    // Upload the file to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to S3');
    }

    document.getElementById('profile-pic-url').innerText = `File uploaded: ${data.fileName}`;
    alert('File uploaded successfully!');
  } catch (error) {
    console.error(error);
    alert('Error uploading file: ' + error.message);
  }
}
