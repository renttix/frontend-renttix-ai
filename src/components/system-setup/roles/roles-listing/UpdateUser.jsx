"use client";
import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { BaseURL } from "../../../../../utils/baseUrl";
import CanceButton from "@/components/Buttons/CanceButton";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";
import Loader from "@/components/common/Loader";

// import AddRoleModal from "../role-permission/add-role-modal/AddRoleModal";

const UpdateUser = () => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(false);
    const [fetchLoading, setfetchLoading] = useState(false)
  
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const params = useParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    permissions: ["Dashboard"],
    role: "",
    isActive: true,
  });
  const router = useRouter();
  const { token } = useSelector((state) => state?.authReducer);
  const toast = React.useRef(null);

  const handleRefreshFlag = (value) => {
    setRefreshFlag(value);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePermissionChange = (permission, isChecked, children = []) => {
    setFormData((prev) => {
      let updatedPermissions;

      if (isChecked) {
        updatedPermissions = [
          ...new Set([...prev.permissions, permission, ...children]),
        ];
      } else {
        updatedPermissions = prev.permissions.filter(
          (perm) => perm !== permission && !children.includes(perm),
        );
      }

      return { ...prev, permissions: updatedPermissions };
    });
  };
  useEffect(() => {
    // Fetch roles
    const fetchRoles = async () => {

      try {
        const response = await axios.get(`${BaseURL}/roles/role`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        setRoles(response.data.data);
      } catch (err) {
        seterror(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Fetch user details
    const fetchUserDetails = async () => {
      setfetchLoading(true);
      try {
        const response = await axios.get(
          `${BaseURL}/sub-vendor/sub-user-profile/${params.id}`,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        );
        setFormData({
          name: response.data?.data?.legalName || "",
          email: response.data?.data?.email || "",
          role: response.data?.data?.role || "",
          permissions: response.data?.data?.permissions || [],
          isActive: response.data?.data?.accountStatus ?? true,
        });
        setfetchLoading(false);
      } catch (err) {
        setfetchLoading(false);
        toast({
          title: "Failed to fetch user details.",
          status: "error",
          position: "top-right",
          duration: 2000,
          isClosable: true,
        });
      }
    };

    fetchRoles();
    fetchUserDetails();
  }, [params.id]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${BaseURL}/sub-vendor/sub-user-role-permissions/${params.id}`,
        formData,
        {
          headers: { authorization: `Bearer ${token}` },
        },
      );
      setLoading(false);
      router.push("/system-setup/roles");
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        permissions: [],
        isActive: true,
      });
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: response.data?.message,
      });
    } catch (error) {
      setLoading(false);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response.data.message,
      });
    }
  };

  const permissionsData = [
    {
      parent: "Add Product",
      children: ["Edit Product", "Delete Product", "All Product"],
    },
    {
      parent: "Customer",
      children: [
        "Account",
        "Create Customer",
        "Edit Customer",
        "Delete Customer",
      ],
    },
    {
      parent: "Orders",
      children: [
        "Create Order",
        "Edit Order",
        "Book In Order",
        "Book Out Order",
      ],
    },
    {
      parent: "Invoicing",
      children: [
        "Invoice Run",
        "Invoice Batches",
        "Delete Batch",
        "Confirm Batch",
        "Posted Batch",
        "Confirm Single Invoice",
        "Posted Single Invoice",
        "Delete Single Invoice",
      ],
    },
    {
      parent: "System Setup",
      children: [],
    },
  ];

  if (fetchLoading) {
    return (
      <>
        <section className="flex h-screen items-center justify-center">
          <Loader />
        </section>
      </>
    );
  }

  return (
    <div className="w-full md:w-[100%] lg:w-[100%] xl:w-[70%] 2xl:w-[70%]">
      <Toast ref={toast} />
      <div className="flex gap-3">
        <GoPrevious route={"/system-setup/roles"} />
        <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white ">
          Update User
        </h2>
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div class="col-span-12 p-4  lg:col-span-3 xl:col-span-3 ">
          <h3 className="font-bold">User Detail</h3>
        </div>
        <div class="col-span-12 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card  md:col-span-12 lg:col-span-9 xl:col-span-9">
          <div className="flex flex-col gap-4">
            <div className="sm:grud grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className=" text-[0.9em] font-bold text-black">
                  Name
                </label>
                <InputText
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled
                  readOnly
                  placeholder="Enter name"
                  className="w-full"
                />
              </div>
              <div>
                <label className=" text-[0.9em] font-bold text-black">
                  Email
                </label>
                <InputText
                  name="email"
                  type="email"
                  disabled
                  readOnly
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <label className=" text-[0.9em] font-bold text-black">
                  Role
                </label>
                <Dropdown
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  options={roles.map((role) => ({
                    label: role.name,
                    value: role.name,
                  }))}
                  placeholder="Select role"
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="">
                  <label
                    className=" text-[0.9em] font-bold text-black"
                    htmlFor=""
                  >
                    Status
                  </label>
                </div>
                <div className="flex">
                  <Checkbox
                    inputId="active"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <label
                    className=" ml-2 text-[0.9em] font-bold text-black"
                    htmlFor="active"
                  >
                    Active
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr className="my-8  bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark " />

      <div class="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div class="col-span-12 p-4  lg:col-span-3 xl:col-span-3 ">
          <h3 className="font-bold">Allow Permissions</h3>
        </div>
        <div class="col-span-12 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card  md:col-span-12 lg:col-span-9 xl:col-span-9">
          <div className="grid">
            <div>
              {permissionsData.map(({ parent, children }) => (
                <div key={parent} className="mt-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      inputId={parent}
                      checked={formData.permissions.includes(parent)}
                      onChange={(e) =>
                        handlePermissionChange(parent, e.checked, children)
                      }
                    />
                    <label
                      className=" text-[0.9em] font-bold text-black"
                      htmlFor={parent}
                    >
                      {parent}
                    </label>
                  </div>
                  {formData.permissions.includes(parent) && (
                    <div className="ml-6">
                      {children.map((child) => (
                        <div
                          key={child}
                          className="mt-2 flex items-center gap-2"
                        >
                          <Checkbox
                            inputId={child}
                            checked={formData.permissions.includes(child)}
                            onChange={(e) =>
                              handlePermissionChange(child, e.checked)
                            }
                          />
                          <label
                            className=" text-[0.9em] font-bold text-black"
                            htmlFor={child}
                          >
                            {child}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <div className="flex gap-5">
                <div className="">
                  <CanceButton onClick={() => router.back()} />
                </div>
                <Button
                  label={"Update User"}
                  loading={loading}
                  onClick={handleSubmit}
                  size="small"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateUser;
