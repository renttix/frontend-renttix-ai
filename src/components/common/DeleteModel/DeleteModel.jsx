import { closeDeleteModal, setLoadingModal } from "@/store/deleteModalSlice";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import apiServices from "../../../../services/apiService";
import { BaseURL } from "../../../../utils/baseUrl";
import { useRouter } from "next/navigation";

const DeleteModel = ({ handleDeleteLocallay }) => {
  const { modelOpen, modalData, loadingModal } = useSelector(
    (state) => state.delete,
  );
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const toast = useRef();
  const router = useRouter();
  console.log(modelOpen);

  const handleDelete = async () => {
    dispatch(setLoadingModal(true));

    try {
      const response = await apiServices.delete(
        `${BaseURL}${modalData?.route}/${modalData?.id}`,
      );
      const result = response.data;
      if (result.success) {
        dispatch(setLoadingModal(false));
        handleDeleteLocallay();
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Deleted successfully!",
          life: 3000,
        });
        dispatch(closeDeleteModal());
        router.push(`${modalData?.redirect}`);
      } else {
        dispatch(setLoadingModal(false));
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: result.message || "Failed to delete!",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "An error occurred while deleting...",
        life: 3000,
      });
    } finally {
      dispatch(setLoadingModal(false));
    }
  };
  return (
    <div>
      <Toast ref={toast} />
      <Dialog
        header="Delete Confirmation"
        footer={() => (
          <div class="">
            <Button
              onClick={() => dispatch(closeDeleteModal())}
              size="small"
              label="Cancel"
              severity="secondary"
              outlined
            />
            <Button
              onClick={handleDelete}
              severity="danger"
              size="small"
              loading={loadingModal}
            >
              Remove
            </Button>
          </div>
        )}
        visible={modelOpen}
        style={{ width: "50vw" }}
        onHide={() => dispatch(closeDeleteModal())}
      >
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <div class="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10 md:size-20">
            <svg
              class="size-12 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <label class="text-sm text-dark-2 dark:text-white md:text-lg">
            <span className="font-semibold">
              {" "}
              Are you sure you want to Delete?
            </span>{" "}
            <br /> All of your data will be permanently removed. This action
            cannot be undone!
          </label>
        </div>
      </Dialog>
    </div>
  );
};

export default DeleteModel;
