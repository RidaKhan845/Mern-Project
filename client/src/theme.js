import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%);' : 'linear-gradient(to top, #ff9a9e 0%, #fecfef 99%, #fecfef 100%);',
        backgroundImage: props.colorMode === 'dark'
          ? "url('/darkbg.jpg')"
          : "url('/lightbgg.jpg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        minHeight: '100vh',
      },
    }),
  },
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#97c9e4ff',
      300: '#7dd3fc',
      400: '#0a3655ff',
      500: '#104e7bff',
      600: '#2433b7ff',
      700: '#3959b8ff',
      800: '#075985',
      900: '#0c4a6e',
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});

export default theme;