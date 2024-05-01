import React, { Fragment, useEffect, useState } from "react";
import {
  exportCSV,
  getBrands,
  getCampaignStages,
  getCampaigns,
  getCampaignsDetail,
  getDeals,
} from "@/utils/httpCalls";
import withAuth from "@/components/common/WithAuth";
import MainLoader from "@/components/common/Loader";
import Sidebar from "@/components/navigation/Sidebar";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import Image from "next/image";
import Reload from "@/components/assets/icons/reload.svg";
import PlusWhite from "@/components/assets/icons/plus-white.svg";
import Kanban from "@/components/assets/icons/kanban.svg";
import Table from "@/components/assets/icons/table.svg";
import Dropdown from "@/components/common/Dropdown";
import Pagination from "@/components/dashboard/table/Pagination";
import CampaignTable from "@/components/dashboard/table/CampaignTable";
import CampaignKanban from "@/components/dashboard/kanban/CampaignKanban";
import CampaignSidepanel from "@/components/dashboard/profile/CampaignSidepanel";
import CampaignForm from "@/components/dashboard/form/CampaignForm";
import { useRouter } from "next/router";

interface profileData {
  id: string;
  name: string;
  profile_picture_url: string;
}

interface FormData {
  id: string;
  projectName: string;
  description: string;
  creator: profileData | null;
}

interface HttpError {
  hasError: boolean;
  message: string;
}

const CampaignsPage = () => {
  const router = useRouter();
  const [loader, setLoader] = useState<boolean>(false);
  const [httpError, setHttpError] = useState({
    hasError: false,
    status: 0,
    message: "",
  });

  const [tableRows, setTableRows] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedCampaign, setSelectedCampaign] = useState({} as any);
  const [campaignStage, setCampaignStage] = useState<any>([]);
  const [updateCampaign, setUpdateCampaign] = useState(false);
  const [openSidepanel, setOpenSidepanel] = useState(false);
  const [openFormSidepanel, setOpenFormSidepanel] = useState(false);

  const [originalData, setOriginalData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [dataToDisplay, setDataToDisplay] = useState<any[]>([]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const breadcrumbLinks = [
    // { label: "Home", link: "/" },
    { label: "Partnerships", link: "/dashboard/partnerships/campaigns" },
    {
      label: "Campaigns",
      link: "/dashboard/partnerships/campaigns",
      current: true,
    },
  ];

  /* UPDATE CAMPAIGNS DATA */
  useEffect(() => {
    const originalDataCopy = [...originalData];
    setFilteredData(originalDataCopy);
    setDataToDisplay(
      originalDataCopy.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    );
  }, [updateCampaign, tableRows]);

  const updateCampaignData = () => {
    setUpdateCampaign((prevState) => !prevState);
  };

  /* CAMPAIGN-STAGE API CALL  */
  useEffect(() => {
    fetchCampaignStages();
  }, [router, updateCampaign, tableRows]);

  const fetchCampaignStages = () => {
    setLoader(true);
    getCampaignStages(
      (response: any) => {
        setCampaignStage(
          response?.map((stage: any) => ({
            stageID: stage.id,
            stageName: stage.name,
            stageIndex: stage.order,
            stageUser: stage.user,
          }))
        );

        setUpdateCampaign(false);
      },

      (error: any) => {
        console.error("Error fetching profile data:", error);
        setCampaignStage([]);
      }
    ).finally(() => {
      setLoader(false);
    });
  };

  /* CAMPAIGNS API CALL */
  useEffect(() => fetchCampaigns(), [updateCampaign, tableRows]);

  const fetchCampaigns = () => {
    let provisionalCampaignsData: any[] = [];
    let provisionalCampaignsDetailData: any[] = [];

    setLoader(true);
    Promise.all([
      getCampaignsDetail(
        (response: any) => (provisionalCampaignsDetailData = response),
        (error: any) => {
          setHttpError({
            hasError: true,
            status: error.status,
            message: error.message,
          });
        }
      ),
      getCampaigns(
        (response: any[]) => (provisionalCampaignsData = response),
        (error: any) => {
          setHttpError({
            hasError: true,
            status: error.status,
            message: error.message,
          });
        }
      ),
    ]).finally(() => {
      const campaignsFullData = provisionalCampaignsData?.map((item) => {
        const item2 = provisionalCampaignsDetailData.find(
          (item2) => item2.id === item.id
        );
        return {
          ...item,
          ...Object.keys(item2).reduce((result: any, key) => {
            if (
              !Object.values(item).includes(item2[key]) &&
              !Object.values(result).includes(item2[key])
            ) {
              result[key] = item2[key];
            }
            return result;
          }, {}),
        };
      });

      setOriginalData(campaignsFullData);
      setFilteredData(campaignsFullData);
      setDataToDisplay(
        campaignsFullData.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        )
      );

      setLoader(false);
    });
  };

  const handleReloadData = () => {
    setLoader(true);
    fetchCampaigns();
  };

  useEffect(() => {
    setDataToDisplay(
      filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    );
  }, [filteredData, currentPage]);

  const handlePrevious = () =>
    setCurrentPage((oldPage) => Math.max(oldPage - 1, 1));
  const handleNext = () =>
    setCurrentPage((oldPage) => Math.min(oldPage + 1, totalPages));

  /* TABLE SORT LOGIC */

  /*
   * Sort the table by the specified field - ascending and descending order
   * totalProjects and contractValue are treated as numbers, while the rest are treated as strings
   * @param field - Field to sort by
   */

  const sortBy = (field: keyof (typeof originalData)[0]) => {
    const sortedData = [...filteredData];
    if (field === "contract_value") {
      sortedData.sort((a, b) => {
        const valueA = parseFloat(a[field]);
        const valueB = parseFloat(b[field]);
        return valueA - valueB;
      });
    } else {
      sortedData.sort((a, b) => {
        if (typeof a[field] === "string" && typeof b[field] === "string") {
          return a[field].localeCompare(b[field]);
        } else if (
          typeof a[field] === "number" &&
          typeof b[field] === "number"
        ) {
          return a[field] - b[field];
        } else {
          return 0;
        }
      });
    }

    const isAscending =
      JSON.stringify(filteredData) === JSON.stringify(sortedData);
    const sortedDataFinal = isAscending ? sortedData.reverse() : sortedData;

    setFilteredData(sortedDataFinal);
  };

  /* CSV EXPORT */
  const handleExportCSV = async (e: any) => {
    const teamId = originalData[0].team;
    try {
      exportCSV("campaigns", teamId, "campaigns")
    } catch (error) {
      console.error("Error exporting file:", error);
    }
  };

  /* SIDEPANEL LOGIC */
  const handleOpenSidepanel = (campaign: any) => {
    setSelectedCampaign(campaign);
    setOpenSidepanel(!openSidepanel);
  };

  const handleCloseSidepanel = (): void => {
    setOpenSidepanel(false);
    setSelectedCampaign(null);
  };

  const handleOpenFormSidepanel = (): void => {
    setOpenFormSidepanel(true);
  };

  const handleCloseFormSidepanel = (): void => {
    setOpenFormSidepanel(false);
  };

  return (
    <div className="main-container">
      <div className="breadcrumb-nav">
        <Breadcrumbs items={breadcrumbLinks} />
      </div>
      {loader ? (
        <MainLoader />
      ) : (
        <>
          <div className="page-container" id="CampaignData">
            {openSidepanel && (
              <CampaignSidepanel
                campaignId={selectedCampaign.id}
                setSelectedCampaign={setSelectedCampaign}
                setOpenSidepanel={setOpenSidepanel}
                updateCampaignData={updateCampaignData}
              />
            )}
            {openFormSidepanel && (
              <CampaignForm
                campaignsData={selectedCampaign}
                campaignStage={campaignStage}
                isEditing={false}
                closeEdit={handleCloseFormSidepanel}
                handleCloseFormSidepanel={handleCloseFormSidepanel}
                updateCampaignData={updateCampaignData}
              />
            )}
            <div className="filtersContainer">
              <Dropdown
                setFilteredData={setFilteredData}
                originalData={originalData}
                setCurrentPage={setCurrentPage}
                origin="campaigns"
              />
              <div className="action-buttons-wrap">
                <label htmlFor="file-upload" className="app-button cream">
                  CSV Export
                </label>
                <button
                  className="input-file"
                  id="file-upload"
                  type="button"
                  onClick={handleExportCSV}
                />
                <button
                  className="app-button"
                  onClick={handleOpenFormSidepanel}
                >
                  <Image src={PlusWhite} alt="Icon" width={14} height={14} />
                  Add Campaign
                </button>
                <button className="reload-button" onClick={handleReloadData}>
                  <Image src={Reload} alt="Icon" width={18} height={18} />
                </button>
                <div className="switch-box">
                  <button
                      className={`switch-button ${!tableRows ? 'active-switch' : ''}`}
                      onClick={() => setTableRows(false)}
                    >
                      <Image src={Kanban} alt="Kanban Icon" width={15} height={15} />
                    </button>
                    <button
                      className={`switch-button ${tableRows ? 'active-switch' : ''}`}
                      onClick={() => setTableRows(true)}
                    >
                      <Image src={Table} alt="Table Icon" width={15} height={15} />
                    </button>
                  </div>
              </div>
              

            </div>
            {tableRows ? (
              <Fragment>
                <CampaignTable
                  httpError={httpError}
                  dataToDisplay={dataToDisplay}
                  sortBy={sortBy}
                  handleOpenSidepanel={handleOpenSidepanel}
                />
                <Pagination
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  filteredData={filteredData}
                  dataToDisplay={dataToDisplay}
                  handlePrevious={handlePrevious}
                  handleNext={handleNext}
                  totalPages={totalPages}
                />
              </Fragment>
            ) : (
              <CampaignKanban
                httpError={httpError}
                data={dataToDisplay}
                campaignsData={filteredData}
                handleOpenSidepanel={handleOpenSidepanel}
                campaignStage={campaignStage}
                updateCampaignData={updateCampaignData}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

const Campaigns = () => {
  return <Sidebar layout={<CampaignsPage />} />;
};

export default withAuth(Campaigns);