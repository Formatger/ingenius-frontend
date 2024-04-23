import React, { useEffect, useState } from "react";
import {putNewOrderProject} from "@/utils/httpCalls";

interface ChangeProjectColumnProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  button: string;
  updateProjectData: () => void;
  changeStage: any;
}

const ChangeProjectColumn: React.FC<ChangeProjectColumnProps> = ({ isOpen, onClose, title, button, updateProjectData,changeStage}) => {
    console.log("!!!!!!!!!!!!!!!!",changeStage)

    const [newName, setNewName] = useState<string>('');

    const handleChange = async () => {
        try {
          // Llamar a la función para actualizar el nombre en la base de datos
          await putNewOrderProject(changeStage.stageID, { name: newName, order: changeStage.stageIndex }, () => {});
          
          // Aquí deberías llamar a las funciones que actualizan el estado o realizan otras tareas necesarias después de la actualización
          // Por ejemplo:
          updateProjectData();
          onClose();
        } catch (error) {
          console.error("Failed to change stage name:", error);
        }
      };

    if (!isOpen) return null;
  
    return (
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="subtitle">{title}</h5>
              <button type="button" onClick={onClose} className="close-button">×</button>
            </div>
            <div className="modal-content">
              <input className="form-input" type="text" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <div className='button-group row-between mt-5'>
                <button className="app-button cream mt-4" type="button" onClick={onClose}>
                  Cancel
                </button>
                <button className="app-button mt-4" type="button" onClick={handleChange}>
                  {button}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    };
    
export default ChangeProjectColumn;
