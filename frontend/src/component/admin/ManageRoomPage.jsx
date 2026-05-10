import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import ApiService from "../../service/ApiService";
import Pagination from "../common/Pagination";
import RoomResult from "../common/RoomResult";

const ManageRoomPage = () => {
  const { t } = useTranslation("admin");

  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage] = useState(8);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await ApiService.getAllRooms();

        const allRooms = response.roomList;

        setRooms(allRooms);
        setFilteredRooms(allRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error.message);
      }
    };

    const fetchRoomTypes = async () => {
      try {
        const types = await ApiService.getRoomTypes();

        setRoomTypes(types);
      } catch (error) {
        console.error("Error fetching room types:", error.message);
      }
    };

    fetchRooms();
    fetchRoomTypes();
  }, []);

  const handleRoomTypeChange = (e) => {
    const value = e.target.value;

    setSelectedRoomType(value);

    filterRooms(value);
  };

  const filterRooms = (type) => {
    if (type === "") {
      setFilteredRooms(rooms);
    } else {
      const filtered = rooms.filter((room) => room.roomType === type);

      setFilteredRooms(filtered);
    }

    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastRoom = currentPage * roomsPerPage;

  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;

  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="all-rooms">
      <h2>{t("manageRoomPage.allRooms")}</h2>

      <div
        className="all-room-filter-div"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="filter-select-div">
          <label>{t("manageRoomPage.filterByType")}</label>

          <select value={selectedRoomType} onChange={handleRoomTypeChange}>
            <option value="">{t("manageRoomPage.all")}</option>

            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <button
            className="add-room-button"
            onClick={() => navigate("/admin/add-room")}
          >
            {t("manageRoomPage.addRoom")}
          </button>
        </div>
      </div>

      <RoomResult roomSearchResults={currentRooms} />

      <Pagination
        roomsPerPage={roomsPerPage}
        totalRooms={filteredRooms.length}
        currentPage={currentPage}
        paginate={paginate}
      />
    </div>
  );
};

export default ManageRoomPage;
