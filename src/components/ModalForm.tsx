import React, { useState } from "react";
import { MdEdit } from "react-icons/md";

interface ModalFormProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const ModalForm: React.FC<ModalFormProps> = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative">
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold"
        onClick={onClose}
        aria-label="Close"
      >×</button>
      <h3 className="text-xl font-bold mb-4 text-blue-900">{title}</h3>
      {children}
    </div>
  </div>
);

export default ModalForm;
