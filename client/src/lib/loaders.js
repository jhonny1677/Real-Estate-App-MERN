import { defer } from "react-router-dom";
import apiRequest from "./apiRequest";
import { enhancedListData, singlePostData } from "./enhancedDummyData";

export const singlePageLoader = async ({ request, params }) => {
  try {
    const res = await apiRequest("/posts/" + params.id);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching single post from backend, using dummy data:", error);
    
    // Find the property by ID in enhanced dummy data
    const property = enhancedListData.find(item => item.id === parseInt(params.id));
    
    if (property) {
      // Convert enhanced data format to single post format
      return {
        ...property,
        bedRooms: property.bedroom, // Map bedroom to bedRooms for compatibility
        city: property.address.split(",").pop()?.trim() || "Unknown",
        user: {
          id: 1,
          username: "John Doe",
          avatar: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
        },
        isSaved: false,
        postDetail: {
          desc: property.description || "Beautiful property with excellent amenities.",
          utilities: property.utilities || "owner",
          pet: property.petPolicy || "allowed", 
          income: "Flexible income requirements",
          size: property.size || 861,
          school: 250,
          bus: 100,
          restaurant: 50,
          neighborhood: property.neighborhood
        }
      };
    } else {
      // Fallback to default single post data if property not found
      return {
        ...singlePostData,
        user: {
          id: 1,
          username: "John Doe", 
          avatar: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
        },
        isSaved: false,
        postDetail: {
          desc: singlePostData.description || "Beautiful property with excellent amenities.",
          utilities: "owner",
          pet: "allowed",
          income: "Flexible income requirements", 
          size: singlePostData.size || 861,
          school: 250,
          bus: 100,
          restaurant: 50
        }
      };
    }
  }
};

export const listPageLoader = async ({ request }) => {
  // Extract search parameters from the request URL
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "";
  const city = url.searchParams.get("city") || "";
  const minPrice = url.searchParams.get("minPrice") || "";
  const maxPrice = url.searchParams.get("maxPrice") || "";

  // Build a query string
  const queryParams = new URLSearchParams({
    ...(type && { type }),
    ...(city && { city }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
  }).toString();

  // Try to request from backend, fallback to dummy data
  const postPromise = apiRequest("/posts?" + queryParams).catch((error) => {
    console.error("❌ Error fetching posts from backend, using dummy data:", error);
    
    // Apply client-side filtering to enhanced dummy data
    let filteredPosts = [...enhancedListData];
    
    if (city) {
      filteredPosts = filteredPosts.filter(post => 
        post.address.toLowerCase().includes(city.toLowerCase())
      );
    }
    
    if (minPrice) {
      filteredPosts = filteredPosts.filter(post => 
        post.price >= parseInt(minPrice)
      );
    }
    
    if (maxPrice) {
      filteredPosts = filteredPosts.filter(post => 
        post.price <= parseInt(maxPrice)
      );
    }
    
    return { data: filteredPosts };
  });

  return defer({
    postResponse: postPromise,
  });
};

export const profilePageLoader = async () => {
  const postPromise = apiRequest("/users/profilePosts").catch((error) => {
    console.error("❌ Error fetching profile posts from backend, using empty array:", error);
    return { data: [] };
  });
  
  const chatPromise = apiRequest("/chats").catch((error) => {
    console.error("❌ Error fetching chats from backend, using empty array:", error);
    return { data: [] };
  });
  
  return defer({
    postResponse: postPromise,
    chatResponse: chatPromise,
  });
};
