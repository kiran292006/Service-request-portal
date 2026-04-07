const Request = require('../models/Request');

const generateTicketNumber = async () => {
    try {
        const date = new Date();
        const year = date.getFullYear();

        // Find the latest ticket for the current year
        const lastRequest = await Request.findOne({
            ticketNumber: new RegExp(`SRP-${year}-`)
        }).sort({ ticketNumber: -1 }); // Sort by ticketNumber to get the highest one

        let sequence = 1;
        if (lastRequest && lastRequest.ticketNumber) {
            const parts = lastRequest.ticketNumber.split('-');
            if (parts.length >= 3) {
                const lastSequence = parseInt(parts[2]);
                if (!isNaN(lastSequence)) {
                    sequence = lastSequence + 1;
                }
            }
        }

        // Format: SRP-2026-0001
        const formattedSequence = sequence.toString().padStart(4, '0');
        const newTicket = `SRP-${year}-${formattedSequence}`;
        console.log('New Ticket Generated:', newTicket);
        return newTicket;
    } catch (err) {
        console.error('Error in generateTicketNumber:', err);
        throw err;
    }
};

module.exports = { generateTicketNumber };
