import React from "react";
import { FaCheck, FaCheckDouble } from "react-icons/fa";
import "../componets-Style/SeenTick.css";

export default function SeenTick({ seen }) {
  return seen ? (
    <FaCheckDouble className="blue-tick" title="Seen" />
  ) : (
    <FaCheck className="gray-tick" title="Delivered" />
  );
}
