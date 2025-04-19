import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const EntrepreneurCorner = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState({});

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    const postsQuery = query(collection(db, 'entrepreneurPosts'), orderBy('timestamp', 'desc'));
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    });

    return () => {
      unsubscribeAuth();
      unsubscribePosts();
    };
  }, []);

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, 'entrepreneurPosts'), {
        content: newPost.trim(),
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        timestamp: new Date(),
        comments: []
      });
      setNewPost('');
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  const handleSubmitComment = async (postId, commentText) => {
    if (!commentText.trim() || !currentUser) return;

    try {
      const postRef = doc(db, 'entrepreneurPosts', postId);
      await updateDoc(postRef, {
        comments: arrayUnion({
          content: commentText.trim(),
          userId: currentUser.uid,
          userName: currentUser.displayName || 'Anonymous',
          timestamp: new Date()
        })
      });
      setComments(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Entrepreneur Corner</h2>
        <p className="text-gray-600 mb-4">Connect with fellow entrepreneurs, ask questions, and share insights</p>
        
        <form onSubmit={handleSubmitPost} className="space-y-4">
          <Textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Ask a question or share your experience..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={!newPost.trim()}>
              Post Question
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No discussions yet. Be the first to start one!
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow p-4">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-blue-50">
                    {post.userName}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(post.timestamp?.toDate()).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-800">{post.content}</p>
              </div>

              <div className="ml-4 border-l-2 border-gray-100 pl-4">
                {post.comments?.map((comment, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-green-50">
                        {comment.userName}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.timestamp?.toDate()).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}

                <div className="mt-4">
                  <Textarea
                    value={comments[post.id] || ''}
                    onChange={(e) => setComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                    placeholder="Add your reply..."
                    className="min-h-[60px] mb-2"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleSubmitComment(post.id, comments[post.id])}
                      disabled={!comments[post.id]?.trim()}
                      size="sm"
                    >
                      Post Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EntrepreneurCorner;