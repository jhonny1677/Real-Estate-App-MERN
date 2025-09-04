import "./listPage.scss";
import Filter from "../../components/filter/Filter";
import List from "../../components/list/List";
import ScrollAnimations from "../../components/ScrollAnimations/ScrollAnimations";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiRequest from "../../lib/apiRequest";
import { enhancedListData } from "../../lib/enhancedDummyData";

function ListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState(false);

  // Get filters from URL
  const type = searchParams.get("type") || "";
  const city = searchParams.get("city") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const property = searchParams.get("property") || "";
  const bedroom = searchParams.get("bedroom") || "";
  const bathroom = searchParams.get("bathroom") || "";
  const minSize = searchParams.get("minSize") || "";
  const maxSize = searchParams.get("maxSize") || "";
  const utilities = searchParams.get("utilities") || "";
  const pet = searchParams.get("pet") || "";
  const sortBy = searchParams.get("sortBy") || "price-asc";

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      const queryParams = {
        type,
        city,
        minPrice,
        property,
        bedroom,
        bathroom,
        minSize,
        maxSize,
        utilities,
        pet,
        sortBy
      };

      if (parseInt(maxPrice) > 0) {
        queryParams.maxPrice = maxPrice;
      }

      try {
        const res = await apiRequest.get("/posts", {
          params: queryParams,
        });

        console.log("✅ Fetched posts from backend:", res.data);

        if (Array.isArray(res.data)) {
          setPosts(res.data);
        } else {
          console.warn("⚠️ Unexpected response format:", res.data);
          setPosts([]);
        }
      } catch (err) {
        console.error("❌ Error fetching posts from backend, using dummy data:", err);
        
        // Fallback to enhanced dummy data and apply client-side filtering
        let filteredPosts = [...enhancedListData];
        
        // Apply filters to dummy data
        if (city) {
          filteredPosts = filteredPosts.filter(post => 
            post.address.toLowerCase().includes(city.toLowerCase())
          );
        }
        
        if (property) {
          filteredPosts = filteredPosts.filter(post => 
            post.type.toLowerCase() === property.toLowerCase()
          );
        }
        
        if (minPrice) {
          filteredPosts = filteredPosts.filter(post => 
            post.price >= parseInt(minPrice)
          );
        }
        
        if (maxPrice && parseInt(maxPrice) > 0) {
          filteredPosts = filteredPosts.filter(post => 
            post.price <= parseInt(maxPrice)
          );
        }
        
        if (bedroom) {
          filteredPosts = filteredPosts.filter(post => 
            post.bedroom >= parseInt(bedroom)
          );
        }
        
        if (bathroom) {
          filteredPosts = filteredPosts.filter(post => 
            post.bathroom >= parseInt(bathroom)
          );
        }
        
        if (minSize) {
          filteredPosts = filteredPosts.filter(post => 
            post.size >= parseInt(minSize)
          );
        }
        
        if (maxSize) {
          filteredPosts = filteredPosts.filter(post => 
            post.size <= parseInt(maxSize)
          );
        }
        
        if (utilities) {
          filteredPosts = filteredPosts.filter(post => {
            if (utilities === "included") return post.utilities === "included";
            if (utilities === "tenant") return post.utilities === "tenant-pays";
            return true;
          });
        }
        
        if (pet) {
          filteredPosts = filteredPosts.filter(post => {
            if (pet === "allowed") return post.petPolicy === "allowed";
            if (pet === "none") return post.petPolicy === "no-pets";
            return true;
          });
        }
        
        // Apply sorting
        if (sortBy) {
          filteredPosts.sort((a, b) => {
            switch (sortBy) {
              case "price-asc": return a.price - b.price;
              case "price-desc": return b.price - a.price;
              case "size-asc": return a.size - b.size;
              case "size-desc": return b.size - a.size;
              case "newest": return b.yearBuilt - a.yearBuilt;
              case "oldest": return a.yearBuilt - b.yearBuilt;
              default: return 0;
            }
          });
        }
        
        setPosts(filteredPosts);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [type, city, minPrice, maxPrice, property, bedroom, bathroom, minSize, maxSize, utilities, pet, sortBy]);

  return (
    <div className="listPage">
      <ScrollAnimations />
      <div className="listContainer">
        <div className="wrapper">
          <div className="slide-left">
            <Filter />
          </div>
          
          <div className="sort-section fade-up">
            <div className="results-info">
              <span>{Array.isArray(posts) ? posts.length : 0} properties found</span>
            </div>
            <div className="sort-controls">
              <label htmlFor="sortBy">Sort by:</label>
              <select 
                id="sortBy" 
                value={sortBy} 
                onChange={(e) => {
                  setSorting(true);
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('sortBy', e.target.value);
                  setSearchParams(newParams);
                  setTimeout(() => setSorting(false), 300); // Reset sorting state after a brief delay
                }}
                className="enhanced-hover"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="size-asc">Size: Small to Large</option>
                <option value="size-desc">Size: Large to Small</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-state scale-in">
              <div className="loading-spinner"></div>
              <p>Loading properties...</p>
            </div>
          ) : sorting ? (
            <div className="sorting-state scale-in">
              <div className="loading-spinner"></div>
              <p>Sorting properties...</p>
            </div>
          ) : Array.isArray(posts) && posts.length > 0 ? (
            <div className="slide-right">
              <List posts={posts} />
            </div>
          ) : (
            <div className="no-results fade-up">
              <h3>No properties found</h3>
              <p>Try adjusting your search filters or browse all properties.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListPage;
