import React, { useState, useEffect } from 'react';
import { VStack, Text, Spinner, Box } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import axios from 'axios';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      const response = await axios.get('api/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={8}>
        <Spinner size="xl" color="brand.500" />
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <CreatePost onPostCreated={fetchPosts} />
      
      {posts.length === 0 ? (
        <Text textAlign="center" color="gray.500" py={8}>
          No posts yet. Be the first to share something!
        </Text>
      ) : (
        posts.map((post) => (
          <PostCard key={post._id} post={post} onUpdate={fetchPosts} />
        ))
      )}
    </VStack>
  );
};

export default Home;