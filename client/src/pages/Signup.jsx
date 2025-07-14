import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Input,
  Button,
  Text,
  Link,
  useColorModeValue,
  useToast,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const bg = useColorModeValue('transparent', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !username || !fullName) return;
    
    setLoading(true);
    try {
      await signUp(email, password, username, fullName);
      navigate('/');
      toast({
        title: 'Account created!',
        description: 'Welcome to SocialApp!',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Signup failed',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg={bg}
        p={8}
        borderRadius="xl"
        border="1px"
        borderColor={borderColor}
        shadow="lg"
        w="full"
        maxW="md"
      >
        <form onSubmit={handleSubmit}>
          <VStack spacing={6}>
            <Heading
              size="lg"
              bgGradient="linear(to-r, brand.400, brand.600)"
              bgClip="text"
            >
              Join SocialApp
            </Heading>
            
            <VStack spacing={4} w="full">
              <FormControl>
                <FormLabel>Full Name</FormLabel>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Username</FormLabel>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="Toggle password visibility"
                      icon={showPassword ? <FiEyeOff /> : <FiEye />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </VStack>
            
            <Button
              type="submit"
              colorScheme="brand"
              size="lg"
              w="full"
              isLoading={loading}
            >
              Create Account
            </Button>
            
            <HStack>
              <Text>Already have an account?</Text>
              <Link as={RouterLink} to="/login" color="brand.500">
                Sign in
              </Link>
            </HStack>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default Signup;