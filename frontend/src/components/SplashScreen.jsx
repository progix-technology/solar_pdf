import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import EmailIcon from '@mui/icons-material/Email';

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (progress >= 100) {
      console.log("SplashScreen: Progress is 100%, scheduling onFinish call in 400ms");
      const timeout = setTimeout(() => {
        console.log("SplashScreen: calling onFinish now");
        onFinish();
      }, 400);
      return () => {
        console.log("SplashScreen: clearing timeout");
        clearTimeout(timeout);
      };
    }
  }, [progress, onFinish]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        const diff = Math.random() * 15;
        return Math.min(prevProgress + diff, 100);
      });
    }, 120);

    return () => {
      clearInterval(timer);
    };
  }, []);

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
        {/* Centered Brand Image Logo - Increased size */}
        <Box
          component="img"
          src="/splashscreen.png?v=2"
          alt="Progix Logo"
          sx={{
            width: '100%',
            maxWidth: { xs: 340, sm: 540 },
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

        {/* App Name Title */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            letterSpacing: '-0.5px',
            fontSize: { xs: '1.6rem', sm: '2rem' },
            mb: 4,
            mt: -2,
            background: 'linear-gradient(90deg, #ffffff 30%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
          }}
        >
          Solar Quotation Generator
        </Typography>

        {/* Custom Progress Loader below the logo/info */}
        <Box sx={{ width: '260px', position: 'relative', mb: 3 }}>
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

        {/* Brand Developer Footer Block */}
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 1 }}>
          
          {/* Custom purple gradient line divider with centered dot */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '14px auto', position: 'relative', width: '300px', maxWidth: '80vw' }}>
            <div style={{ height: '2px', width: '100%', background: 'linear-gradient(90deg, rgba(168,85,247,0) 0%, rgba(168,85,247,1) 50%, rgba(168,85,247,0) 100%)' }} />
            <div style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a855f7', left: '50%', transform: 'translateX(-50%)' }} />
          </div>

          {/* Developed by */}
          <Typography
            variant="caption"
            sx={{
              color: '#94a3b8',
              fontWeight: 600,
              fontSize: '0.78rem',
              letterSpacing: '0.5px',
              display: 'block'
            }}
          >
            Developed by
          </Typography>

          {/* PROGIX TECHNOLOGY LLP */}
          <Typography
            variant="body2"
            sx={{
              color: '#a855f7',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '1px',
              mt: 0.3,
              display: 'block'
            }}
          >
            PROGIX TECHNOLOGY LLP
          </Typography>
          
          {/* Separated Email & Website with Icons and Spacing */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '32px', marginTop: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LanguageIcon sx={{ color: '#6366f1', fontSize: 17 }} />
              <span style={{ color: '#6366f1', fontWeight: 800, fontSize: '0.76rem', letterSpacing: '0.2px', lineHeight: 1 }}>
                www.progixtechnology.com
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EmailIcon sx={{ color: '#6366f1', fontSize: 17 }} />
              <span style={{ color: '#6366f1', fontWeight: 800, fontSize: '0.76rem', letterSpacing: '0.2px', lineHeight: 1 }}>
                info@progixtechnology.com
              </span>
            </div>
          </div>
        </Box>

      </Box>
    </Box>
  );
};

export default SplashScreen;
