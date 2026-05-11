import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import ApiService from "../../service/ApiService";
import Pagination from "../common/Pagination";
import RoomResult from "../common/RoomResult";
import RoomSearch from "../common/RoomSearch";

const AllRoomsPage = () => {
  const { t } = useTranslation("rooms");

  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage] = useState(8);

  const handleSearchResult = (results) => {
    setRooms(results);
    setFilteredRooms(results);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await ApiService.getAllRooms();
        setRooms(res.roomList);
        setFilteredRooms(res.roomList);
      } catch (err) {
        console.error(err.message);
      }
    };

    const fetchRoomTypes = async () => {
      try {
        const res = await ApiService.getRoomTypes();
        setRoomTypes(res);
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchRooms();
    fetchRoomTypes();
  }, []);

  const handleRoomTypeChange = (e) => {
    const value = e.target.value;
    setSelectedRoomType(value);

    if (value === "") {
      setFilteredRooms(rooms);
    } else {
      setFilteredRooms(rooms.filter((r) => r.roomType === value));
    }

    setCurrentPage(1);
  };

  const indexOfLast = currentPage * roomsPerPage;
  const indexOfFirst = indexOfLast - roomsPerPage;

  const currentRooms = filteredRooms.slice(indexOfFirst, indexOfLast);

  return (
    <div className="all-rooms">
      <h2>{t("addRoomPage.allRooms")}</h2>

      <div className="all-room-filter-div">
        <label>{t("addRoomPage.filterByType")}</label>

        <select value={selectedRoomType} onChange={handleRoomTypeChange}>
          <option value="">{t("addRoomPage.all")}</option>

          {roomTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <RoomSearch handleSearchResult={handleSearchResult} />

      <RoomResult roomSearchResults={currentRooms} />

      <Pagination
        roomsPerPage={roomsPerPage}
        totalRooms={filteredRooms.length}
        currentPage={currentPage}
        paginate={setCurrentPage}
      />
    </div>
  );
};

export default AllRoomsPage;
