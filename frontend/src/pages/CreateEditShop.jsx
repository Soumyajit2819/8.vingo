// COPY AND PASTE THIS ENTIRE FUNCTION
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  console.log("1. ✅ Handle submit started.");

  try {
    const dataToSubmit = new FormData();
    console.log("2. ✅ FormData created to submit.");

    // Append all the text data from your state
    dataToSubmit.append("name", name);
    dataToSubmit.append("city", city);
    dataToSubmit.append("state", state);
    dataToSubmit.append("address", address);
    console.log("3. ✅ Appended text data:", { name, city, state, address });

    // Check if there is a new image file to append
    if (backendImage) {
      dataToSubmit.append("image", backendImage);
      console.log("4. ✅ Appended image file:", backendImage);
    } else {
      console.log("4. ⚠️ NO NEW IMAGE FILE to append.");
    }

    console.log("5. 🚀 About to send API request to backend...");
    const result = await axios.post(`${serverUrl}/api/shop/create-edit`, dataToSubmit, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data' // This header is crucial
      }
    });

    console.log("7. 🎉 SUCCESS! Backend responded:", result.data);
    dispatch(setMyShopData(result.data));
    setLoading(false);
    navigate("/");

  } catch (error) {
    console.error("6. ❌ ERROR! API call failed.");
    console.error("Full error object:", error);
    if (error.response) {
      // This will show the error message from the backend if it exists
      console.error("Backend error response:", error.response.data);
    }
    setLoading(false);
  }
};
