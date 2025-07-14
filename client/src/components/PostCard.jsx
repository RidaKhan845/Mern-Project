import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  IconButton,
  Button,
  Textarea,
  useColorModeValue,
  Image,
  Collapse,
  useToast,
} from '@chakra-ui/react';
import { FiHeart, FiMessageCircle, FiSend, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PostCard = ({ post, onUpdate }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Check follow status when component mounts
  useEffect(() => {
    if (user && post.author && user.id !== post.author._id) {
      checkFollowStatus();
    }
  }, [user, post.author]);

  const checkFollowStatus = async () => {
    try {
      const response = await axios.get(`/api/users/${post.author._id}/is-following`);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user || !post.author) return;
    
    setFollowLoading(true);
    try {
      const response = await axios.post(`/api/users/${post.author._id}/follow`);
      setIsFollowing(response.data.isFollowing);
      toast({
        title: response.data.isFollowing ? 'Started following' : 'Unfollowed',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setFollowLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    
    try {
      const response = await axios.post(`/api/posts/${post._id}/like`);
      setIsLiked(response.data.isLiked);
      setLikesCount(response.data.likesCount);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async () => {
    if (!user || !newComment.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`/api/posts/${post._id}/comment`, {
        content: newComment.trim()
      });
      
      setComments(prev => [...prev, response.data]);
      setNewComment('');
      toast({
        title: 'Comment added',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error adding comment',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <Box
      bg={bg}
      p={6}
      borderRadius="xl"
      border="1px"
      borderColor={borderColor}
      shadow="sm"
      _hover={{ shadow: 'rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset' }}
      transition="all 0.2s"
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <HStack>
            <Avatar
              size="md"
              name={post.author.fullName}
              src={post.author.avatarUrl}
              cursor="pointer"
              onClick={() => navigate(`/profile/${post.author._id}`)}
            />
            <VStack align="start" spacing={0}>
              <Text
                fontWeight="bold"
                cursor="pointer"
                onClick={() => navigate(`/profile/${post.author._id}`)}
              >
                {post.author.fullName}
              </Text>
              <Text fontSize="sm" color="gray.500">
                @{post.author.username}
              </Text>
            </VStack>
          </HStack>
          
          {/* Follow button - only show if not the current user */}
          {user && post.author && user.id !== post.author._id && (
            <Button
              leftIcon={isFollowing ? <FiUserCheck /> : <FiUserPlus />}
              size="sm"
              colorScheme={isFollowing ? "blue" : "brand"}
              variant={isFollowing ? "outline" : "solid"}
              onClick={handleFollow}
              isLoading={followLoading}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </HStack>

        <Text fontSize="md" lineHeight="tall">
          {post.content}
        </Text>

        {post.imageUrl && (
          <Image
            src={post.imageUrl}
            alt="Post image"
            borderRadius="lg"
            maxH="400px"
            objectFit="cover"
          />
        )}

        <HStack justifyContent="space-between">
          <HStack>
            <IconButton
              aria-label="Like post"
              icon={isLiked ? <FaHeart color="red" /> : <FiHeart />}
              variant="ghost"
              size="sm"
              onClick={handleLike}
            />
            <Text fontSize="sm">{likesCount}</Text>
          </HStack>
          
          <Button
            leftIcon={<FiMessageCircle />}
            variant="ghost"
            size="sm"
            onClick={toggleComments}
          >
            {post.commentsCount} comments
          </Button>
        </HStack>

        <Collapse in={showComments}>
          <VStack align="stretch" spacing={3} pt={2}>
            {user && (
              <HStack>
                <Avatar size="sm" name={user.fullName} src={user.avatarUrl} />
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  size="sm"
                  resize="none"
                  rows={2}
                />
                <IconButton
                  aria-label="Send comment"
                  icon={<FiSend />}
                  onClick={handleComment}
                  isLoading={loading}
                  isDisabled={!newComment.trim()}
                />
              </HStack>
            )}
            
            {comments.map((comment) => (
              <HStack key={comment._id} align="start">
                <Avatar
                  size="sm"
                  name={comment.author.fullName}
                  src={comment.author.avatarUrl}
                />
                <VStack align="start" spacing={1} flex={1}>
                  <HStack>
                    <Text fontSize="sm" fontWeight="bold">
                      {comment.author.fullName}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      @{comment.author.username}
                    </Text>
                  </HStack>
                  <Text fontSize="sm">{comment.content}</Text>
                </VStack>
              </HStack>
            ))}
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  );
};

export default PostCard;