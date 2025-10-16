import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App'; // Make sure this import is correct

function CreateEditShop() {
  const navigate = useNavigate();
  const { myShop } = useSelector(state => state.user); // Assuming you have this in Redux

  // This is the state variable that holds all the form data.
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    address: '',
    imageFile: null,
    imagePreview: ''
  });

  // If editing an existing shop, populate the form when the component loads
  useEffect(() => {
    if (myShop) {
      setFormData({
        name: myShop.name || '',
        city: myShop.city || '',
        state: myShop.state || '',
        address: myShop.address || '',
        imageFile: null,
        imagePreview: myShop.image || ''
      });
    }
  }, [myShop]);

  // This function updates the state when the user types in the form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // This function updates the state when the user selects an image file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevState => ({
        ...prevState,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  // THIS IS THE CORRECTED SUBMIT FUNCTION
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("1. ✅ Handle submit started.");

    try {
      const dataToSubmit = new FormData();
      console.log("2. ✅ FormData created to submit.");

      // Append all the text data
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

      // IMPORTANT: Check if there is an image file to append
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
          'Content-Type': 'multipart/form-data' // This header is crucial
        }
      });

      console.log("7. 🎉 SUCCESS! Backend responded:", response.data);
      // Add your success logic here (e.g., navigate to another page)
      alert("Shop saved successfully!");
      navigate('/'); // Example: navigate home after success
      
    } catch (error) {
      console.error("6. ❌ ERROR! API call failed.");
      console.error("Full error object:", error);
      if (error.response) {
        // This will show the error message from the backend if it exists
        console.error("Backend error response:", error.response.data);
      }
      alert("Failed to save shop. Check the console for details.");
    }
  };

  // This is the JSX for your form
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>{myShop ? 'Edit Shop' : 'Add Shop'}</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>Shop Image</label>
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            style={{ width: '100%' }}
          />
          {formData.imagePreview && (
            <img src={formData.imagePreview} alt="Shop Preview" style={{ width: '200px', marginTop: '10px' }} />
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Save
        </button>
      </form>
    </div>
  );
}

export default CreateEditShop;
