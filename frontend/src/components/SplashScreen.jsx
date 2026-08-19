import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onFinish();
          }, 400); // Small delay for smooth exit animation
          return 100;
        }
        const diff = Math.random() * 15;
        return Math.min(prevProgress + diff, 100);
      });
    }, 120);

    return () => {
      clearInterval(timer);
    };
  }, [onFinish]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #020617 100%)', // Sleek dark futuristic indigo/space background
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient lighting accents */}
      <Box
        sx={{
          position: 'absolute',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(40px)',
          top: '15%',
          left: '25%',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, rgba(0,0,0,0) 75%)',
          filter: 'blur(50px)',
          bottom: '10%',
          right: '20%',
        }}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          px: 3,
          animation: 'fadeIn 1s ease-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translateY(15px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          }
        }}
      >
        {/* Centered Brand Image Logo */}
        <Box
          component="img"
          src="/splashscreen.png"
          alt="Progix Logo"
          sx={{
            width: '100%',
            maxWidth: { xs: 260, sm: 340 },
            height: 'auto',
            objectFit: 'contain',
            mb: 5,
            filter: 'drop-shadow(0 10px 25px rgba(168, 85, 247, 0.25))',
            animation: 'float 3.5s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-10px)' }
            }
          }}
        />

        {/* Title & Info */}
        <Typography
          variant="h4"
          sx={{
            color: '#ffffff',
            fontWeight: 900,
            letterSpacing: '-0.8px',
            fontSize: { xs: '1.8rem', sm: '2.3rem' },
            mb: 0.5,
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}
        >
          Solar Quotation Generator
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color: '#c084fc',
            fontWeight: 800,
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            fontSize: '0.78rem',
            mb: 5,
            display: 'block'
          }}
        >
          User & Admin Portal
        </Typography>

        {/* Custom Progress Loader below the logo/info */}
        <Box sx={{ width: '260px', position: 'relative', mb: 7 }}>
          {/* Progress track */}
          <Box
            sx={{
              width: '100%',
              height: '5px',
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #a855f7 0%, #6366f1 100%)', // Purple to Indigo dynamic loader
                borderRadius: '10px',
                transition: 'width 0.15s ease-out',
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
              }}
            />
          </Box>
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Loading resources...
            </Typography>
            <Typography variant="caption" sx={{ color: '#a855f7', fontWeight: 700, fontFamily: 'monospace' }}>
              {Math.round(progress)}%
            </Typography>
          </Box>
        </Box>

        {/* Developed by Progix Footer */}
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="caption"
            sx={{
              color: '#94a3b8',
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.5px',
              display: 'block'
            }}
          >
            Developed by PROGIX TECHNOLOGY LLP
          </Typography>
          
          <Box display="flex" justifyContent="center" gap={3} mt={0.8}>
            <Typography
              variant="caption"
              sx={{
                color: '#6366f1',
                fontWeight: 800,
                fontSize: '0.74rem'
              }}
            >
              www.progixtechnology.com
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#6366f1',
                fontWeight: 800,
                fontSize: '0.74rem'
              }}
            >
              info@progixtechnology.com
            </Typography>
          </Box>
        </Box>

      </Box>
    </Box>
  );
};

export default SplashScreen;
