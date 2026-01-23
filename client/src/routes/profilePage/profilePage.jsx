import List from "../../components/list/List";
import UpcomingVisits from "../../components/upcomingVisits/UpcomingVisits";
import Avatar from "../../components/Avatar/Avatar";
import "./profilePage.scss";
import apiRequest from "../../lib/apiRequest";
import { Await, Link, useLoaderData, useNavigate } from "react-router-dom";
import { Suspense, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function ProfilePage() {
  const data = useLoaderData();

  const { updateUser, currentUser } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      updateUser(null);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="profilePage">
      <div className="details">
        <div className="wrapper">
          <div className="title">
            <h1>User Information</h1>
            <Link to="/profile/update">
              <button>Update Profile</button>
            </Link>
          </div>
          <div className="info">
            <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Avatar src={currentUser.avatar} username={currentUser.username} size={56} />
              <div>
                <b style={{ display: "block", fontSize: "1.1rem" }}>{currentUser.username}</b>
                <span style={{ color: "#888", fontSize: "0.875rem" }}>{currentUser.email}</span>
              </div>
            </span>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <div className="title">
            <h1>My List</h1>
            <Link to="/add">
              <button>Create New Post</button>
            </Link>
          </div>
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={data.postResponse}
              errorElement={<p>Error loading posts!</p>}
            >
              {(postResponse) => <List posts={postResponse.data.userPosts} />}
            </Await>
          </Suspense>
          <div className="title">
            <h1>My Visits</h1>
          </div>
          <UpcomingVisits />
          
          <div className="title">
            <h1>Saved List</h1>
          </div>
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={data.postResponse}
              errorElement={<p>Error loading posts!</p>}
            >
              {(postResponse) => <List posts={postResponse.data.savedPosts} />}
            </Await>
          </Suspense>
        </div>
      </div>
      <div className="chatContainer">
        <div className="wrapper">
          <div className="title"><h1>Your Chats</h1></div>
          <p style={{ color: "#888", fontSize: "0.9rem" }}>
            Open any property listing and click "Send a Message" to start a conversation, or go to <Link to="/chats">Chats</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
