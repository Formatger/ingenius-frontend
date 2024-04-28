import React, { useEffect, useState } from "react";
import { postProjectFiles, postProjects, postTicket } from "@/utils/httpCalls";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "@/components/assets/icons/link.svg";

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  button: string;
}

interface FormData {
  invoice_file?: File;
  contract_file?: File;
}

const UploadFileModal: React.FC<UploadFileModalProps> = ({ 
  isOpen, onClose, title, message, button }) => {

    if (!isOpen) return null;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
        setSelectedFiles(Array.from(files)); 
        setValue("invoice_file", files[0]); 
    }
};

const onSubmit = async (data: FormData) => {
  const formData = new FormData();

  if (selectedFiles.length > 0) {
    formData.append('invoice_file', selectedFiles[0]);
  }

  // Object.entries(data).forEach(([key, value]) => {
  //   if (value !== undefined && value !== null && key !== 'invoice_file') {
  //       formData.append(key, value);
  //   }
  // });

  try {
    await postProjectFiles(
      formData,
      (response) => {
        reset();
        setSelectedFiles([]);
        onClose();
        // updateProjectData();
      },
      (error) => {
        console.error("Error uploading file", error);
      }
    );
  } catch (error) {
    console.error("ERROR", error);
  }
};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        {title && (
          <div className="modal-header">
            <h5 className="subtitle">{title}</h5>
            <button type="button" onClick={onClose} className="close-button">×</button>
          </div>
        )}
        <div className="modal-content">
          {message}
          <form className="sidepanel-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-box">
              <span className="smallcaps">FILES</span>
              <input
                id="fileInput"
                style={{ display: "none" }}
                type="file"
                accept="application/pdf, image/jpg, image/jpeg"
                onChange={handleFiles}
              />
              <div className="upload-files-box">
                <label htmlFor="fileInput" className="custom-file-upload">
                  Select Files
                </label>
                {selectedFiles.length > 0 && (
                  <ul>
                    <li className="ticket-files">
                      <Image src={Link} alt="Icon" width={15} height={15} />
                      {selectedFiles[selectedFiles.length - 1].name}
                    </li>
                  </ul>
                )}
              </div>
              {/* {selectedFiles.length > 0 && (
                <ul>
                  {selectedFiles.map((file, index) => (
                    <li className="ticket-files" key={index}>
                      <Image src={Link} alt="Icon" width={15} height={15} />
                      {file.name}
                    </li>
                  ))}
                </ul>
              )} */}
            </div>
            <div className="column-center">
              <button className="sec-button red" type="submit">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadFileModal;
