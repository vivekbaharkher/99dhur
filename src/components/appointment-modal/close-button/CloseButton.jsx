import React from "react";
import { BsX } from "react-icons/bs";

const CloseButton = ({ onClose }) => {
    return (
        <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 bg-white newBorder rounded-lg"
            aria-label="Close modal"
            type="button"
        >
            <BsX className="w-6 h-6 text-gray-600" aria-hidden="true" />
        </button>
    );
};

export default CloseButton;