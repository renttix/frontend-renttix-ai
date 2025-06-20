"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { BaseURL } from "../../../../utils/baseUrl";

const ViewDocuments = () => {
  const [data, setdata] = useState({});
  const params = useParams();
  const { token } = useSelector((state) => state?.authReducer);
  const [title, settitle] = useState("");
  const router = useRouter();
  const [loading, setloading] = useState(false);
  const [loader, setloader] = useState(false);

  const toast = useRef(null);
  console.log(data);
  const [documentData, setDocumentData] = useState({
    name: "",
    code: "",
    mask: "",
    seed: "",
    identityMinimumLength: "",
    domain: "global",
    resetSeedFlag: false,
  });

  useEffect(() => {
    async function fetchData() {
      setloader(true);
      try {
        const res = await axios(
          `${BaseURL}/document/doucment-number/${params.id}`,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.data.success) {
          const { resetSeedFlag, ...document } = res.data.document;
          settitle(document.name);
          setDocumentData(document);
        }
      } catch (error) {
        console.error("Error fetching document data:", error);
      } finally {
        setloader(false);
      }
    }

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setDocumentData((prevData) => ({
      ...prevData,
      [name]: e.target.type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!documentData.resetSeedFlag) {
      delete documentData.seed;
    }

    setloading(true);

    try {
      const res = await axios.put(
        `${BaseURL}/document/doucment-number/${params.id}`,
        documentData,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        router.push("/system-setup/document-number");
        setloading(false);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: res.data.message,
          life: 2000,
        });
      }
    } catch (error) {
      setloading(false);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response.data.message,
        life: 2000,
      });
    }
  };

  return (
    <div className="col-span-12 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card md:col-span-12 md:w-[100%] md:py-10 lg:col-span-10 lg:w-[100%]  xl:col-span-10 xl:w-[70%] 2xl:w-[70%]">
      <Toast ref={toast} />
      {loader ? (
        <div className="flex h-screen items-center justify-center">
          <ProgressSpinner />
        </div>
      ) : (
        <div className="">
          <h2 className="mb-10 py-3 text-[25px] font-semibold text-dark-2 dark:text-white">
            Document Number: {title}
          </h2>

          <div className="flex">
            <div className="flex w-[20%] items-center justify-center">
              <i className="pi pi-tasks text-[100px] text-[#DDD]"></i>
            </div>
            <div className="">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col">
                  <label className="text-[0.9em] font-bold text-black">
                    Name
                  </label>
                  <InputText
                    name="name"
                    value={documentData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="">
                  <label className="text-[0.9em] font-bold text-black">
                    Code
                  </label>
                  <InputText name="code" value={documentData.code} readOnly />
                </div>
              </div>

              <div className="">
                <hr className="my-8" />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="">
                  <label className="text-[0.9em] font-bold text-black">
                    Mask
                  </label>
                  <InputText
                    name="mask"
                    value={documentData.mask}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="">
                    <label className="text-[0.9em] font-bold text-black">
                      Seed
                    </label>
                    <InputText
                      name="seed"
                      type="number"
                      value={documentData.seed}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="">
                    <label className="text-[0.9em] font-bold text-black">
                      Identity Minimum Length
                    </label>
                    <InputText
                      name="identityMinimumLength"
                      value={documentData.identityMinimumLength}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex  flex-col gap-1">
                  <label className="text-[0.9em] font-bold text-black">
                    Domain
                  </label>
                  <Dropdown
                    name="domain"
                    value={documentData.domain}
                    options={[
                      { label: "Global", value: "global" },
                      { label: "Country", value: "country" },
                      { label: "Company", value: "company" },
                      { label: "Depot", value: "depot" },
                    ]}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-5">
                  <label className="text-[0.9em] font-bold text-black">
                    Reset Seed
                  </label>
                  <Checkbox
                    name="resetSeedFlag"
                    checked={documentData.resetSeedFlag}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex justify-center md:justify-end gap-4 mt-5">
                {/* <GoBackButton title="Cancel" /> */}
                <Button
                  label="Update Document Number"
                  loading={loading}
                  className="p-button-warning"
                  onClick={handleSubmit}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDocuments;
