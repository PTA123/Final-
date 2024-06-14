import ErrorHandler from "../middlewares/error.js";
import { Reservation } from "../models/reservation.js";

const send_reservation = async (req, res, next) => {
    const { name, email, date, time, phone, guests, notes } = req.body;

    if (!name || !email || !date || !time || !phone || !guests) {
        return next(new ErrorHandler("Vui lòng điền đầy đủ vào mẫu đặt chỗ!", 400));
    }

    try {
        await Reservation.create({ name, email, date, time, phone, guests, notes });
        res.status(201).json({
            success: true,
            message: "Đặt chỗ thành công!",
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return next(new ErrorHandler(validationErrors.join(', '), 400));
        }

        return next(error);
    }
};

const get_reservations = async (req, res, next) => {
    try {
        const reservations = await Reservation.find();
        res.status(200).json({
            success: true,
            reservations
        });
    } catch (error) {
        next(error);
    }
};

const get_reservation_by_id = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return next(new ErrorHandler('Không tìm thấy đặt chỗ!', 404));
        }
        res.status(200).json({
            success: true,
            reservation
        });
    } catch (error) {
        next(error);
    }
};

const update_reservation = async (req, res, next) => {
    const { status } = req.body;
    if (!["canceled", "completed"].include(status)) {
        return next(new ErrorHandler('Trạng thái không hợp lệ', 400));
    }

    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return next(new ErrorHandler('Không tìm thấy đặt chỗ!', 404));
        }

        reservation.status = status;
        await reservation.save();

        res.status(200).json({
            success: true,
            reservation
        });
    } catch (error) {
        next(error);
    }
};

const search_reservation = async (req, res) => {
    try {
        const { keyword, option } = req.body
        if (!keyword || option) {
            const noKeyword = await Reservation.find()
            return res.status(400).json({ noKeyword })
        }
        let searchField = {};
        if (option === "name") {
            searchField = { name: { $regex: keyword, $option: 'i' } };
        } else if (option === "id_reservation") {
            searchField = { id_reservation: { $regex: keyword, $option: 'i' } };
        } else {
            return res.status(400).json({ message: "Tùy chọn tìm kiếm không hợp lệ!" });
        }

        const reservations = await Reservation.find({ ...searchField });

        if (!reservations || reservations.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đơn đặt bàn đó!" });
        }

        const formattedReservation = reservations.map(reservation => ({
            ...reservation.toObject(),
            createdAt: formatCreatedAt(reservation.createdAt)
        }));

        return res.status(200).json({ reservations: formattedReservation });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// const search_reservation_by_name = async (req, res, next) => {
//     const { name } = req.query;
//     if (!name) {
//         return next(new ErrorHandler('Vui lòng cung cấp tên khách hàng!', 400));
//     }

//     try {
//         const reservations = await Reservation.find({ name: new RegExp(name, 'i') });
//         if (reservations.length === 0) {
//             return next(new ErrorHandler('Không tìm thấy đặt chỗ!', 404));
//         }
//         res.status(200).json({
//             success: true,
//             reservations
//         });
//     } catch (error) {
//         next(error);
//     }
// };

export {
    send_reservation,
    get_reservation_by_id,
    update_reservation,
    search_reservation,
    get_reservations
    // search_reservation_by_name,
    // search_reservation_by_id
}
