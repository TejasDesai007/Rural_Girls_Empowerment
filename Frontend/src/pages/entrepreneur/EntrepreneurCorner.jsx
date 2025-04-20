import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sparkles, Heart, MessageCircle, Send, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const EntrepreneurCorner = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
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

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name || name === 'Anonymous') return 'AN';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 py-16 px-4 sm:px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-3xl mx-auto"
      >
        {/* Logo and Brand Header */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center mb-10 text-center"
        >
          <div className="w-16 h-16 mb-3 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-fuchsia-800">
            Entrepreneur Corner
          </h1>
          <p className="text-gray-700 max-w-md mt-3 text-center font-medium">
            A space for inspired women to connect, share ideas, and grow their businesses together
          </p>
        </motion.div>

        {/* New Post Card */}
        <Card className="mb-10 border border-fuchsia-200 shadow-xl bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-violet-500"></div>
          <CardHeader className="pb-0 pt-6">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-fuchsia-800">
              <Star className="h-5 w-5 text-fuchsia-600" />
              Share Your Thoughts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmitPost} className="space-y-4">
              <Textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Ask a question or share your experience..."
                className="min-h-[120px] border-fuchsia-200 focus:border-fuchsia-400 focus:ring-fuchsia-300 rounded-lg resize-none shadow-sm"
              />
              <div className="flex justify-end">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit" 
                    disabled={!newPost.trim()}
                    className="bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-700 hover:to-purple-800 transition-all duration-300 shadow-md px-6 text-white"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Share with Community
                  </Button>
                </motion.div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {posts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-16 rounded-lg shadow-md bg-white border border-fuchsia-100"
            >
              <div className="flex justify-center">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                >
                  <Heart className="h-16 w-16 text-fuchsia-500" />
                </motion.div>
              </div>
              <p className="text-lg font-medium text-fuchsia-800 mt-4">No discussions yet</p>
              <p className="text-gray-700 max-w-md mx-auto mt-2">
                Be the first to start a conversation and inspire our community!
              </p>
            </motion.div>
          ) : (
            posts.map((post, idx) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <Card className="border border-fuchsia-100 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-fuchsia-400 to-violet-500"></div>
                  <CardHeader className="pb-2 pt-5">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12 ring-2 ring-fuchsia-200 ring-offset-2 bg-gradient-to-br from-fuchsia-500 to-purple-600">
                        <AvatarFallback className="text-white font-bold text-sm">
                          {getInitials(post.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="mb-1">
                          <Badge className="bg-fuchsia-100 text-fuchsia-800 border-none hover:bg-fuchsia-200 font-medium">
                            {post.userName}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 font-medium">
                          {new Date(post.timestamp?.toDate()).toLocaleString(undefined, { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-800 py-2 pl-1 leading-relaxed">{post.content}</p>
                  
                    {/* Comments section */}
                    <div className="mt-8 pt-4 border-t border-fuchsia-100">
                      <div className="flex items-center mb-4 gap-2">
                        <MessageCircle className="h-4 w-4 text-fuchsia-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {post.comments?.length || 0} {post.comments?.length === 1 ? 'Reply' : 'Replies'}
                        </span>
                      </div>
                      
                      {post.comments?.length > 0 && (
                        <div className="space-y-5 mb-6">
                          {post.comments.map((comment, index) => (
                            <div key={index} className="pl-4 border-l-2 border-fuchsia-300">
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="h-8 w-8 ring-1 ring-fuchsia-100 bg-gradient-to-r from-fuchsia-400 to-purple-500">
                                  <AvatarFallback className="text-white font-bold text-xs">
                                    {getInitials(comment.userName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <Badge className="bg-purple-100 text-purple-800 border-none hover:bg-purple-200 font-medium">
                                    {comment.userName}
                                  </Badge>
                                  <span className="text-xs text-gray-700 ml-2 font-medium">
                                    {new Date(comment.timestamp?.toDate()).toLocaleString(undefined, { 
                                      month: 'short', 
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-800 pl-10 leading-relaxed">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-fuchsia-100 pt-4 bg-fuchsia-50">
                    <div className="w-full space-y-3">
                      <Textarea
                        value={comments[post.id] || ''}
                        onChange={(e) => setComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Add your reply..."
                        className="min-h-[60px] border-fuchsia-200 focus:border-fuchsia-400 focus:ring-fuchsia-300 text-sm rounded-md resize-none shadow-sm bg-white"
                      />
                      <div className="flex justify-end">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => handleSubmitComment(post.id, comments[post.id])}
                            disabled={!comments[post.id]?.trim()}
                            size="sm"
                            className="bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-700 hover:to-purple-800 transition-all duration-300 shadow-sm text-white"
                          >
                            <Send className="mr-2 h-3 w-3" />
                            Post Reply
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EntrepreneurCorner;