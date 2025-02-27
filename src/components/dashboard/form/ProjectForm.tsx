import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import HelpIcon from "@/components/assets/svg/Help";
import SearchDropdown from "./SearchDropdown";
import { useForm } from "react-hook-form";
import FormSidepanel from "@/components/common/Sidepanel";
import { CampaignInterface, ProjectInterface } from "@/interfaces/interfaces";
import {
  getCampaigns,
  getCreators,
  lockCampaign,
  lockProject,
  postProjects,
  putProject,
  unlockCampaign,
  unlockProject,
} from "@/utils/httpCalls";
import { useRouter } from "next/router";
import InvoiceDropdown from "@/components/common/InvoiceDropdown";

interface Creators {
  id: string;
  name: string;
  profile_picture_url: string;
  email: string;
}

interface FormData {
  id?: number;
  start_date: Date;
  deadline: Date;
  name: string;
  contract_value?: number;
  description?: string;
  campaign: string;
  creator?: string;
  project_stage?: number;
  invoice_paid?: boolean;
  team_name?: string;
}

interface ProjectFormProps {
  projectStage: any[];
  handleCloseFormSidepanel: () => void;
  updateProjectData: () => void;
  isEditing: boolean;
  projectsData: any;
  closeEdit: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  projectStage,
  handleCloseFormSidepanel,
  updateProjectData,
  isEditing,
  projectsData,
  closeEdit,
}) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FormData>();
  const [creatorsData, setCreatorsData] = useState<Creators[]>([]);
  const [campaignsData, setCampaignsData] = useState<any>([]);
  const [invoiceStatus, setInvoiceStatus] = useState(
    projectsData.invoice_paid ? "Paid" : "Unpaid"
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const startDate = watch("start_date");
  const endDate = watch("deadline");

  /* LOCK FORM */
  useEffect(() => {
    lockProject(projectsData.id);

    const handleBeforeUnload = (event: any) => {
      event.preventDefault();
      unlockProject(projectsData.id);
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unlockProject(projectsData.id);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  /* INVOICE DROPDOWN */

  const handleInvoiceSelect = (value: string) => {
    setInvoiceStatus(value);
    setValue("invoice_paid", value === "Paid");
    trigger("invoice_paid");
  };

  /* SEARCH DROPDOWN */
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (term: any) => {
    setSearchTerm(term);
  };

  /* SIDEPANEL STATE */
  const handleClose = () => {
    handleCloseFormSidepanel();
  };

  /* GET CREATORS API CALL */

  useEffect(() => {
    fetchCreators();
  }, [router]);

  const fetchCreators = () => {
    getCreators(
      (response: any) => {
        setCreatorsData(response || []);
      },
      (error: any) => {
        console.error("Error fetching profile data:", error);
        setCreatorsData([]);
      }
    ).finally(() => { });
  };

  /* GET CAMPAIGNS API CALL */

  useEffect(() => {
    fetchCampaigns();
  }, [router]);

  const fetchCampaigns = () => {
    getCampaigns(
      (response: any) => {
        setCampaignsData(response || []);
      },
      (error: any) => {
        console.error("Error fetching profile data:", error);
        setCampaignsData([]);
      }
    ).finally(() => { });
  };

  /* SUBMIT FORM - POST PROJECTS API CALL  */

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      if (isEditing) {
        const projectId = projectsData.id;

        const updatedData: FormData = {
          ...projectsData,
          ...data,
        };

        await putProject(
          projectId,
          updatedData,
          (response) => {
            reset();
            closeEdit();
            updateProjectData();
          },
          (error) => {
            console.error("Error updating project:", error);
          }
        ).finally(() => setSubmitting(false));
      } else {
        await postProjects(
          data,
          (response) => {
            reset();
            handleClose();
            updateProjectData();
          },
          (error) => {
            console.error("Error creating project:", error);
          }
        ).finally(() => setSubmitting(false));
      }
    } catch (error) {
      console.error("ERROR", error);
      setSubmitting(false);
    }
  };

  return (
    <FormSidepanel handleClose={handleClose}>
      <div className="sidepanel-header">
        <p
          className="row-wrap-2 text-brown"
        >
          {isEditing ? "Edit Project" : "Add Project"}
        </p>
        <div className="sidepanel-button">
          <Link href="/dashboard/support" passHref>
            <button className="sidepanel-top-button">
              <HelpIcon />
              Get help
            </button>
          </Link>
        </div>
      </div>
      {isEditing ? (
        <div className="sidepanel-wrap">
          <form className="sidepanel-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-box">
              <span className="smallcaps">PROJECT NAME*</span>
              <input
                {...register("name", {
                  required: "Project name is required",
                  validate: (value) =>
                    value.trim() !== "" || "Project name is required",
                })}
                className="form-input"
                type="text"
                placeholder="Enter project name"
                defaultValue={projectsData.name}
              />
              {errors.name && (
                <span className="error-message">{errors.name.message}</span>
              )}
            </div>
            <div className="form-box">
              <span className="smallcaps">DESCRIPTION</span>
              <textarea
                {...register("description")}
                className="form-textarea"
                placeholder="Add a description"
                defaultValue={projectsData.description}
              />
            </div>
            <div className="form-box">
              <span className="smallcaps">SELECT CAMPAIGN*</span>
              <SearchDropdown
                // {...register("campaign")}
                data={campaignsData}
                onSelect={(selectedItem) => {
                  setValue("campaign", selectedItem.id);
                  trigger("campaign");
                }}
                placeholder={projectsData.campaign_name}
                handleSearch={handleSearchChange}
                displayKey="name"
              />
            </div>
            <div className="form-box">
              <span className="smallcaps">SELECT CREATOR*</span>
              <SearchDropdown
                // {...register("creator")}
                data={creatorsData}
                onSelect={(selectedItem) => {
                  setValue("creator", selectedItem.id);
                  trigger("creator");
                }}
                placeholder={projectsData.creator_name}
                handleSearch={handleSearchChange}
                displayKey="name"
              />
            </div>
            <div className="form-box">
              <span className="smallcaps">CONTRACT VALUE*</span>
              <input
                {...register("contract_value", {
                  required: "Contract value is required",
                  valueAsNumber: true,
                  validate: {
                    notEmpty: (value) =>
                      value !== undefined || "Contract value cannot be empty",
                    isNumber: (value) =>
                      !isNaN(value ?? 0) || "Please enter a number",
                  },
                })}
                className="form-input"
                type="text"
                defaultValue={projectsData.contract_value}
              />
              {errors.contract_value && (
                <span className="error-message">
                  {errors.contract_value.message}
                </span>
              )}
            </div>
            <div>
              <InvoiceDropdown
                selectedValue={invoiceStatus}
                onSelect={handleInvoiceSelect}
              />
            </div>
            <div className="form-box">
              <span className="smallcaps">START DATE*</span>
              <input
                {...register("start_date", {
                  required: "Start date is required",
                })}
                className="form-input"
                type="date"
                defaultValue={projectsData.start_date}
              />
              {errors.start_date && (
                <span className="error-message">
                  {errors.start_date.message}
                </span>
              )}
            </div>
            <div className="form-box">
              <span className="smallcaps">END DATE*</span>
              <input
                {...register("deadline", {
                  required: "End date is required",
                  validate: {
                    isAfterStartDate: (value) =>
                      new Date(value) >= new Date(startDate) ||
                      "End date cannot be before start date",
                  },
                })}
                className="form-input"
                type="date"
                defaultValue={projectsData.deadline}
              />
              {errors.deadline && (
                <span className="error-message">{errors.deadline.message}</span>
              )}
            </div>

            <div className="button-group">
              <button
                className="sec-button stone"
                type="button"
                onClick={handleClose}
              >
                <p>Cancel</p>
              </button>
              <button className="sec-button linen" type="submit">
                {submitting ? (
                  <div className="spinner-container">
                    <div className="spinner-linen" />
                  </div>
                ) : (
                  <p>Save</p>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="sidepanel-wrap">
          <form className="sidepanel-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-box">
              <span className="smallcaps">PROJECT NAME*</span>
              <input
                {...register("name", {
                  required: "Project name is required",
                  validate: (value) =>
                    value.trim() !== "" || "Project name is required",
                })}
                className="form-input"
                type="text"
                placeholder="Enter a name"
              />
              {errors.name && (
                <span className="error-message">{errors.name.message}</span>
              )}
            </div>
            <div className="form-box">
              <span className="smallcaps">DESCRIPTION</span>
              <textarea
                {...register("description")}
                className="form-textarea"
                placeholder="Add a description"
              />
            </div>
            <div className="form-box">
              <span className="smallcaps">SELECT CAMPAIGN*</span>
              <SearchDropdown
                {...register("campaign", { required: true })}
                data={campaignsData}
                onSelect={(selectedItem) => {
                  setValue("campaign", selectedItem.id);
                  trigger("campaign");
                }}
                placeholder="Select Campaign"
                handleSearch={handleSearchChange}
                displayKey="name"
              />
              {errors.campaign && (
                <span className="error-message">Campaign is required</span>
              )}
            </div>
            <div className="form-box">
              <span className="smallcaps">SELECT CREATOR*</span>
              <SearchDropdown
                {...register("creator", { required: "true" })}
                data={creatorsData}
                onSelect={(selectedItem) => {
                  setValue("creator", selectedItem.id);
                  trigger("creator");
                }}
                placeholder="Select Creator"
                handleSearch={handleSearchChange}
                displayKey="name"

              />
              {errors.creator && (
                <span className="error-message">Creator is required</span>
              )}
            </div>
            <div className="form-box">
              <span className="smallcaps">CONTRACT VALUE*</span>
              <input
                {...register("contract_value", {
                  required: "Contract value is required",
                  valueAsNumber: true,
                  validate: {
                    notEmpty: (value) =>
                      value !== undefined || "Contract value cannot be empty",
                    isNumber: (value) =>
                      !isNaN(value ?? 0) || "Please enter a number",
                  },
                })}
                className="form-input"
                type="text"
                placeholder="Enter contract value"
              />
              {errors.contract_value && (
                <span className="error-message">
                  {errors.contract_value.message}
                </span>
              )}
            </div>
            <div>
              <InvoiceDropdown
                selectedValue={invoiceStatus}
                onSelect={handleInvoiceSelect}
              />
            </div>
            <div className="form-box">
              <span className="smallcaps">START DATE*</span>
              <input
                {...register("start_date", {
                  required: "Start date is required",
                })}
                className="form-input"
                type="date"
              />
              {errors.start_date && (
                <span className="error-message">
                  {errors.start_date.message}
                </span>
              )}
            </div>
            <div className="form-box">
              <span className="smallcaps">END DATE*</span>
              <input
                {...register("deadline", {
                  required: "End date is required",
                  validate: {
                    isAfterStartDate: (value) =>
                      new Date(value) >= new Date(startDate) ||
                      "End date cannot be before start date",
                  },
                })}
                className="form-input"
                type="date"
              />
              {errors.deadline && (
                <span className="error-message">{errors.deadline.message}</span>
              )}
            </div>
            <div className="form-box">
              <span className="smallcaps">SELECT STAGE*</span>
              <SearchDropdown
                data={projectStage}
                onSelect={(selectedItem) => {
                  setValue("project_stage", selectedItem.stageID);
                  trigger("project_stage");
                }}
                placeholder="Select Stage"
                handleSearch={handleSearchChange}
                displayKey="stageName"
                {...register("project_stage", {
                  required: "Stage selection is required",
                })}
              />
              {errors.project_stage && (
                <span className="error-message">Stage is required</span>
              )}
            </div>

            <button className="sec-button linen" type="submit">
              {submitting ? (
                <div className="spinner-container">
                  <div className="spinner-linen" />
                </div>
              ) : (
                <p>SAVE</p>
              )}
            </button>
          </form>
        </div>
      )}
    </FormSidepanel>
  );
};

export default ProjectForm;