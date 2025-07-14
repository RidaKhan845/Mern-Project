import React, { useState, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Textarea,
  Button,
  Avatar,
  useColorModeValue,
  useToast,
  IconButton,
  Image,
  Spinner,
  Flex,
  Text,
} from '@chakra-ui/react';
import { FiImage, FiX, FiUpload } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:5000';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSubmit = async () => {
    if (!user || !content.trim()) return;
    
    setLoading(true);
    try {
      await axios.post('/api/posts', {
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
      });
      
      setContent('');
      setImageUrl('');
      setShowImageUpload(false);
      
      toast({
        title: 'Post created!',
        status: 'success',
        duration: 2000,
      });
      
      onPostCreated?.();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error creating post',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Log the file information for debugging
    console.log('Uploading file:', file.name, file.type, file.size);

    const formData = new FormData();
    formData.append('image', file);

    setUploadLoading(true);
    try {
      console.log('Sending upload request to /api/uploads/image');
      const response = await axios.post('/api/uploads/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', response.data);
      
      // Ensure the URL is properly formatted with the base URL if needed
      let fullImageUrl = response.data.fileUrl;
      if (fullImageUrl && !fullImageUrl.startsWith('http')) {
        fullImageUrl = `${API_BASE_URL}${fullImageUrl}`;
      }
      
      console.log('Setting image URL to:', fullImageUrl);
      setImageUrl(fullImageUrl);
      
      toast({
        title: 'Image uploaded successfully',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error uploading image:', error.response || error);
      toast({
        title: 'Error uploading image',
        description: error.response?.data?.message || error.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!user) return null;

  return (
    <Box
      bg={bg}
      p={6}
      borderRadius="xl"
      border="1px"
      borderColor={borderColor}
 shadow="rgba(0, 0, 0, 0.24) 0px 1px 2px;"
      _hover={{ shadow: 'rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;' }}
      transition="all 0.2s"
    >
      <VStack spacing={4}>
        <HStack align="start" w="full">
          <Avatar size="md" name={user.fullName} src={user.avatarUrl} />
          <VStack flex={1} spacing={3} align="start">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              resize="none"
              border="none"
              _focus={{ boxShadow: 'none' }}
              fontSize="lg"
              minH="80px"
              width="100%"
            />
            
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            {/* Image preview */}
            {imageUrl && (
              <Box position="relative" width="full" borderRadius="md" overflow="hidden">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  maxH="300px"
                  objectFit="cover"
                  borderRadius="md"
                  width="100%"
                  fallback={<Box p={4} textAlign="center">
                    <Text>Failed to load image preview</Text>
                    <Text fontSize="sm" color="gray.500" mt={2}>{imageUrl}</Text>
                  </Box>}
                  onError={() => console.error('Image failed to load:', imageUrl)}
                />
                <IconButton
                  aria-label="Remove image"
                  icon={<FiX />}
                  size="sm"
                  position="absolute"
                  top={2}
                  right={2}
                  colorScheme="red"
                  onClick={removeImage}
                  borderRadius="full"
                  backgroundColor="rgba(0,0,0,0.6)"
                  _hover={{ backgroundColor: "rgba(0,0,0,0.8)" }}
                />
              </Box>
            )}
            
            {/* Upload button when no image is selected */}
            {showImageUpload && !imageUrl && (
              <Flex 
                justify="center" 
                align="center" 
                width="100%" 
                borderRadius="md" 
                borderWidth="2px" 
                borderStyle="dashed" 
                borderColor={borderColor}
                py={6}
                cursor="pointer"
                onClick={triggerFileInput}
                _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
              >
                {uploadLoading ? (
                  <Spinner />
                ) : (
                  <VStack spacing={2}>
                    <FiUpload size={24} />
                    <Text>Click to upload an image</Text>
                  </VStack>
                )}
              </Flex>
            )}
          </VStack>
        </HStack>
        
        <HStack w="full" justifyContent="space-between">
          <IconButton
            aria-label="Add image"
            icon={<FiImage />}
            onClick={() => setShowImageUpload(!showImageUpload)}
            variant="ghost"
            colorScheme={showImageUpload ? "brand" : "gray"}
          />
          
          <Button
            onClick={handleSubmit}
            isLoading={loading}
            isDisabled={!content.trim()}
            colorScheme="brand"
          >
            Post
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default CreatePost;