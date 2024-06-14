import express from "express";
import{send_reservation, get_reservations, get_reservation_by_id, update_reservation }from "../controllers/reservation.js"

const router = express.Router();

router.post("/send", send_reservation);
router.get('/', get_reservations);
router.get('/:id', get_reservation_by_id);
router.patch('/:id', update_reservation);

export default router;