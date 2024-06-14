import { axiosInstanceAuth } from "./index";

const update_reservation_status = (reservationId, data) => {
    return axiosInstanceAuth.patch(`/reservations/${reservationId}/status`, data);
}

const get_reservations = ({ pageSize, pageIndex }) => {
    return axiosInstanceAuth.get(`/reservations?pageSize=${pageSize}&pageIndex=${pageIndex}`);
}

const get_reservation_by_id = (reservationId) => {
    return axiosInstanceAuth.get(`/reservations/${reservationId}`);
}

const search_reservation_by_name = (name) => {
    return axiosInstanceAuth.get(`/reservations/search?name=${name}`);
}

export {
    update_reservation_status,
    get_reservations,
    get_reservation_by_id,
    search_reservation_by_name
}
