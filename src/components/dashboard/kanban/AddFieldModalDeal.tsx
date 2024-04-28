import React, { useEffect, useState } from "react";
import { getDealStages, postDealStage } from "@/utils/httpCalls";

interface AddFieldModalDealProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  updateDealData: () => void;
}

const AddFieldModalCampaign: React.FC<AddFieldModalDealProps> = ({
  isOpen,
  onClose,
  title,
  updateDealData,
}) => {
  if (!isOpen) return null;

  const [newLabel, setNewLabel] = useState<{
    name: string;
    order: number;
  }>({ name: "", order: -1 });

  useEffect(() => {
    const fetchMaxOrderDeal = async () => {
      try {
        await getDealStages(
          (response) => {
            const maxOrder = Math.max(
              ...response?.map((stage: any) => stage.order)
            );
            setNewLabel((prevLabel) => ({ ...prevLabel, order: maxOrder + 1 }));
          },
          (error) => {
            console.error("Error fetching deal stages:", error);
          }
        );
      } catch (error) {
        console.error("Error fetching deal stages:", error);
      }
    };
    fetchMaxOrderDeal();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setNewLabel((prevLabel) => ({ ...prevLabel, name: newName }));
  };

  const addDealStage = async () => {
    try {
      await postDealStage(
        newLabel,
        (response) => {
          onClose();
          updateDealData();
        },
        (error) => {
          console.error("Error creating campaign:", error);
        }
      );
    } catch (error) {
      console.error("ERROR", error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="modal-header">
            <h5 className="subtitle">{title}</h5>
            <button type="button" onClick={onClose} className="close-button">
              ×
            </button>
          </div>
        )}
        <div className="modal-content">
          {/* <p className='text'>
            Add a new field to your kanban board here
          </p> */}
          <p className="smallcaps">Add Label</p>
          <input
            type="text"
            placeholder="Label (eg. Prospective)"
            className="app-input"
            value={newLabel.name}
            onChange={handleInputChange}
          />
          <div className="column-center">
            <button
              className="app-button mt-4"
              type="submit"
              onClick={addDealStage}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFieldModalCampaign;
