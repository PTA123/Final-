import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  Pagination,
  Form,
  Button,
  Popconfirm,
  Space,
  Select,
  Input,
  Tag,
  Modal,
} from "antd";
import { TiDelete } from "react-icons/ti";
import { toast } from "react-hot-toast";
import {
  get_reservations,
  get_reservation_by_id,
  search_reservation_by_name,
  update_reservation_status,
} from "../services/reservation.js";

const ReservationComponent = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalDoc, setTotalDoc] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState("id_reservation");
  const [searchResults, setSearchResults] = useState([]);
  const [searchTotalDoc, setSearchTotalDoc] = useState(0);
  const [searchPageIndex, setSearchPageIndex] = useState(1);

  const options = [
    { value: "id_reservation", label: "Mã đơn" },
    { value: "name", label: "Tên khách hàng" },
  ];

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "id_reservation",
      key: "id_reservation",    
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số lượng khách",
      dataIndex: "NumOfGuest",
      key: "NumOfGuest",
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAtDate",
      key: "createdAtDate",
    },
    {
      title: "Giờ đặt",
      dataIndex: "createdAtTime",
      key: "createdAtTime",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          "Hoàn thành": "green",
          "Đã hủy": "red",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (row) => (
        <div className="flex gap-2">
          <Button onClick={() => handleUpdateStatus(row._id, "completed")}>
            Hoàn tất
          </Button>
          <Button danger onClick={() => handleUpdateStatus(row._id, "canceled")}>
            Hủy
          </Button>
        </div>
      ),
    },
  ];

  const [form] = Form.useForm();

  const getReservations = useCallback(async () => {
    try {
      setLoading(true);
      const result = await get_reservations({ pageSize, pageIndex });
      setReservations(result.data.reservations);
      setTotalDoc(result.data.count);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [pageSize, pageIndex]);

  useEffect(() => {
    getReservations();
  }, [getReservations]);

  const handleUpdateStatus = async (id, status) => {
    try {
      setLoading(true);
      const result = await update_reservation_status(id, { status });
      setReservations(
        reservations.map((reservation) => {
          if (reservation._id === id) {
            return result.data.reservation;
          }
          return reservation;
        })
      );
      toast.success(`Cập nhật trạng thái thành công: ${status}`);
    } catch (error) {
      console.log(error);
      toast.error(`Cập nhật trạng thái thất bại: ${status}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      if (searchQuery.trim() !== "") {
        let response;
        if (selectedOption === "id_reservation") {
          response = await get_reservation_by_id(searchQuery);
        } else {
          response = await search_reservation_by_name(searchQuery);
        }
        setSearchResults(response.data.reservations || [response.data.reservation]);
        setSearchTotalDoc(response.data.count || 1);
        setSearchPageIndex(1);
      }
    } catch (error) {
      toast.error("Không tìm thấy đơn đặt chỗ!");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    getReservations();
  };

  const handlePaginationChange = (pageIndex, pageSize) => {
    if (searchQuery.trim() === "") {
      setPageSize(pageSize);
      setPageIndex(pageIndex);
    } else {
      setPageSize(pageSize);
      setSearchPageIndex(pageIndex);
      handleSearch();
    }
  };

  return (
    <div className="h-[37.45rem]">
      <div className="flex justify-between items-center px-2 pb-4 pr-4 pl-4 pt-0">
        <h1 className="text-gray-500 text-xl">Danh sách đơn đặt chỗ</h1>
        <Space.Compact className="w-[32rem] relative">
        <Select
            defaultValue="id_reservation"
            options={options}
            className="w-[10rem]"
            onChange={(value) => setSelectedOption(value)}
          />
          <Input
            placeholder="Nhập từ khóa tìm kiếm ...."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onPressEnter={handleSearch}
          />
          {searchQuery && (
            <TiDelete
              className="text-gray-400 text-xl absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer z-10"
              onClick={handleClearSearch}
            />
          )}
        </Space.Compact>
      </div>

      <Table
        columns={columns}
        dataSource={searchQuery.trim() === "" ? reservations : searchResults}
        loading={loading}
        pagination={false}
        rowKey="_id"
      />
      
      <Pagination
        className="my-5 float-right"
        defaultCurrent={1}
        current={searchQuery.trim() === "" ? pageIndex : searchPageIndex}
        total={searchQuery.trim() === "" ? totalDoc : searchTotalDoc}
        pageSize={pageSize}
        showSizeChanger
        onChange={handlePaginationChange}
      />
    </div>
  );
};

export default ReservationComponent;
