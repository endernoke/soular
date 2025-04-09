import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';

function Social() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(postsQuery);
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
    setLoading(false);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    
    setPosting(true);
    try {
      const post = {
        content: newPost,
        user: {
          id: currentUser.uid,
          name: currentUser.displayName,
          avatar: currentUser.photoURL || 'https://i.imgur.com/HYsTHOF.png'
        },
        likes: [],
        comments: [],
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'posts'), post);
      
      // Award points for posting
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        points: (currentUser.points || 0) + 5,
        actions: (currentUser.actions || 0) + 1
      });

      setNewPost('');
      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error('Error creating post:', error);
    }
    setPosting(false);
  };

  const handleLike = async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);
      const hasLiked = post.likes.includes(currentUser.uid);

      if (hasLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.uid)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid)
        });

        // Award points for first like on a post
        if (!hasLiked) {
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            points: (currentUser.points || 0) + 1
          });
        }
      }

      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Create Post */}
      <div className="bg-white dark:bg-darkcard p-6 rounded-lg shadow-lg mb-6">
        <form onSubmit={handlePostSubmit}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your climate action..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
            rows="3"
          ></textarea>
          <button
            type="submit"
            disabled={posting || !newPost.trim()}
            className="mt-3 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {posting ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>

      {/* Posts Feed */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="loader ease-linear rounded-full border-4 border-gray-200 h-12 w-12"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white dark:bg-darkcard p-6 rounded-lg shadow-lg">
              {/* Post Header */}
              <div className="flex items-center mb-4">
                <img
                  src={post.user.avatar}
                  alt={post.user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="ml-3">
                  <h3 className="font-semibold">{post.user.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(post.createdAt)}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <p className="mb-4">{post.content}</p>

              {/* Post Actions */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-1 ${
                    post.likes.includes(currentUser.uid)
                      ? 'text-primary'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span>{post.likes.length}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Social;
