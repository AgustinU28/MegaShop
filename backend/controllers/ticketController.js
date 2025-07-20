// ===== backend/controllers/ticketController.js =====
const getAllTickets = (req, res) => {
  res.json({
    success: true,
    message: 'Tickets del usuario (placeholder)',
    data: []
  });
};

const getTicketById = (req, res) => {
  res.json({
    success: true,
    message: 'Ticket por ID (placeholder)',
    data: { id: req.params.id, status: 'open' }
  });
};

const createTicket = (req, res) => {
  res.json({
    success: false,
    message: 'Creación de tickets no implementada aún'
  });
};

module.exports = {
  getAllTickets,
  getTicketById,
  createTicket
};

