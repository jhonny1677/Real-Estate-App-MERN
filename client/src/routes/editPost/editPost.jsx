import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import "./editPost.scss";

function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    address: "",
    bedroom: "",
    bathroom: "",
    images: [],
    city: "",
    type: "",
    property: "",
    size: "",
    yearBuilt: "",
    floorPlan: "",
    virtualTour: "",
    amenities: [],
    features: [],
    safetyScore: "",
    walkScore: "",
    transitScore: "",
    utilities: "",
    petPolicy: "",
    income: "",
    description: ""
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await apiRequest.get(`/posts/${id}`);
        const post = res.data;

        // Flatten post + postDetail into one formData object
        setFormData({
          title: post.title || "",
          price: post.price || "",
          address: post.address || "",
          bedroom: post.bedroom || "",
          bathroom: post.bathroom || "",
          images: post.images || [],
          city: post.city || "",
          type: post.type || "",
          property: post.property || "",
          size: post.size || "",
          yearBuilt: post.yearBuilt || "",
          floorPlan: post.floorPlan || "",
          virtualTour: post.virtualTour || "",
          amenities: post.amenities || [],
          features: post.features || [],
          safetyScore: post.postDetail?.neighborhood?.safetyScore || "",
          walkScore: post.postDetail?.neighborhood?.walkScore || "",
          transitScore: post.postDetail?.neighborhood?.transitScore || "",
          utilities: post.postDetail?.utilities || "",
          petPolicy: post.postDetail?.petPolicy || "",
          income: post.postDetail?.income || "",
          description: post.postDetail?.desc || ""
        });
      } catch (err) {
        console.error("Failed to load post:", err);
      }
    };

    fetchPost();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await apiRequest.put(`/posts/${id}`, {
        postData: {
          title: formData.title,
          price: parseFloat(formData.price),
          address: formData.address,
          bedroom: parseInt(formData.bedroom),
          bathroom: parseInt(formData.bathroom),
          city: formData.city,
          type: formData.type,
          property: formData.property,
          size: parseInt(formData.size) || 0,
          yearBuilt: parseInt(formData.yearBuilt) || new Date().getFullYear(),
          amenities: formData.amenities,
          features: formData.features,
          floorPlan: formData.floorPlan,
          virtualTour: formData.virtualTour,
          images: formData.images,
        },
        postDetail: {
          desc: formData.description,
          utilities: formData.utilities,
          petPolicy: formData.petPolicy,
          income: formData.income,
          neighborhood: {
            safetyScore: parseFloat(formData.safetyScore) || 8.0,
            walkScore: parseInt(formData.walkScore) || 70,
            transitScore: parseInt(formData.transitScore) || 65
          }
        },
      });

      alert("Post updated!");
      navigate(`/profile`);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update post.");
    }
  };

  return (
    <div className="editPostPage">
      <h2>Edit Your Listing</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} />
          <input name="price" placeholder="Price" type="number" value={formData.price} onChange={handleChange} />
          <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
        </div>
        
        <div className="form-group">
          <input name="bedroom" placeholder="Bedrooms" type="number" value={formData.bedroom} onChange={handleChange} />
          <input name="bathroom" placeholder="Bathrooms" type="number" value={formData.bathroom} onChange={handleChange} />
          <input name="size" placeholder="Size (sqft)" type="number" value={formData.size} onChange={handleChange} />
        </div>
        
        <div className="form-group">
          <input name="city" placeholder="City" value={formData.city} onChange={handleChange} />
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="">Select Type</option>
            <option value="rent">Rent</option>
            <option value="buy">Buy</option>
          </select>
          <select name="property" value={formData.property} onChange={handleChange}>
            <option value="">Select Property</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="condo">Condo</option>
            <option value="land">Land</option>
          </select>
        </div>
        
        <div className="form-group">
          <input name="yearBuilt" placeholder="Year Built" type="number" value={formData.yearBuilt} onChange={handleChange} />
          <input name="floorPlan" placeholder="Floor Plan URL" value={formData.floorPlan} onChange={handleChange} />
          <input name="virtualTour" placeholder="Virtual Tour URL" value={formData.virtualTour} onChange={handleChange} />
        </div>
        
        <div className="form-group">
          <select name="utilities" value={formData.utilities} onChange={handleChange}>
            <option value="">Utilities Policy</option>
            <option value="owner">Owner is responsible</option>
            <option value="tenant">Tenant is responsible</option>
            <option value="shared">Shared</option>
          </select>
          <select name="petPolicy" value={formData.petPolicy} onChange={handleChange}>
            <option value="">Pet Policy</option>
            <option value="allowed">Allowed</option>
            <option value="not-allowed">Not Allowed</option>
          </select>
          <input name="income" placeholder="Income Policy" value={formData.income} onChange={handleChange} />
        </div>
        
        <div className="form-group">
          <input name="safetyScore" placeholder="Safety Score (0-10)" type="number" step="0.1" value={formData.safetyScore} onChange={handleChange} />
          <input name="walkScore" placeholder="Walk Score (0-100)" type="number" value={formData.walkScore} onChange={handleChange} />
          <input name="transitScore" placeholder="Transit Score (0-100)" type="number" value={formData.transitScore} onChange={handleChange} />
        </div>
        
        <div className="form-group full-width">
          <textarea name="description" placeholder="Description" rows="4" value={formData.description} onChange={handleChange} />
        </div>
        
        <button type="submit" className="update-btn">Update Property</button>
      </form>
    </div>
  );
}

export default EditPostPage;
