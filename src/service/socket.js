module.exports = (io) => {
    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);
      
      // Join room for specific emergency
      socket.on('joinEmergency', (emergencyId) => {
        socket.join(emergencyId);
        console.log(`Client joined emergency room: ${emergencyId}`);
      });
      
      // Handle chat messages
      socket.on('sendMessage', ({ emergencyId, message }) => {
        io.to(emergencyId).emit('newMessage', message);
      });
      
      // Handle location updates
      socket.on('updateLocation', ({ emergencyId, coordinates }) => {
        io.to(emergencyId).emit('locationUpdated', coordinates);
      });
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  };