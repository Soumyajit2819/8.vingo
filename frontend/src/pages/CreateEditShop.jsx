// THIS IS THE ONLY PART YOU NEED TO COPY AND PASTE
const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("1. ✅ Handle submit started.");

  try {
    const dataToSubmit = new FormData();
    console.log("2. ✅ FormData created to submit.");

    // IMPORTANT: Make sure 'formData' matches your state variable's name
    dataToSubmit.append("name", formData.name);
    dataToSubmit.append("city", formData.city);
    dataToSubmit.append("state", formData.state);
    dataToSubmit.append("address", formData.address);
    console.log("3. ✅ Appended text data:", {
      name: formData.name,
      city: formData.city,
      state: formData.state,
      address: formData.address,
    });

    // IMPORTANT: Make sure 'formData' matches your state variable's name
    if (formData.imageFile && formData.imageFile instanceof File) {
      dataToSubmit.append("image", formData.imageFile);
      console.log("4. ✅ Appended image file:", formData.imageFile);
    } else {
      console.log("4. ⚠️ NO NEW IMAGE FILE to append.");
    }

    console.log("5. 🚀 About to send API request to backend...");
    const response = await axios.post(`${serverUrl}/api/shop/create-edit`, dataToSubmit, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log("7. 🎉 SUCCESS! Backend responded:", response.data);
    alert("Shop saved successfully!");
    navigate('/'); 
    
  } catch (error) {
    console.error("6. ❌ ERROR! API call failed.");
    console.error("Full error object:", error);
    if (error.response) {
      console.error("Backend error response:", error.response.data);
    }
    alert("Failed to save shop. Check the console for details.");
  }
};
