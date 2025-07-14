import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Avatar,
  Button,
  Spinner,
  useColorModeValue,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Divider,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import axios from 'axios';

const Profile = () => {
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  const { user } = useAuth();
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchProfile = async () => {
    if (!userId) return;
    
    try {
      const [userResponse, postsResponse] = await Promise.all([
        axios.get(`api/users/${userId}`),
        axios.get(`api/posts/user/${userId}`)
      ]);

      setProfileUser(userResponse.data.user);
      setIsFollowing(userResponse.data.user.isFollowing);
      setPosts(postsResponse.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId, user]);

  const handleFollow = async () => {
    if (!user || !profileUser) return;
    
    setFollowLoading(true);
    try {
      const response = await axios.post(`/users/${profileUser.id}/follow`);
      setIsFollowing(response.data.isFollowing);
      toast({
        title: response.data.message,
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: 'Error updating follow status',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={8}>
        <Spinner size="xl" color="brand.500" />
      </Box>
    );
  }

  if (!profileUser) {
    return (
      <Box textAlign="center" p={8}>
        <Text>User not found</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box
        bg="transparent"
        p={6}
        borderRadius="xl"
        border="1px"
        borderColor={borderColor}
        boxShadow=""
        shadow="sm"
      >
        <VStack spacing={4}>
          <Avatar
            size="2xl"
            name={profileUser.fullName}
            src={profileUser.avatarUrl}
          />
          
          <VStack spacing={2}>
            <Text fontSize="2xl" fontWeight="bold">
              {profileUser.fullName}
            </Text>
            <Text color="gray.500">@{profileUser.username}</Text>
            {profileUser.bio && (
              <Text textAlign="center" maxW="md">
                {profileUser.bio}
              </Text>
            )}
          </VStack>
          
          <StatGroup>
            <Stat textAlign="center"  mr={3}>
              <StatNumber>{posts.length}</StatNumber>
              <StatLabel>Posts</StatLabel>
            </Stat>
            <Stat textAlign="center" mr={3}>
              <StatNumber>{profileUser.followersCount}</StatNumber>
              <StatLabel>Followers</StatLabel>
            </Stat>
            <Stat textAlign="center">
              <StatNumber>{profileUser.followingCount}</StatNumber>
              <StatLabel>Following</StatLabel>
            </Stat>
          </StatGroup>
          
          {user && user.id !== profileUser.id && (
            <Button
              colorScheme={isFollowing ? 'gray' : 'brand'}
              variant={isFollowing ? 'outline' : 'solid'}
              onClick={handleFollow}
              isLoading={followLoading}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </VStack>
      </Box>
      
      <Divider />
      
      <Text fontSize="xl" fontWeight="bold">
        Posts
      </Text>
      
      {posts.length === 0 ? (
        <Text textAlign="center" color="gray.500" py={8}>
          No posts yet.
        </Text>
      ) : (
        posts.map((post) => (
          <PostCard key={post._id} post={post} onUpdate={fetchProfile} />
        ))
      )}
    </VStack>
  );
};

export default Profile;