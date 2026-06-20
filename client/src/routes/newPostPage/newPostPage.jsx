import { useState } from "react";
import "./newPostPage.scss";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import apiRequest from "../../lib/apiRequest";
import UploadWidget from "../../components/uploadWidget/UploadWidget";
import { useNavigate } from "react-router-dom";

function NewPostPage() {
  const [value, setValue] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [features, setFeatures] = useState([]);
  const [schools, setSchools] = useState([{ name: "", distance: "", rating: "" }]);
  const [healthcare, setHealthcare] = useState([{ name: "", distance: "", type: "" }]);
  const [transport, setTransport] = useState([{ name: "", distance: "", type: "" }]);
  const [shopping, setShopping] = useState([{ name: "", distance: "", type: "" }]);

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    try {
      const res = await apiRequest.post("/posts", {
        postData: {
          title: inputs.title,
          price: parseInt(inputs.price),
          address: inputs.address,
          city: inputs.city,
          bedroom: parseInt(inputs.bedroom),
          bathroom: parseInt(inputs.bathroom),
          type: inputs.type,
          property: inputs.property,
          latitude: inputs.latitude,
          longitude: inputs.longitude,
          images: images,
          sqft: parseInt(inputs.size) || 0,
          yearBuilt: parseInt(inputs.yearBuilt) || new Date().getFullYear(),
          amenities: amenities,
          features: features,
          floorPlan: inputs.floorPlan || "",
          virtualTour: inputs.virtualTour || "",
          neighborhood: {
            schools: schools.filter(s => s.name),
            healthcare: healthcare.filter(h => h.name),
            transport: transport.filter(t => t.name),
            shopping: shopping.filter(s => s.name),
            safetyScore: parseFloat(inputs.safetyScore) || 8.0,
            walkScore: parseInt(inputs.walkScore) || 70,
            transitScore: parseInt(inputs.transitScore) || 65
          },
        },
        postDetail: {
          desc: value,
          utilities: inputs.utilities,
          pet: inputs.pet,
          income: inputs.income,
          school: parseInt(inputs.school),
          bus: parseInt(inputs.bus),
          restaurant: parseInt(inputs.restaurant),
        },
      });
      navigate("/"+res.data.id)
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || err.message || "Something went wrong");
    }
  };

  return (
    <div className="newPostPage">
      <div className="formContainer">
        <h1>Add New Post</h1>
        <div className="wrapper">
          <form onSubmit={handleSubmit}>
            <div className="item">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" type="text" />
            </div>
            <div className="item">
              <label htmlFor="price">Price</label>
              <input id="price" name="price" type="number" />
            </div>
            <div className="item">
              <label htmlFor="address">Address</label>
              <input id="address" name="address" type="text" />
            </div>
            <div className="item description">
              <label htmlFor="desc">Description</label>
              <ReactQuill theme="snow" onChange={setValue} value={value} />
            </div>
            <div className="item">
              <label htmlFor="city">City</label>
              <input id="city" name="city" type="text" />
            </div>
            <div className="item">
              <label htmlFor="bedroom">Bedroom Number</label>
              <input min={1} id="bedroom" name="bedroom" type="number" />
            </div>
            <div className="item">
              <label htmlFor="bathroom">Bathroom Number</label>
              <input min={1} id="bathroom" name="bathroom" type="number" />
            </div>
            <div className="item">
              <label htmlFor="latitude">Latitude</label>
              <input id="latitude" name="latitude" type="text" />
            </div>
            <div className="item">
              <label htmlFor="longitude">Longitude</label>
              <input id="longitude" name="longitude" type="text" />
            </div>
            <div className="item">
              <label htmlFor="type">Type</label>
              <select name="type">
                <option value="rent" defaultChecked>
                  Rent
                </option>
                <option value="buy">Buy</option>
              </select>
            </div>
            <div className="item">
              <label htmlFor="type">Property</label>
              <select name="property">
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="land">Land</option>
              </select>
            </div>

            <div className="item">
              <label htmlFor="utilities">Utilities Policy</label>
              <select name="utilities">
                <option value="owner">Owner is responsible</option>
                <option value="tenant">Tenant is responsible</option>
                <option value="shared">Shared</option>
              </select>
            </div>
            <div className="item">
              <label htmlFor="pet">Pet Policy</label>
              <select name="pet">
                <option value="allowed">Allowed</option>
                <option value="not-allowed">Not Allowed</option>
              </select>
            </div>
            <div className="item">
              <label htmlFor="income">Income Policy</label>
              <input
                id="income"
                name="income"
                type="text"
                placeholder="Income Policy"
              />
            </div>
            <div className="item">
              <label htmlFor="size">Total Size (sqft)</label>
              <input min={0} id="size" name="size" type="number" />
            </div>
            <div className="item">
              <label htmlFor="school">School</label>
              <input min={0} id="school" name="school" type="number" />
            </div>
            <div className="item">
              <label htmlFor="bus">bus</label>
              <input min={0} id="bus" name="bus" type="number" />
            </div>
            <div className="item">
              <label htmlFor="restaurant">Restaurant</label>
              <input min={0} id="restaurant" name="restaurant" type="number" />
            </div>
            
            {/* Enhanced Fields */}
            <div className="item">
              <label htmlFor="yearBuilt">Year Built</label>
              <input id="yearBuilt" name="yearBuilt" type="number" min="1900" max={new Date().getFullYear()} />
            </div>
            
            <div className="item">
              <label htmlFor="floorPlan">Floor Plan URL</label>
              <input id="floorPlan" name="floorPlan" type="url" placeholder="https://example.com/floorplan.jpg" />
            </div>
            
            <div className="item">
              <label htmlFor="virtualTour">Virtual Tour URL</label>
              <input id="virtualTour" name="virtualTour" type="url" placeholder="https://my.matterport.com/show/?m=..." />
            </div>
            
            <div className="item">
              <label>Amenities</label>
              <div className="checkbox-group">
                {["parking", "gym", "pool", "security", "elevator", "laundry", "garden", "terrace"].map(amenity => (
                  <label key={amenity} className="checkbox-item">
                    <input 
                      type="checkbox" 
                      value={amenity}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAmenities([...amenities, amenity]);
                        } else {
                          setAmenities(amenities.filter(a => a !== amenity));
                        }
                      }}
                    />
                    {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="item">
              <label>Features</label>
              <div className="checkbox-group">
                {["balcony", "city-view", "furnished", "hardwood-floors", "updated-kitchen", "fireplace"].map(feature => (
                  <label key={feature} className="checkbox-item">
                    <input 
                      type="checkbox" 
                      value={feature}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFeatures([...features, feature]);
                        } else {
                          setFeatures(features.filter(f => f !== feature));
                        }
                      }}
                    />
                    {feature.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="item">
              <label htmlFor="safetyScore">Safety Score (0-10)</label>
              <input id="safetyScore" name="safetyScore" type="number" min="0" max="10" step="0.1" placeholder="8.5" />
            </div>
            
            <div className="item">
              <label htmlFor="walkScore">Walk Score (0-100)</label>
              <input id="walkScore" name="walkScore" type="number" min="0" max="100" placeholder="75" />
            </div>
            
            <div className="item">
              <label htmlFor="transitScore">Transit Score (0-100)</label>
              <input id="transitScore" name="transitScore" type="number" min="0" max="100" placeholder="65" />
            </div>
            
            <button className="sendButton">Add</button>
            {error && <span>{error}</span>}
          </form>
        </div>
      </div>
      <div className="sideContainer">
        {images.map((image, index) => (
          <img src={image} key={index} alt="" />
        ))}
        <UploadWidget
          uwConfig={{
            multiple: true,
            cloudName: "lamadev",
            uploadPreset: "estate",
            folder: "posts",
          }}
          setState={setImages}
        />
      </div>
    </div>
  );
}

export default NewPostPage;
