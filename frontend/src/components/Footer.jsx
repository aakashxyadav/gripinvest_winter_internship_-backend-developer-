import React from 'react'
import { Box, Typography, Container, IconButton, Divider } from '@mui/material'
import { FavoriteRounded, CodeRounded } from '@mui/icons-material'

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        py: 4,
        mt: 'auto',
        background: 'linear-gradient(135deg, #0052CC 0%, #003d99 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #00B8D9, #0052CC, #00B8D9)',
        }
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Decorative elements */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              gap: 1
            }}
          >
            <CodeRounded sx={{ fontSize: 28, color: '#00B8D9' }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #ffffff, #e3f2fd)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.5px'
              }}
            >
              GripInvest
            </Typography>
          </Box>

          <Divider 
            sx={{ 
              width: '100px', 
              mb: 3, 
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: '1px'
            }} 
          />

          {/* Main footer text */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 1,
              mb: 2
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                fontSize: '1.1rem',
                opacity: 0.95
              }}
            >
              Created with
            </Typography>
            <FavoriteRounded 
              sx={{ 
                color: '#ff4757', 
                fontSize: 20,
                animation: 'heartbeat 2s ease-in-out infinite'
              }} 
            />
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                fontSize: '1.1rem',
                opacity: 0.95
              }}
            >
              by
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #00B8D9, #ffffff)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.2rem',
                letterSpacing: '0.5px'
              }}
            >
              Aakash Yadav
            </Typography>
          </Box>

          {/* Year and additional info */}
          <Typography
            variant="body2"
            sx={{
              opacity: 0.8,
              fontSize: '0.9rem',
              fontWeight: 400
            }}
          >
            © 2025 • All rights reserved.
          </Typography>
        </Box>
      </Container>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.15); }
          28% { transform: scale(1); }
          42% { transform: scale(1.15); }
          70% { transform: scale(1); }
        }
      `}</style>
    </Box>
  )
}

export default Footer
