const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("1. ✅ Handle submit started.");
  
    try {
      const formData = new FormData();
      console.log("2. ✅ FormData created.");
  
      // Append all the text data
      formData.append("name", data.name);
      formData.append("city", data.city);
      formData.append("state", data.state);
      formData.append("address", data.address);
      console.log("3. ✅ Appended text data:", {
        name: data.name,
        city: data.city,
        state: data.state,
        address: data.address,
      });
  
      // IMPORTANT: Check if there is an image file to append
      if (data.imageFile && data.imageFile instanceof File) {
        formData.append("image", data.imageFile);
        console.log("4. ✅ Appended image file:", data.imageFile);
      } else {
        console.log("4. ⚠️ NO IMAGE FILE to append or file is invalid.");
      }
  
      console.log("5. 🚀 About to send API request to backend...");
      const response = await axios.post(`${serverUrl}/api/shop/create-edit`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data' // This header is crucial
        }
      });
  
      console.log("7. 🎉 SUCCESS! Backend responded:", response.data);
      // Add your success logic here (e.g., navigate to another page)
      
    } catch (error) {
      console.error("6. ❌ ERROR! API call failed.");
      console.error("Full error object:", error);
      if (error.response) {
        // This will show the error message from the backend if it exists
        console.error("Backend error response:", error.response.data);
      }
    }
  };
  