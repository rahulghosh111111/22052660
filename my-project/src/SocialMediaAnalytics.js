import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const API_BASE = "http://20.244.56.144/evaluation-service";

export default function SocialMediaAnalytics() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/users`, { withCredentials: true });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (userId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/users/${userId}/posts`, { withCredentials: true });
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/posts/${postId}/comments`, { withCredentials: true });
      setComments(response.data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const addPost = async () => {
    if (!newPostContent || !newPostImage) {
      alert("Please provide both content and an image URL.");
      return;
    }

    if (users.length === 0) {
      alert("No users available to associate with the post.");
      return;
    }

    const userId = users[0]?.id || "defaultUserId";

    try {
      const newPost = {
        userId,
        content: newPostContent,
        imageUrl: newPostImage,
      };

      console.log("Sending Post:", newPost);

      const response = await axios.post(`${API_BASE}/posts`, newPost, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      console.log("Response:", response.data);

      setPosts((prevPosts) => [...prevPosts, response.data]);
      setNewPostContent("");
      setNewPostImage("");
    } catch (error) {
      console.error("Error adding post:", error.response?.data || error.message);
      alert("Failed to add post. Check the console for details.");
    }
  };

  const postCounts = users.map((user) => ({
    name: user.name,
    posts: posts.filter((post) => post.userId === user.id).length,
  }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Social Media Analytics</h1>
      
      <div className="border p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
        <input
          type="text"
          placeholder="Enter post content"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <input
          type="text"
          placeholder="Enter image URL"
          value={newPostImage}
          onChange={(e) => setNewPostImage(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <button 
          className="px-4 py-2 bg-purple-500 text-white rounded" 
          onClick={addPost}
        >
          Add Post with Image
        </button>
      </div>

      {loading && <p className="text-center text-gray-500">Loading...</p>}

      <div className="border p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <div className="grid grid-cols-3 gap-4">
          {users.map((user) => (
            <button 
              key={user.id} 
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => fetchPosts(user.id)}
            >
              {user.name}
            </button>
          ))}
        </div>
      </div>

      <div className="border p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Post Count per User</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={postCounts}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="posts" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="border p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Posts</h2>
        <div className="space-y-4">
          {posts.map((post) => (
            <button 
              key={post.id} 
              className="px-4 py-2 bg-green-500 text-white rounded"
              onClick={() => fetchComments(post.id)}
            >
              {post.content}
            </button>
          ))}
        </div>
      </div>

      <div className="border p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        <ul className="list-disc pl-5">
          {comments.map((comment) => (
            <li key={comment.id}>{comment.content}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
